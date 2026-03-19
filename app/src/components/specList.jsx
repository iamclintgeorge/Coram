import React from "react";
import { Server } from "lucide-react";
import {
  formatBytes,
  formatUptime,
  formatPercentage,
} from "../utils/formatters";

// Animated progress bar component
const ProgressBar = ({ value, max, color }) => {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-1.5 bg-gray-300 rounded-full overflow-hidden shadow-lg">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};

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
  const isRunning = status === "running";
  const memPercent = maxmem > 0 ? ((mem || 0) / maxmem) * 100 : 0;
  const diskPercent = maxdisk > 0 ? ((disk || 0) / maxdisk) * 100 : 0;
  const cpuPercent = (cpu || 0) * 100;

  return (
    <div className="border-2 border-gray-500 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full sm:min-w-[200px] md:min-w-[250px] lg:min-w-[300px] overflow-hidden group">
      {/* VM Header */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${isRunning ? "bg-emerald-50" : "bg-gray-100"} transition-colors`}
            >
              <Server
                className={`w-5 h-5 ${isRunning ? "text-emerald-600" : "text-gray-700"}`}
              />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 truncate max-w-[180px]">
                {name}
              </h3>
              <p className="text-xs text-gray-500 font-mono">ID: {vmid}</p>
            </div>
          </div>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              isRunning
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-emerald-500" : "bg-red-500"}`}
              />
              {status}
            </span>
          </span>
        </div>
      </div>

      {/* VM Stats */}
      <div className="px-5 pb-5 space-y-4">
        {/* CPU */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-900">CPU</span>
            <div className="text-right">
              <span className="text-sm font-semibold text-gray-800">
                {formatPercentage(cpu)}
              </span>
              <span className="text-xs text-gray-700 ml-1">
                ({cpus || 0} cores)
              </span>
            </div>
          </div>
          <ProgressBar
            value={cpuPercent}
            max={100}
            color={
              cpuPercent > 80
                ? "bg-red-500"
                : cpuPercent > 50
                  ? "bg-amber-500"
                  : "bg-indigo-500"
            }
          />
        </div>

        {/* Memory */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-900">Memory</span>
            <div className="text-right">
              <span className="text-sm font-semibold text-gray-800">
                {formatBytes(mem)}
              </span>
              <span className="text-xs text-gray-700 ml-1">
                / {formatBytes(maxmem)}
              </span>
            </div>
          </div>
          <ProgressBar
            value={memPercent}
            max={100}
            color={
              memPercent > 80
                ? "bg-red-500"
                : memPercent > 50
                  ? "bg-amber-500"
                  : "bg-violet-500"
            }
          />
        </div>

        {/* Disk */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-900">Disk</span>
            <div className="text-right">
              <span className="text-sm font-semibold text-gray-800">
                {formatBytes(disk)}
              </span>
              <span className="text-xs text-gray-700 ml-1">
                / {formatBytes(maxdisk)}
              </span>
            </div>
          </div>
          <ProgressBar
            value={diskPercent}
            max={100}
            color={
              diskPercent > 80
                ? "bg-red-500"
                : diskPercent > 50
                  ? "bg-amber-500"
                  : "bg-teal-500"
            }
          />
        </div>

        {/* Uptime */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs font-medium text-gray-900">Uptime</span>
          <span className="text-sm font-semibold text-gray-800">
            {formatUptime(uptime)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SpecList;
