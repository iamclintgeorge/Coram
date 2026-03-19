import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [vmData, setVmData] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Actual app pages
  const pages = [
    { name: "Dashboard", path: "/dashboard", category: "Pages", icon: "📊" },
    { name: "Virtual Machines", path: "/vms", category: "Pages", icon: "🖥️" },
    {
      name: "Billing / Invoice",
      path: "/billing",
      category: "Pages",
      icon: "💳",
    },
    {
      name: "Billing Settings",
      path: "/billing/settings",
      category: "Pages",
      icon: "⚙️",
    },
    { name: "Order VM", path: "/order-vm", category: "Pages", icon: "🛒" },
    { name: "Logs", path: "/logs", category: "Pages", icon: "📋" },
    { name: "Alerts", path: "/alerts", category: "Pages", icon: "🔔" },
    { name: "Settings", path: "/setting", category: "Pages", icon: "⚙️" },
    { name: "Profile", path: "/profile", category: "Pages", icon: "👤" },
  ];

  // Fetch VMs for search
  useEffect(() => {
    const fetchVMs = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_admin_server}/api/proxmox/fetchNodeStats/pve`,
          { withCredentials: true },
        );
        setVmData(response.data || []);
      } catch (err) {
        console.log("Could not fetch VM data for search");
      }
    };
    fetchVMs();
  }, []);

  // Filter pages + VMs based on query
  useEffect(() => {
    if (query.trim()) {
      const q = query.toLowerCase().trim();

      const pageResults = pages
        .filter((p) => p.name.toLowerCase().includes(q))
        .map((p) => ({ ...p, type: "page" }));

      const vmResults = vmData
        .filter(
          (vm) =>
            vm.name?.toLowerCase().includes(q) || String(vm.vmid).includes(q),
        )
        .map((vm) => ({
          name: `${vm.name} (ID: ${vm.vmid})`,
          path: `/vms/${vm.vmid}`,
          category: "Virtual Machines",
          icon: vm.status === "running" ? "🟢" : "🔴",
          type: "vm",
          status: vm.status,
        }));

      setFilteredResults([...pageResults, ...vmResults]);
      setSelectedIndex(-1);
    } else {
      setFilteredResults([]);
      setSelectedIndex(-1);
    }
  }, [query, vmData]);

  // Keyboard handling
  const handleKeyDown = useCallback(
    (e) => {
      // Ctrl + / to focus search
      if (e.ctrlKey && e.key === "/") {
        e.preventDefault();
        setIsActive(true);
        inputRef.current?.focus();
        return;
      }

      if (!isActive) return;

      if (e.key === "Escape") {
        setQuery("");
        setIsActive(false);
        inputRef.current?.blur();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredResults.length - 1 ? prev + 1 : 0,
        );
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredResults.length - 1,
        );
      }

      if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        navigateToResult(filteredResults[selectedIndex]);
      } else if (e.key === "Enter" && filteredResults.length > 0) {
        e.preventDefault();
        navigateToResult(filteredResults[0]);
      }
    },
    [isActive, filteredResults, selectedIndex],
  );

  const navigateToResult = (result) => {
    navigate(result.path);
    setQuery("");
    setIsActive(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (query === "") setIsActive(false);
    }, 200);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Group results by category
  const groupedResults = filteredResults.reduce((groups, result) => {
    const cat = result.category || "Other";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(result);
    return groups;
  }, {});

  let flatIndex = -1;

  return (
    <div className="relative w-[45vw]">
      <div className="group flex items-center relative mt-3">
        <svg
          className="absolute left-4 fill-gray-500 w-4 h-4"
          aria-hidden="true"
          viewBox="0 0 24 24"
        >
          <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search pages, VMs..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsActive(true);
          }}
          onBlur={handleBlur}
          onFocus={() => setIsActive(true)}
          className="w-full h-10 font-inter pl-12 pr-12 text-gray-800 bg-white border border-gray-200 rounded-md outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute text-xl right-5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        )}
        {!isActive && !query && (
          <div className="absolute text-xs right-3 text-gray-400 cursor-pointer rounded-md px-2 py-0.5 font-mono bg-gray-100">
            Ctrl /
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      {isActive && filteredResults.length > 0 && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
          {Object.entries(groupedResults).map(([category, items]) => (
            <div key={category}>
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 sticky top-0">
                {category}
              </div>
              {items.map((result) => {
                flatIndex++;
                const idx = flatIndex;
                return (
                  <div
                    key={`${result.path}-${idx}`}
                    onMouseDown={() => navigateToResult(result)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors ${
                      selectedIndex === idx
                        ? "bg-indigo-50 text-indigo-700"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span className="text-base">{result.icon}</span>
                    <span className="font-medium text-sm">{result.name}</span>
                    {result.status && (
                      <span className="ml-auto text-xs text-gray-400">
                        {result.status}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {isActive && query && filteredResults.length === 0 && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-2xl">
          <div className="px-4 py-6 text-center text-gray-400 text-sm">
            No results found for "{query}"
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
