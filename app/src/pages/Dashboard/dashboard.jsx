import React, { useEffect, useState } from "react";
import SpecCard from "../../components/specCard";
import { CheckCircle, Cpu, Server, HardDrive, Activity } from "lucide-react";
import axios from "axios";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const nodeName = "pve";

  useEffect(() => {
    fetchVMStats();
  }, []);

  const fetchVMStats = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_admin_server
        }/api/proxmox/fetchNodeStats/${nodeName}`,
        { withCredentials: true }
      );
      setStats(response.data);
    } catch (err) {
      console.log("Error while fetching VM Stats:", err.message);
    }
  };

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

  const runningVMs = stats?.filter((vm) => vm.status === "running").length;
  const totalVMs = stats?.length;

  return (
    <div className="p-8">
      {!stats ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Server className="mx-auto mb-4 text-gray-400" size={64} />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            No Active VMs
          </h2>
          <p className="text-gray-500">You don't have any active VMs!</p>
        </div>
      ) : (
        <>
          {/* Quick Stats Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Quick Stats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SpecCard title="Total VMs" value={totalVMs} icon={Server} />
              <SpecCard
                title="Running VMs"
                value={runningVMs}
                icon={CheckCircle}
              />
              <SpecCard
                title="CPU Cores"
                value={stats.reduce((sum, vm) => sum + (vm.cpus || 0), 0)}
                icon={Cpu}
              />
              <SpecCard
                title="Total Memory"
                value={`${(
                  stats.reduce((sum, vm) => sum + (vm.maxmem || 0), 0) /
                  1024 ** 3
                ).toFixed(2)} GB`}
                icon={Activity}
              />
            </div>
          </div>

          {/* Your Virtual Machines Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Your Virtual Machines
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {stats.map((vm) => (
                <div
                  key={vm.vmid}
                  className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {/* VM Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Server className="text-white" size={24} />
                        <div>
                          <h3 className="text-lg font-semibold text-white truncate max-w-[200px]">
                            {vm.name}
                          </h3>
                          <p className="text-blue-100 text-sm">ID: {vm.vmid}</p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          vm.status === "running"
                            ? "bg-green-400 text-green-900"
                            : "bg-red-400 text-red-900"
                        }`}
                      >
                        {vm.status}
                      </span>
                    </div>
                  </div>

                  {/* VM Stats */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <Cpu className="text-blue-600" size={18} />
                        <span className="text-sm text-gray-600">CPU</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800">
                          {((vm.cpu || 0) * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">
                          {vm.cpus || 0} cores
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <Activity className="text-green-600" size={18} />
                        <span className="text-sm text-gray-600">Memory</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800">
                          {((vm.mem || 0) / 1024 ** 2).toFixed(0)} MB
                        </p>
                        <p className="text-xs text-gray-500">
                          / {((vm.maxmem || 0) / 1024 ** 2).toFixed(0)} MB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <HardDrive className="text-purple-600" size={18} />
                        <span className="text-sm text-gray-600">Disk</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800">
                          {formatBytes(vm.disk)}
                        </p>
                        <p className="text-xs text-gray-500">
                          / {formatBytes(vm.maxdisk)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="text-orange-600" size={18} />
                        <span className="text-sm text-gray-600">Uptime</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">
                        {formatUptime(vm.uptime)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
