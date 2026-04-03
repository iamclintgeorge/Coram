import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, Edit3, Search, User, Mail, Shield } from "lucide-react";
import { toast } from "react-toastify";

const ViewUsersPage = () => {
  // const [users, setUsers] = useState([]);
  const [users, setUsers] = useState([
    {
      id: "u123",
      name: "John Doe",
      email: "john.doe@example.com",
      role: "admin",
      created_on: "2024-03-15T10:00:00Z",
    },
    {
      id: "u124",
      name: "Jane Smith",
      email: "jane.smith@student.in",
      role: "user",
      created_on: "2024-03-20T14:30:00Z",
    },
  ]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_admin_server}/api/users`,
        { withCredentials: true },
      );
      setUsers(res.data.users || []);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_admin_server}/api/users/${userId}`,
        { withCredentials: true },
      );
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User deleted successfully");
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-8 mx-auto font-inter max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Manage Users
          </h1>
          <p className="text-gray-500 mt-1">
            Overview of all users and their account status
          </p>
        </div>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl w-full md:w-80 focus:ring-2 focus:ring-gray-900 outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No users found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    User Details
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Joined On
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                          <User size={20} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {u.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail size={12} /> {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          u.role === "admin"
                            ? "bg-purple-50 text-purple-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        <Shield size={12} /> {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(u.created_on).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                          title="Edit User"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewUsersPage;
