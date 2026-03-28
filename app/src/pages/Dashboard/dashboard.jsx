import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SpecList from "../../components/specList";
import { CheckCircle, Cpu, Server, Activity, RefreshCw } from "lucide-react";
import axios from "axios";
import usePolling from "../../hooks/usePolling";
import {
  formatBytes,
  formatUptime,
  formatPercentage,
  timeAgo,
} from "../../utils/formatters";
import StatCard from "../../components/statCard";

const POLL_INTERVAL = 10000;
const ALERT_FETCH_INTERVAL = 60000;

const Dashboard = () => {
  const nodeName = "pve";

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

  const runningVMs = stats?.filter((vm) => vm.status === "running").length || 0;
  const totalVMs = stats?.length || 0;
  const totalCPU = stats?.reduce((sum, vm) => sum + (vm.cpus || 0), 0) || 0;
  const totalMem = stats?.reduce((sum, vm) => sum + (vm.maxmem || 0), 0) || 0;
  const avgCpu =
    stats && stats.length > 0
      ? stats.reduce((sum, vm) => sum + (vm.cpu || 0), 0) / stats.length
      : 0;

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded-xl w-1/4" />
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 bg-gray-200 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        {/* <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-3xl" />
          <Server className="relative w-20 h-20 text-gray-500 mb-6" />
        </div> */}
        <h2 className="text-4xl font-inter font-semibold text-gray-900 mb-1">
          No Active VMs
        </h2>
        <p className="text-gray-500 font-inter mb-6">
          You don't have any active virtual machines yet.
        </p>
        <Link
          to="/order-vm"
          className="px-6 py-2 bg-black text-white rounded-md font-normal hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 font-inter"
        >
          Create Your First VM →
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-inter font-bold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1 font-inter">
            Infrastructure overview
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              Live · {timeAgo(lastUpdated)}
            </div>
          )}
          <button
            onClick={refresh}
            className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            title="Refresh now"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Total VMs"
          value={totalVMs}
          icon={Server}
          subtitle={`${runningVMs} running`}
        />
        <StatCard
          title="Running VMs"
          value={runningVMs}
          icon={CheckCircle}
          subtitle={`${totalVMs - runningVMs} stopped`}
        />
        <StatCard
          title="Total CPU Cores"
          value={totalCPU}
          icon={Cpu}
          subtitle={`Avg ${formatPercentage(avgCpu)} utilization`}
        />
        <StatCard
          title="Total Memory"
          value={formatBytes(totalMem)}
          icon={Activity}
          subtitle="Allocated across VMs"
        />
      </div>

      {/* Virtual Machines Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-inter font-semibold text-gray-900">
            Virtual Machines
          </h2>
          <span className="text-sm text-gray-400 font-inter">
            {totalVMs} total
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {stats.map((vm) => (
            <Link to={`/vms/${vm.vmid}`} key={vm.vmid} className="flex">
              <SpecList
                name={vm.name}
                vmid={vm.vmid}
                cpu={vm.cpu}
                cpus={vm.cpus}
                mem={vm.mem}
                maxmem={vm.maxmem}
                disk={vm.disk}
                maxdisk={vm.maxdisk}
                status={vm.status}
                uptime={vm.uptime}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
