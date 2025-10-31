import React, { useState } from "react";
import { api } from "../../services/api";

function CreateParty() {
  const [formData, setFormData] = useState({
    name: "",
    symbolUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await api.post("/admin/parties", formData);
      setMessage("Party created successfully!");
      setFormData({ name: "", symbolUrl: "" });
    } catch (error) {
      setMessage(
        "Error creating party: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Create New Party</h1>
        <p className="text-[#3F3F46] mt-1">
          Register a new political party in the system.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white p-6 rounded-lg border shadow border-[#E2E8F0]">
          <h2 className="text-xl font-bold text-black mb-6">
            Party Registration Form
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Party Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white border shadow border-[#E2E8F0] rounded-lg text-black placeholder-[#3F3F46] focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter party name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Party Symbol URL *
              </label>
              <input
                type="url"
                name="symbolUrl"
                value={formData.symbolUrl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white border shadow border-[#E2E8F0] rounded-lg text-black placeholder-[#3F3F46] focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="https://example.com/symbol.png"
                required
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg ${
                  message.includes("Error")
                    ? "bg-red-900 text-red-200 border border-red-700"
                    : "bg-green-900 text-green-200 border border-green-700"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Party"}
            </button>
          </form>
        </div>

        {/* Preview */}
        <div className="bg-white p-6 rounded-lg border shadow border-[#E2E8F0]">
          <h2 className="text-xl font-bold text-black mb-6">Preview</h2>

          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-[#E2E8F0]">
              <div className="flex items-center gap-4">
                {formData.symbolUrl && (
                  <img
                    src={formData.symbolUrl}
                    alt="Party Symbol"
                    className="w-12 h-12 rounded-full object-cover bg-white p-1"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
                <div>
                  <h3 className="text-lg font-medium text-black">
                    {formData.name || "Party Name"}
                  </h3>
                  <p className="text-[#3F3F46] text-sm">Political Party</p>
                </div>
              </div>
            </div>

            <div className="text-sm text-[#3F3F46]">
              <p>• Party name must be unique</p>
              <p>• Symbol URL should point to a valid image</p>
              <p>• Recommended image size: 100x100 pixels</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateParty;
