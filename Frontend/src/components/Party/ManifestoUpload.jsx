import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const ManifestoUpload = () => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState("");

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
    setError("");

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    setError("");
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const validateFile = (file) => {
    if (file.type !== "application/pdf") {
      setError("Please select a PDF file");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setError("File size must be less than 10MB");
      return false;
    }
    return true;
  };

  const uploadManifesto = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setUploading(true);
    setError("");
    setUploadStatus("Uploading manifesto...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("partyId", user.partyId || user.id);
      formData.append("partyName", user.name);

      // Call AI service directly for manifesto processing
      const response = await fetch("http://localhost:5001/process-manifesto", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      setUploadStatus("✅ Manifesto uploaded and processed successfully!");
      setFile(null);

      // Clear file input
      const fileInput = document.getElementById("file");
      if (fileInput) fileInput.value = "";

      setTimeout(() => {
        setUploadStatus("");
      }, 5000);
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload manifesto. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Manifesto Management
        </h1>
        <p className="text-gray-600 mt-1">
          Upload and manage your party's election manifesto for AI-powered voter
          queries
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Upload Manifesto
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Upload your party manifesto in PDF format. This will be processed by
            our AI system to enable voters to ask questions about your policies.
          </p>
        </div>

        {/* Drag & Drop Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            id="file"
            type="file"
            accept=".pdf"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="space-y-4">
            <div className="text-6xl text-gray-400">📄</div>

            {file ? (
              <div className="space-y-2">
                <div className="text-lg font-medium text-gray-900">
                  Selected: {file.name}
                </div>
                <div className="text-sm text-gray-500">
                  Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-lg font-medium text-gray-900">
                  Drop your manifesto PDF here
                </div>
                <div className="text-gray-500">
                  or{" "}
                  <span className="text-blue-600 hover:text-blue-700">
                    browse to upload
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  Supports PDF files up to 10MB
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Status Message */}
        {uploadStatus && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {uploadStatus}
          </div>
        )}

        {/* Upload Button */}
        <div className="mt-6">
          <button
            onClick={uploadManifesto}
            disabled={!file || uploading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {uploading
              ? "Processing Manifesto..."
              : "Upload & Process Manifesto"}
          </button>
        </div>
      </div>

      {/* Features Info */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          🤖 AI-Powered Manifesto Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <span className="text-blue-600 mt-1">✨</span>
            <div>
              <div className="font-medium text-blue-900">
                Automatic Processing
              </div>
              <div className="text-sm text-blue-700">
                Your PDF is automatically parsed and indexed for AI queries
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-blue-600 mt-1">💬</span>
            <div>
              <div className="font-medium text-blue-900">Voter Chatbot</div>
              <div className="text-sm text-blue-700">
                Voters can ask questions about your policies through our chatbot
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-blue-600 mt-1">🎯</span>
            <div>
              <div className="font-medium text-blue-900">Smart Search</div>
              <div className="text-sm text-blue-700">
                AI finds relevant sections to answer specific policy questions
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-blue-600 mt-1">📊</span>
            <div>
              <div className="font-medium text-blue-900">
                Source Attribution
              </div>
              <div className="text-sm text-blue-700">
                All answers include references to specific manifesto sections
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3">
          📋 Manifesto Guidelines
        </h3>
        <ul className="space-y-2 text-yellow-800">
          <li className="flex items-center space-x-2">
            <span>•</span>
            <span>Upload your complete party manifesto in PDF format</span>
          </li>
          <li className="flex items-center space-x-2">
            <span>•</span>
            <span>Ensure text is searchable (not scanned images)</span>
          </li>
          <li className="flex items-center space-x-2">
            <span>•</span>
            <span>
              Include clear policy sections for better AI understanding
            </span>
          </li>
          <li className="flex items-center space-x-2">
            <span>•</span>
            <span>File size limit: 10MB maximum</span>
          </li>
          <li className="flex items-center space-x-2">
            <span>•</span>
            <span>Processing takes 1-2 minutes after upload</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ManifestoUpload;
