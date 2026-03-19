import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Bell, BellOff, Plus, Trash2, Check, AlertTriangle, X,
  Cpu, HardDrive, Activity, RefreshCw,
} from "lucide-react";
import { timeAgo } from "../../utils/formatters";
import usePolling from "../../hooks/usePolling";

const POLL_INTERVAL = 15000;

const METRIC_ICONS = {
  cpu: Cpu,
  memory: Activity,
  disk: HardDrive,
};

const CONDITION_LABELS = {
  gt: "greater than",
  lt: "less than",
  eq: "equal to",
};

const AlertsPage = () => {
  const [rules, setRules] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newRule, setNewRule] = useState({
    name: "",
    metric: "cpu",
    condition: "gt",
    threshold: 80,
    vm_filter: "all",
    enabled: true,
  });
  const [saving, setSaving] = useState(false);

  // Fetch rules
  const fetchRules = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_admin_server}/api/alerts/rules`,
        { withCredentials: true }
      );
      setRules(res.data || []);
    } catch (err) {
      console.error("Error fetching rules:", err);
    }
  };

  // Fetch events with polling
  const fetchEvents = async () => {
    const res = await axios.get(
      `${import.meta.env.VITE_admin_server}/api/alerts/events?limit=50`,
      { withCredentials: true }
    );
    return res.data;
  };

  const {
    data: eventsData,
    lastUpdated,
    refresh: refreshEvents,
  } = usePolling(fetchEvents, POLL_INTERVAL);

  useEffect(() => {
    fetchRules();
  }, []);

  const handleCreateRule = async () => {
    if (!newRule.name.trim()) {
      toast.error("Please enter a rule name");
      return;
    }
    setSaving(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_admin_server}/api/alerts/rules`,
        newRule,
        { withCredentials: true }
      );
      toast.success("Alert rule created!");
      setShowCreate(false);
      setNewRule({ name: "", metric: "cpu", condition: "gt", threshold: 80, vm_filter: "all", enabled: true });
      fetchRules();
    } catch (err) {
      toast.error("Failed to create rule");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRule = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_admin_server}/api/alerts/rules/${id}/toggle`,
        {},
        { withCredentials: true }
      );
      fetchRules();
    } catch (err) {
      toast.error("Failed to toggle rule");
    }
  };

  const handleDeleteRule = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_admin_server}/api/alerts/rules/${id}`,
        { withCredentials: true }
      );
      toast.success("Rule deleted");
      fetchRules();
    } catch (err) {
      toast.error("Failed to delete rule");
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_admin_server}/api/alerts/events/${id}/acknowledge`,
        {},
        { withCredentials: true }
      );
      refreshEvents();
    } catch (err) {
      toast.error("Failed to acknowledge alert");
    }
  };

  const events = eventsData?.events || [];
  const unacknowledgedCount = events.filter((e) => !e.acknowledged).length;

  return (
    <div className="p-8 max-w-6xl mx-auto font-inter">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Alerts
          </h1>
          <p className="text-gray-500 mt-1">
            Configure rules and monitor triggered alerts
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unacknowledgedCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />
              {unacknowledgedCount} unacknowledged
            </div>
          )}
          {lastUpdated && (
            <div className="text-xs text-gray-400">
              Updated {timeAgo(lastUpdated)}
            </div>
          )}
          <button
            onClick={refreshEvents}
            className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alert Rules Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Alert Rules</h2>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-all text-sm font-medium"
          >
            {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showCreate ? "Cancel" : "New Rule"}
          </button>
        </div>

        {/* Create Rule Form */}
        {showCreate && (
          <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Rule Name</label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="e.g. High CPU Alert"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Metric</label>
                <select
                  value={newRule.metric}
                  onChange={(e) => setNewRule({ ...newRule, metric: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="cpu">CPU Usage (%)</option>
                  <option value="memory">Memory Usage (%)</option>
                  <option value="disk">Disk Usage (%)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Condition</label>
                <select
                  value={newRule.condition}
                  onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="gt">Greater than (&gt;)</option>
                  <option value="lt">Less than (&lt;)</option>
                  <option value="eq">Equal to (=)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Threshold (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newRule.threshold}
                  onChange={(e) => setNewRule({ ...newRule, threshold: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Apply To</label>
                <select
                  value={newRule.vm_filter}
                  onChange={(e) => setNewRule({ ...newRule, vm_filter: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="all">All VMs</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleCreateRule}
                  disabled={saving}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium transition-colors"
                >
                  {saving ? "Creating..." : "Create Rule"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rules List */}
        {rules.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Bell className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>No alert rules configured yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => {
              const Icon = METRIC_ICONS[rule.metric] || Activity;
              return (
                <div
                  key={rule.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    rule.enabled
                      ? "border-gray-200 bg-white"
                      : "border-gray-100 bg-gray-50 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${rule.enabled ? "bg-indigo-50" : "bg-gray-100"}`}>
                      <Icon className={`w-5 h-5 ${rule.enabled ? "text-indigo-600" : "text-gray-400"}`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{rule.name}</p>
                      <p className="text-sm text-gray-500">
                        {rule.metric.toUpperCase()} {CONDITION_LABELS[rule.condition]} {rule.threshold}%
                        {rule.vm_filter !== "all" && ` · VM ${rule.vm_filter}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        rule.enabled ? "text-emerald-600 hover:bg-emerald-50" : "text-gray-400 hover:bg-gray-100"
                      }`}
                      title={rule.enabled ? "Disable" : "Enable"}
                    >
                      {rule.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Alert Events Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Triggered Alerts
        </h2>

        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Check className="w-10 h-10 mx-auto mb-3 text-emerald-300" />
            <p>No alerts triggered — all systems normal</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  event.acknowledged
                    ? "border-gray-100 bg-gray-50"
                    : event.severity === "critical"
                    ? "border-red-200 bg-red-50"
                    : "border-amber-200 bg-amber-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2.5 rounded-xl ${
                      event.acknowledged
                        ? "bg-gray-100"
                        : event.severity === "critical"
                        ? "bg-red-100"
                        : "bg-amber-100"
                    }`}
                  >
                    <AlertTriangle
                      className={`w-5 h-5 ${
                        event.acknowledged
                          ? "text-gray-400"
                          : event.severity === "critical"
                          ? "text-red-600"
                          : "text-amber-600"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{event.rule_name}</p>
                    <p className="text-sm text-gray-500">
                      {event.vm_name || `VM ${event.vm_id}`} · {event.metric} at{" "}
                      {event.metric_value?.toFixed(1)}% (threshold: {event.threshold}%)
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                {!event.acknowledged && (
                  <button
                    onClick={() => handleAcknowledge(event.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Acknowledge
                  </button>
                )}
                {event.acknowledged && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Acknowledged
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
