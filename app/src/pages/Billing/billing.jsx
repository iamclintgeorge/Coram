import React, { useEffect, useState } from "react";
import axios from "axios";
import { DollarSign, Cpu, HardDrive, Activity, Server } from "lucide-react";

const Billing = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const nodeName = "pve";

  // Base unit costs (arbitrary values)
  const UNIT_COSTS = {
    cpu: 0.05, // $0.05 per CPU percentage per hour
    ram: 0.002, // $0.002 per MB per hour
    disk: 0.001, // $0.001 per GB per hour
    maxmem: 0.002, // $0.002 per MB allocated
    maxdisk: 0.001, // $0.001 per GB allocated
    uptime: 0.01, // $0.01 per hour uptime
  };

  useEffect(() => {
    fetchVMStats();
  }, []);

  const fetchVMStats = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_admin_server
        }/api/proxmox/fetchVMStats/${nodeName}`,
        { withCredentials: true }
      );
      setStats(response.data.data);
    } catch (err) {
      console.log("Error while fetching VM Stats:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "0 GB";
    const gb = (bytes / 1024 ** 3).toFixed(2);
    return `${gb} GB`;
  };

  const formatUptime = (seconds) => {
    if (!seconds) return "0h";
    const hours = (seconds / 3600).toFixed(2);
    return `${hours}h`;
  };

  const calculateCharges = (vm) => {
    const cpuCharge = (vm.cpu || 0) * 100 * UNIT_COSTS.cpu;
    const ramCharge = ((vm.mem || 0) / 1024 ** 2) * UNIT_COSTS.ram;
    const maxRamCharge = ((vm.maxmem || 0) / 1024 ** 2) * UNIT_COSTS.maxmem;
    const diskCharge = ((vm.disk || 0) / 1024 ** 3) * UNIT_COSTS.disk;
    const maxDiskCharge = ((vm.maxdisk || 0) / 1024 ** 3) * UNIT_COSTS.maxdisk;
    const uptimeCharge = ((vm.uptime || 0) / 3600) * UNIT_COSTS.uptime;

    const total =
      cpuCharge +
      ramCharge +
      maxRamCharge +
      diskCharge +
      maxDiskCharge +
      uptimeCharge;

    return {
      cpuCharge,
      ramCharge,
      maxRamCharge,
      diskCharge,
      maxDiskCharge,
      uptimeCharge,
      total,
    };
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Billing</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <DollarSign className="mx-auto mb-4 text-yellow-600" size={48} />
          <p className="text-gray-600 text-lg">
            No active VMs found for billing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Billing Dashboard
        </h1>
        <p className="text-gray-600">
          Resource usage and charges for your virtual machines
        </p>
      </div>

      {stats.map((vm) => {
        const charges = calculateCharges(vm);

        return (
          <div
            key={vm.vmid}
            className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6 overflow-hidden"
          >
            {/* VM Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Server className="text-white" size={24} />
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {vm.name}
                    </h2>
                    <p className="text-blue-100 text-sm">VM ID: {vm.vmid}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-sm">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      vm.status === "running"
                        ? "bg-green-400 text-green-900"
                        : "bg-red-400 text-red-900"
                    }`}
                  >
                    {vm.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Resource Usage Section */}
            <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Resource Usage
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Cpu className="text-blue-600" size={20} />
                    <span className="text-sm font-medium text-gray-600">
                      CPU Usage
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {((vm.cpu || 0) * 100).toFixed(2)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {vm.cpus || 0} cores allocated
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="text-green-600" size={20} />
                    <span className="text-sm font-medium text-gray-600">
                      Memory Usage
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {((vm.mem || 0) / 1024 ** 2).toFixed(2)} MB
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    of {((vm.maxmem || 0) / 1024 ** 2).toFixed(2)} MB allocated
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <HardDrive className="text-purple-600" size={20} />
                    <span className="text-sm font-medium text-gray-600">
                      Disk Usage
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {formatBytes(vm.disk)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    of {formatBytes(vm.maxdisk)} allocated
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Server className="text-orange-600" size={20} />
                    <span className="text-sm font-medium text-gray-600">
                      Uptime
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {formatUptime(vm.uptime)}
                  </p>
                </div>
              </div>
            </div>

            {/* Billing Breakdown Section */}
            <div className="px-6 py-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Billing Breakdown
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">CPU Usage Charge</span>
                  <span className="font-semibold text-gray-800">
                    ${charges.cpuCharge.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Memory Usage Charge</span>
                  <span className="font-semibold text-gray-800">
                    ${charges.ramCharge.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">
                    Memory Allocation Charge
                  </span>
                  <span className="font-semibold text-gray-800">
                    ${charges.maxRamCharge.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Disk Usage Charge</span>
                  <span className="font-semibold text-gray-800">
                    ${charges.diskCharge.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Disk Allocation Charge</span>
                  <span className="font-semibold text-gray-800">
                    ${charges.maxDiskCharge.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Uptime Charge</span>
                  <span className="font-semibold text-gray-800">
                    ${charges.uptimeCharge.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 mt-2 bg-blue-50 px-4 rounded-lg">
                  <span className="text-lg font-bold text-gray-800">
                    Total Charges
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${charges.total.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>

            {/* Rate Card Section */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <details className="cursor-pointer">
                <summary className="text-sm font-semibold text-gray-700">
                  View Rate Card
                </summary>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-gray-600">CPU Usage</p>
                    <p className="font-semibold text-gray-800">
                      ${UNIT_COSTS.cpu}/% per hour
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-gray-600">RAM Usage</p>
                    <p className="font-semibold text-gray-800">
                      ${UNIT_COSTS.ram}/MB per hour
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-gray-600">RAM Allocation</p>
                    <p className="font-semibold text-gray-800">
                      ${UNIT_COSTS.maxmem}/MB per hour
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-gray-600">Disk Usage</p>
                    <p className="font-semibold text-gray-800">
                      ${UNIT_COSTS.disk}/GB per hour
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-gray-600">Disk Allocation</p>
                    <p className="font-semibold text-gray-800">
                      ${UNIT_COSTS.maxdisk}/GB per hour
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-gray-600">Uptime</p>
                    <p className="font-semibold text-gray-800">
                      ${UNIT_COSTS.uptime}/hour
                    </p>
                  </div>
                </div>
              </details>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Billing;
