import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../services/useAuthCheck";

const menuItems = [
  { path: "/dashboard", label: "Overview", icon: "📊" },
  { path: "/template", label: "Templates", roles: ["root"], icon: "📄" },
  { path: "/order-vm", label: "Order VM", icon: "🛒" },
  { path: "/vms", label: "View VMs", roles: ["root"], icon: "🖥️" },
  { path: "/billing", label: "Invoice", icon: "💳" },
  { path: "/billing/settings", label: "Billing Settings", roles: ["root"], icon: "⚙️" },
  { path: "/logs", label: "Logs", roles: ["root"], icon: "📋" },
  { path: "/alerts", label: "Alerts", icon: "🔔" },
  { path: "/signup", label: "Manage User", roles: ["root"], icon: "👥" },
  { path: "/setting", label: "Setting", icon: "⚙️" },
];

const DynamicSideBar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const userRole = user?.UserName; //Change this to user.Role later

  if (!user) return null;

  return (
    <div className="bg-white mt-16 min-h-screen w-52 text-gray-800 pb-10 sticky top-0 z-0 border-r border-gray-200">
      <div className="flex flex-col pt-6 px-3 space-y-1 text-sm font-inter">
        {menuItems.map(({ path, label, roles, icon }) => {
          if (roles && !roles.includes(userRole)) return null;
          const isActive =
            location.pathname === path ||
            (path !== "/" && location.pathname.startsWith(path) && path !== "/billing");
          return (
            <Link to={path} key={label}>
              <div
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gray-900 text-white shadow-sm"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <span className="text-base">{icon}</span>
                <span className="font-medium">{label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default DynamicSideBar;
