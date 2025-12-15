import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Server,
  Power,
  PowerOff,
  RefreshCw,
  Loader,
  Activity,
} from "lucide-react";
import api from "../../services/api";
import { toast } from "react-toastify";
import SpecList from "../../components/specList";
import axios from "axios";

const VMList = () => {
  const [vms, setVMs] = useState([]);
  const [stats, setStats] = useState(null);
  const nodeName = "pve";
  // const [loading, setLoading] = useState(true);
  // const [actionLoading, setActionLoading] = useState({});

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
      console.log(response.data.data); // Debugging
    } catch (err) {
      console.log("Error while fetching VM Stats:", err.message);
    }
  };

  // const fetchVMs = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await api.get("/api/vms");
  //     setVMs(response.data.vms || []);
  //   } catch (error) {
  //     toast.error("Failed to fetch VMs");
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleVMAction = async (vmID, action) => {
  //   try {
  //     setActionLoading({ ...actionLoading, [vmID]: action });
  //     await api.post(`/api/vms/${vmID}/${action}`);
  //     toast.success(`VM ${action} initiated successfully`);
  //     setTimeout(fetchVMs, 2000);
  //   } catch (error) {
  //     toast.error(`Failed to ${action} VM`);
  //     console.error(error);
  //   } finally {
  //     setActionLoading({ ...actionLoading, [vmID]: null });
  //   }
  // };

  // const formatBytes = (bytes) => {
  //   if (!bytes) return "0 B";
  //   const k = 1024;
  //   const sizes = ["B", "KB", "MB", "GB"];
  //   const i = Math.floor(Math.log(bytes) / Math.log(k));
  //   return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  // };

  // const formatUptime = (seconds) => {
  //   if (!seconds) return "0s";
  //   const days = Math.floor(seconds / 86400);
  //   const hours = Math.floor((seconds % 86400) / 3600);
  //   const mins = Math.floor((seconds % 3600) / 60);

  //   if (days > 0) return `${days}d ${hours}h`;
  //   if (hours > 0) return `${hours}h ${mins}m`;
  //   return `${mins}m`;
  // };

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen bg-gray-50">
  //       <Loader className="w-8 h-8 animate-spin text-blue-600" />
  //     </div>
  //   );
  // }

  return (
    <div>
      {stats?.map((vm) => (
        <div key={vm.vmid} className="w-[30%]">
          <SpecList
            title={vm.name} // VM name
            cpu={vm.cpu}
            ram={vm.mem / 1024 / 1024}
            disk={vm.disk / 1024 / 1024 / 1024}
            status={vm.status}
            icon={Server}
          />
        </div>
      ))}
    </div>
    // <div className="p-6 bg-gray-50 min-h-screen w-[76vw]">
    //   <div className="mb-6">
    //     <div className="flex justify-between items-center">
    //       <div>
    //         <h1 className="text-3xl font-bold text-gray-900 font-playfair">
    //           My Virtual Machines
    //         </h1>
    //         <p className="text-gray-600 font-inter mt-1">
    //           Manage and monitor your VMs
    //         </p>
    //       </div>
    //       <button
    //         onClick={fetchVMs}
    //         className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
    //       >
    //         <RefreshCw className="w-4 h-4" />
    //         Refresh
    //       </button>
    //     </div>
    //   </div>

    //   {vms.length === 0 ? (
    //     <div className="text-center py-16 bg-white rounded-lg shadow-sm">
    //       <Server className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    //       <h3 className="text-xl font-semibold text-gray-900 mb-2">
    //         No Virtual Machines
    //       </h3>
    //       <p className="text-gray-600 mb-4">You don't have any VMs yet</p>
    //     </div>
    //   ) : (
    //     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    //       {vms.map((vm) => (
    //         <div
    //           key={vm.vm_id}
    //           className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
    //         >
    //           <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
    //             <div className="flex items-center justify-between">
    //               <div className="flex items-center gap-3">
    //                 <Server className="w-6 h-6" />
    //                 <div>
    //                   <h3 className="font-semibold text-lg">{vm.vm_name}</h3>
    //                   <p className="text-blue-100 text-sm">ID: {vm.vm_id}</p>
    //                 </div>
    //               </div>
    //               <span
    //                 className={`px-3 py-1 rounded-full text-xs font-semibold ${
    //                   vm.live_data?.status === "running"
    //                     ? "bg-green-500 text-white"
    //                     : "bg-gray-500 text-white"
    //                 }`}
    //               >
    //                 {vm.live_data?.status || vm.status}
    //               </span>
    //             </div>
    //           </div>

    //           <div className="p-4">
    //             <div className="grid grid-cols-2 gap-4 mb-4">
    //               <div className="bg-gray-50 p-3 rounded-lg">
    //                 <p className="text-xs text-gray-600 mb-1">CPU Cores</p>
    //                 <p className="text-lg font-semibold text-gray-900">
    //                   {vm.live_data?.cpus || 0}
    //                 </p>
    //               </div>
    //               <div className="bg-gray-50 p-3 rounded-lg">
    //                 <p className="text-xs text-gray-600 mb-1">Memory</p>
    //                 <p className="text-lg font-semibold text-gray-900">
    //                   {formatBytes(vm.live_data?.maxmem)}
    //                 </p>
    //               </div>
    //               <div className="bg-gray-50 p-3 rounded-lg">
    //                 <p className="text-xs text-gray-600 mb-1">Disk</p>
    //                 <p className="text-lg font-semibold text-gray-900">
    //                   {formatBytes(vm.live_data?.maxdisk)}
    //                 </p>
    //               </div>
    //               <div className="bg-gray-50 p-3 rounded-lg">
    //                 <p className="text-xs text-gray-600 mb-1">Uptime</p>
    //                 <p className="text-lg font-semibold text-gray-900">
    //                   {formatUptime(vm.live_data?.uptime)}
    //                 </p>
    //               </div>
    //             </div>

    //             {vm.live_data?.cpu !== undefined && (
    //               <div className="mb-4">
    //                 <div className="flex justify-between text-sm mb-1">
    //                   <span className="text-gray-600">CPU Usage</span>
    //                   <span className="font-semibold text-gray-900">
    //                     {(vm.live_data.cpu * 100).toFixed(1)}%
    //                   </span>
    //                 </div>
    //                 <div className="w-full bg-gray-200 rounded-full h-2">
    //                   <div
    //                     className="bg-blue-600 h-2 rounded-full transition-all"
    //                     style={{ width: `${vm.live_data.cpu * 100}%` }}
    //                   ></div>
    //                 </div>
    //               </div>
    //             )}

    //             {vm.live_data?.mem && vm.live_data?.maxmem && (
    //               <div className="mb-4">
    //                 <div className="flex justify-between text-sm mb-1">
    //                   <span className="text-gray-600">Memory</span>
    //                   <span className="font-semibold text-gray-900">
    //                     {(
    //                       (vm.live_data.mem / vm.live_data.maxmem) *
    //                       100
    //                     ).toFixed(1)}
    //                     %
    //                   </span>
    //                 </div>
    //                 <div className="w-full bg-gray-200 rounded-full h-2">
    //                   <div
    //                     className="bg-green-600 h-2 rounded-full transition-all"
    //                     style={{
    //                       width: `${
    //                         (vm.live_data.mem / vm.live_data.maxmem) * 100
    //                       }%`,
    //                     }}
    //                   ></div>
    //                 </div>
    //               </div>
    //             )}

    //             <div className="flex gap-2 mt-4">
    //               {vm.live_data?.status === "running" ? (
    //                 <>
    //                   <button
    //                     onClick={() => handleVMAction(vm.vm_id, "shutdown")}
    //                     disabled={actionLoading[vm.vm_id]}
    //                     className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
    //                   >
    //                     {actionLoading[vm.vm_id] === "shutdown" ? (
    //                       <Loader className="w-4 h-4 animate-spin" />
    //                     ) : (
    //                       <PowerOff className="w-4 h-4" />
    //                     )}
    //                     Shutdown
    //                   </button>
    //                   <button
    //                     onClick={() => handleVMAction(vm.vm_id, "stop")}
    //                     disabled={actionLoading[vm.vm_id]}
    //                     className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
    //                   >
    //                     {actionLoading[vm.vm_id] === "stop" ? (
    //                       <Loader className="w-4 h-4 animate-spin" />
    //                     ) : (
    //                       <PowerOff className="w-4 h-4" />
    //                     )}
    //                     Stop
    //                   </button>
    //                 </>
    //               ) : (
    //                 <button
    //                   onClick={() => handleVMAction(vm.vm_id, "start")}
    //                   disabled={actionLoading[vm.vm_id]}
    //                   className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
    //                 >
    //                   {actionLoading[vm.vm_id] === "start" ? (
    //                     <Loader className="w-4 h-4 animate-spin" />
    //                   ) : (
    //                     <Power className="w-4 h-4" />
    //                   )}
    //                   Start
    //                 </button>
    //               )}
    //             </div>
    //           </div>

    //           <div className="bg-gray-50 px-4 py-3 text-xs text-gray-600 border-t">
    //             <div className="flex justify-between items-center">
    //               <span>
    //                 Created: {new Date(vm.created_at).toLocaleDateString()}
    //               </span>
    //               <Activity className="w-4 h-4 text-gray-400" />
    //             </div>
    //           </div>
    //         </div>
    //       ))}
    //     </div>
    //   )}
    // </div>
  );
};

export default VMList;
