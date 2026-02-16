// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../services/useAuthCheck";
// import axios from "axios";

// export const SectionContext = React.createContext({
//   setSelectedSection: () => {},
// });

// const DynamicSideBar = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [permissionsData, setPermissionsData] = useState([]);
//   const [userPermissions, setUserPermissions] = useState([]);
//   const userRole = user.UserName;

//   console.log("From SideBar", user.UserName);

//   if (!user) return null;

//   return (
//     <div className="bg-[#f4f4f4] mt-16 min-h-screen max-h-auto w-44 text-[#0C2340] pb-10 sticky top-0 z-0 border-r-[0.5px] border-gray-400">
//       <div className="flex flex-col pt-9 pl-2 space-y-6 text-[15px] font-light font-inter">
//         <Link to="/dashboard">
//           <div className="mr-8 hover:border-b-[1px] border-gray-500 flex flex-row">
//             <p className="pl-5 flex justify-between pb-3">Overview</p>
//           </div>
//         </Link>
//         {userRole === "root" && (
//           <Link to="/template">
//             <div className="mr-8 hover:border-b-[1px] border-gray-500">
//               <p className="pl-5 flex justify-between pb-3">Templates</p>
//             </div>
//           </Link>
//         )}
//         <Link to="/order-vm">
//           <div className="mr-8 hover:border-b-[1px] border-gray-500">
//             <p className="pl-5 flex justify-between pb-3">Order VM</p>
//           </div>
//         </Link>
//         {userRole === "root" && (
//           <Link to="/vms">
//             <div className="mr-8 hover:border-b-[1px] border-gray-500">
//               <p className="pl-5 flex justify-between pb-3">View VMs</p>
//             </div>
//           </Link>
//         )}
//         <Link to="/billing">
//           <div className="mr-8 hover:border-b-[1px] border-gray-500">
//             <p className="pl-5 flex justify-between pb-3">Invoice</p>
//           </div>
//         </Link>
//         {userRole === "root" && (
//           <Link to="/signup">
//             <div className="mr-8 hover:border-b-[1px] border-gray-500">
//               <p className="pl-5 flex justify-between pb-3">Manage User</p>
//             </div>
//           </Link>
//         )}
//         <Link to="/setting">
//           <div className="mr-8 hover:border-b-[1px] border-gray-500">
//             <p className="pl-5 flex justify-between pb-3">Setting</p>
//           </div>
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default DynamicSideBar;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../services/useAuthCheck";

const menuItems = [
  { path: "/dashboard", label: "Overview" },
  { path: "/template", label: "Templates", roles: ["root"] },
  { path: "/order-vm", label: "Order VM" },
  { path: "/vms", label: "View VMs", roles: ["root"] },
  { path: "/billing", label: "Invoice" },
  { path: "/signup", label: "Manage User", roles: ["root"] },
  { path: "/setting", label: "Setting" },
];

const DynamicSideBar = () => {
  const { user } = useAuth();
  const userRole = user?.UserName; //Change this to user.Role later
  // console.log("From SideBar", userRole, user);
  if (!user) return null;

  return (
    <div className="bg-[#f4f4f4] mt-16 min-h-screen max-h-auto w-44 text-[#0C2340] pb-10 sticky top-0 z-0 border-r-[0.5px] border-gray-400">
      <div className="flex flex-col pt-9 pl-2 space-y-6 text-[15px] font-light font-inter">
        {menuItems.map(({ path, label, roles }) => {
          if (roles && !roles.includes(userRole)) return null;
          return (
            <Link to={path} key={label}>
              <div className="mr-8 hover:border-b-[1px] border-gray-500">
                <p className="pl-5 flex justify-between pb-3">{label}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default DynamicSideBar;
