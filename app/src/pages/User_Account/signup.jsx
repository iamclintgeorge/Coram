import react, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, User } from "lucide-react";

function DynamicSignup() {
  const navigate = useNavigate();
  const [userName, setName] = useState("");
  const [password, setPassword] = useState("");
  const [emailId, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkroot, setCheckroot] = useState(false);

  const checkRoot = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_admin_server}/api/check-root`,
        { withCredentials: true },
      );
      setCheckroot(response.data.isRoot);
      console.log("isRoot", response.data.isRoot);
      if (!response.data.isRoot) {
        navigate("/login");
      }
    } catch (err) {
      console.log("Error while fetching Root Status:", err.message);
    }
  };

  useEffect(() => {
    checkRoot();
  }, []);

  if (!checkroot) {
    navigate("/login");
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const userData = {
      emailId,
      userName,
      password,
    };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_admin_server}/api/signup`,
        userData,
        {
          withCredentials: true,
        },
      );
      console.log("Signup Response:", res);

      // Reset form
      setName("");
      setPassword("");
      setEmail("");

      // Navigate after successful signup
      navigate("/dashboard");
    } catch (err) {
      console.error("Signup failed:", err);
      alert("Failed to create user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    return userName && password && emailId;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto font-inter">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
          Create New User
        </h1>
        <p className="text-gray-500 mt-1">
          Register a new account for your user
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Username */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <User size={16} className="text-gray-400" /> Username
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="johndoe"
                className="w-full rounded-lg border border-gray-200 p-2.5 text-gray-800 focus:ring-2 focus:ring-gray-900 outline-none transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <Mail size={16} className="text-gray-400" /> Email Address
              </label>
              <input
                type="email"
                value={emailId}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="john@example.com"
                className="w-full rounded-lg border border-gray-200 p-2.5 text-gray-800 focus:ring-2 focus:ring-gray-900 outline-none transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <Lock size={16} className="text-gray-400" /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-200 p-2.5 text-gray-800 focus:ring-2 focus:ring-gray-900 outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white text-sm px-6 py-2 rounded-md hover:bg-black transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50"
            >
              <UserPlus size={18} />
              {loading ? "Creating User..." : "Create User Account"}
            </button>

            {/* <p className="text-center text-sm text-gray-500">
              User will be assigned a default role. Manage roles in{" "}
              <button
                onClick={() => navigate("/view-users")}
                className="text-gray-900 font-semibold hover:underline"
              >
                Manage Users
              </button>
            </p> */}
          </div>
        </form>
      </div>
    </div>
  );
}

export default DynamicSignup;

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { UserPlus, Mail, Lock, User } from "lucide-react";
// import { toast } from "react-toastify";

// function DynamicSignup() {
//   const navigate = useNavigate();
//   const [userName, setName] = useState("");
//   const [password, setPassword] = useState("");
//   const [emailId, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [checkroot, setCheckroot] = useState(false);

//   useEffect(() => {
//     const checkRoot = async () => {
//       try {
//         const response = await axios.get(
//           `${import.meta.env.VITE_admin_server}/api/check-root`,
//           { withCredentials: true },
//         );
//         setCheckroot(response.data.isRoot);
//         if (!response.data.isRoot) navigate("/login");
//       } catch (err) {
//         navigate("/login");
//       }
//     };
//     checkRoot();
//   }, [navigate]);

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setLoading(true);
//     try {
//       await axios.post(
//         `${import.meta.env.VITE_admin_server}/api/signup`,
//         { emailId, userName, password },
//         { withCredentials: true },
//       );
//       toast.success("User created successfully");
//       navigate("/dashboard");
//     } catch (err) {
//       toast.error("Failed to create user");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!checkroot) return null;

//   return (
//     <div className="p-8 mx-auto font-inter max-w-2xl">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
//           Create New User
//         </h1>
//         <p className="text-gray-500 mt-1">
//           Register a new account for your service
//         </p>
//       </div>

//       {/* Form Card */}
//       <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="grid grid-cols-1 gap-6">
//             {/* Username */}
//             <div>
//               <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
//                 <User size={16} className="text-gray-400" /> Username
//               </label>
//               <input
//                 type="text"
//                 value={userName}
//                 onChange={(e) => setName(e.target.value)}
//                 required
//                 placeholder="johndoe"
//                 className="w-full rounded-lg border border-gray-200 p-2.5 text-gray-800 focus:ring-2 focus:ring-gray-900 outline-none transition-all"
//               />
//             </div>

//             {/* Email */}
//             <div>
//               <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
//                 <Mail size={16} className="text-gray-400" /> Email Address
//               </label>
//               <input
//                 type="email"
//                 value={emailId}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 placeholder="john@example.com"
//                 className="w-full rounded-lg border border-gray-200 p-2.5 text-gray-800 focus:ring-2 focus:ring-gray-900 outline-none transition-all"
//               />
//             </div>

//             {/* Password */}
//             <div>
//               <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
//                 <Lock size={16} className="text-gray-400" /> Password
//               </label>
//               <input
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 placeholder="••••••••"
//                 className="w-full rounded-lg border border-gray-200 p-2.5 text-gray-800 focus:ring-2 focus:ring-gray-900 outline-none transition-all"
//               />
//             </div>
//           </div>

//           <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50"
//             >
//               <UserPlus size={18} />
//               {loading ? "Creating User..." : "Create User Account"}
//             </button>

//             <p className="text-center text-sm text-gray-500">
//               User will be assigned a default role. Manage roles in{" "}
//               <button
//                 onClick={() => navigate("/view-users")}
//                 className="text-gray-900 font-semibold hover:underline"
//               >
//                 Manage Users
//               </button>
//             </p>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default DynamicSignup;
