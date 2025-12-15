// import { Navigate, useLocation } from "react-router-dom";
// import { useAuth } from "../services/useAuthCheck";

// const PrivateRoute = ({ children, permission }) => {
//   const { user } = useAuth();
//   const location = useLocation();

//   // Check if user is logged in and has permission, or if they have the "all" permission
//   if (
//     !user ||
//     (!user.permissions.includes(permission) &&
//       !user.permissions.includes("all"))
//   ) {
//     return <Navigate to="/error403" state={{ from: location }} />;
//   }

//   return children; // Allow access to the route if the permission exists or if the user has "all"
// };

// export default PrivateRoute;
