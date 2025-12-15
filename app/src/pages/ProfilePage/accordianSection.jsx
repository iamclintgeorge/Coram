import React from "react";
import { HiChevronUp, HiChevronDown } from "react-icons/hi";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";

const AccordionSection = ({
  section,
  label,
  data,
  open,
  onToggle,
  input,
  addButton,
  renderItem,
}) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex justify-between items-center p-4 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
    >
      <h4 className="text-lg font-medium text-gray-900">{label}</h4>
      {open ? (
        <HiChevronUp className="w-5 h-5 text-gray-700" />
      ) : (
        <HiChevronDown className="w-5 h-5 text-gray-700" />
      )}
    </button>
    <div
      className={`transition-all duration-300 ${
        open ? "max-h-[400px] overflow-y-auto p-4" : "max-h-0 overflow-hidden"
      }`}
    >
      {data.length > 0 ? (
        <div className="space-y-4 mb-6">
          {data.map((item) => (
            <div
              key={item.id}
              className="border-b border-gray-200 pb-4 font-inter"
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-4">
          No {label.toLowerCase()} added.
        </p>
      )}
      <div className="bg-gray-50 p-4 rounded-md mb-4">{input()}</div>
      <div className="flex justify-center">{addButton}</div>
    </div>
  </div>
);

export default AccordionSection;
