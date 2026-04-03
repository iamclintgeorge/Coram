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

  const handleOrder = (e) => {
    e.preventDefault();
    setLoading(true);
    // Logic to insert into vmOrders.db goes here
    setTimeout(() => setLoading(false), 1000);
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
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          <span className="text-lg leading-none">＋</span>
          Create New Template
        </button>
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
                  className="w-full bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50"
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
    </div>
  );
};

export default OrderVM;
