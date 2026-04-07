import React, { useState, useEffect } from "react";
import { Save, Terminal, Cpu, HardDrive, Layout } from "lucide-react";
import api from "../../services/api";
import { toast } from "react-toastify";

const OrderVM = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    templateId: "",
    vmName: "",
    remark: "",
  });

  const [templates, setTemplates] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchTemplates();
    fetchOrders();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get("/api/order/fetch-template");
      const formatted = res.data.map((t) => {
        let resourceData = {};
        try {
          resourceData = JSON.parse(t.resource);
        } catch (e) {
          console.error("Failed to parse resource JSON", t.resource);
        }
        return {
          id: t.id,
          name: resourceData.name || `Template ${t.id}`,
          specs: `${resourceData.cpu} vCPU, ${resourceData.ram}GB RAM, ${resourceData.disk}GB Disk`,
        };
      });
      setTemplates(formatted);
    } catch (err) {
      console.error("Failed to fetch Templates", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/order/fetch-order");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch Orders", err);
    }
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!formData.templateId || !formData.vmName) {
      toast.error("Please fill in required fields");
      return;
    }
    setLoading(true);
    try {
      await createOrder({
        template_id: parseInt(formData.templateId),
        remark: `${formData.vmName}: ${formData.remark}`,
      });
      toast.success("Order placed successfully!");
      setFormData({ templateId: "", vmName: "", remark: "" });
      fetchOrders();
    } catch (err) {
      // Error handled in createOrder
    } finally {
      setLoading(false);
    }
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

  const createOrder = async (orderData) => {
    try {
      const res = await api.post("/api/order/create-order", orderData);
      return res.data;
    } catch (err) {
      console.error("Failed to Create Order", err);
      toast.error("Failed to place order");
      throw err;
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
            {orders.map((order) => {
              const template = templates.find((t) => t.id === order.template_id);
              // Extract VM name from remark if we stored it as "Name: Remark"
              const [vmName, ...remarkParts] = order.remark?.split(": ") || ["VM " + order.id];
              
              return (
                <div
                  key={order.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {vmName}
                    </h3>

                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${getStatusStyle(
                        order.status || "pending"
                      )}`}
                    >
                      {order.status || "pending"}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mb-1">{template?.name || "Unknown Template"}</p>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Cpu size={14} />
                      {template?.specs || "Specs N/A"}
                    </div>

                    <span className="text-xs text-gray-400">
                      {order.created_on?.split("T")[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderVM;
