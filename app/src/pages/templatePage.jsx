import React, { useState } from "react";
import { Save, Trash2, Eye, Server, Cpu, HardDrive } from "lucide-react";

const TemplatePage = () => {
  const [loading, setLoading] = useState(false);

  // Sample state mapping to templates.db
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: "Standard Ubuntu",
      resources: { cpu: 2, ram: 4, disk: 40 },
      created_on: "2023-10-01",
    },
    {
      id: 2,
      name: "High Perf Node",
      resources: { cpu: 8, ram: 16, disk: 100 },
      created_on: "2023-10-05",
    },
  ]);

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
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-black transition-all shadow-sm">
            <span className="text-lg leading-none">＋</span>
            Create New Template
          </button>
        </div>
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
                <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                  <Eye size={18} />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {template.name}
            </h3>
            <p className="text-xs text-gray-400 mb-4 font-medium uppercase tracking-wider">
              Created: {template.created_on}
            </p>

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Cpu size={14} /> <span>CPU</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {template.resources.cpu} Cores
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Server size={14} /> <span>RAM</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {template.resources.ram} GB
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <HardDrive size={14} /> <span>Disk</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {template.resources.disk} GB
                </span>
              </div>
            </div>

            <button className="w-full mt-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Edit Configuration
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatePage;
