import React from "react";
import { HiPencil, HiCheck } from "react-icons/hi";

const ProfileHeader = ({
  profile,
  isEditing,
  toggleEdit,
  saveField,
  handleFileChange,
}) => (
  <div className="flex flex-col items-center mb-10">
    <div className="relative group">
      <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-lg">
        <img
          src={
            profile.photo
              ? typeof profile.photo === "string" &&
                profile.photo.startsWith("http")
                ? profile.photo
                : `${import.meta.env.VITE_admin_server}${profile.photo}`
              : "https://via.placeholder.com/144?text=Profile"
          }
          alt="Profile"
          className="w-full h-full object-cover"
        />
        {isEditing.photo && (
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={(e) => handleFileChange(e, "photo")}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        )}
      </div>
      <div className="absolute -bottom-2 -right-2">
        <button
          onClick={() =>
            isEditing.photo ? saveField("photo") : toggleEdit("photo")
          }
          className={`rounded-full p-2 shadow-lg transition-colors duration-200 ${
            isEditing.photo
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
          aria-label={isEditing.photo ? "Save Photo" : "Edit Photo"}
        >
          {isEditing.photo ? (
            <HiCheck className="w-5 h-5" />
          ) : (
            <HiPencil className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
    <div className="text-center">
      <h2 className="text-2xl mt-5 font-inter font-semibold text-gray-900">
        {profile.name || "User Profile"}
      </h2>
    </div>
  </div>
);

export default ProfileHeader;
