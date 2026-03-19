import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

//Core Routes
import Login from "./pages/User_Account/login";
import Signup from "./pages/User_Account/signup";
import ChangePassword from "./pages/User_Account/changePassword";
import ForgotPassword from "./pages/User_Account/forgotPassword";
import SetupWizard from "./pages/Setup/SetupWizard";
import Error404 from "./pages/Error_Pages/error404";
import Error403 from "./pages/Error_Pages/error403";
import AdminLayout from "./layout/adminLayout";
import Dashboard from "./pages/Dashboard/dashboard";
import SettingsPage from "./pages/settingsPage";
import TemplatePage from "./pages/templatePage";
import { AuthProvider } from "./services/useAuthCheck";
import ProfilePage from "./pages/ProfilePage/profilePage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// VM Management
import VMList from "./pages/VirtualMachines/vmList";
import VmPage from "./pages/VirtualMachines/vmPage";
import Billing from "./pages/Billing/billing";
import BillingSettings from "./pages/Billing/BillingSettings";
import OrderVM from "./pages/OrderVM/orderVM";

// Logs & Alerts
import LogsPage from "./pages/Logs/LogsPage";
import AlertsPage from "./pages/Alerts/AlertsPage";

const App = () => {
  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/setup" element={<SetupWizard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected routes */}
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/vms" element={<VMList />} />
              <Route path="/vms/:id" element={<VmPage />} />
              <Route path="/order-vm" element={<OrderVM />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/billing/settings" element={<BillingSettings />} />
              <Route path="/logs" element={<LogsPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/setting" element={<SettingsPage />} />
              <Route path="/template" element={<TemplatePage />} />
              <Route path="/change_password" element={<ChangePassword />} />
            </Route>

            {/* Error pages */}
            <Route path="/403" element={<Error403 />} />
            <Route path="/404" element={<Error404 />} />

            {/* Default redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
