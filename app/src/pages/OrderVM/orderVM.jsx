import React, { useState } from "react";
import { Save, Terminal, Cpu, HardDrive, Layout } from "lucide-react";

const OrderVM = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    templateId: "",
    vmName: "",
    remark: "",
  });

  // Sample templates based on your templates.db structure
  const templates = [
    { id: "t1", name: "Ubuntu 22.04 LTS (Small)", specs: "2 vCPU, 4GB RAM" },
    { id: "t2", name: "Debian 12 (Medium)", specs: "4 vCPU, 8GB RAM" },
    { id: "t3", name: "CentOS Stream 9 (Large)", specs: "8 vCPU, 16GB RAM" },
  ];

  const [orders, setOrders] = useState([
    {
      id: "o1",
      vmName: "prod-server",
      template: "Ubuntu 22.04 LTS (Small)",
      specs: "2 vCPU, 4GB RAM",
      status: "pending",
      created_on: "2024-04-01",
    },
  ]);

  const handleOrder = (e) => {
    e.preventDefault();
    setLoading(true);
    // Logic to insert into vmOrders.db goes here
    setTimeout(() => setLoading(false), 1000);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-50 text-green-700";
      case "rejected":
        return "bg-red-50 text-red-700";
      default:
        return "bg-yellow-50 text-yellow-700";
    }
  };

  const createOrder = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_admin_server}/api/order/create-order`,
        { withCredentials: true },
      );
    } catch (err) {
      console.error("Failed to Create Template", err);
    }
  };

  return (
    <div className="p-8 mx-auto font-inter max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Order VM
          </h1>
          <p className="text-gray-500 mt-1">Place your order for VMs here</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 p-6 bg-white shadow-sm">
            <form onSubmit={handleOrder} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Select Template
                </label>
                <select
                  required
                  className="w-full rounded-lg border border-gray-200 p-2.5 text-gray-800 bg-gray-50 focus:ring-2 focus:ring-gray-900 outline-none transition-all"
                  value={formData.templateId}
                  onChange={(e) =>
                    setFormData({ ...formData, templateId: e.target.value })
                  }
                >
                  <option value="">Choose a base image...</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  VM Name
                </label>
                <input
                  type="text"
                  placeholder="my-production-server"
                  className="w-full rounded-lg border border-gray-200 p-2.5 text-gray-800 focus:ring-2 focus:ring-gray-900 outline-none"
                  value={formData.vmName}
                  onChange={(e) =>
                    setFormData({ ...formData, vmName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Remark / Purpose
                </label>
                <textarea
                  rows="3"
                  placeholder="Testing kernel modules for LKMP..."
                  className="w-full rounded-lg border border-gray-200 p-2.5 text-gray-800 focus:ring-2 focus:ring-gray-900 outline-none"
                  value={formData.remark}
                  onChange={(e) =>
                    setFormData({ ...formData, remark: e.target.value })
                  }
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white px-6 py-2 rounded-md hover:bg-black transition-all flex text-sm items-center justify-center gap-2 font-medium disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? "Processing..." : "Confirm Order"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Info / Estimated Cost */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 p-6 bg-gray-50 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Terminal size={20} /> Order Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Selected Template:</span>
                <span className="font-medium text-gray-900">
                  {templates.find((t) => t.id === formData.templateId)?.name ||
                    "None"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Resources:</span>
                <span className="font-medium text-gray-900">
                  {templates.find((t) => t.id === formData.templateId)?.specs ||
                    "-"}
                </span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between text-base pt-2">
                <span className="font-semibold text-gray-900">Est. Cost:</span>
                <span className="font-bold text-gray-900 text-lg">
                  $0.00 / month
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">My Orders</h2>

        {orders.length === 0 ? (
          <div className="text-gray-500 text-sm">No orders placed yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {order.vmName}
                  </h3>

                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${getStatusStyle(
                      order.status,
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mb-1">{order.template}</p>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Cpu size={14} />
                    {order.specs}
                  </div>

                  <span className="text-xs text-gray-400">
                    {order.created_on}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderVM;
