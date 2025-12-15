import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../services/useAuthCheck";
import { HiPencil, HiCheck } from "react-icons/hi";
import ProfileHeader from "./profileHeader";
import AccordionSection from "./accordianSection";

const EditableField = ({
  field,
  label,
  type,
  value,
  onChange,
  isEditing,
  toggleEdit,
  saveField,
}) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-2">{label}</label>
    {isEditing ? (
      <input
        type={type || "text"}
        name={field}
        value={value}
        onChange={onChange}
        className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
        placeholder={`Enter ${label}`}
      />
    ) : (
      <p className="text-sm text-gray-700 p-3 bg-white rounded-md border border-gray-200">
        {value || `No ${label.toLowerCase()} provided`}
      </p>
    )}
    <button
      onClick={() => (isEditing ? saveField(field) : toggleEdit(field))}
      className="text-blue-600 hover:text-blue-800 text-sm mt-2 transition-colors duration-200 flex items-center"
    >
      {isEditing ? (
        <>
          <HiCheck className="mr-1" /> Save
        </>
      ) : (
        <>
          <HiPencil className="mr-1" /> Edit
        </>
      )}
    </button>
  </div>
);

const FileEditableField = ({
  field,
  label,
  accept,
  render,
  isEditing,
  toggleEdit,
  saveField,
  handleFileChange,
}) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-2">{label}</label>
    {isEditing ? (
      <input
        type="file"
        accept={accept}
        onChange={(e) => handleFileChange(e, field)}
        className="p-3 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition duration-150"
      />
    ) : (
      <p className="text-sm text-gray-700 p-3 bg-white rounded-md border border-gray-200">
        {render()}
      </p>
    )}
    <button
      onClick={() => (isEditing ? saveField(field) : toggleEdit(field))}
      className="text-blue-600 hover:text-blue-800 text-sm mt-2 transition-colors duration-200 flex items-center"
    >
      {isEditing ? (
        <>
          <HiCheck className="mr-1" /> Save
        </>
      ) : (
        <>
          <HiPencil className="mr-1" /> Edit
        </>
      )}
    </button>
  </div>
);

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    photo: null,
    name: "",
    qualification: "",
    designation: "",
    email: "",
    dateOfJoining: "",
    bioData: null,
    publications: null,
    onlineProfiles: [],
    specializations: [],
    subjects: [],
    papers: [],
    researches: [],
  });
  const [prevProfile, setprevProfile] = useState({
    photo: null,
    name: "",
    qualification: "",
    designation: "",
    email: "",
    dateOfJoining: "",
    bioData: null,
    publications: null,
    onlineProfiles: [],
    specializations: [],
    subjects: [],
    papers: [],
    researches: [],
  });

  const [isEditing, setIsEditing] = useState({
    qualification: false,
    designation: false,
    email: false,
    dateOfJoining: false,
    photo: false,
    bioData: false,
    publications: false,
  });

  const [editingEntry, setEditingEntry] = useState({
    onlineProfile: null,
    areasOfSpecialization: null,
    subjectTaught: null,
    papersPresented: null,
    researchProjects: null,
  });

  const [newEntry, setNewEntry] = useState({
    onlineProfile: "",
    areasOfSpecialization: "",
    subjectTaught: { subject: "", type: "", semester: "" },
    papersPresented: { title: "", description: "", link: "" },
    researchProjects: {
      title: "",
      grant_type: "",
      funding_organization: "",
      amount: "",
      duration: "",
    },
  });

  const [openSections, setOpenSections] = useState({
    onlineProfiles: false,
    specializations: false,
    subjects: false,
    papers: false,
    researches: false,
  });

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_admin_server}/api/profile/${user.id}`
      );
      console.log("Fetched profile:", response.data);
      setProfile(response.data);
      setprevProfile(response.data);
    } catch (error) {
      console.error("Fetch profile error:", error);
      toast.error("Error fetching profile");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    setProfile((prev) => ({ ...prev, [field]: file }));
  };

  const handleNewEntryChange = (e, field, subField = null) => {
    const { name, value } = e.target;
    if (subField) {
      setNewEntry((prev) => ({
        ...prev,
        [field]: { ...prev[field], [name]: value },
      }));
    } else {
      setNewEntry((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditEntryChange = (e, field, subField = null) => {
    const { name, value } = e.target;
    setEditingEntry((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        id: prev[field]?.id, // Preserve the ID
        [name]: value, // Update the value
      },
    }));
  };

  const toggleEdit = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleEditEntry = (section, item) => {
    setEditingEntry((prev) => ({
      ...prev,
      [section]: prev[section]?.id === item.id ? null : { ...item },
    }));
  };

  const saveField = async (field) => {
    const formData = new FormData();
    const formatDate = (date) => {
      if (!date) return "";
      const d = new Date(date);
      return d.toISOString().split("T")[0];
    };

    const requiredFields = {
      name: profile.name || "",
      qualification: profile.qualification || "",
      designation: profile.designation || "",
      email: profile.email || "",
      dateOfJoining: formatDate(profile.dateOfJoining),
    };

    if (Object.keys(requiredFields).includes(field)) {
      requiredFields[field] =
        field === "dateOfJoining"
          ? formatDate(profile[field])
          : profile[field] || "";
    }

    Object.entries(requiredFields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (
      ["photo", "bioData", "publications"].includes(field) &&
      profile[field]
    ) {
      formData.append(field, profile[field]);
    }

    const formDataObj = {};
    formData.forEach((value, key) => {
      formDataObj[key] = value;
    });

    try {
      console.log("formDataObj", formDataObj);
      const formDataToSend = new FormData();
      if (profile.photo !== prevProfile.photo) {
        formDataToSend.append("file", profile.photo);
      }

      if (profile.bioData !== prevProfile.bioData) {
        formDataToSend.append("file", profile.bioData);
      }

      if (profile.publications !== prevProfile.publications) {
        formDataToSend.append("file", profile.publications);
      }
      formDataToSend.append("method", "PUT");
      formDataToSend.append("section", "Profile");
      formDataToSend.append("title", "Update Profile Personal Details");
      formDataToSend.append(
        "change_summary",
        "Update Existing Entry of Profile Personal Page pertaining to the faculties table"
      );
      formDataToSend.append("current_content", "");
      formDataToSend.append("proposed_content", JSON.stringify(formDataObj));
      formDataToSend.append("endpoint_url", `api/profile`);
      formDataToSend.append("id", user.id);

      await axios.post(
        `${import.meta.env.VITE_admin_server}/api/content-approval/request`,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // await axios.put(
      //   `${import.meta.env.VITE_admin_server}/api/profile/${user.id}`,
      //   formData,
      //   {
      //     headers: { "Content-Type": "multipart/form-data" },
      //   }
      // );
      toast.success(`${field} updated successfully`);
      toggleEdit(field);
      fetchProfile();
    } catch (error) {
      console.error(`Update ${field} error:`, error);
      toast.error(`Error updating ${field}`);
    }
  };

  const addEntry = async (field, endpoint, data) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("method", "POST");
      formDataToSend.append("section", "Profile");
      formDataToSend.append("title", `Create Profile ${field}`);
      formDataToSend.append(
        "change_summary",
        `Added Entry to Profile ${field}`
      );
      formDataToSend.append("current_content", "");
      formDataToSend.append("proposed_content", JSON.stringify(data));
      formDataToSend.append(
        "endpoint_url",
        `api/profile/${user.id}/${endpoint}`
      );
      formDataToSend.append("id", 0);

      await axios.post(
        `${import.meta.env.VITE_admin_server}/api/content-approval/request`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // await axios.post(
      //   `${import.meta.env.VITE_admin_server}/api/profile/${user.id}/${endpoint}`,
      //   data
      // );
      toast.success(`${field} added successfully`);
      setNewEntry((prev) => ({
        ...prev,
        [field]:
          field === "subjectTaught" ||
          field === "papersPresented" ||
          field === "researchProjects"
            ? {
                subject: "",
                type: "",
                semester: "",
                title: "",
                description: "",
                link: "",
                grant_type: "",
                funding_organization: "",
                amount: "",
                duration: "",
              }
            : "",
      }));
      fetchProfile();
    } catch (error) {
      console.error(`Add ${field} error:`, error);
      toast.error(`Error adding ${field}`);
    }
  };

  const updateEntry = async (field, endpoint, data, entryId, section) => {
    try {
      const formData = new FormData();
      formData.append("method", "PUT");
      formData.append("section", "Profile");
      formData.append("title", `Update Profile ${field}`);
      formData.append(
        "change_summary",
        `Update Existing Entry of Update Profile ${field} Section`
      );
      formData.append("current_content", JSON.stringify(prevProfile[section]));
      formData.append("proposed_content", JSON.stringify(data));
      formData.append("endpoint_url", `api/profile/${user.id}/${endpoint}`);
      formData.append("id", entryId);

      await axios.post(
        `${import.meta.env.VITE_admin_server}/api/content-approval/request`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // const response = await axios.put(
      //   `${import.meta.env.VITE_admin_server}/api/profile/${user.id}/${endpoint}/${entryId}`,
      //   data
      // );
      toast.success(`${field} updated successfully`);
      // Clear the editing state for this field
      setEditingEntry((prev) => ({
        ...prev,
        [field.toLowerCase().replace(/\s+/g, "")]: null,
      }));
      // Refresh the profile data
      await fetchProfile();
    } catch (error) {
      console.error(`Update ${field} error:`, error);
      toast.error(`Error updating ${field}`);
    }
  };

  const deleteEntry = async (field, entryId, endpoint, section) => {
    if (!window.confirm(`Are you sure you want to delete this ${field}?`))
      return;
    try {
      const formData = new FormData();
      formData.append("method", "DELETE");
      formData.append("section", "Profile");
      formData.append("title", `Delete Profile ${field}`);
      formData.append(
        "change_summary",
        `Delete Existing Entry of Profile ${field} Section`
      );
      formData.append("current_content", JSON.stringify(prevProfile[section]));
      formData.append("proposed_content", "");
      formData.append("endpoint_url", `api/profile/${user.id}/${endpoint}`);
      formData.append("id", entryId);

      await axios.post(
        `${import.meta.env.VITE_admin_server}/api/content-approval/request`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // await axios.delete(
      //   `${import.meta.env.VITE_admin_server}/api/profile/${user.id}/${endpoint}/${entryId}`
      // );
      toast.success(`${field} deleted successfully`);
      fetchProfile();
    } catch (error) {
      console.error(`Delete ${field} error:`, error);
      toast.error(`Error deleting ${field}`);
    }
  };

  const accordionSections = [
    {
      section: "onlineProfiles",
      label: "Online Profiles",
      endpoint: "online-profile",
      data: profile.onlineProfiles,
      input: () => (
        <input
          type="url"
          name="onlineProfile"
          value={newEntry.onlineProfile}
          onChange={(e) => handleNewEntryChange(e, "onlineProfile")}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
          placeholder="Enter online profile link"
        />
      ),
      addButton: (
        <button
          onClick={() =>
            addEntry("Online Profile", "online-profile", {
              description: newEntry.onlineProfile,
            })
          }
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
        >
          <HiCheck className="mr-2" /> Add Online Profile
        </button>
      ),
      renderItem: (item) =>
        editingEntry.onlineProfile?.id === item.id ? (
          <div className="space-y-4 bg-white p-4 rounded-md">
            <input
              type="url"
              name="onlineProfile"
              value={
                editingEntry.onlineProfile?.onlineProfile || item.onlineProfile
              }
              onChange={(e) => handleEditEntryChange(e, "onlineProfile")}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
              placeholder="Enter online profile link"
            />
            <div className="flex space-x-4">
              <button
                onClick={() =>
                  updateEntry(
                    "Online Profile",
                    "online-profile",
                    {
                      description:
                        editingEntry.onlineProfile?.onlineProfile ||
                        item.onlineProfile,
                    },
                    item.id,
                    "onlineProfiles"
                  )
                }
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200"
              >
                <HiCheck className="mr-2" /> Save
              </button>
              <button
                onClick={() => toggleEditEntry("onlineProfile", null)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center bg-white p-4 rounded-md">
            <a
              href={item.onlineProfile}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              {item.onlineProfile}
            </a>
            <div className="flex space-x-2">
              <button
                onClick={() => toggleEditEntry("onlineProfile", item)}
                className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center"
              >
                <HiPencil className="mr-1" /> Edit
              </button>
              <button
                onClick={() =>
                  deleteEntry(
                    "Online Profile",
                    item.id,
                    "online-profile",
                    "onlineProfiles"
                  )
                }
                className="text-red-600 hover:text-red-800 transition-colors duration-200 flex items-center"
              >
                Delete
              </button>
            </div>
          </div>
        ),
    },
    {
      section: "specializations",
      label: "Areas of Specialization",
      endpoint: "specialization",
      data: profile.specializations,
      input: () => (
        <input
          type="text"
          name="areasOfSpecialization"
          value={newEntry.areasOfSpecialization}
          onChange={(e) => handleNewEntryChange(e, "areasOfSpecialization")}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
          placeholder="Enter specialization"
        />
      ),
      addButton: (
        <button
          onClick={() =>
            addEntry("Areas of Specialization", "specialization", {
              description: newEntry.areasOfSpecialization,
            })
          }
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
        >
          <HiCheck className="mr-2" /> Add Specialization
        </button>
      ),
      renderItem: (item) =>
        editingEntry.areasOfSpecialization?.id === item.id ? (
          <div className="space-y-4 bg-white p-4 rounded-md">
            <input
              type="text"
              name="areasOfSpecialization"
              value={editingEntry.areasOfSpecialization.areasOfSpecialization}
              onChange={(e) =>
                handleEditEntryChange(e, "areasOfSpecialization")
              }
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
              placeholder="Enter specialization"
            />
            <div className="flex space-x-4">
              <button
                onClick={() =>
                  updateEntry(
                    "Areas of Specialization",
                    "specialization",
                    {
                      description:
                        editingEntry.areasOfSpecialization
                          .areasOfSpecialization,
                    },
                    item.id,
                    "specializations"
                  )
                }
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
              >
                <HiCheck className="mr-2" /> Save
              </button>
              <button
                onClick={() => toggleEditEntry("areasOfSpecialization", item)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center bg-white p-4 rounded-md">
            <p className="text-sm text-gray-700">
              {item.areasOfSpecialization}
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => toggleEditEntry("areasOfSpecialization", item)}
                className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center"
              >
                <HiPencil className="mr-1" /> Edit
              </button>
              <button
                onClick={() =>
                  deleteEntry(
                    "Specialization",
                    item.id,
                    "specialization",
                    "specializations"
                  )
                }
                className="text-red-600 hover:text-red-800 transition-colors duration-200 flex items-center"
              >
                Delete
              </button>
            </div>
          </div>
        ),
    },
    {
      section: "subjects",
      label: "Subjects Taught",
      endpoint: "subject",
      data: profile.subjects,
      input: () => (
        <div className="space-y-4">
          <input
            type="text"
            name="subject"
            value={newEntry.subjectTaught.subject}
            onChange={(e) =>
              handleNewEntryChange(e, "subjectTaught", "subject")
            }
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            placeholder="Enter subject"
          />
          <input
            type="text"
            name="type"
            value={newEntry.subjectTaught.type}
            onChange={(e) => handleNewEntryChange(e, "subjectTaught", "type")}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            placeholder="Enter type (e.g., Theory, Practical)"
          />
          <input
            type="text"
            name="semester"
            value={newEntry.subjectTaught.semester}
            onChange={(e) =>
              handleNewEntryChange(e, "subjectTaught", "semester")
            }
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            placeholder="Enter semester"
          />
        </div>
      ),
      addButton: (
        <button
          onClick={() =>
            addEntry("Subject Taught", "subject", newEntry.subjectTaught)
          }
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
        >
          <HiCheck className="mr-2" /> Add Subject
        </button>
      ),
      renderItem: (item) =>
        editingEntry.subjectTaught?.id === item.id ? (
          <div className="space-y-4 bg-white p-4 rounded-md">
            <div className="space-y-4">
              <input
                type="text"
                name="subject"
                value={editingEntry.subjectTaught.subject}
                onChange={(e) =>
                  handleEditEntryChange(e, "subjectTaught", "subject")
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                placeholder="Enter subject"
              />
              <input
                type="text"
                name="type"
                value={editingEntry.subjectTaught.type}
                onChange={(e) =>
                  handleEditEntryChange(e, "subjectTaught", "type")
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                placeholder="Enter type (e.g., Theory, Practical)"
              />
              <input
                type="text"
                name="semester"
                value={editingEntry.subjectTaught.semester}
                onChange={(e) =>
                  handleEditEntryChange(e, "subjectTaught", "semester")
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                placeholder="Enter semester"
              />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() =>
                  updateEntry(
                    "Subject Taught",
                    "subject",
                    editingEntry.subjectTaught,
                    item.id,
                    "subjects"
                  )
                }
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
              >
                <HiCheck className="mr-2" /> Save
              </button>
              <button
                onClick={() => toggleEditEntry("subjectTaught", item)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center bg-white p-4 rounded-md">
            <p className="text-sm text-gray-700">
              {item.subjectTaught} ({item.type}, Semester: {item.semester})
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => toggleEditEntry("subjectTaught", item)}
                className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center"
              >
                <HiPencil className="mr-1" /> Edit
              </button>
              <button
                onClick={() =>
                  deleteEntry("Subject", item.id, "subject", "subjects")
                }
                className="text-red-600 hover:text-red-800 transition-colors duration-200 flex items-center"
              >
                Delete
              </button>
            </div>
          </div>
        ),
    },
    {
      section: "papers",
      label: "Papers Presented",
      endpoint: "paper",
      data: profile.papers,
      input: () => (
        <div className="space-y-4">
          <input
            type="text"
            name="title"
            value={newEntry.papersPresented.title}
            onChange={(e) =>
              handleNewEntryChange(e, "papersPresented", "title")
            }
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            placeholder="Enter paper title"
          />
          <input
            type="text"
            name="description"
            value={newEntry.papersPresented.description}
            onChange={(e) =>
              handleNewEntryChange(e, "papersPresented", "description")
            }
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            placeholder="Enter paper description"
          />
          <input
            type="url"
            name="link"
            value={newEntry.papersPresented.link}
            onChange={(e) => handleNewEntryChange(e, "papersPresented", "link")}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            placeholder="Enter paper link (optional)"
          />
        </div>
      ),
      addButton: (
        <button
          onClick={() =>
            addEntry("Paper Presented", "paper", newEntry.papersPresented)
          }
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
        >
          <HiCheck className="mr-2" /> Add Paper
        </button>
      ),
      renderItem: (item) =>
        editingEntry.papersPresented?.id === item.id ? (
          <div className="space-y-4 bg-white p-4 rounded-md">
            <div className="space-y-4">
              <input
                type="text"
                name="title"
                value={editingEntry.papersPresented.title}
                onChange={(e) =>
                  handleEditEntryChange(e, "papersPresented", "title")
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                placeholder="Enter paper title"
              />
              <input
                type="text"
                name="description"
                value={editingEntry.papersPresented.description}
                onChange={(e) =>
                  handleEditEntryChange(e, "papersPresented", "description")
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                placeholder="Enter paper description"
              />
              <input
                type="url"
                name="link"
                value={editingEntry.papersPresented.link}
                onChange={(e) =>
                  handleEditEntryChange(e, "papersPresented", "link")
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                placeholder="Enter paper link (optional)"
              />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() =>
                  updateEntry(
                    "Paper Presented",
                    "paper",
                    editingEntry.papersPresented,
                    item.id,
                    "papers"
                  )
                }
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
              >
                <HiCheck className="mr-2" /> Save
              </button>
              <button
                onClick={() => toggleEditEntry("papersPresented", item)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center bg-white p-4 rounded-md">
            <div>
              <p className="text-sm text-gray-700">{item.title}</p>
              <p className="text-sm text-gray-500">{item.description}</p>
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors duration-200 text-sm flex items-center"
                >
                  <HiPencil className="mr-1" /> View Link
                </a>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => toggleEditEntry("papersPresented", item)}
                className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center"
              >
                <HiPencil className="mr-1" /> Edit
              </button>
              <button
                onClick={() => deleteEntry("Paper", item.id, "paper", "papers")}
                className="text-red-600 hover:text-red-800 transition-colors duration-200 flex items-center"
              >
                Delete
              </button>
            </div>
          </div>
        ),
    },
    {
      section: "researches",
      label: "Research Projects",
      endpoint: "research",
      data: profile.researches,
      input: () => (
        <div className="space-y-4">
          <input
            type="text"
            name="title"
            value={newEntry.researchProjects.title}
            onChange={(e) =>
              handleNewEntryChange(e, "researchProjects", "title")
            }
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            placeholder="Enter project title"
          />
          <input
            type="text"
            name="grant_type"
            value={newEntry.researchProjects.grant_type}
            onChange={(e) =>
              handleNewEntryChange(e, "researchProjects", "grant_type")
            }
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            placeholder="Enter grant type"
          />
          <input
            type="text"
            name="funding_organization"
            value={newEntry.researchProjects.funding_organization}
            onChange={(e) =>
              handleNewEntryChange(
                e,
                "researchProjects",
                "funding_organization"
              )
            }
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            placeholder="Enter funding organization"
          />
          <input
            type="text"
            name="amount"
            value={newEntry.researchProjects.amount}
            onChange={(e) =>
              handleNewEntryChange(e, "researchProjects", "amount")
            }
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            placeholder="Enter amount"
          />
          <input
            type="text"
            name="duration"
            value={newEntry.researchProjects.duration}
            onChange={(e) =>
              handleNewEntryChange(e, "researchProjects", "duration")
            }
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            placeholder="Enter duration"
          />
        </div>
      ),
      addButton: (
        <button
          onClick={() =>
            addEntry("Research Project", "research", newEntry.researchProjects)
          }
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
        >
          <HiCheck className="mr-2" /> Add Research Project
        </button>
      ),
      renderItem: (item) =>
        editingEntry.researchProjects?.id === item.id ? (
          <div className="space-y-4 bg-white p-4 rounded-md">
            <div className="space-y-4">
              <input
                type="text"
                name="title"
                value={editingEntry.researchProjects.title}
                onChange={(e) =>
                  handleEditEntryChange(e, "researchProjects", "title")
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                placeholder="Enter project title"
              />
              <input
                type="text"
                name="grant_type"
                value={editingEntry.researchProjects.grant_type}
                onChange={(e) =>
                  handleEditEntryChange(e, "researchProjects", "grant_type")
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                placeholder="Enter grant type"
              />
              <input
                type="text"
                name="funding_organization"
                value={editingEntry.researchProjects.funding_organization}
                onChange={(e) =>
                  handleEditEntryChange(
                    e,
                    "researchProjects",
                    "funding_organization"
                  )
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                placeholder="Enter funding organization"
              />
              <input
                type="text"
                name="amount"
                value={editingEntry.researchProjects.amount}
                onChange={(e) =>
                  handleEditEntryChange(e, "researchProjects", "amount")
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                placeholder="Enter amount"
              />
              <input
                type="text"
                name="duration"
                value={editingEntry.researchProjects.duration}
                onChange={(e) =>
                  handleEditEntryChange(e, "researchProjects", "duration")
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                placeholder="Enter duration"
              />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() =>
                  updateEntry(
                    "Research Project",
                    "research",
                    editingEntry.researchProjects,
                    item.id,
                    "researches"
                  )
                }
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
              >
                <HiCheck className="mr-2" /> Save
              </button>
              <button
                onClick={() => toggleEditEntry("researchProjects", item)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center bg-white p-4 rounded-md">
            <div>
              <p className="text-sm text-gray-700">{item.title}</p>
              <p className="text-sm text-gray-500">
                {item.grant_type}, {item.funding_organization}, {item.amount},{" "}
                {item.duration}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => toggleEditEntry("researchProjects", item)}
                className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center"
              >
                <HiPencil className="mr-1" /> Edit
              </button>
              <button
                onClick={() =>
                  deleteEntry(
                    "Research Project",
                    item.id,
                    "research",
                    "researches"
                  )
                }
                className="text-red-600 hover:text-red-800 transition-colors duration-200 flex items-center"
              >
                Delete
              </button>
            </div>
          </div>
        ),
    },
  ];

  return (
    <div className="min-h-screen py-0 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto font-inter">
        <div className="p-8">
          <ProfileHeader
            profile={profile}
            isEditing={isEditing}
            toggleEdit={toggleEdit}
            saveField={saveField}
            handleFileChange={handleFileChange}
          />
          {/* Personal Information */}
          <div className="mb-8 border-2 border-gray-300 p-6 rounded-lg">
            <h3 className="text-2xl font-playfair font-medium text-gray-900 mb-6 border-b pb-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { field: "qualification", label: "Qualification" },
                { field: "designation", label: "Designation" },
                { field: "email", label: "Email" },
                {
                  field: "dateOfJoining",
                  label: "Date of Joining",
                  type: "date",
                },
              ].map(({ field, label, type }) => (
                <EditableField
                  key={field}
                  field={field}
                  label={label}
                  type={type}
                  value={
                    field === "dateOfJoining" && profile[field]
                      ? profile[field].split("T")[0]
                      : profile[field] || ""
                  }
                  onChange={handleChange}
                  isEditing={isEditing[field]}
                  toggleEdit={toggleEdit}
                  saveField={saveField}
                />
              ))}
            </div>
          </div>
          {/* Academic Details */}
          <div className="mb-8 border-2 border-gray-300 p-6 rounded-lg">
            <h3 className="text-2xl font-playfair font-medium text-gray-900 mb-6 border-b pb-2">
              Academic Details
            </h3>
            <div className="space-y-6">
              {[
                {
                  field: "bioData",
                  label: "Bio-Data (PDF)",
                  accept: "application/pdf",
                  render: () =>
                    profile.bioData ? (
                      <a
                        href={`${profile.bioData}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                      >
                        View Bio-Data
                      </a>
                    ) : (
                      "No bio-data uploaded"
                    ),
                },
                {
                  field: "publications",
                  label: "Publications (PDF)",
                  accept: "application/pdf",
                  render: () =>
                    profile.publications ? (
                      <a
                        href={`${profile.publications}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                      >
                        View Publications
                      </a>
                    ) : (
                      "No publications uploaded"
                    ),
                },
              ].map(({ field, label, accept, render }) => (
                <FileEditableField
                  key={field}
                  field={field}
                  label={label}
                  accept={accept}
                  render={render}
                  isEditing={isEditing[field]}
                  toggleEdit={toggleEdit}
                  saveField={saveField}
                  handleFileChange={handleFileChange}
                />
              ))}
              {accordionSections.map(
                ({ section, label, data, input, addButton, renderItem }) => (
                  <AccordionSection
                    key={section}
                    section={section}
                    label={label}
                    data={data}
                    open={openSections[section]}
                    onToggle={() => toggleSection(section)}
                    input={input}
                    addButton={addButton}
                    renderItem={renderItem}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
