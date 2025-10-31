import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (!loading) setLoading(true);
      const response = await api.getDashboardStats();
      setDashboardData(response.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      name: "Create Election",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-circuit-board-icon lucide-circuit-board"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M11 9h4a2 2 0 0 0 2-2V3" />
          <circle cx="9" cy="9" r="2" />
          <path d="M7 21v-4a2 2 0 0 1 2-2h4" />
          <circle cx="15" cy="15" r="2" />
        </svg>
      ),
      path: "/ec/create-election",
    },
    {
      name: "Create Party",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-badge-plus-icon lucide-badge-plus"
        >
          <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
          <line x1="12" x2="12" y1="8" y2="16" />
          <line x1="8" x2="16" y1="12" y2="12" />
        </svg>
      ),
      path: "/ec/create-party",
    },
    {
      name: "Manage Elections",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-square-chart-gantt-icon lucide-square-chart-gantt"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M9 8h7" />
          <path d="M8 12h6" />
          <path d="M11 16h5" />
        </svg>
      ),
      path: "/ec/manage-elections",
    },
    {
      name: "Manage Parties",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-handshake-icon lucide-handshake"
        >
          <path d="m11 17 2 2a1 1 0 1 0 3-3" />
          <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
          <path d="m21 3 1 11h-2" />
          <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
          <path d="M3 4h8" />
        </svg>
      ),
      path: "/ec/manage-parties",
    },
    {
      name: "Manage Voters",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-users-icon lucide-users"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <path d="M16 3.128a4 4 0 0 1 0 7.744" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      ),
      path: "/ec/manage-voters",
    },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case "election":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-circuit-board-icon lucide-circuit-board"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M11 9h4a2 2 0 0 0 2-2V3" />
            <circle cx="9" cy="9" r="2" />
            <path d="M7 21v-4a2 2 0 0 1 2-2h4" />
            <circle cx="15" cy="15" r="2" />
          </svg>
        );
      case "party":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-handshake-icon lucide-handshake"
          >
            <path d="m11 17 2 2a1 1 0 1 0 3-3" />
            <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
            <path d="m21 3 1 11h-2" />
            <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
            <path d="M3 4h8" />
          </svg>
        );
      case "vote":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-circle-check-icon lucide-circle-check"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        );
      case "result":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-chart-column-big-icon lucide-chart-column-big"
          >
            <path d="M3 3v16a2 2 0 0 0 2 2h16" />
            <rect x="15" y="5" width="4" height="12" rx="1" />
            <rect x="7" y="8" width="4" height="9" rx="1" />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-pen-icon lucide-pen"
          >
            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
          </svg>
        );
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      ACTIVE: "bg-green-900 text-green-200 border-green-700",
      UPCOMING: "bg-blue-900 text-blue-200 border-blue-700",
      COMPLETED: "bg-gray-900 text-gray-200 border-gray-700",
      RESULTS_PUBLISHED: "bg-purple-900 text-purple-200 border-purple-700",
    };

    return colors[status] || colors["COMPLETED"];
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-red-400 text-lg mb-4">{error}</div>
        <button
          onClick={fetchDashboardData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-black">Dashboard</h1>
          <p className="text-[#64748B] mt-1">
            Welcome back! Here's what's happening with your elections.
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
            {loading && <span className="ml-2 text-blue-400">Updating...</span>}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchDashboardData}
            className="bg-black text-white px-4 py-2 text-sm rounded-lg border shadow hover:bg-black transition-colors flex items-center gap-2"
            disabled={loading}
          >
            Refresh
          </button>
          <button
            onClick={() => navigate("/ec/create-election")}
            className="bg-white border border-[#E2E8F0] shadow hover:bg-black text-black hover:text-white px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2"
          >
            New Election
          </button>
          <button
            onClick={() => navigate("/ec/manage-elections")}
            className="bg-black text-white px-4 py-2 text-sm rounded-lg hover:bg-black transition-colors flex items-center gap-2"
          >
            Manage Elections
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-lg border shadow border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-black text-sm">Total Elections</p>
              <p className="text-xl font-bold text-black">
                {stats.totalElections || 0}
              </p>
              <p className="text-blue-400 text-xs mt-1">
                {stats.activeElections || 0} active •{" "}
                {stats.upcomingElections || 0} upcoming
              </p>
            </div>
            <div className="text-blue-400 text-xl mb-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-circuit-board-icon lucide-circuit-board"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M11 9h4a2 2 0 0 0 2-2V3" />
                <circle cx="9" cy="9" r="2" />
                <path d="M7 21v-4a2 2 0 0 1 2-2h4" />
                <circle cx="15" cy="15" r="2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-black text-sm">Active Elections</p>
              <p className="text-xl font-bold text-black">
                {stats.activeElections || 0}
              </p>
              <p className="text-green-400 text-xs mt-1">
                Currently accepting votes
              </p>
            </div>
            <div className="text-green-400 text-xl mb-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-circle-check-icon lucide-circle-check"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-black text-sm">Total Parties</p>
              <p className="text-xl font-bold text-black">
                {stats.totalParties || 0}
              </p>
              <p className="text-purple-400 text-xs mt-1">
                Registered political parties
              </p>
            </div>
            <div className="text-purple-400 text-xl mb-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-handshake-icon lucide-handshake"
              >
                <path d="m11 17 2 2a1 1 0 1 0 3-3" />
                <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
                <path d="m21 3 1 11h-2" />
                <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
                <path d="M3 4h8" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-black text-sm">Total Votes Cast</p>
              <p className="text-xl font-bold text-black">
                {stats.totalVotes || 0}
              </p>
              <p className="text-yellow-400 text-xs mt-1">
                From {stats.totalReceipts || 0} receipts
              </p>
            </div>
            <div className="text-yellow-400 text-xl mb-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-chart-column-big-icon lucide-chart-column-big"
              >
                <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                <rect x="15" y="5" width="4" height="12" rx="1" />
                <rect x="7" y="8" width="4" height="9" rx="1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg border shadow border-[#E2E8F0] text-center">
          <div className="text-xl font-bold text-black">
            {stats.totalVoters || 0}
          </div>
          <div className="text-[#3F3F46] text-sm">Registered Voters</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow border-[#E2E8F0] text-center">
          <div className="text-xl font-bold text-black">
            {stats.completedElections || 0}
          </div>
          <div className="text-[#3F3F46] text-sm">Completed Elections</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow border-[#E2E8F0] text-center">
          <div className="text-xl font-bold text-black">
            {stats.totalReceipts || 0}
          </div>
          <div className="text-[#3F3F46] text-sm">Vote Receipts Issued</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg border shadow border-[#E2E8F0]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-black">Recent Activity</h3>
            <button
              onClick={fetchDashboardData}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Refresh
            </button>
          </div>
          <p className="text-[#3F3F46] text-sm mb-4">
            Latest updates from your election system.
          </p>

          <div className="space-y-4 max-h-80 overflow-y-auto">
            {dashboardData?.recentActivity?.length > 0 ? (
              dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="text-lg mt-1 text-black">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-black text-sm">{activity.message}</p>
                    <p className="text-[#3F3F46] text-xs mt-1">
                      {activity.timeAgo}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-[#3F3F46] text-center py-4">
                No recent activity
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg border shadow border-[#E2E8F0]">
          <h3 className="text-xl font-bold text-black mb-4">Quick Actions</h3>
          <p className="text-[#3F3F46] text-sm mb-4">
            Frequently used actions for election management.
          </p>

          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                // 1. Add 'group' to the parent button
                className="group w-full flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-black transition-colors text-left"
              >
                {/* 2. Use 'group-hover' on the child elements */}
                <span className="text-xl text-black group-hover:text-white transition-colors">
                  {action.icon}
                </span>
                <span className="text-black group-hover:text-white transition-colors">
                  {action.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Elections Overview */}
      {dashboardData?.elections?.length > 0 && (
        <div className="bg-white p-6 rounded-lg border shadow border-[#E2E8F0]">
          <h3 className="text-xl font-bold text-black mb-4">
            Elections Overview
          </h3>
          <div className="space-y-3">
            {dashboardData.elections.slice(0, 5).map((election) => (
              <div
                key={election.id}
                className="flex items-center justify-between p-3 bg-white border border-ROCKET-d88f36fd-2b29 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-black font-medium">{election.name}</h4>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium border ${getStatusBadge(
                        election.status
                      )}`}
                    >
                      {election.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-[#3F3F46] text-sm mt-1">
                    {election.partiesCount} parties • {election.votersCount}{" "}
                    voted • {election.totalVotes} total votes
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-black font-bold">
                    {election.totalVotes}
                  </div>
                  <div className="text-[#3F3F46] text-sm">votes</div>
                </div>
              </div>
            ))}
          </div>

          {dashboardData.elections.length > 5 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate("/ec/manage-elections")}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                View all {dashboardData.elections.length} elections →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
