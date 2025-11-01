import React, { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  Trash2,
  Calendar,
  Users,
  Download,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";

const ManifestoManager = () => {
  const [manifestos, setManifestos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchManifestos();
  }, []);

  const fetchManifestos = async () => {
    try {
      setLoading(true);
      const response = await api.get("/manifesto/my-manifestos");
      setManifestos(response.data.manifestos);
    } catch (error) {
      console.error("❌ Error fetching manifestos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file only.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      // 50MB limit
      alert("File size must be less than 50MB.");
      return;
    }

    const formData = new FormData();
    formData.append("manifesto", file);

    try {
      setUploading(true);
      const response = await api.post("/manifesto/upload", formData);

      alert("✅ Manifesto uploaded successfully!");
      fetchManifestos(); // Refresh the list
    } catch (error) {
      console.error("❌ Upload error:", error);
      alert(
        `❌ Upload failed: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (manifestoId) => {
    if (
      !confirm(
        "Are you sure you want to delete this manifesto? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/manifesto/${manifestoId}`);
      alert("✅ Manifesto deleted successfully!");
      fetchManifestos(); // Refresh the list
    } catch (error) {
      console.error("❌ Delete error:", error);
      alert(
        `❌ Delete failed: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Manifesto Management
          </h1>
          <p className="text-gray-600">
            Upload and manage your party's manifestos. These will be permanently
            stored and accessible to voters for AI-powered queries.
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Upload New Manifesto
          </h2>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600">
                  Uploading and processing your manifesto...
                </p>
                <p className="text-sm text-gray-500">
                  This may take a moment while we extract and process the
                  content.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg text-gray-900 mb-2">
                    Drop your manifesto here, or{" "}
                    <label className="text-blue-600 hover:text-blue-700 cursor-pointer underline">
                      browse files
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf"
                        onChange={(e) => handleFileUpload(e.target.files)}
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-500">
                    Only PDF files up to 50MB are supported
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-start space-x-2 p-4 bg-blue-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Important:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Manifestos are stored permanently and cannot be modified once
                  uploaded
                </li>
                <li>Only you (as the party) can delete your manifestos</li>
                <li>
                  The AI system will extract text content to answer voter
                  questions
                </li>
                <li>Make sure your PDF is readable and well-formatted</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Manifestos List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Your Manifestos
              </h2>
              <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                {manifestos.length} manifesto
                {manifestos.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your manifestos...</p>
            </div>
          ) : manifestos.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No manifestos uploaded yet
              </h3>
              <p className="text-gray-600">
                Upload your first manifesto using the form above to make it
                available to voters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {manifestos.map((manifesto) => (
                <div key={manifesto.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-red-600 flex-shrink-0" />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {manifesto.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {manifesto.description || "No description provided"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            {new Date(
                              manifesto.uploadedAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            {formatFileSize(manifesto.fileSize)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Public access</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              manifesto.extractedText
                                ? "bg-green-400"
                                : "bg-yellow-400"
                            }`}
                          />
                          <span className="text-gray-600">
                            {manifesto.extractedText
                              ? "Processed"
                              : "Processing..."}
                          </span>
                        </div>
                      </div>

                      {manifesto.extractedText && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">
                              Content preview:
                            </span>{" "}
                            {manifesto.extractedText.substring(0, 200)}
                            {manifesto.extractedText.length > 200 && "..."}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() =>
                          window.open(
                            `/api/manifesto/download/${manifesto.id}`,
                            "_blank"
                          )
                        }
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Download PDF"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(manifesto.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete manifesto"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManifestoManager;
