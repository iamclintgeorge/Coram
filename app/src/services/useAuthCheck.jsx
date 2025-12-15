// import React, { createContext, useContext, useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate, useLocation } from "react-router-dom";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     checkAuth();
//   }, []);

//   const checkAuth = async () => {
//     try {
//       const response = await axios.get(
//         `${import.meta.env.VITE_admin_server}/api/check-auth`,
//         { withCredentials: true }
//       );

//       if (response.data.authenticated) {
//         setIsAuthenticated(true);
//         setUser(response.data.user);

//         // If on login/signup page while authenticated, redirect to dashboard
//         if (location.pathname === "/login" || location.pathname === "/signup") {
//           navigate("/dashboard");
//         }
//       } else {
//         setIsAuthenticated(false);
//         setUser(null);
//       }
//     } catch (error) {
//       // 401 is normal when not logged in
//       setIsAuthenticated(false);
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (emailId, password) => {
//     try {
//       const response = await axios.post(
//         `${import.meta.env.VITE_admin_server}/api/login`,
//         { emailId, password },
//         { withCredentials: true }
//       );

//       if (response.data.success) {
//         setIsAuthenticated(true);
//         setUser(response.data.user);
//         return { success: true };
//       }
//     } catch (error) {
//       return {
//         success: false,
//         message: error.response?.data?.message || "Login failed",
//       };
//     }
//   };

//   const logout = async () => {
//     try {
//       await axios.post(
//         `${import.meta.env.VITE_admin_server}/api/signout`,
//         {},
//         { withCredentials: true }
//       );
//     } catch (error) {
//       console.error("Logout error:", error);
//     } finally {
//       setIsAuthenticated(false);
//       setUser(null);
//       navigate("/login");
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{ user, isAuthenticated, loading, login, logout, checkAuth }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_admin_server}/api/check-auth`,
          {
            withCredentials: true,
          }
        );

        // const response = await axios.get(
        //   `http://localhost:8080/api/check-auth`,
        //   {
        //     withCredentials: true,
        //   }
        // );
        if (response.data.authenticated) {
          setIsAuthenticated(true);
          setUser(response.data.user);
          // console.log("setUser", user);
        } else {
          // Only navigate if we're not already on the login page
          if (window.location.pathname !== "/login") {
            navigate("/login");
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response) {
          setMessage(
            error.response.data.message || "You are not authenticated."
          );
          // Only navigate if we're not already on the login page
          if (
            error.response.status === 401 &&
            window.location.pathname !== "/login"
          ) {
            // navigate("/login");
            navigate("/signup");
          }
        } else {
          setMessage("Failed to load message due to network issue.");
        }

        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     try {
  //       const response = await axios.get(
  //         `${import.meta.env.VITE_admin_server}/api/check-auth`,
  //         { withCredentials: true }
  //       );

  //       if (response.data.authenticated) {
  //         setIsAuthenticated(true);
  //         setUser(response.data.user);
  //         // Redirect logged-in users away from /login or /signup
  //         if (
  //           window.location.pathname === "/login" ||
  //           window.location.pathname === "/signup"
  //         ) {
  //           navigate("/dashboard"); // or wherever you want logged-in users to go
  //         }
  //       } else {
  //         // Allow access to /login and /signup
  //         if (
  //           window.location.pathname === "/login" ||
  //           window.location.pathname === "/signup"
  //         ) {
  //           setIsAuthenticated(false);
  //         } else {
  //           navigate("/login");
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //       if (error.response) {
  //         setMessage(
  //           error.response.data.message || "You are not authenticated."
  //         );
  //         if (
  //           error.response.status === 401 &&
  //           window.location.pathname !== "/login"
  //         ) {
  //           navigate("/signup");
  //         }
  //       } else {
  //         setMessage("Failed to load message due to network issue.");
  //       }
  //       setIsAuthenticated(false);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   checkAuth();
  // }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, message }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
