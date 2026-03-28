import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const SetupWizard = () => {
  const [step, setStep] = useState(1);
  
  // Step 1 State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 2 State
  const [host, setHost] = useState("");
  const [port, setPort] = useState("8006");
  const [nodeName, setNodeName] = useState("");
  const [apiToken, setApiToken] = useState("");

  const handleRootSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_admin_server}/api/setup/root`, { email, password });
      toast.success("Root account created!");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create root account");
    } finally {
      setLoading(false);
    }
  };

  const handleProxmoxSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_admin_server}/api/setup/proxmox`, { host, port, node_name: nodeName, api_token: apiToken });
      toast.success("Proxmox configured! Redirecting to login...");
      // Force reload to ensure AuthProvider re-evaluates setup status
      window.location.href = "/login";
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to configure Proxmox");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 font-sans text-neutral-100">
      <div className="bg-neutral-800 p-8 rounded-xl shadow-2xl max-w-md w-full border border-neutral-700">
        <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Coram Initialization
        </h1>
        
        {step === 1 && (
          <form onSubmit={handleRootSubmit} className="space-y-5">
            <h2 className="text-xl font-semibold mb-2">1. Create Root Account</h2>
            <div>
              <label className="block text-sm font-medium text-neutral-400">Email Address</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md bg-neutral-900 border-neutral-700 shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500 text-white transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400">Strong Password</label>
              <input
                type="password"
                required
                className="mt-1 block w-full rounded-md bg-neutral-900 border-neutral-700 shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500 text-white transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white p-3 rounded-md hover:from-blue-500 hover:to-blue-400 font-semibold transition-all disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Next Step"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleProxmoxSubmit} className="space-y-5">
            <h2 className="text-xl font-semibold mb-2">2. Configure Proxmox Node</h2>
            <div>
              <label className="block text-sm font-medium text-neutral-400">Host (IP or Domain)</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md bg-neutral-900 border-neutral-700 shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500 text-white transition-colors"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="192.168.1.100"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-neutral-400">Node Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md bg-neutral-900 border-neutral-700 shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500 text-white transition-colors"
                  value={nodeName}
                  onChange={(e) => setNodeName(e.target.value)}
                  placeholder="pve"
                />
              </div>
              <div className="w-1/3">
                <label className="block text-sm font-medium text-neutral-400">Port</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md bg-neutral-900 border-neutral-700 shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500 text-white transition-colors"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="8006"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400">API Token (ID=Secret)</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md bg-neutral-900 border-neutral-700 shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500 text-white transition-colors"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="root@pam!token=aaaa-bbbb-cccc"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-3 rounded-md hover:from-emerald-500 hover:to-emerald-400 font-semibold transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Saving config..." : "Finish Initialization"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SetupWizard;
