import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Save, RotateCcw } from "lucide-react";

const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
];

const BILLING_PERIODS = [
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "monthly", label: "Monthly" },
];

const BillingSettings = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_admin_server}/api/billing/config`,
        { withCredentials: true },
      );
      setConfig(response.data);
    } catch (err) {
      console.error("Error fetching billing config:", err);
      toast.error("Failed to load billing configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_admin_server}/api/billing/config`,
        config,
        { withCredentials: true },
      );
      toast.success("Billing configuration saved!");
    } catch (err) {
      console.error("Error saving billing config:", err);
      toast.error("Failed to save billing configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig({
      ...config,
      currency: "₹",
      currency_code: "INR",
      cpu_rate: 0.05,
      ram_rate: 0.002,
      ram_alloc_rate: 0.002,
      disk_rate: 0.001,
      disk_alloc_rate: 0.001,
      uptime_rate: 0.01,
      billing_period: "hourly",
    });
    toast.info("Reset to defaults — click Save to apply");
  };

  const updateField = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (code) => {
    const cur = CURRENCIES.find((c) => c.code === code);
    if (cur) {
      updateField("currency", cur.symbol);
      updateField("currency_code", cur.code);
    }
  };

  if (loading || !config) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded-xl w-1/3" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const rateFields = [
    {
      key: "cpu_rate",
      label: "CPU Usage Rate",
      unit: "per % per hour",
      description: "Cost per 1% CPU usage per hour",
    },
    {
      key: "ram_rate",
      label: "RAM Usage Rate",
      unit: "per MB per hour",
      description: "Cost per MB of memory used per hour",
    },
    {
      key: "ram_alloc_rate",
      label: "RAM Allocation Rate",
      unit: "per MB allocated",
      description: "Cost per MB of memory allocated",
    },
    {
      key: "disk_rate",
      label: "Disk Usage Rate",
      unit: "per GB per hour",
      description: "Cost per GB of disk used per hour",
    },
    {
      key: "disk_alloc_rate",
      label: "Disk Allocation Rate",
      unit: "per GB allocated",
      description: "Cost per GB of disk allocated",
    },
    {
      key: "uptime_rate",
      label: "Uptime Rate",
      unit: "per hour",
      description: "Cost per hour of VM uptime",
    },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto font-inter">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Billing Settings
          </h1>
          <p className="text-gray-500 mt-1">
            Configure billing rates, currency, and parameters
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 transition-all"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Currency & Period */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          General Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={config.currency_code || "INR"}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} — {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Billing Period
            </label>
            <select
              value={config.billing_period || "hourly"}
              onChange={(e) => updateField("billing_period", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
            >
              {BILLING_PERIODS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Rate Configuration */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Resource Rates
        </h2>
        <div className="space-y-5">
          {rateFields.map((field) => (
            <div key={field.key} className="flex items-center gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-800">
                  {field.label}
                </label>
                <p className="text-xs text-gray-400">{field.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{config.currency}</span>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={config[field.key] || 0}
                  onChange={(e) =>
                    updateField(field.key, parseFloat(e.target.value) || 0)
                  }
                  className="w-32 px-3 py-2 border border-gray-200 rounded-xl text-right text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                />
                <span className="text-xs text-gray-400 w-24">{field.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rate Preview */}
      <div className="mt-6 bg-white border border-gray-400 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-black uppercase tracking-wider mb-3">
          Rate Preview
        </h3>
        <p className="text-sm text-gray-600">
          A VM with{" "}
          <span className="font-semibold">2 CPU cores at 50% usage</span>,{" "}
          <span className="font-semibold">2 GB RAM</span>,{" "}
          <span className="font-semibold">20 GB disk</span>, running for{" "}
          <span className="font-semibold">24 hours</span> would cost
          approximately:{" "}
          <span className="text-2xl font-bold text-red-600 ml-2">
            {config.currency}
            {(
              50 * config.cpu_rate +
              2048 * config.ram_rate +
              2048 * config.ram_alloc_rate +
              20 * config.disk_rate +
              20 * config.disk_alloc_rate +
              24 * config.uptime_rate
            ).toFixed(2)}
          </span>
        </p>
      </div>
    </div>
  );
};

export default BillingSettings;
