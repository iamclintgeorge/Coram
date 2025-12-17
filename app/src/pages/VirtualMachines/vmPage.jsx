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

  const isRunning = vm.status === "running";
  const isStopped = vm.status === "stopped";

  const buttonBase = "border-[0.5px] px-4 py-2 transition cursor-pointer";
  const buttonDisabled =
    "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed";
  const buttonEnabled = "bg-white text-black border-gray-400 hover:bg-gray-100";

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

        <div className="mt-4 flex flex-wrap gap-2">
          {/* START */}
          <button
            className={`${buttonBase} ${
              isRunning || actionLoading === "start"
                ? buttonDisabled
                : buttonEnabled
            }`}
            onClick={() => handleVMAction("start")}
            disabled={isRunning || actionLoading === "start"}
          >
            {actionLoading === "start" ? "Starting..." : "Start"}
          </button>

          {/* STOP */}
          <button
            className={`${buttonBase} ${
              !isRunning || actionLoading === "stop"
                ? buttonDisabled
                : buttonEnabled
            }`}
            onClick={() => handleVMAction("stop")}
            disabled={!isRunning || actionLoading === "stop"}
          >
            {actionLoading === "stop" ? "Stopping..." : "Stop"}
          </button>

          {/* SHUTDOWN */}
          <button
            className={`${buttonBase} ${
              !isRunning || actionLoading === "shutdown"
                ? buttonDisabled
                : buttonEnabled
            }`}
            onClick={() => handleVMAction("shutdown")}
            disabled={!isRunning || actionLoading === "shutdown"}
          >
            {actionLoading === "shutdown" ? "Shutting down..." : "Shutdown"}
          </button>

          {/* RESTART */}
          <button
            className={`${buttonBase} ${
              !isRunning || actionLoading === "restart"
                ? buttonDisabled
                : buttonEnabled
            }`}
            onClick={() => handleVMAction("restart")}
            disabled={!isRunning || actionLoading === "restart"}
          >
            <Power className="inline-block mr-1" />
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
