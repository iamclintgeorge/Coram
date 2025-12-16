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
    <div>
      {stats?.map((vm) => (
        <div key={vm.vmid} className="w-[30%]">
          <Link to={`/vms/${vm.vmid}`}>
            <SpecList
              title={vm.name} // VM name
              cpu={vm.cpu}
              ram={vm.mem / 1024 / 1024}
              disk={vm.disk / 1024 / 1024 / 1024}
              status={vm.status}
              icon={Server}
            />
          </Link>
        </div>
      ))}
    </div>
  );
};

export default VMList;
