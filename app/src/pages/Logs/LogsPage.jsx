import React, { useState, useEffect } from "react";
import axios from "axios";
import usePolling from "../../hooks/usePolling";
import { timeAgo } from "../../utils/formatters";
import { RefreshCw, Filter, Terminal, Activity } from "lucide-react";

const POLL_INTERVAL = 15000;

const LogsPage = () => {
  const [activeTab, setActiveTab] = useState("coram"); // "coram" or "proxmox"
  const [filters, setFilters] = useState({
    level: "",
    service: "",
    username: "",
    page: 1,
    limit: 50,
  });
  const [showFilters, setShowFilters] = useState(false);
  const nodeName = "pve";

  // Coram logs polling
  const fetchCoramLogs = async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    const response = await axios.get(
      `${import.meta.env.VITE_admin_server}/api/logs?${params}`,
      { withCredentials: true }
    );
    return response.data;
  };

  // Proxmox syslog polling
  const fetchProxmoxLogs = async () => {
    const response = await axios.get(
      `${import.meta.env.VITE_admin_server}/api/logs/proxmox/${nodeName}`,
      { withCredentials: true }
    );
    return response.data;
  };

  const {
    data: coramData,
    loading: coramLoading,
    lastUpdated: coramUpdated,
    refresh: coramRefresh,
  } = usePolling(fetchCoramLogs, POLL_INTERVAL, activeTab === "coram");

  const {
    data: proxmoxData,
    loading: proxmoxLoading,
    lastUpdated: proxmoxUpdated,
    refresh: proxmoxRefresh,
  } = usePolling(fetchProxmoxLogs, POLL_INTERVAL, activeTab === "proxmox");

  const levelColors = {
    error: "bg-red-100 text-red-700",
    warn: "bg-amber-100 text-amber-700",
    warning: "bg-amber-100 text-amber-700",
    info: "bg-blue-100 text-blue-700",
    debug: "bg-purple-100 text-purple-700",
    success: "bg-emerald-100 text-emerald-700",
  };

  const getLevelColor = (level) =>
    levelColors[level?.toLowerCase()] || "bg-gray-100 text-gray-700";

  const tabs = [
    { id: "coram", label: "Coram Activity", icon: Activity, count: coramData?.total || 0 },
    { id: "proxmox", label: "Proxmox Syslog", icon: Terminal, count: proxmoxData?.data?.length || 0 },
  ];

  const isLoading = activeTab === "coram" ? coramLoading : proxmoxLoading;
  const lastUpdated = activeTab === "coram" ? coramUpdated : proxmoxUpdated;
  const handleRefresh = activeTab === "coram" ? coramRefresh : proxmoxRefresh;

  return (
    <div className="p-8 max-w-7xl mx-auto font-inter">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Logs
          </h1>
          <p className="text-gray-500 mt-1">
            Monitor Proxmox system logs and application activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              {timeAgo(lastUpdated)}
            </div>
          )}
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === tab.id ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-500"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Coram Tab Filters */}
      {activeTab === "coram" && (
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>

          {showFilters && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Level</label>
                <select
                  value={filters.level}
                  onChange={(e) => setFilters({ ...filters, level: e.target.value, page: 1 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">All Levels</option>
                  {["info", "warn", "error", "debug"].map((l) => (
                    <option key={l} value={l}>{l.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Service</label>
                <select
                  value={filters.service}
                  onChange={(e) => setFilters({ ...filters, service: e.target.value, page: 1 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">All Services</option>
                  {["auth", "billing", "vm", "system", "alerting"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Username</label>
                <input
                  type="text"
                  value={filters.username}
                  onChange={(e) => setFilters({ ...filters, username: e.target.value, page: 1 })}
                  placeholder="Filter by user..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() =>
                    setFilters({ level: "", service: "", username: "", page: 1, limit: 50 })
                  }
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Log Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading logs...</p>
          </div>
        ) : activeTab === "coram" ? (
          /* Coram Logs Table */
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">Level</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                </tr>
              </thead>
              <tbody>
                {(coramData?.logs || []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      No logs found
                    </td>
                  </tr>
                ) : (
                  coramData.logs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getLevelColor(log.level)}`}>
                          {log.level?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">{log.service}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{log.title}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{log.description}</td>
                      <td className="px-4 py-3 text-gray-600">{log.username || "system"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Proxmox Syslog */
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Line</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Log Entry</th>
                </tr>
              </thead>
              <tbody>
                {(proxmoxData?.data || []).length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center py-12 text-gray-400">
                      No Proxmox syslog entries available. The API token may lack syslog permissions.
                    </td>
                  </tr>
                ) : (
                  (proxmoxData.data || []).map((entry, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors font-mono text-xs">
                      <td className="px-4 py-2 text-gray-400 w-16">{entry.n || i + 1}</td>
                      <td className="px-4 py-2 text-gray-700 whitespace-pre-wrap">{entry.t || entry.d || JSON.stringify(entry)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination for Coram logs */}
      {activeTab === "coram" && coramData?.pagination?.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <span className="text-sm text-gray-500">
            Page {coramData.pagination.page} of {coramData.pagination.totalPages} ({coramData.pagination.totalCount} total)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={!coramData.pagination.hasPrev}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={!coramData.pagination.hasNext}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogsPage;
