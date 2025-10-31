import React, { useState, useEffect } from "react";
import { api } from "../../services/api";

function Results() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [electionStats, setElectionStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const response = await api.get("/public/elections");
      setElections(response.data);
    } catch (error) {
      console.error("Error fetching elections:", error);
    }
  };

  const fetchElectionStats = async (electionId) => {
    if (!electionId) return;

    setLoading(true);
    try {
      const response = await api.get(`/admin/elections/${electionId}/stats`);
      console.log("Election stats response:", response.data);
      setElectionStats(response.data);
    } catch (error) {
      console.error("Error fetching election stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleElectionChange = (electionId) => {
    setSelectedElection(electionId);
    if (electionId) {
      fetchElectionStats(electionId);
    } else {
      setElectionStats(null);
    }
  };

  const calculateResults = async () => {
    if (!selectedElection) return;

    setCalculating(true);
    try {
      await api.post(`/admin/elections/${selectedElection}/calculate-results`);
      // Refresh stats after calculation
      fetchElectionStats(selectedElection);
    } catch (error) {
      console.error("Error calculating results:", error);
    } finally {
      setCalculating(false);
    }
  };

  const publishResults = async (publish) => {
    if (!selectedElection) return;

    try {
      console.log(
        `${publish ? "Publishing" : "Unpublishing"} results for election:`,
        selectedElection
      );
      const response = await api.post(
        `/admin/elections/${selectedElection}/publish-results`,
        {
          publish,
        }
      );
      console.log("API response:", response.data);
      // Refresh stats after publishing
      fetchElectionStats(selectedElection);
    } catch (error) {
      console.error("Error publishing results:", error);
    }
  };

  const selectedElectionData = elections.find((e) => e.id === selectedElection);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Results Management</h1>
        <p className="text-[#3F3F46] mt-1">
          Calculate, preview, and publish election results.
        </p>
      </div>

      {/* Election Selection */}
      <div className="bg-white p-6 rounded-lg border shadow border-[#E2E8F0]">
        <h2 className="text-xl font-bold text-black mb-4">Select Election</h2>
        <select
          value={selectedElection}
          onChange={(e) => handleElectionChange(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">Choose an election...</option>
          {elections.map((election) => (
            <option key={election.id} value={election.id}>
              {election.name} (
              {new Date(election.startDate).toLocaleDateString()} -{" "}
              {new Date(election.endDate).toLocaleDateString()})
            </option>
          ))}
        </select>
      </div>

      {selectedElectionData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Election Info & Controls */}
          <div className="bg-white p-6 rounded-lg border shadow border-[#E2E8F0]">
            <h2 className="text-xl font-bold text-black mb-4">
              {selectedElectionData.name}
            </h2>

            {electionStats && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#3F3F46]">Status</p>
                    <p
                      className={`font-medium ${
                        electionStats.status?.resultsPublished
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {" "}
                      {electionStats.status?.resultsPublished
                        ? "Results Published"
                        : "Completed"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#3F3F46]">Total Registered Voters</p>
                    <p className="text-black font-medium">
                      {electionStats?.statistics?.totalRegisteredVoters || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#3F3F46]">Voters Who Voted</p>
                    <p className="text-black font-medium">
                      {electionStats?.statistics?.votersWhoVoted || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#3F3F46]">Turnout</p>
                    <p className="text-black font-medium">
                      {electionStats?.statistics?.turnoutPercentage || 0}%
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <button
                    onClick={calculateResults}
                    disabled={calculating}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {calculating ? "Calculating..." : "Recalculate Results"}
                  </button>

                  <button
                    onClick={() =>
                      publishResults(!electionStats.status?.resultsPublished)
                    }
                    className={`w-full py-2 px-4 rounded-lg transition-colors ${
                      electionStats.status?.resultsPublished
                        ? "bg-yellow-600 hover:bg-yellow-700"
                        : "bg-green-600 hover:bg-green-700"
                    } text-white`}
                  >
                    {electionStats.status?.resultsPublished
                      ? "Unpublish Results"
                      : "Publish Results"}
                  </button>
                </div>

                {electionStats.status?.resultsPublished && (
                  <p className="text-center text-[#3F3F46] text-sm mt-4">
                    Results are published and visible to public
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Results Preview */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="bg-white p-6 rounded-lg border shadow border-[#E2E8F0] flex justify-center items-center h-64">
                <div className="text-black">Loading results...</div>
              </div>
            ) : electionStats?.results?.length > 0 ? (
              <div className="bg-white p-6 rounded-lg border shadow border-[#E2E8F0]">
                <h3 className="text-xl font-bold text-black mb-6">
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
                  Results Preview
                </h3>

                {/* Check for draw or no votes */}
                {(() => {
                  const maxVotes = Math.max(
                    ...electionStats.results.map((r) => r.voteCount)
                  );
                  const winnersCount = electionStats.results.filter(
                    (r) => r.voteCount === maxVotes && r.voteCount > 0
                  ).length;
                  const isDraw = winnersCount > 1 && maxVotes > 0;
                  const noVotes = maxVotes === 0;

                  if (noVotes) {
                    return (
                      <div className="mb-6 p-4 bg-white rounded-lg border border-[#E2E8F0] text-center">
                        <div className="text-xl font-bold text-black">
                          No Votes Cast
                        </div>
                        <div className="text-[#3F3F46]">
                          No votes have been cast in this election yet
                        </div>
                      </div>
                    );
                  }

                  if (isDraw) {
                    return (
                      <div className="mb-6 p-4 bg-blue-900 rounded-lg border border-blue-700 text-center">
                        <div className="text-xl font-bold text-white">
                          🤝 It's a Draw!
                        </div>
                        <div className="text-blue-200">
                          {winnersCount} parties tied with {maxVotes} votes each
                        </div>
                      </div>
                    );
                  }

                  return null;
                })()}

                <div className="space-y-3">
                  {electionStats.results.map((result, index) => {
                    const maxVotes = Math.max(
                      ...electionStats.results.map((r) => r.voteCount)
                    );
                    const winnersCount = electionStats.results.filter(
                      (r) => r.voteCount === maxVotes && r.voteCount > 0
                    ).length;
                    const isDraw = winnersCount > 1 && maxVotes > 0;
                    const noVotes = maxVotes === 0;
                    const isWinner =
                      !isDraw &&
                      !noVotes &&
                      result.voteCount === maxVotes &&
                      result.voteCount > 0;
                    const isDrawParticipant =
                      isDraw && result.voteCount === maxVotes;

                    return (
                      <div
                        key={result.party.id}
                        // The base class for animations
                        className={`flex justify-between items-center p-4 rounded-lg border transition-colors duration-300 ${
                          isWinner
                            ? "bg-green-600 border-yellow-500 shadow-lg" // Winner state
                            : isDrawParticipant
                            ? "bg-blue-900 border-blue-600" // Draw state
                            : "bg-white border-[#E2E8F0]" // Default state
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Winner/Draw Icon 🏆 */}
                          {(isWinner || isDrawParticipant) && ( // Simplified conditional rendering for the icon
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              // Corrected SVG attributes to camelCase for JSX
                              stroke={isWinner ? "#FFD700" : "#FFFFFF"} // Gold for winner, white for draw
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                              <path d="M4 22h16" />
                              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21A5 5 0 0 1 7 22" />
                              <path d="M14 14.66V17c0 .55.47.98.97 1.21A5 5 0 0 0 17 22" />
                              <path d="M18 5a6 6 0 0 0-12 0v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2Z" />
                            </svg>
                          )}

                          <img
                            src={result.party.symbolUrl}
                            alt={result.party.name}
                            className="w-10 h-10 rounded-full object-cover bg-white p-1"
                          />
                          {/* 1. Conditional text color for Party Name */}
                          <span
                            className={`font-medium ${
                              isWinner || isDrawParticipant
                                ? "text-white"
                                : "text-black"
                            }`}
                          >
                            {result.party.name}
                          </span>
                        </div>

                        <div className="text-right">
                          {/* 2. Conditional text color for Vote Count */}
                          <div
                            className={`font-bold ${
                              isWinner || isDrawParticipant
                                ? "text-white"
                                : "text-black"
                            }`}
                          >
                            {result.voteCount} votes
                          </div>
                          {/* 3. Conditional text color for Percentage */}
                          <div
                            className={`text-sm ${
                              isWinner
                                ? "text-yellow-300" // A lighter color for secondary text on the winner card
                                : isDrawParticipant
                                ? "text-blue-300"
                                : "text-gray-500"
                            }`}
                          >
                            {result.percentage}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg border shadow border-[#E2E8F0] text-center">
                <p className="text-gray-400">
                  No results available. Calculate results to see data.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Results;
