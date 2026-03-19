import React from "react";
import { Server } from "lucide-react";

const SpecCard = ({ title, value, icon, subtitle }) => {
  const IconComponent = icon || Server;

  return (
    <div className="relative overflow-hidden bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
      <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-4 group-hover:from-indigo-50 group-hover:to-purple-50 transition-all duration-300">
          <IconComponent className="w-6 h-6 text-gray-600 group-hover:text-indigo-600 transition-colors" />
        </div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        {value !== undefined && (
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        )}
        {subtitle && (
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default SpecCard;
