import React, { useState, useEffect } from "react";
import { Trash2, Terminal, Cpu, HardDrive } from "lucide-react";
import api from "../../services/api";
import { toast } from "react-toastify";

const ViewOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null); // modal state

  useEffect(() => {
    const init = async () => {
      await fetchTemplates();
      await fetchOrder();
    };
    init();
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
          specs: `${resourceData.cpu} vCPU, ${resourceData.ram}GB RAM`,
        };
      });
      setTemplates(formatted);
    } catch (err) {
      console.error("Failed to fetch Templates", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    await deleteOrder(id);
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
    setLoading(true);
    try {
      const res = await api.get("/api/order/fetch-order");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch Order", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (id, updatedData) => {
    try {
      await api.put(`/api/order/update-order/${id}`, updatedData);
      toast.success("Order updated successfully");
      fetchOrder();
    } catch (err) {
      console.error("Failed to Update Order", err);
      toast.error("Failed to update order");
    }
  };

  const deleteOrder = async (id) => {
    try {
      await api.delete(`/api/order/delete-order/${id}`);
      toast.success("Order deleted successfully");
      fetchOrder();
    } catch (err) {
      console.error("Failed to Delete Order", err);
      toast.error("Failed to delete order");
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
          {orders.map((order) => {
            const template = templates.find((t) => t.id === order.template_id);
            const [vmName, ...remarkParts] = order.remark?.split(": ") || ["VM " + order.id];
            const remarkText = remarkParts.join(": ") || order.remark;

            return (
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
                  {vmName}
                </h3>

                <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">
                  Created: {order.created_on?.split("T")[0]}
                </p>

                {/* Status */}
                <span
                  className={`inline-block px-2.5 py-0.5 text-xs rounded-full font-medium mb-4 ${getStatusStyle(
                    order.status || "pending",
                  )}`}
                >
                  {order.status || "pending"}
                </span>

                {/* Template Info */}
                <div className="text-sm text-gray-600 mb-3">
                  <span className="font-medium text-gray-900">
                    {template?.name || "Unknown Template"}
                  </span>
                </div>

                {/* Resources */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Cpu size={14} /> CPU / RAM
                    </div>
                    <span className="font-semibold text-gray-900">
                      {template?.specs || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Remark */}
                {remarkText && (
                  <div className="mt-4 text-sm text-gray-500 line-clamp-2">{remarkText}</div>
                )}

                {/* Footer */}
                <button
                  onClick={() => setSelectedOrder({ ...order, vmName, template: template?.name, specs: template?.specs, remarkText })}
                  className="w-full mt-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  View Details
                </button>
              </div>
            );
          })}
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
                <strong>Template:</strong> {selectedOrder.template || "Unknown"}
              </div>
              <div>
                <strong>Specs:</strong> {selectedOrder.specs || "N/A"}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(
                    selectedOrder.status || "pending",
                  )}`}
                >
                  {selectedOrder.status || "pending"}
                </span>
              </div>
              <div>
                <strong>Created On:</strong> {selectedOrder.created_on?.split("T")[0]}
              </div>
              {selectedOrder.remarkText && (
                <div>
                  <strong>Remark:</strong> {selectedOrder.remarkText}
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
