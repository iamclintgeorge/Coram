import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FiServer as Server,
  FiPower as PowerOff,
  FiPower as Power,
  FiActivity as Activity,
  // FiRefreshCw as RefreshCw,
  FiLoader as Loader,
} from "react-icons/fi";
import axios from "axios";

// Helper functions
const formatBytes = (bytes) =>
  bytes ? (bytes / 1024 / 1024).toFixed(1) + " MB" : "0 MB";
const formatUptime = (seconds) =>
  seconds
    ? `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
    : "0h 0m";

const VmPage = () => {
  const { id } = useParams();
  const [vm, setVm] = useState(null);
  const [vncURL, setVncURL] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const nodeName = "pve";

  useEffect(() => {
    console.log(id);
    fetchVMDetails();
  }, [id]);

  const fetchVMDetails = async () => {
    try {
      // setRefreshing(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_admin_server
        }/api/proxmox/vms/${nodeName}/${id}`,
        { withCredentials: true }
      );
      setVm(response.data);
      setVncURL(
        `https://192.168.122.15:8006/?console=kvm&novnc=1&vmid=${response.data.vmid}&vmname=${response.data.name}&node=${nodeName}&resize=off&cmd=`
      );
      console.log(response);
    } catch (err) {
      console.error("Failed to fetch VM details", err);
    }
  };

  const handleVMAction = async (action) => {
    console.log(action);
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_admin_server
        }/api/proxmox/vms/${nodeName}/${id}`,
        { action: action }, // Wrap action in an object
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Failed to Perform VM Action", err);
    }
  };

  if (!vm) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center text-gray-600">
        <Loader className="w-6 h-6 animate-spin mr-2" /> Loading VM...
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-playfair">
            {vm.name}
          </h1>
          <p className="text-gray-600 font-inter mt-1">
            Manage and monitor your VM
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r bg-gray-700 p-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Server className="w-6 h-6" />
            <div>
              <h3 className="font-semibold text-lg">{vm.name}</h3>
              <p className="text-blue-100 text-sm">ID: {vm.vmid}</p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              vm.status === "running"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {vm.status}
          </span>
        </div>

        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-xs text-gray-600 mb-1">CPU Cores</p>
            <p className="text-lg font-semibold text-gray-900">{vm.cpus}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-xs text-gray-600 mb-1">Memory</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatBytes(vm.mem)}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-xs text-gray-600 mb-1">Disk</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatBytes(vm.disk)}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-xs text-gray-600 mb-1">Uptime</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatUptime(vm.uptime)}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {vm.status === "running" ? (
            <>
              <button
                onClick={() => handleVMAction("shutdown")}
                disabled={actionLoading === "shutdown"}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === "shutdown" ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <PowerOff className="w-4 h-4" />
                )}
                Shutdown
              </button>
              <button
                onClick={() => handleVMAction("stop")}
                disabled={actionLoading === "stop"}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === "stop" ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <PowerOff className="w-4 h-4" />
                )}
                Stop
              </button>
            </>
          ) : (
            <button
              onClick={() => handleVMAction("start")}
              disabled={actionLoading === "start"}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {actionLoading === "start" ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Power className="w-4 h-4" />
              )}
              Start
            </button>
          )}
        </div>

        <div className="bg-gray-50 px-4 py-3 text-xs text-gray-600 border-t mt-4 flex justify-between items-center">
          <span>Created: {new Date(vm.created_at).toLocaleDateString()}</span>
          <Activity className="w-4 h-4 text-gray-400" />
        </div>

        <div className="bg-gray-50 px-4 py-3 text-xs text-gray-600 border-t mt-4 flex justify-between items-center">
          <a target="_blank" href={vncURL}>
            <button>Open noVNC</button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default VmPage;
