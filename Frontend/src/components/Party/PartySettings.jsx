import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

const PartySettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    symbolUrl: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/party/profile");
      setProfileData({
        name: response.data.name || "",
        email: response.data.email || "",
        symbolUrl: response.data.symbolUrl || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile data");
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.put("/party/profile", {
        name: profileData.name,
        symbolUrl: profileData.symbolUrl,
      });

      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      await api.post("/party/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setMessage("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error changing password:", error);
      setError(error.response?.data?.error || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "profile", name: "Profile", icon: "👤" },
    { id: "password", name: "Password", icon: "🔒" },
    { id: "about", name: "About", icon: "ℹ️" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your party profile and account settings
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Success/Error Messages */}
          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <form onSubmit={updateProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Party Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-500"
                  disabled
                />
                <p className="text-sm text-gray-500 mt-1">
                  Email cannot be changed. Contact EC for email updates.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Party Symbol URL
                </label>
                <input
                  type="url"
                  value={profileData.symbolUrl}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      symbolUrl: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/party-symbol.png"
                />
                <p className="text-sm text-gray-500 mt-1">
                  URL to your party's official symbol image
                </p>
              </div>

              {profileData.symbolUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview
                  </label>
                  <img
                    src={profileData.symbolUrl}
                    alt="Party Symbol Preview"
                    className="w-20 h-20 object-contain border border-gray-300 rounded"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <form onSubmit={changePassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  minLength="6"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  minLength="6"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? "Changing..." : "Change Password"}
              </button>
            </form>
          )}

          {/* About Tab */}
          {activeTab === "about" && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  🏛️ Party Portal Features
                </h3>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-center space-x-2">
                    <span>📊</span>
                    <span>
                      Dashboard with election statistics and performance metrics
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span>📄</span>
                    <span>
                      AI-powered manifesto upload and processing system
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span>🗳️</span>
                    <span>
                      Real-time election tracking and results monitoring
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span>💬</span>
                    <span>Voter chatbot integration for policy Q&A</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span>⚙️</span>
                    <span>Profile management and security settings</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  📋 Account Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Party Name:</span>
                    <span className="font-medium">{user?.name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{user?.email || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Type:</span>
                    <span className="font-medium">Political Party</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verification Status:</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✅ Verified by EC
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3">
                  ⚠️ Important Notes
                </h3>
                <ul className="space-y-2 text-yellow-800">
                  <li>
                    • Your party account is managed and verified by the Election
                    Commission
                  </li>
                  <li>
                    • Manifesto uploads are processed by AI for voter query
                    system
                  </li>
                  <li>
                    • All election data and results are managed by EC officials
                  </li>
                  <li>
                    • For account issues, contact the Election Commission
                    directly
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartySettings;
