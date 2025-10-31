import React, { useState } from "react";
import { api } from "../../services/api";

const ChangePassword = ({ onClose, userEmail }) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError("New password must be different from current password");
      setLoading(false);
      return;
    }

    try {
      const response = await api.put("/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setSuccess("Password changed successfully!");

      // Clear form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-100 p-6 rounded-lg border shadow border-[#E2E8F0] w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-black">Change Password</h2>
          <button
            onClick={onClose}
            className="text-black hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-3 bg-black border shadow border-[#E2E8F0] rounded-lg text-white text-sm">
          <p>Account: {userEmail}</p>
          <p>Changing password for security</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-600/20 border border-red-600/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-600/20 border border-green-600/50 rounded-lg text-green-400 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-[#3F3F46] mb-2"
            >
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter current password"
              required
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-[#3F3F46] mb-2"
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter new password (min 6 characters)"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-[#3F3F46] mb-2"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Confirm new password"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-black hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
