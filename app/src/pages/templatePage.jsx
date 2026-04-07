import React, { useState, useEffect } from "react";
import { Trash2, Server, Cpu, HardDrive } from "lucide-react";
import api from "../services/api";
import { toast } from "react-toastify";

const TemplatePage = () => {
  const [templates, setTemplates] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const [form, setForm] = useState({
    name: "",
    cpu: "",
    ram: "",
    disk: "",
  });

  useEffect(() => {
    fetchTemplate();
  }, []);

  const createTemplate = async (templateData) => {
    try {
      await api.post("/api/order/create-template", templateData);
      toast.success("Template created successfully");
      fetchTemplate();
    } catch (err) {
      console.error("Failed to Create Template", err);
      toast.error("Failed to create template");
    }
  };

  const fetchTemplate = async () => {
    try {
      const res = await api.get("/api/order/fetch-template");
      // Map backend Template to frontend format
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
          resources: {
            cpu: resourceData.cpu || 0,
            ram: resourceData.ram || 0,
            disk: resourceData.disk || 0,
          },
          created_on: t.created_on?.split("T")[0] || "N/A",
        };
      });
      setTemplates(formatted);
    } catch (err) {
      console.error("Failed to fetch Template", err);
      toast.error("Failed to load templates");
    }
  };

  const updateTemplate = async (id, templateData) => {
    try {
      await api.put(`/api/order/update-template/${id}`, templateData);
      toast.success("Template updated successfully");
      fetchTemplate();
    } catch (err) {
      console.error("Failed to Update Template", err);
      toast.error("Failed to update template");
    }
  };

  const deleteTemplate = async (id) => {
    try {
      await api.delete(`/api/order/delete-template/${id}`);
      toast.success("Template deleted successfully");
      fetchTemplate();
    } catch (err) {
      console.error("Failed to Delete Template", err);
      toast.error("Failed to delete template");
    }
  };

  // 🔹 Open Create
  const handleCreate = () => {
    setEditingTemplate(null);
    setForm({ name: "", cpu: "", ram: "", disk: "" });
    setIsModalOpen(true);
  };

  // 🔹 Open Edit
  const handleEdit = (template) => {
    setEditingTemplate(template);
    setForm({
      name: template.name,
      cpu: template.resources.cpu,
      ram: template.resources.ram,
      disk: template.resources.disk,
    });
    setIsModalOpen(true);
  };

  // 🔹 Save (Create + Edit)
  const handleSave = async () => {
    if (!form.name || !form.cpu || !form.ram || !form.disk) return;

    const payload = {
      resource: JSON.stringify({
        name: form.name,
        cpu: Number(form.cpu),
        ram: Number(form.ram),
        disk: Number(form.disk),
      }),
      billing_config_id: 1, // Default or selected
    };

    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, payload);
    } else {
      await createTemplate(payload);
    }

    setIsModalOpen(false);
  };

  // 🔹 Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this template?")) return;
    await deleteTemplate(id);
  };

  return (
    <div className="p-8 mx-auto font-inter max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Templates
          </h1>
          <p className="text-gray-500 mt-1">
            View, Configure and Create New Templates
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="flex text-sm items-center gap-2 px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-black transition-all shadow-sm"
        >
          <span className="text-lg leading-none">＋</span>
          Create New Template
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Server className="text-gray-600" size={24} />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(template.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {template.name}
            </h3>

            <p className="text-xs text-gray-400 mb-4 uppercase tracking-wider">
              Created: {template.created_on}
            </p>

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Cpu size={14} /> CPU
                </div>
                <span className="font-semibold text-gray-900">
                  {template.resources.cpu} Cores
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Server size={14} /> RAM
                </div>
                <span className="font-semibold text-gray-900">
                  {template.resources.ram} GB
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <HardDrive size={14} /> Disk
                </div>
                <span className="font-semibold text-gray-900">
                  {template.resources.disk} GB
                </span>
              </div>
            </div>

            <button
              onClick={() => handleEdit(template)}
              className="w-full mt-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Edit Configuration
            </button>
          </div>
        ))}
      </div>

      {/* 🔥 Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingTemplate ? "Edit Template" : "Create Template"}
            </h2>

            <div className="space-y-4">
              <input
                placeholder="Template Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-3 border rounded-lg"
              />

              <div className="grid grid-cols-3 gap-3">
                <input
                  type="number"
                  placeholder="CPU"
                  value={form.cpu}
                  onChange={(e) => setForm({ ...form, cpu: e.target.value })}
                  className="p-3 border rounded-lg"
                />

                <input
                  type="number"
                  placeholder="RAM"
                  value={form.ram}
                  onChange={(e) => setForm({ ...form, ram: e.target.value })}
                  className="p-3 border rounded-lg"
                />

                <input
                  type="number"
                  placeholder="Disk"
                  value={form.disk}
                  onChange={(e) => setForm({ ...form, disk: e.target.value })}
                  className="p-3 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatePage;
