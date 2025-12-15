import React from "react";
import { Server } from "lucide-react";

const SpecList = ({ title, cpu, ram, disk, icon }) => {
  const IconComponent = Server;

  return (
    <div className="flex flex-col w-[77vw] h-auto p-5 border-2 border-gray-400 shadow-lg hover:shadow-xl transition-all duration-200 ">
      <div className="flex w-full h-20 bg-gray-100">
        <IconComponent className="w-10 h-10 text-red-800" />
        <h3 className="text-xl ml-5 pt-2 font-inter font-semibold text-gray-800 mb-2">
          {title}
        </h3>
      </div>
      <div className="flex flex-row justify-between">
        <p className="text-gray-600 font-inter">CPU: {cpu}%</p>
        <p className="text-gray-600 font-inter">RAM: {ram}MB</p>
        <p className="text-gray-600 font-inter">Disk: {disk}GB</p>
      </div>
    </div>
  );
};

export default SpecList;
