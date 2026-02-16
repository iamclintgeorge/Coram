import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SpecList from "../../components/specList";
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
        { withCredentials: true },
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
        <div className="text-center py-12 ">
          {/* <Server className="mx-auto mb-4 text-gray-400" size={64} /> */}
          <h2 className="text-2xl font-inter font-medium text-black mb-2">
            No Active VMs
          </h2>
          <p className="text-gray-500 font-inter">
            You don't have any active VMs!
          </p>
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
        </>
      )}
    </div>
  );
};

export default Dashboard;
