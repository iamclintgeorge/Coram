import React, { useState, useEffect } from "react";
import api from "../../services/api";
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
  const [saving, setSaving] = useState(false);
  const [rateCards, setRateCards] = useState([]);
  const [creatingNew, setCreatingNew] = useState(false);

  useEffect(() => {
    fetchBillingConfig();
  }, []);

  const handleCreateNew = () => {
    setConfig({
      name: "", // new field for Rate Card Name
      created_at: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
      currency: "₹",
      currency_code: "INR",
      cpu_rate: 0,
      ram_rate: 0,
      ram_alloc_rate: 0,
      disk_rate: 0,
      disk_alloc_rate: 0,
      uptime_rate: 0,
      billing_period: "hourly",
    });
    setCreatingNew(true);
    toast.info("New rate card initialized — configure and save");
  };

  const createBillingConfig = async (configData) => {
    try {
      setSaving(true);
      await api.post("/api/billing/create-config", configData);
      toast.success("New rate card created!");
      fetchBillingConfig();
      setCreatingNew(false);
      setConfig(null);
    } catch (err) {
      console.error("Failed to Create BillingConfig", err);
      toast.error("Failed to create billing configuration");
    } finally {
      setSaving(false);
    }
  };

  const fetchBillingConfig = async () => {
    try {
      const res = await api.get("/api/billing/fetch-config");
      // Map currency based on currency_code if symbol is missing
      const formatted = (res.data || []).map(card => ({
        ...card,
        currency: CURRENCIES.find(c => c.code === card.currency_code)?.symbol || "₹"
      }));
      setRateCards(formatted);
    } catch (err) {
      console.error("Failed to fetch BillingConfig", err);
      toast.error("Failed to load billing configurations");
    }
  };

  const updateBillingConfig = async (id, configData) => {
    try {
      setSaving(true);
      await api.put(`/api/billing/update-config/${id}`, configData);
      toast.success("Rate card updated!");
      fetchBillingConfig();
      setCreatingNew(false);
      setConfig(null);
    } catch (err) {
      console.error("Failed to Update BillingConfig", err);
      toast.error("Failed to update configuration");
    } finally {
      setSaving(false);
    }
  };

  const deleteBillingConfig = async (id) => {
    try {
      await api.delete(`/api/billing/delete-config/${id}`);
      toast.success("Rate card deleted!");
      fetchBillingConfig();
    } catch (err) {
      console.error("Failed to Delete BillingConfig", err);
      toast.error("Failed to delete configuration");
    }
  };

  const handleSave = () => {
    // Note: 'name' is not in the backend model 'BillingConfig' but used in frontend.
    // We'll proceed with other fields. 
    // If the user wants 'name', they should add it to the backend model.

    const payload = {
      currency_code: config.currency_code,
      billing_period: config.billing_period,
      cpu_rate: Number(config.cpu_rate),
      ram_rate: Number(config.ram_rate),
      ram_alloc_rate: Number(config.ram_alloc_rate),
      disk_rate: Number(config.disk_rate),
      disk_alloc_rate: Number(config.disk_alloc_rate),
      uptime_rate: Number(config.uptime_rate),
    };

    if (creatingNew) {
      createBillingConfig(payload);
    } else {
      updateBillingConfig(config.id, payload);
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

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this rate card?")) {
      deleteBillingConfig(id);
    }
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

  // --- Show list of existing rate cards if not creating new ---
  if (!creatingNew) {
    return (
      <div className="p-8 mx-auto font-inter">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Billing Rate Cards
          </h1>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg leading-none">＋</span> New Rate Card
          </button>
        </div>

        {rateCards.length === 0 ? (
          <p className="text-gray-500">
            No rate cards found. Click "New Rate Card" to create one.
          </p>
        ) : (
          <div className="space-y-4">
            {rateCards.map((card) => (
              <div
                key={card.id}
                className="flex justify-between items-center bg-white border border-gray-200 rounded-2xl p-4"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {card.name} {/* Show Name instead of currency_code */}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Currency: {card.currency_code}, Billing Period:{" "}
                    {card.billing_period}
                  </p>
                  <p className="text-gray-500 text-sm">
                    CPU: {card.currency}
                    {card.cpu_rate}, RAM: {card.currency}
                    {card.ram_rate}, Disk: {card.currency}
                    {card.disk_rate}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setConfig(card);
                      setCreatingNew(true);
                    }}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(card.id)}
                    className="px-3 py-1.5 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- Show the form when creating new or editing ---
  return (
    <div className="p-8 mx-auto font-inter">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Billing Settings
          </h1>
          <p className="text-gray-500 mt-1">
            Configure billing rates, currency, and parameters
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCreatingNew(false)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
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

      {/* Rate Card Name & Date */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Rate Card Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rate Card Name
            </label>
            <input
              type="text"
              value={config.name || ""}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Enter rate card name"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Created
            </label>
            <input
              type="date"
              value={config.created_at || new Date().toISOString().slice(0, 10)}
              onChange={(e) => updateField("created_at", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
            />
          </div>
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
    </div>
  );
};

export default BillingSettings;
