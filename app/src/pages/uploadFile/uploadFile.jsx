import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const UploadFile = () => {
  const [pdfs, setPdfs] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [type, setType] = useState("under-graduate");
  const [division, setDivision] = useState("");
  const [semester, setSemester] = useState(1);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPdfs();
  }, []);

  const fetchPdfs = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_admin_server}/api/static-files/`
      );
      console.log("Fetched PDFs:", response.data);
      setPdfs(response.data);
    } catch (err) {
      console.error("Error loading PDFs:", err);
      toast.error("Error fetching PDFs");
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) {
      toast.error("Please fill in all fields");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    setUploading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_admin_server}/api/static-files/create`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success("PDF uploaded successfully");
      setFile(null);
      setTitle("");
      fetchPdfs();
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Error uploading PDF");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this PDF?")) return;

    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_admin_server}/api/static-files/${id}`,
        { withCredentials: true }
      );
      toast.success("PDF deleted successfully");
      fetchPdfs();
      console.log("HandleDelete Function:", res);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error deleting PDF");
    }
  };

  const handleCopyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(
        `${import.meta.env.VITE_admin_server}/cdn/static_pdfs/${url}`
      );
      toast.success("Link copied to clipboard!");
    } catch (err) {
      console.error("Error copying link:", err);
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto shadow-sm overflow-hidden">
        <div>
          <h2 className="text-3xl font-inter font-bold text-gray-900 mb-10">
            Upload Static Files
          </h2>

          {/* File Upload Form */}
          <form onSubmit={handleUpload} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PDF Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter PDF title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload PDF
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-200 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Upload PDF"}
            </button>
          </form>

          {/* PDF List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pdfs.length > 0 ? (
              pdfs.map((pdf) => (
                <div
                  key={pdf.id}
                  className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex flex-col">
                    <a
                      href={pdf.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium"
                    >
                      {pdf.originalname}
                    </a>
                    <p className="text-sm text-gray-500 mt-1">
                      Title: {pdf.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Created By: {pdf.created_by}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      Link:{" "}
                      {`${import.meta.env.VITE_admin_server}/cdn/static_pdfs/${
                        pdf.filename
                      }`}
                    </p>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={() => handleCopyLink(pdf.filename)}
                      className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition-colors duration-200 text-sm"
                      title="Copy link to clipboard"
                      aria-label="Copy link to clipboard"
                    >
                      Copy Link
                    </button>
                    <button
                      onClick={() => handleDelete(pdf.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors duration-200 text-sm"
                      title="Delete PDF"
                      aria-label="Delete PDF"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No PDFs available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadFile;
