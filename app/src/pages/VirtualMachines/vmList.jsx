import React from "react";
import { Link } from "react-router-dom";
import SpecList from "../../components/specList";
import api from "../../services/api";
import usePolling from "../../hooks/usePolling";
import { RefreshCw } from "lucide-react";
import { timeAgo } from "../../utils/formatters";

const POLL_INTERVAL = 10000;

const VMList = () => {
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  const fetchNodes = async () => {
    try {
      const res = await api.get("/api/proxmox/get-config");
      setNodes(res.data.nodes || []);
      if (res.data.nodes?.length > 0 && !selectedNode) {
        setSelectedNode(res.data.nodes[0]);
      }
    } catch (err) {
      console.error("Failed to fetch Proxmox nodes", err);
    }
  };

  const fetchVMStats = async () => {
    if (!selectedNode) return [];
    const response = await api.get(
      `/api/proxmox/fetchNodeStats/${selectedNode.node_name}`
    );
    return response.data;
  };

  const {
    data: stats,
    loading,
    lastUpdated,
    refresh,
  } = usePolling(fetchVMStats, POLL_INTERVAL, !!selectedNode);

  React.useEffect(() => {
    fetchNodes();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded-xl w-1/4" />
          <div className="grid grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-56 bg-gray-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight font-inter">
            Virtual Machines
          </h1>
          <p className="text-gray-500 mt-1">
            {stats?.length || 0} machines found
          </p>
        </div>
        <div className="flex items-center gap-4">
          {nodes.length > 1 && (
            <select
              value={selectedNode?.id || ""}
              onChange={(e) =>
                setSelectedNode(
                  nodes.find((n) => n.id === parseInt(e.target.value))
                )
              }
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium outline-none transition-all cursor-pointer border-none"
            >
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  Node: {node.node_name}
                </option>
              ))}
            </select>
          )}

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
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* VM Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {(stats || []).map((vm) => (
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
  );
};

export default VMList;
