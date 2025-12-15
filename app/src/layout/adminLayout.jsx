// import React from "react";
// import SideBar from "../components/sideBar";
// import NavBar from "../components/navBar";
// import { Outlet } from "react-router-dom";

// const AdminLayout = () => {
//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* Sidebar */}
//       <SideBar />

//       {/* Main content area */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Navbar */}
//         <NavBar />

//         {/* Page content */}
//         <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
//           <Outlet /> {/* This renders Dashboard, Profile, VMs, etc. */}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default AdminLayout;

import React from "react";
import SideBar from "../components/sideBar";
import NavBar from "../components/navBar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <>
      <NavBar />
      <div className="flex flex-row pr-5">
        <div className="mr-4">
          <SideBar />
        </div>
        <div className="mt-20 mb-5">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
