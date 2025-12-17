import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiServer as Server,
  FiPower as PowerOff,
  FiPower as Power,
  FiActivity as Activity,
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
    fetchVMDetails();
  }, [id]);

  const fetchVMDetails = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_admin_server
        }/api/proxmox/vms/${nodeName}/${id}`,
        { withCredentials: true }
      );
      setVm(response.data);
      console.log(response.data);
      setVncURL(
        `https://192.168.122.15:8006/?console=kvm&novnc=1&vmid=${response.data.vmid}&vmname=${response.data.name}&node=${nodeName}&resize=off&cmd=`
      );
    } catch (err) {
      console.error("Failed to fetch VM details", err);
    }
  };

  const handleVMAction = async (action) => {
    setActionLoading(action);
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_admin_server
        }/api/proxmox/vms/${nodeName}/${id}`,
        { action: action },
        { withCredentials: true }
      );
      fetchVMDetails(); // Refresh VM details after action
    } catch (err) {
      console.error("Failed to Perform VM Action", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (!vm) return <Loader className="animate-spin" />; // Loader while fetching

  return (
    <div className="container mx-auto p-4">
      <div className="flex mb-4">
        <Link to="/vms">
          <span className="text-4xl font-semibold">←</span>
        </Link>
        <h1 className="text-2xl font-bold mx-2 ">/</h1>
        <h1 className="text-2xl font-bold">{vm.name}</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <h2 className="text-lg font-bold mb-2">VM Details</h2>
        <p>
          <strong>State:</strong> {vm.status}
        </p>
        <p>
          <strong>Uptime:</strong> {formatUptime(vm.uptime)}
        </p>
        <p>
          <strong>CPU Core:</strong> {vm.cpus} Core
        </p>
        <p>
          <strong>Disk:</strong> {formatBytes(vm.disk)} /{" "}
          {formatBytes(vm.maxdisk)}
        </p>

        <div className="mt-4">
          <button
            className="bg-white border-gray-400 border-[0.5px] text-black px-4 py-2 mr-2"
            onClick={() => handleVMAction("start")}
            disabled={actionLoading === "start"}
          >
            {actionLoading === "start" ? "Starting..." : "Start"}
          </button>
          <button
            className="bg-white border-gray-400 border-[0.5px] text-black px-4 py-2 mr-2"
            onClick={() => handleVMAction("stop")}
            disabled={actionLoading === "stop"}
          >
            {actionLoading === "stop" ? "Stopping..." : "Stop"}
          </button>
          <button
            className="bg-white border-gray-400 border-[0.5px] text-black px-4 py-2"
            onClick={() => handleVMAction("shutdown")}
            disabled={actionLoading === "shutdown"}
          >
            {actionLoading === "shutdown" ? "Shutting down..." : "Shutdown"}
          </button>
          <button
            className="bg-white border-gray-400 border-[0.5px] text-black px-4 py-2 ml-2"
            onClick={() => handleVMAction("restart")}
            disabled={actionLoading === "restart"}
          >
            <Power className="inline-block" />{" "}
            {actionLoading === "restart" ? "Restarting..." : "Restart"}
          </button>
        </div>
      </div>

      <a target="_blank" href={vncURL}>
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-bold mb-2">VM Console</h2>
          <p className="text-gray-600 mb-4">
            Remotely manage your server from the web.
          </p>
          <iframe
            src={vncURL}
            title="VM Console"
            className="w-full h-96 border rounded"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      </a>
    </div>
  );
};

export default VmPage;
