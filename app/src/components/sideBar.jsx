import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/useAuthCheck";
import axios from "axios";

export const SectionContext = React.createContext({
  setSelectedSection: () => {},
});

const DynamicSideBar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [permissionsData, setPermissionsData] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);

  // console.log(user);

  if (!user) return null;

  return (
    <div className="bg-[#f4f4f4] mt-16 min-h-screen max-h-auto w-64 text-[#0C2340] pb-10 sticky top-0 z-0 border-r-2 border-gray-400">
      <div className="flex flex-col pt-9 pl-5 space-y-6 text-base font-light font-inter">
        {/* Dashboard - Always visible */}
        <Link to="/dashboard">
          <div className="mr-8 hover:border-b-[1px] border-gray-500">
            <p className="pl-5 flex justify-between pb-3">Dashboard</p>
          </div>
        </Link>
        <Link to="/order-vm">
          <div className="mr-8 hover:border-b-[1px] border-gray-500">
            <p className="pl-5 flex justify-between pb-3">Order VM</p>
          </div>
        </Link>
        <Link to="/vms">
          <div className="mr-8 hover:border-b-[1px] border-gray-500">
            <p className="pl-5 flex justify-between pb-3">My VMs</p>
          </div>
        </Link>
        <Link to="/billing">
          <div className="mr-8 hover:border-b-[1px] border-gray-500">
            <p className="pl-5 flex justify-between pb-3">Billing</p>
          </div>
        </Link>
        <Link to="/signup">
          <div className="mr-8 hover:border-b-[1px] border-gray-500">
            <p className="pl-5 flex justify-between pb-3">
              Create User Account
            </p>
          </div>
        </Link>
        <Link to="/setting">
          <div className="mr-8 hover:border-b-[1px] border-gray-500">
            <p className="pl-5 flex justify-between pb-3">Setting</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default DynamicSideBar;
