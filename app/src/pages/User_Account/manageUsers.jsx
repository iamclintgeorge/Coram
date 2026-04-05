import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, Edit3, Search, User, Mail, Shield, X } from "lucide-react";
import { toast } from "react-toastify";

const ViewUsersPage = () => {
  const nodeName = "pve";
  // const [users, setUsers] = useState([
  //   {
  //     id: "u123",
  //     name: "John Doe",
  //     email: "john.doe@example.com",
  //     role: "admin",
  //     created_on: "2024-03-15T10:00:00Z",
  //     vms: ["100", "101"],
  //   },
  //   {
  //     id: "u124",
  //     name: "Jane Smith",
  //     email: "jane.smith@student.in",
  //     role: "user",
  //     created_on: "2024-03-20T14:30:00Z",
  //     vms: [],
  //   },
  // ]);

  const [users, setUsers] = useState([]);

  // 🔹 Mock VM list
  // const [vmList] = useState([
  //   { id: "vm1", name: "Ubuntu Server" },
  //   { id: "vm2", name: "Windows 11" },
  //   { id: "vm3", name: "Kali Linux" },
  //   { id: "vm4", name: "Arch Linux" },
  //   { id: "vm5", name: "Mint Linux" },
  //   { id: "vm6", name: "Debian Linux" },
  //   { id: "vm7", name: "Zorin Linux" },
  //   { id: "vm8", name: "Mac Linux" },
  // ]);

  const [vmList, setVmList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedVMs, setSelectedVMs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchVMs = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_admin_server}/api/proxmox/fetchNodeStats/${nodeName}`,
        { withCredentials: true },
      );

      console.log("fetchVMs", res);

      const formattedVMs = res?.data.map((vm) => ({
        id: vm.vmid.toString(),
        name: vm.name,
      }));

      setVmList(formattedVMs);
    } catch (err) {
      console.error("Failed to fetch VMs", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_admin_server}/api/get-users`,
        { withCredentials: true },
      );

      console.log("Get Users", res.data.users);

      const formattedUsers = res.data.users.map((u) => ({
        id: u.ID,
        name: u.UserName,
        email: u.Email,
        role: u.Role,
        created_on: u.CreatedOn,
        vms: u.VMs || [],
      }));

      setUsers(formattedUsers);
    } catch (err) {
      console.error("Failed to fetch Users", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchVMs();
  }, []);

  const deleteUsers = async () => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_admin_server}/api/delete-users`,
        { withCredentials: true },
      );
    } catch (err) {
      console.error("Failed to Delete Users", err);
    }
  };

  const updateVMAssign = async () => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_admin_server}/api/update-vm-assign`,
        { withCredentials: true },
      );
    } catch (err) {
      console.error("Failed to Delete Users", err);
    }
  };

  // 🔹 Open modal
  const handleEdit = (user) => {
    setSelectedUser(user);
    setSelectedVMs(user.vms || []);
    setIsModalOpen(true);
  };

  // 🔹 Toggle VM selection
  const toggleVM = (vmId) => {
    setSelectedVMs((prev) =>
      prev.includes(vmId) ? prev.filter((id) => id !== vmId) : [...prev, vmId],
    );
  };

  // 🔹 Save assignment
  const handleSaveVMs = () => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id ? { ...u, vms: selectedVMs } : u,
      ),
    );

    toast.success("VM assignment updated");
    setIsModalOpen(false);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    toast.success("User deleted successfully");
  };

  // const filteredUsers = users?.filter(
  //   (u) =>
  //     u.name?.toLowerCase().includes(search.toLowerCase()) ||
  //     u.email?.toLowerCase().includes(search.toLowerCase()),
  // );

  const filteredUsers = Array.isArray(users)
    ? users.filter(
        (u) =>
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase()),
      )
    : [];

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

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No users found.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  User Details
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  VM(s) Assigned
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-sm text-gray-500 flex gap-1">
                          <Mail size={12} /> {u.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {u.vms?.length
                      ? u.vms
                          .map((id) => vmList.find((v) => v.id === id)?.name)
                          .join(", ")
                      : "None"}
                  </td>

                  <td className="px-6 py-4 space-x-7 text-right">
                    <button
                      onClick={() => handleEdit(u)}
                      className="text-gray-600"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-500/50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 🔥 Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium font-inter">
                Assign VMs to {selectedUser.name}
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* 🔍 Search Input */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search VMs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none"
              />
            </div>

            {/* ✅ Selected VM Chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedVMs.map((vmId) => {
                const vm = vmList.find((v) => v.id === vmId);
                return (
                  <span
                    key={vmId}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded-full"
                  >
                    {vm?.name}
                    <button
                      onClick={() => toggleVM(vmId)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
            </div>

            {/* 📜 Dropdown List */}
            <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
              {vmList
                .filter((vm) =>
                  vm.name.toLowerCase().includes(search.toLowerCase()),
                )
                .map((vm) => {
                  const isSelected = selectedVMs.includes(vm.id);

                  return (
                    <div
                      key={vm.id}
                      onClick={() => toggleVM(vm.id)}
                      className={`px-3 py-2 text-sm cursor-pointer flex justify-between items-center ${
                        isSelected ? "bg-gray-100" : "hover:bg-gray-50"
                      }`}
                    >
                      <span>{vm.name}</span>
                      {isSelected && (
                        <span className="text-xs text-gray-500">✓</span>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVMs}
                className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewUsersPage;
