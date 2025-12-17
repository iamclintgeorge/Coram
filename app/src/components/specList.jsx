// components/SpecList.js
import React from "react";
import { Server } from "lucide-react";

const SpecList = ({
  name,
  vmid,
  cpu,
  cpus,
  mem,
  maxmem,
  disk,
  maxdisk,
  status,
  uptime,
}) => {
  const formatBytes = (bytes) => {
    if (!bytes) return "0 GB";
    const gb = (bytes / 1024 ** 3).toFixed(2);
    return `${gb} GB`;
  };

  const formatUptime = (seconds) => {
    if (!seconds) return "0h 0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-white border border-gray-400 hover:shadow-lg transition-shadow duration-300 w-full sm:min-w-[200px] md:min-w-[250px] lg:min-w-[300px]">
      {/* VM Header */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="text-black mr-5" size={24} />
            <div>
              <h3 className="text-xl font-medium text-black truncate max-w-[200px]">
                {name}
              </h3>
              <p className="text-black text-sm">ID: {vmid}</p>
            </div>
          </div>
          <span
            className={`px-3 py-1 text-xs font-semibold ${
              status === "running"
                ? "bg-green-700 text-white"
                : "bg-red-700 text-white"
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* VM Stats */}
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">CPU</span>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">
              {((cpu || 0) * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">{cpus || 0} cores</p>
          </div>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">Memory</span>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">
              {((mem || 0) / 1024 ** 2).toFixed(0)} MB
            </p>
            <p className="text-xs text-gray-500">
              / {((maxmem || 0) / 1024 ** 2).toFixed(0)} MB
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">Disk</span>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">
              {formatBytes(disk)}
            </p>
            <p className="text-xs text-gray-500">/ {formatBytes(maxdisk)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-600">Uptime</span>
          <p className="text-sm font-semibold text-gray-800">
            {formatUptime(uptime)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpecList;
