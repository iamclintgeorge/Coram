import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [nodes, setNodes] = useState([
    { host: "", port: "", nodeName: "", apiToken: "" },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    fetchProxmoxConfig();
  }, []);

  const fetchProxmoxConfig = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_admin_server}/api/setup/proxmox`,
        { withCredentials: true },
      );
      if (response.data?.nodes?.length) {
        setNodes(response.data.nodes);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error("Failed to load Proxmox configuration");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNodeChange = (index, field, value) => {
    const updatedNodes = [...nodes];
    updatedNodes[index][field] = value;
    setNodes(updatedNodes);
  };

  const addNode = () => {
    setNodes((prev) => [
      ...prev,
      { host: "", port: "", nodeName: "", apiToken: "" },
    ]);
  };

  const removeNode = (index) => {
    setNodes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_admin_server}/api/setup/proxmox`,
        { nodes },
        { withCredentials: true },
      );
      toast.success("Proxmox settings updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-white">Loading settings...</div>;
  }

  return (
    <div className="p-8 text-neutral-100 max-w-4xl font-inter">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Settings
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your application preferences and node configurations
        </p>
      </div>

      <div className="flex border-b border-gray-300 mb-6 gap-8">
        <button
          onClick={() => setActiveTab("general")}
          className={`pb-2 text-sm font-medium transition-colors ${
            activeTab === "general"
              ? "text-black border-b-2 border-black"
              : "text-gray-500 hover:text-black"
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab("nodes")}
          className={`pb-2 text-sm font-medium transition-colors ${
            activeTab === "nodes"
              ? "text-black border-b-2 border-black"
              : "text-gray-500 hover:text-black"
          }`}
        >
          Node Config
        </button>
      </div>

      <div className="rounded-xl border border-gray-500 p-6 shadow-lg text-black">
        {activeTab === "general" ? (
          <div>
            <h2 className="text-xl font-semibold mb-6">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Appearance (Theme)
                </label>
                <select
                  className="w-full md:w-64 rounded-md border border-gray-200 shadow-sm p-3 text-gray-800 bg-white"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                  <option value="system">System Preference</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              Proxmox Nodes
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {nodes.map((node, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-300 pb-4 mb-4 relative"
                >
                  {nodes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeNode(index)}
                      className="absolute -top-5 right-0 mt-2 mr-2 text-red-500 font-bold"
                    >
                      ✕
                    </button>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1">
                      Host (IP or Domain)
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-md border border-gray-200 shadow-sm p-3 text-gray-800"
                      value={node.host}
                      onChange={(e) =>
                        handleNodeChange(index, "host", e.target.value)
                      }
                      placeholder="192.168.1.100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1">
                      Port
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-md border border-gray-200 shadow-sm p-3 text-gray-800"
                      value={node.port}
                      onChange={(e) =>
                        handleNodeChange(index, "port", e.target.value)
                      }
                      placeholder="8006"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1">
                      Node Name
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-md border border-gray-200 shadow-sm p-3 text-gray-800"
                      value={node.nodeName}
                      onChange={(e) =>
                        handleNodeChange(index, "nodeName", e.target.value)
                      }
                      placeholder="pve"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1">
                      API Token
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-md border border-gray-200 shadow-sm p-3 text-gray-800"
                      value={node.apiToken}
                      onChange={(e) =>
                        handleNodeChange(index, "apiToken", e.target.value)
                      }
                      placeholder="root@pam!token=secret"
                    />
                    <p className="mt-1 text-xs text-neutral-500">
                      Format: TokenID=Secret
                    </p>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addNode}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              >
                + Add Node
              </button>
              <div className="flex justify-end pt-4 border-t border-neutral-700">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gray-900 text-white px-6 py-2 rounded-xl hover:bg-black transition-all disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
