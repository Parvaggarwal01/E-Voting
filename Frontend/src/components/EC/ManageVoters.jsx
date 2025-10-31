import React, { useState, useEffect, useRef } from "react";
import { api } from "../../services/api";

const ManageVoters = () => {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [registrationResults, setRegistrationResults] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchVoters();
  }, []);

  const fetchVoters = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/voters");
      setVoters(response.data);
    } catch (error) {
      console.error("Error fetching voters:", error);
      setUploadStatus({ type: "error", message: "Failed to fetch voters" });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setUploadStatus({ type: "error", message: "Please select a CSV file" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const rows = text.split("\n").filter((row) => row.trim());

        // Parse CSV properly handling quoted fields
        const parseCSVRow = (row) => {
          const values = [];
          let current = "";
          let inQuotes = false;

          for (let i = 0; i < row.length; i++) {
            const char = row[i];

            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
              values.push(current.trim());
              current = "";
            } else {
              current += char;
            }
          }
          values.push(current.trim());
          return values;
        };

        const headers = parseCSVRow(rows[0]);

        // Validate required headers
        const requiredHeaders = [
          "name",
          "email",
          "phone",
          "address",
          "dateOfBirth",
          "aadhaarNumber",
        ];
        const missingHeaders = requiredHeaders.filter(
          (h) => !headers.includes(h)
        );

        if (missingHeaders.length > 0) {
          setUploadStatus({
            type: "error",
            message: `Missing required columns: ${missingHeaders.join(", ")}`,
          });
          return;
        }

        const data = rows
          .slice(1)
          .map((row, index) => {
            const values = parseCSVRow(row);
            const rowData = {};
            headers.forEach((header, i) => {
              rowData[header] = values[i] || "";
            });
            rowData.index = index + 1;
            return rowData;
          })
          .filter((row) => row.name && row.email); // Filter out empty rows

        setCsvData(data);
        setShowPreview(true);
        setUploadStatus({
          type: "success",
          message: `${data.length} voters loaded from CSV`,
        });
      } catch (error) {
        setUploadStatus({ type: "error", message: "Failed to parse CSV file" });
      }
    };
    reader.readAsText(file);
  };

  const handleBulkRegister = async () => {
    if (csvData.length === 0) return;

    try {
      setLoading(true);
      setUploadStatus({ type: "info", message: "Registering voters..." });

      const response = await api.post("/admin/voters/bulk-register", {
        votersData: csvData,
      });

      setRegistrationResults(response.data);
      setShowPreview(false);
      setCsvData([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Refresh voters list
      await fetchVoters();

      const { success, errors, total } = response.data;
      setUploadStatus({
        type: errors.length > 0 ? "warning" : "success",
        message: `Registration complete: ${success.length}/${total} voters registered successfully`,
      });
    } catch (error) {
      console.error("Error registering voters:", error);
      setUploadStatus({ type: "error", message: "Failed to register voters" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVoter = async (voterId) => {
    if (!confirm("Are you sure you want to delete this voter?")) return;

    try {
      await api.delete(`/admin/voters/${voterId}`);
      setVoters(voters.filter((voter) => voter.id !== voterId));
      setUploadStatus({
        type: "success",
        message: "Voter deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting voter:", error);
      setUploadStatus({
        type: "error",
        message: error.response?.data?.error || "Failed to delete voter",
      });
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setUploadStatus({
        type: "success",
        message: `${type} copied to clipboard!`,
      });
      setTimeout(() => setUploadStatus(null), 2000);
    } catch (err) {
      setUploadStatus({
        type: "error",
        message: "Failed to copy to clipboard",
      });
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ["name", "email", "phone", "address", "dateOfBirth", "aadhaarNumber"],
      [
        "Parv Aggarwal",
        "parvaggarwal130@gmail.com",
        "+91 90121028912",
        "Chandigarh",
        "2005-07-15",
        "123456789012",
      ],
      [
        "Jane Smith",
        "jane.smith@gmail.com",
        "+91 6234786328",
        '"Jalandhar, Punjab"',
        "1985-03-22",
        "987654321098",
      ],
      [
        "Bob Johnson",
        "bob.johnson@email.com",
        "+91 2376187823",
        '"Jaipur, Rajasthan"',
        "1992-07-08",
        "456789123456",
      ],
    ];

    const csvContent = sampleData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "voter_sample.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-black">
          Voter Management
        </h1>
        <button
          onClick={downloadSampleCSV}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm md:text-base w-full sm:w-auto"
        >
          Download Sample CSV
        </button>
      </div>

      {/* Status Messages */}
      {uploadStatus && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            uploadStatus.type === "success"
              ? "bg-green-100 text-green-800"
              : uploadStatus.type === "error"
              ? "bg-red-100 text-red-800"
              : uploadStatus.type === "warning"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {uploadStatus.message}
        </div>
      )}

      {/* CSV Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Bulk Voter Registration</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-4">
              <label htmlFor="csvFile" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Upload CSV file with voter data
                </span>
                <span className="mt-1 block text-sm text-gray-500">
                  Required columns: name, email, phone, address, dateOfBirth,
                  aadhaarNumber
                </span>
              </label>
              <input
                ref={fileInputRef}
                id="csvFile"
                name="csvFile"
                type="file"
                accept=".csv"
                className="sr-only"
                onChange={handleFileUpload}
              />
            </div>
            <p className="mt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Click to upload
              </button>
              <span className="text-gray-500"> or drag and drop</span>
            </p>
          </div>
        </div>
      </div>

      {/* CSV Preview */}
      {showPreview && csvData.length > 0 && (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h2 className="text-lg font-semibold">
              Preview ({csvData.length} voters)
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowPreview(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkRegister}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm"
              >
                {loading ? "Registering..." : "Register All Voters"}
              </button>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4 max-h-96 overflow-y-auto">
            {csvData.slice(0, 10).map((voter, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  #{voter.index}
                </div>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {voter.name}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {voter.email}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {voter.phone}
                  </div>
                  <div>
                    <span className="font-medium">Address:</span>{" "}
                    {voter.address}
                  </div>
                  <div>
                    <span className="font-medium">DOB:</span>{" "}
                    {voter.dateOfBirth}
                  </div>
                  <div>
                    <span className="font-medium">Aadhaar:</span>{" "}
                    {voter.aadhaarNumber}
                  </div>
                </div>
              </div>
            ))}
            {csvData.length > 10 && (
              <p className="text-center text-gray-500 py-4">
                ... and {csvData.length - 10} more voters
              </p>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    #
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Phone
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Address
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date of Birth
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Aadhaar Number
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {csvData.slice(0, 10).map((voter, index) => (
                  <tr key={index}>
                    <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                      {voter.index}
                    </td>
                    <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                      <div className="truncate max-w-32">{voter.name}</div>
                    </td>
                    <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                      <div className="truncate max-w-40">{voter.email}</div>
                    </td>
                    <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                      {voter.phone}
                    </td>
                    <td className="px-3 lg:px-6 py-4 text-sm text-gray-500">
                      <div className="truncate max-w-32">{voter.address}</div>
                    </td>
                    <td className="px-3 lg:px-6 py-4 text-sm text-gray-500">
                      {voter.dateOfBirth}
                    </td>
                    <td className="px-3 lg:px-6 py-4 text-sm text-gray-500">
                      {voter.aadhaarNumber}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {csvData.length > 10 && (
              <p className="text-center text-gray-500 py-4">
                ... and {csvData.length - 10} more voters
              </p>
            )}
          </div>
        </div>
      )}

      {/* Registration Results */}
      {registrationResults && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Registration Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {registrationResults.success.length}
              </div>
              <div className="text-sm text-green-800">
                Successfully Registered
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {registrationResults.errors.length}
              </div>
              <div className="text-sm text-red-800">Failed</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {registrationResults.total}
              </div>
              <div className="text-sm text-blue-800">Total Processed</div>
            </div>
          </div>

          {registrationResults.success.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium text-green-800 mb-2">
                Successfully Registered Voters:
              </h3>
              <div className="bg-green-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                <div className="grid grid-cols-1 gap-3">
                  {registrationResults.success.map((voter, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {voter.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            Real Email:{" "}
                            <span className="break-all">{voter.realEmail}</span>
                          </div>
                        </div>
                        <div className="lg:text-right space-y-2">
                          <div className="text-sm flex flex-col sm:flex-row sm:items-center gap-1">
                            <span className="font-medium whitespace-nowrap">
                              Login Email:
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-blue-600 break-all text-xs sm:text-sm">
                                {voter.email}
                              </span>
                              <button
                                onClick={() =>
                                  copyToClipboard(voter.email, "Email")
                                }
                                className="text-gray-400 hover:text-blue-600 transition-colors p-1 flex-shrink-0"
                                title="Copy email"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="text-sm flex flex-col sm:flex-row sm:items-center gap-1">
                            <span className="font-medium whitespace-nowrap">
                              Voter ID:
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-green-600 break-all">
                                {voter.voterId}
                              </span>
                              <button
                                onClick={() =>
                                  copyToClipboard(voter.voterId, "Voter ID")
                                }
                                className="text-gray-400 hover:text-green-600 transition-colors p-1 flex-shrink-0"
                                title="Copy voter ID"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-2 text-xs text-green-700">
                📋 Share the Voter ID with voters for login. Passwords are
                auto-generated based on DOB and Aadhaar.
              </div>
            </div>
          )}

          {registrationResults.errors.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium text-red-800 mb-2">Errors:</h3>
              <div className="bg-red-50 p-3 rounded max-h-32 overflow-y-auto">
                {registrationResults.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-700">
                    {error.name} ({error.email}): {error.error}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setRegistrationResults(null)}
            className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            Close Results
          </button>
        </div>
      )}

      {/* Existing Voters List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">
            Registered Voters ({voters.length})
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage all registered voters in the system
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-gray-600">Loading voters...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden">
              {voters.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-gray-400 text-5xl mb-4">👥</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No voters registered
                  </h3>
                  <p className="text-gray-600">
                    Upload a CSV file to register voters in bulk
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {voters.map((voter) => (
                    <div
                      key={voter.id}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {voter.name || "N/A"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            ID: {voter.voterId || "N/A"}
                          </p>
                        </div>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            voter.isVerified
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {voter.isVerified ? "Verified" : "Pending"}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">
                            Login Email:
                          </span>
                          <div className="text-blue-600 break-all">
                            {voter.email}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Real Email:
                          </span>
                          <div className="text-gray-600 break-all">
                            {voter.realEmail || "N/A"}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Phone:
                          </span>{" "}
                          <span className="text-gray-600">
                            {voter.phone || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <button
                          onClick={() => handleDeleteVoter(voter.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium transition-colors"
                        >
                          🗑️ Delete Voter
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              {voters.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-gray-400 text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    No voters registered
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Upload a CSV file with voter information to register voters
                    in bulk and manage them here.
                  </p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Voter Details
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Info
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                        Phone
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {voters.map((voter) => (
                      <tr
                        key={voter.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 lg:px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {voter.name || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {voter.voterId || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm text-blue-600 truncate max-w-48">
                              {voter.email}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-48">
                              {voter.realEmail || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-sm text-gray-500 hidden xl:table-cell">
                          {voter.phone || "N/A"}
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              voter.isVerified
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {voter.isVerified ? "✓ Verified" : "⏳ Pending"}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-sm font-medium">
                          <button
                            onClick={() => handleDeleteVoter(voter.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete voter"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageVoters;
