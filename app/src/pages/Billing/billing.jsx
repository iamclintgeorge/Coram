import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Server,
  RefreshCw,
  FileText,
  TrendingUp,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import usePolling from "../../hooks/usePolling";
import {
  formatBytes,
  formatUptime,
  formatPercentage,
  formatCurrency,
  timeAgo,
} from "../../utils/formatters";

const POLL_INTERVAL = 30000;

const Billing = () => {
  const [billingConfig, setBillingConfig] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [expandedVM, setExpandedVM] = useState(null);
  const [activeTab, setActiveTab] = useState("live"); // "live" or "invoices"
  const [nodeName, setNodeName] = useState(
    localStorage.getItem("coram_node_name") || "",
  );

  // Fetch node name from config
  useEffect(() => {
    const fetchNode = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_admin_server}/api/proxmox/nodes`,
          {
            withCredentials: true,
          },
        );
        if (res.data && res.data.length > 0) {
          const name = res.data[0].node_name;
          setNodeName(name);
          localStorage.setItem("coram_node_name", name);
          return;
        }
      } catch (err) {
        console.error("Failed to fetch registered nodes", err);
      }

      try {
        const fallbackRes = await axios.get(
          `${import.meta.env.VITE_admin_server}/api/proxmox/cluster/nodes`,
          { withCredentials: true },
        );
        if (fallbackRes.data && fallbackRes.data.length > 0) {
          const name = fallbackRes.data[0].node;
          setNodeName(name);
          localStorage.setItem("coram_node_name", name);
        }
      } catch (err) {
        console.error("Failed to fetch cluster nodes", err);
      }
    };

    if (!nodeName) fetchNode();
  }, [nodeName]);

  // Fetch billing config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_admin_server}/api/billing/config`,
          { withCredentials: true },
        );
        setBillingConfig(response.data);
      } catch (err) {
        setBillingConfig({
          currency: "₹",
          cpu_rate: 0.05,
          ram_rate: 0.002,
          ram_alloc_rate: 0.002,
          disk_rate: 0.001,
          disk_alloc_rate: 0.001,
          uptime_rate: 0.01,
        });
      }
    };
    fetchConfig();
  }, []);

  // Fetch invoices (persistent)
  const fetchInvoices = async () => {
    setInvoicesLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_admin_server}/api/billing/invoices`,
        { withCredentials: true },
      );
      setInvoices(response.data?.invoices || []);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setInvoicesLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Fetch live stats
  const fetchStats = async () => {
    if (!nodeName) return null;
    const response = await axios.get(
      `${import.meta.env.VITE_admin_server}/api/proxmox/fetchNodeStats/${nodeName}`,
      { withCredentials: true },
    );
    return response.data;
  };

  const {
    data: stats,
    loading,
    lastUpdated,
    refresh,
  } = usePolling(fetchStats, POLL_INTERVAL);

  const fetchInvoice = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_admin_server}/api/billing/fetch-invoice`,
        { withCredentials: true },
      );
    } catch (err) {
      console.error("Failed to fetch Invoice", err);
    }
  };

  const calculateCharges = (vm) => {
    if (!billingConfig) return null;
    const c = billingConfig;
    const cpuCharge = (vm.cpu || 0) * 100 * c.cpu_rate;
    const ramCharge = ((vm.mem || 0) / 1024 ** 2) * c.ram_rate;
    const ramAllocCharge = ((vm.maxmem || 0) / 1024 ** 2) * c.ram_alloc_rate;
    const diskCharge = ((vm.disk || 0) / 1024 ** 3) * c.disk_rate;
    const diskAllocCharge = ((vm.maxdisk || 0) / 1024 ** 3) * c.disk_alloc_rate;
    const uptimeCharge = ((vm.uptime || 0) / 3600) * c.uptime_rate;

    const total =
      cpuCharge +
      ramCharge +
      ramAllocCharge +
      diskCharge +
      diskAllocCharge +
      uptimeCharge;

    return {
      items: [
        {
          label: "CPU Usage",
          value: formatPercentage(vm.cpu),
          charge: cpuCharge,
        },
        {
          label: "Memory Usage",
          value: formatBytes(vm.mem),
          charge: ramCharge,
        },
        {
          label: "Memory Allocated",
          value: formatBytes(vm.maxmem),
          charge: ramAllocCharge,
        },
        {
          label: "Disk Usage",
          value: formatBytes(vm.disk),
          charge: diskCharge,
        },
        {
          label: "Disk Allocated",
          value: formatBytes(vm.maxdisk),
          charge: diskAllocCharge,
        },
        {
          label: "Uptime",
          value: formatUptime(vm.uptime),
          charge: uptimeCharge,
        },
      ],
      total,
    };
  };

  const handleMarkAsPaid = async (invoiceId) => {
    setPayingId(invoiceId);
    try {
      await axios.put(
        `${import.meta.env.VITE_admin_server}/api/billing/invoices/${invoiceId}/pay`,
        {},
        { withCredentials: true },
      );
      toast.success("Invoice marked as paid");
      fetchInvoices();
    } catch (err) {
      toast.error("Failed to mark invoice as paid");
    } finally {
      setPayingId(null);
    }
  };

  const currency = billingConfig?.currency || "₹";

  // Grand total across all VMs (live)
  const grandTotal =
    stats && billingConfig
      ? stats.reduce((sum, vm) => {
          const charges = calculateCharges(vm);
          return sum + (charges?.total || 0);
        }, 0)
      : 0;

  // Invoice totals
  const unpaidTotal = invoices
    .filter((inv) => inv.status === "unpaid")
    .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

  const paidTotal = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

  if (loading || !billingConfig) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded-xl w-1/4" />
          <div className="h-32 bg-gray-200 rounded-2xl" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto font-inter">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Invoice
          </h1>
          <p className="text-gray-500 mt-1">
            Resource usage, invoices, and payments
          </p>
        </div>
        <div className="flex items-center gap-4">
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
            onClick={() => {
              refresh();
              fetchInvoices();
            }}
            className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8 w-fit">
        {[
          { key: "live", label: "Live Usage" },
          { key: "invoices", label: `Invoices (${invoices.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== LIVE USAGE TAB ===== */}
      {activeTab === "live" && (
        <>
          {/* Grand Total Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 mb-8 text-white">
            <div className="absolute top-0 right-0 w-48 h-48 -mr-12 -mt-12 rounded-full bg-white/5 blur-3xl" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60 mb-1">
                  Current Usage Total
                </p>
                <p className="text-4xl font-bold tracking-tight">
                  {formatCurrency(grandTotal, currency, 2)}
                </p>
                <p className="text-sm text-white/50 mt-2">
                  {stats?.length || 0} virtual machines
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
                <TrendingUp className="w-8 h-8 text-white/80" />
              </div>
            </div>
          </div>

          {!stats || stats.length === 0 ? (
            <div className="p-8 text-center mt-6">
              <FileText className="w-12 h-12 text-black mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-inter">
                No active VMs found for billing
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {stats.map((vm) => {
                const charges = calculateCharges(vm);
                if (!charges) return null;
                const isExpanded = expandedVM === vm.vmid;

                return (
                  <div
                    key={vm.vmid}
                    className="border-2 border-gray-400 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    {/* VM Header */}
                    <div
                      className="px-6 py-5 flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedVM(isExpanded ? null : vm.vmid)}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-xl ${vm.status === "running" ? "bg-emerald-50" : "bg-gray-100"}`}
                        >
                          <Server
                            className={`w-5 h-5 ${vm.status === "running" ? "text-emerald-600" : "text-gray-700"}`}
                          />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">
                            {vm.name}
                          </h2>
                          <p className="text-sm text-gray-700 font-mono">
                            VM ID: {vm.vmid}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(charges.total, currency)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            vm.status === "running"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${vm.status === "running" ? "bg-emerald-500" : "bg-red-500"}`}
                          />
                          {vm.status}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Charges Breakdown (collapsible) */}
                    {isExpanded && (
                      <div className="px-6 pb-6">
                        <div className="bg-white rounded-xl overflow-hidden">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-black uppercase tracking-wider">
                                  Resource
                                </th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-black uppercase tracking-wider">
                                  Usage
                                </th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-black uppercase tracking-wider">
                                  Charge
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {charges.items.map((item, i) => (
                                <tr
                                  key={i}
                                  className="border-b border-gray-100 last:border-0"
                                >
                                  <td className="px-4 py-3 text-gray-800">
                                    {item.label}
                                  </td>
                                  <td className="px-4 py-3 text-right text-gray-700">
                                    {item.value}
                                  </td>
                                  <td className="px-4 py-3 text-right font-semibold text-gray-800">
                                    {formatCurrency(item.charge, currency)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="bg-gray-100">
                                <td
                                  colSpan="2"
                                  className="px-4 py-3 font-semibold text-gray-800"
                                >
                                  Total
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-lg text-gray-900">
                                  {formatCurrency(charges.total, currency)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Rate Card */}
          {billingConfig && (
            <div className="mt-8 border-2 border-gray-400 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-black uppercase tracking-wider mb-4">
                Current Rate Card
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  {
                    label: "CPU",
                    rate: billingConfig.cpu_rate,
                    unit: "/% per hr",
                  },
                  {
                    label: "RAM Usage",
                    rate: billingConfig.ram_rate,
                    unit: "/MB per hr",
                  },
                  {
                    label: "RAM Alloc",
                    rate: billingConfig.ram_alloc_rate,
                    unit: "/MB",
                  },
                  {
                    label: "Disk Usage",
                    rate: billingConfig.disk_rate,
                    unit: "/GB per hr",
                  },
                  {
                    label: "Disk Alloc",
                    rate: billingConfig.disk_alloc_rate,
                    unit: "/GB",
                  },
                  {
                    label: "Uptime",
                    rate: billingConfig.uptime_rate,
                    unit: "/hr",
                  },
                ].map((r) => (
                  <div key={r.label} className="bg-white rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">{r.label}</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {currency}
                      {r.rate}
                      {r.unit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== INVOICES TAB ===== */}
      {activeTab === "invoices" && (
        <>
          {/* Invoice Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
              <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full bg-white/5 blur-2xl" />
              <p className="text-sm font-medium text-white/60 mb-1">
                Total Invoices
              </p>
              <p className="text-3xl font-bold">{invoices.length}</p>
            </div>
            <div className="border-2 border-gray-400 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-amber-500" />
                <p className="text-sm font-medium text-gray-500">Unpaid</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(unpaidTotal, currency, 2)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {invoices.filter((i) => i.status === "unpaid").length} invoices
              </p>
            </div>
            <div className="border-2 border-gray-400 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <p className="text-sm font-medium text-gray-500">Paid</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(paidTotal, currency, 2)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {invoices.filter((i) => i.status === "paid").length} invoices
              </p>
            </div>
          </div>

          {/* Invoice List */}
          {invoicesLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No invoices yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Invoices are generated automatically by the billing system
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className={`border-2 rounded-xl p-5 transition-all duration-200 ${
                    invoice.status === "paid"
                      ? "border-gray-200 bg-gray-50"
                      : "border-gray-400 hover:shadow-lg"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-xl ${
                          invoice.status === "paid"
                            ? "bg-emerald-50"
                            : "bg-amber-50"
                        }`}
                      >
                        {invoice.status === "paid" ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">
                            {invoice.vm_name || `VM ${invoice.vm_id}`}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              invoice.status === "paid"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {invoice.status === "paid" ? "Paid" : "Unpaid"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 font-mono">
                          VM {invoice.vm_id} · Node: {invoice.node_name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(invoice.period_start).toLocaleDateString()}{" "}
                          → {new Date(invoice.period_end).toLocaleDateString()}
                          {invoice.paid_at && (
                            <span className="ml-2">
                              · Paid{" "}
                              {new Date(invoice.paid_at).toLocaleString()}
                              {invoice.paid_by && ` by ${invoice.paid_by}`}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(
                            invoice.total_amount,
                            invoice.currency || currency,
                            2,
                          )}
                        </p>
                        <div className="flex gap-3 text-xs text-gray-400 mt-1">
                          <span>
                            CPU:{" "}
                            {formatCurrency(
                              invoice.cpu_charge,
                              invoice.currency || currency,
                              2,
                            )}
                          </span>
                          <span>
                            RAM:{" "}
                            {formatCurrency(
                              invoice.ram_charge,
                              invoice.currency || currency,
                              2,
                            )}
                          </span>
                          <span>
                            Disk:{" "}
                            {formatCurrency(
                              invoice.disk_charge,
                              invoice.currency || currency,
                              2,
                            )}
                          </span>
                        </div>
                      </div>
                      {invoice.status === "unpaid" && (
                        <button
                          onClick={() => handleMarkAsPaid(invoice.id)}
                          disabled={payingId === invoice.id}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            payingId === invoice.id
                              ? "bg-gray-200 text-gray-500 cursor-wait"
                              : "bg-gray-900 text-white hover:bg-gray-800 active:scale-95"
                          }`}
                        >
                          {payingId === invoice.id ? (
                            <>
                              <span className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Mark as Paid
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Billing;
