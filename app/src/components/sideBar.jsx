import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Server } from "lucide-react";
import { useAuth } from "../services/useAuthCheck";

const menuItems = [
  { path: "/dashboard", label: "Overview", icon: Server },
  { path: "/template", label: "Templates", roles: ["root"], icon: Server },
  { path: "/order-vm", label: "Order VM", roles: ["client"], icon: Server },
  { path: "/view-order", label: "View Order", roles: ["root"], icon: Server },
  { path: "/vms", label: "View VMs", roles: ["root"], icon: Server },
  { path: "/billing", label: "Invoice", icon: Server },
  {
    path: "/billing/settings",
    label: "Billing Settings",
    roles: ["root"],
    icon: Server,
  },
  { path: "/logs", label: "Logs", roles: ["root"], icon: Server },
  { path: "/alerts", label: "Alerts", icon: Server },
  { path: "/signup", label: "Create Users", roles: ["root"], icon: Server },
  {
    path: "/manage-users",
    label: "Manage Users",
    roles: ["root"],
    icon: Server,
  },
  { path: "/setting", label: "Setting", icon: Server },
];

const DynamicSideBar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const userRole = user?.Role;

  if (!user) return null;

  return (
    <div className="mt-16 min-h-screen w-52 text-gray-800 pb-10 sticky top-0 z-0 border-r border-gray-400">
      <div className="flex flex-col pt-6 px-3 space-y-1 text-sm font-inter">
        {menuItems?.map(({ path, label, roles }) => {
          if (roles && !roles.includes(userRole)) return null;
          const isActive =
            location.pathname === path ||
            (path !== "/" &&
              location.pathname.startsWith(path) &&
              path !== "/billing");
          return (
            <Link to={path} key={label}>
              <div
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gray-900 text-white shadow-sm"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
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
