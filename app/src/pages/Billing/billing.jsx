import React, { useEffect, useState } from "react";
import axios from "axios";
import { Server, RefreshCw, FileText, TrendingUp } from "lucide-react";
import usePolling from "../../hooks/usePolling";
import {
  formatBytes,
  formatUptime,
  formatPercentage,
  formatCurrency,
  timeAgo,
} from "../../utils/formatters";

const POLL_INTERVAL = 30000;

const Billing = () => {
  const [billingConfig, setBillingConfig] = useState(null);
  const nodeName = "pve";

  // Fetch billing config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_admin_server}/api/billing/config`,
          { withCredentials: true },
        );
        setBillingConfig(response.data);
      } catch (err) {
        // Use defaults if backend not available
        setBillingConfig({
          currency: "₹",
          cpu_rate: 0.05,
          ram_rate: 0.002,
          ram_alloc_rate: 0.002,
          disk_rate: 0.001,
          disk_alloc_rate: 0.001,
          uptime_rate: 0.01,
        });
      }
    };
    fetchConfig();
  }, []);

  const fetchStats = async () => {
    const response = await axios.get(
      `${import.meta.env.VITE_admin_server}/api/proxmox/fetchNodeStats/${nodeName}`,
      { withCredentials: true },
    );
    return response.data;
  };

  const {
    data: stats,
    loading,
    lastUpdated,
    refresh,
  } = usePolling(fetchStats, POLL_INTERVAL);

  const calculateCharges = (vm) => {
    if (!billingConfig) return null;
    const c = billingConfig;
    const cpuCharge = (vm.cpu || 0) * 100 * c.cpu_rate;
    const ramCharge = ((vm.mem || 0) / 1024 ** 2) * c.ram_rate;
    const ramAllocCharge = ((vm.maxmem || 0) / 1024 ** 2) * c.ram_alloc_rate;
    const diskCharge = ((vm.disk || 0) / 1024 ** 3) * c.disk_rate;
    const diskAllocCharge = ((vm.maxdisk || 0) / 1024 ** 3) * c.disk_alloc_rate;
    const uptimeCharge = ((vm.uptime || 0) / 3600) * c.uptime_rate;

    const total =
      cpuCharge +
      ramCharge +
      ramAllocCharge +
      diskCharge +
      diskAllocCharge +
      uptimeCharge;

    return {
      items: [
        {
          label: "CPU Usage",
          value: formatPercentage(vm.cpu),
          charge: cpuCharge,
        },
        {
          label: "Memory Usage",
          value: formatBytes(vm.mem),
          charge: ramCharge,
        },
        {
          label: "Memory Allocated",
          value: formatBytes(vm.maxmem),
          charge: ramAllocCharge,
        },
        {
          label: "Disk Usage",
          value: formatBytes(vm.disk),
          charge: diskCharge,
        },
        {
          label: "Disk Allocated",
          value: formatBytes(vm.maxdisk),
          charge: diskAllocCharge,
        },
        {
          label: "Uptime",
          value: formatUptime(vm.uptime),
          charge: uptimeCharge,
        },
      ],
      total,
    };
  };

  const currency = billingConfig?.currency || "₹";

  // Grand total across all VMs
  const grandTotal =
    stats && billingConfig
      ? stats.reduce((sum, vm) => {
          const charges = calculateCharges(vm);
          return sum + (charges?.total || 0);
        }, 0)
      : 0;

  if (loading || !billingConfig) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded-xl w-1/4" />
          <div className="h-32 bg-gray-200 rounded-2xl" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing</h1>
        <div className="p-8 text-center mt-6">
          <FileText className="w-12 h-12 text-black mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-inter">
            No active VMs found for billing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto font-inter">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Usage Invoice
          </h1>
          <p className="text-gray-500 mt-1">
            Resource usage and charges for your virtual machines
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              {timeAgo(lastUpdated)}
            </div>
          )}
          <button
            onClick={refresh}
            className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grand Total Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 mb-8 text-white">
        <div className="absolute top-0 right-0 w-48 h-48 -mr-12 -mt-12 rounded-full bg-white/5 blur-3xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/60 mb-1">
              Total Across All VMs
            </p>
            <p className="text-4xl font-bold tracking-tight">
              {formatCurrency(grandTotal, currency, 2)}
            </p>
            <p className="text-sm text-white/50 mt-2">
              {stats.length} virtual machines
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
            <TrendingUp className="w-8 h-8 text-white/80" />
          </div>
        </div>
      </div>

      {/* Per-VM Invoice Cards */}
      <div className="space-y-6">
        {stats.map((vm) => {
          const charges = calculateCharges(vm);
          if (!charges) return null;

          return (
            <div
              key={vm.vmid}
              className="border-2 border-gray-400 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* VM Header */}
              <div className="px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${vm.status === "running" ? "bg-emerald-50" : "bg-gray-100"}`}
                  >
                    <Server
                      className={`w-5 h-5 ${vm.status === "running" ? "text-emerald-600" : "text-gray-700"}`}
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {vm.name}
                    </h2>
                    <p className="text-sm text-gray-700 font-mono">
                      VM ID: {vm.vmid}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    vm.status === "running"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${vm.status === "running" ? "bg-emerald-500" : "bg-red-500"}`}
                  />
                  {vm.status}
                </span>
              </div>

              {/* Charges Breakdown */}
              <div className="px-6 pb-6">
                <div className="bg-white rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-black uppercase tracking-wider">
                          Resource
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-black uppercase tracking-wider">
                          Usage
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-black uppercase tracking-wider">
                          Charge
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {charges.items.map((item, i) => (
                        <tr
                          key={i}
                          className="border-b border-gray-100 last:border-0"
                        >
                          <td className="px-4 py-3 text-gray-800">
                            {item.label}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700">
                            {item.value}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-800">
                            {formatCurrency(item.charge, currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-100">
                        <td
                          colSpan="2"
                          className="px-4 py-3 font-semibold text-gray-800"
                        >
                          Total
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-lg text-gray-900">
                          {formatCurrency(charges.total, currency)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rate Card */}
      <div className="mt-8 border-2 border-gray-400 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-black uppercase tracking-wider mb-4">
          Current Rate Card
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "CPU", rate: billingConfig.cpu_rate, unit: "/% per hr" },
            {
              label: "RAM Usage",
              rate: billingConfig.ram_rate,
              unit: "/MB per hr",
            },
            {
              label: "RAM Alloc",
              rate: billingConfig.ram_alloc_rate,
              unit: "/MB",
            },
            {
              label: "Disk Usage",
              rate: billingConfig.disk_rate,
              unit: "/GB per hr",
            },
            {
              label: "Disk Alloc",
              rate: billingConfig.disk_alloc_rate,
              unit: "/GB",
            },
            { label: "Uptime", rate: billingConfig.uptime_rate, unit: "/hr" },
          ].map((r) => (
            <div key={r.label} className="bg-white rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">{r.label}</p>
              <p className="text-sm font-semibold text-gray-800">
                {currency}
                {r.rate}
                {r.unit}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Billing;
