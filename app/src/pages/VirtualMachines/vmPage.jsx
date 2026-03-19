import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiServer as Server,
  FiPower as Power,
  FiActivity as Activity,
  FiCpu as CpuIcon,
  FiHardDrive as DiskIcon,
  FiArrowLeft as ArrowLeft,
} from "react-icons/fi";
import axios from "axios";
import usePolling from "../../hooks/usePolling";
import {
  formatBytes,
  formatUptime,
  formatPercentage,
  timeAgo,
} from "../../utils/formatters";

const POLL_INTERVAL = 5000;

// Circular gauge component
const ResourceGauge = ({ value, max, label, color, icon: Icon }) => {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300">
      <div className="relative w-28 h-28 mb-4">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="40"
            stroke="#f0f0f0" strokeWidth="8" fill="none"
          />
          <circle
            cx="50" cy="50" r="40"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-gray-900">
            {percent.toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
    </div>
  );
};

const VmPage = () => {
  const { id } = useParams();
  const nodeName = "pve";

  const fetchVMDetails = async () => {
    const response = await axios.get(
      `${import.meta.env.VITE_admin_server}/api/proxmox/vms/${nodeName}/${id}`,
      { withCredentials: true }
    );
    return response.data;
  };

  const {
    data: vm,
    loading,
    lastUpdated,
    refresh,
  } = usePolling(fetchVMDetails, POLL_INTERVAL);

  const [actionLoading, setActionLoading] = React.useState(null);

  const handleVMAction = async (action) => {
    setActionLoading(action);
    try {
      await axios.post(
        `${import.meta.env.VITE_admin_server}/api/proxmox/vms/${nodeName}/${id}`,
        { action },
        { withCredentials: true }
      );
      setTimeout(refresh, 1500);
    } catch (err) {
      console.error("Failed to Perform VM Action", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading || !vm) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded-xl w-1/3" />
          <div className="grid grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-52 bg-gray-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isRunning = vm.status === "running";
  const vncURL = `https://192.168.122.15:8006/?console=kvm&novnc=1&vmid=${vm.vmid}&vmname=${vm.name}&node=${nodeName}&resize=off&cmd=`;

  const actions = [
    { key: "start", label: "Start", disabled: isRunning },
    { key: "stop", label: "Stop", disabled: !isRunning },
    { key: "shutdown", label: "Shutdown", disabled: !isRunning },
    { key: "restart", label: "Restart", disabled: !isRunning },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            to="/vms"
            className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{vm.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-400 font-mono">
                ID: {vm.vmid}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold ${
                  isRunning
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isRunning ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
                {vm.status}
              </span>
            </div>
          </div>
        </div>

        {lastUpdated && (
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Live · {timeAgo(lastUpdated)}
          </div>
        )}
      </div>

      {/* Resource Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <ResourceGauge
          value={(vm.cpu || 0) * 100}
          max={100}
          label={`CPU (${vm.cpus || 0} cores)`}
          color="#6366f1"
          icon={CpuIcon}
        />
        <ResourceGauge
          value={vm.mem || 0}
          max={vm.maxmem || 1}
          label={`Memory (${formatBytes(vm.mem)} / ${formatBytes(vm.maxmem)})`}
          color="#8b5cf6"
          icon={Activity}
        />
        <ResourceGauge
          value={vm.disk || 0}
          max={vm.maxdisk || 1}
          label={`Disk (${formatBytes(vm.disk)} / ${formatBytes(vm.maxdisk)})`}
          color="#14b8a6"
          icon={DiskIcon}
        />
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 mb-4">
            <Server className="w-8 h-8 text-indigo-500" />
          </div>
          <span className="text-2xl font-bold text-gray-900 mb-1">
            {formatUptime(vm.uptime)}
          </span>
          <span className="text-sm text-gray-500">Uptime</span>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          VM Controls
        </h2>
        <div className="flex flex-wrap gap-3">
          {actions.map(({ key, label, disabled }) => (
            <button
              key={key}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                disabled || actionLoading === key
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg active:scale-95"
              }`}
              onClick={() => handleVMAction(key)}
              disabled={disabled || actionLoading === key}
            >
              {actionLoading === key ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-gray-300 border-t-white rounded-full animate-spin" />
                  {label}ing...
                </span>
              ) : (
                label
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Console */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">VM Console</h2>
          <a
            href={vncURL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Open in new tab →
          </a>
        </div>
        <iframe
          src={vncURL}
          title="VM Console"
          className="w-full h-[500px] border-0"
          sandbox="allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
};

export default VmPage;
