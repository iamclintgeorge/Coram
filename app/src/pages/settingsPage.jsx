import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const SettingsPage = () => {
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [nodeName, setNodeName] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProxmoxConfig();
  }, []);

  const fetchProxmoxConfig = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_admin_server}/api/setup/proxmox`,
        { withCredentials: true }
      );
      if (response.data) {
        setHost(response.data.host || "");
        setPort(response.data.port || "");
        setNodeName(response.data.node_name || "");
        setApiToken(response.data.api_token || "");
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error("Failed to load Proxmox configuration");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_admin_server}/api/setup/proxmox`,
        {
          host,
          port,
          node_name: nodeName,
          api_token: apiToken,
        },
        { withCredentials: true }
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
    <div className="p-8 text-neutral-100 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Settings
        </h1>
        <p className="text-neutral-400 mt-2">
          Manage your Coram application preferences and server configurations.
        </p>
      </div>

      <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-lg">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <span className="text-emerald-400">☁️</span> Proxmox Configuration
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">
                Host (IP or Domain)
              </label>
              <input
                type="text"
                required
                className="w-full rounded-md bg-neutral-900 border-neutral-700 shadow-sm p-3 border focus:ring-emerald-500 focus:border-emerald-500 text-white transition-colors"
                value={host}
                onChange={(e) => setHost(e.target.value)}
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
                className="w-full rounded-md bg-neutral-900 border-neutral-700 shadow-sm p-3 border focus:ring-emerald-500 focus:border-emerald-500 text-white transition-colors"
                value={port}
                onChange={(e) => setPort(e.target.value)}
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
                className="w-full rounded-md bg-neutral-900 border-neutral-700 shadow-sm p-3 border focus:ring-emerald-500 focus:border-emerald-500 text-white transition-colors"
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
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
                className="w-full rounded-md bg-neutral-900 border-neutral-700 shadow-sm p-3 border focus:ring-emerald-500 focus:border-emerald-500 text-white transition-colors"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="root@pam!token=secret"
              />
              <p className="mt-1 text-xs text-neutral-500">
                Format: TokenID=Secret (e.g., root@pam!token=aaaa-bbbb)
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-neutral-700">
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 text-white px-6 py-2 rounded-md hover:bg-emerald-500 font-semibold transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
