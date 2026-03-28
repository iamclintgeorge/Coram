import React, { useState, useEffect } from "react";
import axios from "axios";

const ViewUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_admin_server}/api/users`,
        { withCredentials: true },
      );
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Delete a user
  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_admin_server}/api/users/${userId}`,
        { withCredentials: true },
      );
      // Remove user from state
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    }
  };

  // Filtered users by search
  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">View Users</h1>

      {/* Search box */}
      <input
        type="text"
        placeholder="Search by username or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 px-3 py-2 border rounded-lg w-full max-w-md"
      />

      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filteredUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Username</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr
                key={u.id}
                className="border-t border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="px-4 py-2">{u.username}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.role}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewUsersPage;
