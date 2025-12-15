import React, { useState, useEffect } from "react";
import { useAuth } from "../../services/useAuthCheck";

const ActivityLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    username: "",
    userRole: "",
    action: "",
    resource: "",
    startDate: "",
    endDate: "",
  });
  const [pagination, setPagination] = useState({});
  const [filterOptions, setFilterOptions] = useState({
    userRoles: [],
    actions: [],
    resources: [],
    users: [],
  });
  const [stats, setStats] = useState(null);

  // Check if user can view all logs (superAdmin or principal)
  const canViewAllLogs =
    user && ["superAdmin", "principal"].includes(user.role);

  useEffect(() => {
    fetchLogs();
    if (canViewAllLogs) {
      fetchFilterOptions();
      fetchStats();
    }
  }, [filters]);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch("/api/activity-logs/filter-options", {
        credentials: "include",
      });

      if (response.ok) {
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          setFilterOptions(data);
        } else {
          console.warn("Filter options endpoint returned non-JSON response");
          // Set default filter options based on the data we have
          setFilterOptions({
            userRoles: ["superAdmin", "principal", "admin", "user"],
            actions: ["CREATE", "READ", "UPDATE", "DELETE", "ERROR"],
            resources: ["users", "logs", "system"],
            users: [],
          });
        }
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
      // Set default filter options on error
      setFilterOptions({
        userRoles: ["superAdmin", "principal", "admin", "user"],
        actions: ["CREATE", "READ", "UPDATE", "DELETE", "ERROR"],
        resources: ["users", "logs", "system"],
        users: [],
      });
    }
  };

  const fetchStats = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);

      const response = await fetch(`/api/activity-logs/stats?${queryParams}`, {
        credentials: "include",
      });

      if (response.ok) {
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          setStats(data);
        } else {
          console.warn("Stats endpoint returned non-JSON response");
        }
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      // Use the new endpoint
      const endpoint = canViewAllLogs
        ? `${import.meta.env.VITE_admin_server}/api/logs/?${queryParams}`
        : `${
            import.meta.env.VITE_admin_server
          }/api/logs/my-activities/?${queryParams}`;

      const response = await fetch(endpoint, {
        credentials: "include",
      });

      console.log("Logs response:", response);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch logs. Status: ${response.status}. Response: ${errorText}`
        );
      }

      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        console.log("Fetched data:", data);

        // Process the logs to ensure unique keys and map the data structure
        const processedLogs = (data.activities || []).map((log, index) => ({
          ...log,
          // Create a unique key using id and index to handle duplicates
          uniqueKey: `${log.id}-${index}`,
          // Map the API response fields to what the component expects
          username: log.created_by || log.username || "system",
          user_role: log.user_role || "system",
          level: log.level || "info",
          title: log.title || "No title",
          service: log.service || "system",
          description: log.description || "No description",
          ip_address: log.ip_address || log.source_ip || "N/A",
          timestamp:
            log.created_at ||
            log.created_on ||
            log.timestamp ||
            new Date().toISOString(),
        }));

        setLogs(processedLogs);
        setPagination(data.pagination || {});
      } else {
        throw new Error(`Expected JSON, but received: ${contentType}`);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const getLevelBadgeColor = (level) => {
    switch (level?.toLowerCase()) {
      case "error":
        return "bg-red-100 text-red-800";
      case "warn":
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "info":
        return "bg-gray-200 text-gray-700";
      case "debug":
        return "bg-purple-100 text-purple-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "trace":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 50,
      username: "",
      userRole: "",
      action: "",
      resource: "",
      startDate: "",
      endDate: "",
    });
  };

  const exportLogs = async () => {
    if (!canViewAllLogs) return;

    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== "page" && key !== "limit") {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(
        `${import.meta.env.VITE_admin_server}/api/logs/export?${queryParams}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `activity_logs_${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error exporting logs:", error);
    }
  };

  const getActionBadgeColor = (action) => {
    switch (action) {
      case "CREATE":
        return "bg-green-100 text-green-800";
      case "UPDATE":
        return "bg-blue-100 text-blue-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      case "READ":
        return "bg-gray-100 text-gray-800";
      case "ERROR":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch (error) {
      return timestamp || "Invalid date";
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {canViewAllLogs ? "Activity Logs" : "My Activity Logs"}
        </h1>
        <p className="text-gray-600">
          {canViewAllLogs
            ? "Monitor all admin panel activities across the system"
            : "View your activity history in the admin panel"}
        </p>
      </div>

      {/* Statistics Cards - Only for admins */}
      {canViewAllLogs && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">
              Total Activities
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              {stats.stats?.totalActivities?.[0]?.count || logs.length || 0}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">
              Most Active User
            </h3>
            <p className="text-lg font-semibold text-green-600">
              {stats.stats?.activitiesByUser?.[0]?.username || "System"}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Top Action</h3>
            <p className="text-lg font-semibold text-purple-600">
              {stats.stats?.activitiesByAction?.[0]?.action || "READ"}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Top Resource</h3>
            <p className="text-lg font-semibold text-orange-600">
              {stats.stats?.activitiesByResource?.[0]?.resource || "System"}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          {canViewAllLogs && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={filters.username}
                  onChange={(e) =>
                    handleFilterChange("username", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Filter by username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Role
                </label>
                <select
                  value={filters.userRole}
                  onChange={(e) =>
                    handleFilterChange("userRole", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Roles</option>
                  {filterOptions.userRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange("action", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              {filterOptions.actions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resource
            </label>
            <select
              value={filters.resource}
              onChange={(e) => handleFilterChange("resource", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Resources</option>
              {filterOptions.resources.map((resource) => (
                <option key={resource} value={resource}>
                  {resource}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Clear Filters
          </button>
          {canViewAllLogs && (
            <button
              onClick={exportLogs}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Activity Logs Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.uniqueKey || log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold ${getLevelBadgeColor(
                        log.level
                      )}`}
                    >
                      {log.level?.toUpperCase() || "INFO"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {log.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.service}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {log.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{log.username}</div>
                      <div className="text-gray-500 text-xs">
                        {log.ip_address}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No activity logs found.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-700">
            Showing page {pagination.page} of {pagination.totalPages} (
            {pagination.totalCount} total records)
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
