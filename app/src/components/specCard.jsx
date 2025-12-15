import React from "react";
import { Cpu, Server, CheckCircle } from "lucide-react";

const SpecCard = ({ title, value, icon }) => {
  const IconComponent = icon || Server; // default icon

  return (
    <div className="flex flex-col items-center w-60 h-56 p-5 border-2 border-gray-400 shadow-lg hover:shadow-xl transition-all duration-200 ">
      <div className="flex items-center justify-center w-full h-20 bg-gray-100 rounded-lg mb-4">
        <IconComponent className="w-10 h-10 text-red-800" />
      </div>
      <h3 className="text-lg font-inter font-semibold text-gray-800 mb-2">
        {title}
      </h3>
      {value !== undefined && (
        <p className="text-gray-600 font-inter">{value}</p>
      )}
    </div>
  );
};

export default SpecCard;
