import React, { useState } from "react";
import { Trash2, Terminal, Cpu, HardDrive } from "lucide-react";

const ViewOrdersPage = () => {
  const [orders, setOrders] = useState([
    {
      id: "o1",
      vmName: "prod-server-1",
      template: "Ubuntu 22.04 LTS (Small)",
      specs: "2 vCPU, 4GB RAM",
      remark: "Production workload",
      status: "pending",
      created_on: "2024-04-01",
    },
    {
      id: "o2",
      vmName: "dev-testing",
      template: "Debian 12 (Medium)",
      specs: "4 vCPU, 8GB RAM",
      remark: "Testing APIs",
      status: "approved",
      created_on: "2024-04-02",
    },
  ]);

  const [selectedOrder, setSelectedOrder] = useState(null); // modal state

  const handleDelete = (id) => {
    if (!window.confirm("Delete this order?")) return;
    setOrders((prev) => prev.filter((o) => o.id !== id));
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

  const fetchOrder = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_admin_server}/api/order/fetch-order`,
        { withCredentials: true },
      );
    } catch (err) {
      console.error("Failed to fetch Order", err);
    }
  };

  const updateOrder = async () => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_admin_server}/api/order/update-order`,
        { withCredentials: true },
      );
    } catch (err) {
      console.error("Failed to Update Order", err);
    }
  };

  const deleteOrder = async () => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_admin_server}/api/order/delete-order`,
        { withCredentials: true },
      );
    } catch (err) {
      console.error("Failed to Delete Order", err);
    }
  };

  return (
    <div className="p-8 mx-auto font-inter max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            VM Orders
          </h1>
          <p className="text-gray-500 mt-1">
            View and manage all VM provisioning requests
          </p>
        </div>
      </div>

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <div className="text-center text-gray-500 py-16">No orders found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Top */}
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Terminal className="text-gray-600" size={24} />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {order.vmName}
              </h3>

              <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">
                Created: {order.created_on}
              </p>

              {/* Status */}
              <span
                className={`inline-block px-2.5 py-0.5 text-xs rounded-full font-medium mb-4 ${getStatusStyle(
                  order.status,
                )}`}
              >
                {order.status}
              </span>

              {/* Template Info */}
              <div className="text-sm text-gray-600 mb-3">
                <span className="font-medium text-gray-900">
                  {order.template}
                </span>
              </div>

              {/* Resources */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Cpu size={14} /> CPU / RAM
                  </div>
                  <span className="font-semibold text-gray-900">
                    {order.specs}
                  </span>
                </div>
              </div>

              {/* Remark */}
              {order.remark && (
                <div className="mt-4 text-sm text-gray-500">{order.remark}</div>
              )}

              {/* Footer */}
              <button
                onClick={() => setSelectedOrder(order)}
                className="w-full mt-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 relative shadow-lg">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 font-bold"
              onClick={() => setSelectedOrder(null)}
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {selectedOrder.vmName} Details
            </h2>

            <div className="space-y-2 text-sm text-gray-700">
              <div>
                <strong>Template:</strong> {selectedOrder.template}
              </div>
              <div>
                <strong>Specs:</strong> {selectedOrder.specs}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(
                    selectedOrder.status,
                  )}`}
                >
                  {selectedOrder.status}
                </span>
              </div>
              <div>
                <strong>Created On:</strong> {selectedOrder.created_on}
              </div>
              {selectedOrder.remark && (
                <div>
                  <strong>Remark:</strong> {selectedOrder.remark}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-6 w-full py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewOrdersPage;
