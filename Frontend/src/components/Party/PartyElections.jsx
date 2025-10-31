import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

const PartyElections = () => {
  const { user } = useAuth();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const response = await api.get("/party/elections");
      setElections(response.data);
    } catch (error) {
      console.error("Error fetching elections:", error);
      setError("Failed to load elections");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "UPCOMING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "RESULTS_PUBLISHED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "ACTIVE":
        return "🟢";
      case "UPCOMING":
        return "🔵";
      case "RESULTS_PUBLISHED":
        return "🏆";
      case "COMPLETED":
        return "✅";
      default:
        return "⏳";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading elections...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Elections</h1>
        <p className="text-gray-600 mt-1">
          Track your party's participation and performance in elections
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Elections List */}
      {elections.length > 0 ? (
        <div className="space-y-4">
          {elections.map((election) => (
            <div
              key={election.id}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {election.name}
                  </h3>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <span>📅</span>
                      <span>
                        {new Date(election.startDate).toLocaleDateString()} -{" "}
                        {new Date(election.endDate).toLocaleDateString()}
                      </span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span>🏛️</span>
                      <span>{election.parties?.length || 0} parties</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      getElectionStatus(election)
                    )}`}
                  >
                    <span className="mr-1">
                      {getStatusIcon(getElectionStatus(election))}
                    </span>
                    {getElectionStatus(election).replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Election Results */}
              {election.results && election.results.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Your Performance
                  </h4>

                  {election.results.map((result, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="text-lg font-semibold text-gray-900">
                              {result.voteCount} votes
                            </div>
                            <div className="text-lg font-semibold text-blue-600">
                              {result.percentage}%
                            </div>
                          </div>

                          {result.isPublished ? (
                            <div className="mt-2 flex items-center space-x-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <span className="mr-1">📊</span>
                                Results Published
                              </span>
                            </div>
                          ) : (
                            <div className="mt-2 flex items-center space-x-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <span className="mr-1">⏳</span>
                                Results Pending
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Performance Indicator */}
                        <div className="text-right">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mb-1">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${Math.min(result.percentage, 100)}%`,
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500">
                            Vote Share
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No Results Yet */}
              {(!election.results || election.results.length === 0) &&
                getElectionStatus(election) === "UPCOMING" && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-blue-600 text-2xl mb-2">🗳️</div>
                      <div className="text-blue-900 font-medium">
                        Election Upcoming
                      </div>
                      <div className="text-blue-700 text-sm mt-1">
                        Results will be available after voting concludes
                      </div>
                    </div>
                  </div>
                )}

              {/* Active Election Notice */}
              {getElectionStatus(election) === "ACTIVE" && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-green-600 text-2xl mb-2">🟢</div>
                    <div className="text-green-900 font-medium">
                      Voting in Progress
                    </div>
                    <div className="text-green-700 text-sm mt-1">
                      Citizens are currently casting their votes
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">🗳️</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No Elections Found
          </h3>
          <p className="text-gray-600">
            Your party hasn't been registered for any elections yet. Contact the
            Election Commission to participate in upcoming elections.
          </p>
        </div>
      )}
    </div>
  );
};

// Helper function to determine election status
function getElectionStatus(election) {
  const now = new Date();
  const start = new Date(election.startDate);
  const end = new Date(election.endDate);

  if (now < start) {
    return "UPCOMING";
  } else if (now >= start && now <= end) {
    return "ACTIVE";
  } else if (election.status?.resultsPublished) {
    return "RESULTS_PUBLISHED";
  } else {
    return "COMPLETED";
  }
}

export default PartyElections;
