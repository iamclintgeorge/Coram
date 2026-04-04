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
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({
    host: "",
    port: "",
    nodeName: "",
    apiToken: "",
  });

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

  // OPEN MODAL FOR NEW NODE

  const addNode = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_admin_server}/api/proxmox/create-config`,
        { withCredentials: true },
      );
    } catch (err) {
      console.error("Failed to Create Node Config", err);
    }
  };

  const fetchNode = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_admin_server}/api/proxmox/get-config`,
        { withCredentials: true },
      );
    } catch (err) {
      console.error("Failed to fetch Node Config", err);
    }
  };

  const updateNode = async () => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_admin_server}/api/proxmox/update-config`,
        { withCredentials: true },
      );
    } catch (err) {
      console.error("Failed to Update Node Config", err);
    }
  };

  const deleteNode = async () => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_admin_server}/api/proxmox/delete-config`,
        { withCredentials: true },
      );
    } catch (err) {
      console.error("Failed to Delete Node Config", err);
    }
  };

  const handleAddNode = () => {
    setEditingIndex(null);
    setForm({ host: "", port: "", nodeName: "", apiToken: "" });
    setIsNodeModalOpen(true);
  };

  // OPEN MODAL FOR EDIT
  const handleEditNode = (index) => {
    setEditingIndex(index);
    setForm(nodes[index]);
    setIsNodeModalOpen(true);
  };

  // SAVE NODE
  const handleSaveNode = () => {
    if (!form.host || !form.port || !form.nodeName || !form.apiToken) {
      toast.error("All fields are required");
      return;
    }

    if (editingIndex !== null) {
      // update existing
      const updated = [...nodes];
      updated[editingIndex] = form;
      setNodes(updated);
    } else {
      // add new
      setNodes((prev) => [...prev, form]);
    }

    setIsNodeModalOpen(false);
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
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
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
                  className="w-full md:w-64 rounded-md border border-gray-200 font-inter text-sm shadow-sm px-2 py-1 text-gray-800 bg-white"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                  <option value="system">System Preference</option>
                </select>
              </div>
              <div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    VM Display Preference
                  </label>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-800">
                      <input
                        type="radio"
                        name="vmDisplay"
                        value="light"
                        checked={theme === "light"}
                        onChange={(e) => setTheme(e.target.value)}
                        className="w-4 h-4 accent-gray-900"
                      />
                      Show VMs in all Nodes
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-800">
                      <input
                        type="radio"
                        name="vmDisplay"
                        value="dark"
                        checked={theme === "dark"}
                        onChange={(e) => setTheme(e.target.value)}
                        className="w-4 h-4 accent-gray-900"
                      />
                      Show VMs of only the selected Node
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {/* Header */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Proxmox Nodes</h2>

                <button
                  onClick={handleAddNode}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm"
                >
                  + Add Node
                </button>
              </div>

              {/* Node List */}
              {nodes.length === 0 ? (
                <div className="text-gray-500 text-sm">No nodes added yet.</div>
              ) : (
                <div className="space-y-3">
                  {nodes.map((node, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center border border-gray-200 rounded-xl p-4"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {node.nodeName || "Unnamed Node"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {node.host}:{node.port}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditNode(index)}
                          className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => removeNode(index)}
                          className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {isNodeModalOpen && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-semibold mb-4">
                    {editingIndex !== null ? "Edit Node" : "Add Node"}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      placeholder="Host"
                      value={form.host}
                      onChange={(e) =>
                        setForm({ ...form, host: e.target.value })
                      }
                      className="p-3 border rounded-lg"
                    />

                    <input
                      placeholder="Port"
                      value={form.port}
                      onChange={(e) =>
                        setForm({ ...form, port: e.target.value })
                      }
                      className="p-3 border rounded-lg"
                    />

                    <input
                      placeholder="Node Name"
                      value={form.nodeName}
                      onChange={(e) =>
                        setForm({ ...form, nodeName: e.target.value })
                      }
                      className="p-3 border rounded-lg"
                    />

                    <input
                      placeholder="API Token"
                      value={form.apiToken}
                      onChange={(e) =>
                        setForm({ ...form, apiToken: e.target.value })
                      }
                      className="p-3 border rounded-lg"
                    />
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      onClick={() => setIsNodeModalOpen(false)}
                      className="px-4 py-2 border rounded-lg"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleSaveNode}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
