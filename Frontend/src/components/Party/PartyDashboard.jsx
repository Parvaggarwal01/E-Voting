import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

const PartyDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/party/dashboard");
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">{error}</div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const recentElections = dashboardData?.recentElections || [];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.name || "Party"}!
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your party's manifestos and track election performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <span className="text-blue-600 text-sm font-semibold">🗳️</span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">
                Total Elections
              </div>
              <div className="text-2xl font-semibold text-gray-900">
                {stats.totalElections || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <span className="text-green-600 text-sm font-semibold">⚡</span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">
                Active Elections
              </div>
              <div className="text-2xl font-semibold text-gray-900">
                {stats.activeElections || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                <span className="text-purple-600 text-sm font-semibold">
                  👥
                </span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">
                Total Votes
              </div>
              <div className="text-2xl font-semibold text-gray-900">
                {stats.totalVotes || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  stats.isVerified ? "bg-green-100" : "bg-yellow-100"
                }`}
              >
                <span
                  className={`text-sm font-semibold ${
                    stats.isVerified ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  {stats.isVerified ? "✅" : "⏳"}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Status</div>
              <div className="text-2xl font-semibold text-gray-900">
                {stats.isVerified ? "Verified" : "Pending"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Elections */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Elections
          </h2>
        </div>

        {recentElections.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {recentElections.map((election) => (
              <div key={election.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {election.name}
                    </h3>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        📅 {new Date(election.startDate).toLocaleDateString()} -{" "}
                        {new Date(election.endDate).toLocaleDateString()}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          election.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : election.status === "UPCOMING"
                            ? "bg-blue-100 text-blue-800"
                            : election.status === "RESULTS_PUBLISHED"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {election.status}
                      </span>
                    </div>
                  </div>

                  {election.result && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {election.result.voteCount} votes
                      </div>
                      <div className="text-sm text-gray-500">
                        {election.result.percentage}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center">
            <div className="text-gray-400 text-sm">
              No elections found. You'll see your election participation here.
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => (window.location.href = "/party/manifesto")}
            className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-blue-600">📄</span>
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Upload Manifesto</div>
              <div className="text-sm text-gray-500">
                Add or update your party manifesto
              </div>
            </div>
          </button>

          <button
            onClick={() => (window.location.href = "/party/elections")}
            className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-green-600">🗳️</span>
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">View Elections</div>
              <div className="text-sm text-gray-500">
                Track your election performance
              </div>
            </div>
          </button>

          <button
            onClick={() => (window.location.href = "/party/settings")}
            className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-purple-600">⚙️</span>
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Settings</div>
              <div className="text-sm text-gray-500">
                Manage your party profile
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartyDashboard;
