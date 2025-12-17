import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SpecList from "../../components/specList";
import axios from "axios";
import SearchBar from "../../components/searchBar";

const VMList = () => {
  const [stats, setStats] = useState([]);
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
      console.log(response.data);
    } catch (err) {
      console.log("Error while fetching VM Stats:", err.message);
    }
  };

  return (
    <>
      <div>
        <SearchBar />
      </div>
      <div className="mt-10">
        <div className="mt-10 flex flex-wrap gap-6">
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
  );
};

export default VMList;
