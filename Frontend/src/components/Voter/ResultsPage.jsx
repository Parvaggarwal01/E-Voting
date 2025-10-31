import React, { useState, useEffect } from "react";
import { api } from "../../services/api";

function ResultsPage() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const response = await api.get("/public/elections");
      const finishedElections = response.data.filter((election) => {
        const now = new Date();
        const end = new Date(election.endDate);
        return now > end;
      });
      setElections(finishedElections);
    } catch (error) {
      console.error("Error fetching elections:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async (electionId) => {
    setResultsLoading(true);
    setError("");
    setResults(null);
    try {
      const response = await api.getElectionResults(electionId);
      setResults(response.data);
    } catch (error) {
      console.error("Error fetching results:", error);

      // Check if it's a 403 error (results not published)
      if (error.response?.data?.error?.includes("not yet published")) {
        setError(
          "Results have not been published yet. Please check back later."
        );
      } else {
        setError("Failed to load results. Please try again later.");
      }
    } finally {
      setResultsLoading(false);
    }
  };

  const selectElection = (election) => {
    setSelectedElection(election);
    fetchResults(election.id);
  };

  const getResultsChartData = () => {
    if (!results || !results.results) return [];

    return results.results
      .sort((a, b) => b.voteCount - a.voteCount)
      .map((result) => ({
        ...result,
        percentage:
          results.totalVotes > 0
            ? ((result.voteCount / results.totalVotes) * 100).toFixed(1)
            : 0,
      }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Loading elections...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Election Results</h1>
        <p className="text-[#3F3F46] mt-1">
          View results from completed elections.
        </p>
      </div>

      {elections.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border shadow border-[#E2E8F0] text-center">
          <div className="text-black text-lg">
            No completed elections available
          </div>
          <p className="text-black text-sm mt-2">
            Results will appear here after elections end
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Elections List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-black">
              Completed Elections
            </h2>
            {elections.map((election) => {
              // Variable for clarity
              const isSelected = selectedElection?.id === election.id;

              return (
                <div
                  key={election.id}
                  onClick={() => selectElection(election)}
                  className={`p-4 rounded-lg border shadow cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-black border-[#E2E8F0]"
                      : "bg-white border-[#E2E8F0] hover:bg-[#f3f1f1]"
                  }`}
                >
                  <h3
                    className={`text-lg font-bold ${
                      // <-- Fixed: Removed the extra 't' here
                      isSelected ? "text-white" : "text-black"
                    }`}
                  >
                    {election.name}
                  </h3>

                  {/* This text will get lighter when selected */}
                  <p
                    className={`text-sm ${
                      isSelected ? "text-white" : "text-[#3F3F46]"
                    }`}
                  >
                    Ended: {new Date(election.endDate).toLocaleDateString()}
                  </p>

                  {/* This text will also get lighter when selected */}
                  <p
                    className={`text-xs mt-1 ${
                      isSelected ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    {election.parties.length} parties participated
                  </p>
                </div>
              );
            })}
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg border shadow border-[#E2E8F0]">
            {selectedElection ? (
              resultsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-black">Loading results...</div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-black text-xl font-bold">{error}</div>
                  <button
                    onClick={() => fetchResults(selectedElection.id)}
                    className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : results ? (
                <div className="space-y-6">
                  {/* Election Info */}
                  <div>
                    <h2 className="text-xl font-bold text-black">
                      {selectedElection.name}
                    </h2>
                    <div className="flex gap-4 text-sm text-[#3F3F46] mt-2">
                      <span>Total Votes: {results.totalVotes}</span>
                      <span>Valid Votes: {results.totalVotes}</span>
                      <span>Parties: {results.results.length}</span>
                    </div>
                  </div>

                  {/* Winner/Draw/No Votes Banner */}
                  {results.totalVotes === 0 ? (
                    <div className="bg-white p-4 rounded-lg border shadow border-[#E2E8F0]">
                      <div className="flex items-center gap-2">
                        <span className="text-black text-xl">
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
                        </span>
                        <div>
                          <h3 className="text-black font-bold">
                            No Votes Cast
                          </h3>
                          <p className="text-black text-sm">
                            No votes have been cast in this election yet
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : results.isDraw ? (
                    <div className="bg-white p-4 rounded-lg border shadow border-[#E2E8F0]">
                      <div className="flex items-center gap-2">
                        <span className="text-black text-xl">
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
                            class="lucide lucide-scale-icon lucide-scale"
                          >
                            <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
                            <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
                            <path d="M7 21h10" />
                            <path d="M12 3v18" />
                            <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
                          </svg>
                        </span>
                        <div>
                          <h3 className="text-black font-bold">It's a Draw!</h3>
                          <p className="text-black text-sm">
                            Multiple parties tied for first place
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : results.totalVotes > 0 &&
                    results.results.length > 0 &&
                    results.results[0].voteCount > 0 ? (
                    <div className="bg-green-900 p-4 rounded-lg border border-green-700">
                      <div className="flex items-center gap-3">
                        <img
                          src={results.results[0].party.symbolUrl}
                          alt={results.results[0].party.name}
                          className="w-12 h-12 rounded-full object-cover bg-white p-2"
                        />
                        <div>
                          <h3 className="text-white font-bold">
                            Winner: {results.results[0].party.name}
                          </h3>
                          <p className="text-white text-sm">
                            {results.results[0].voteCount} votes (
                            {(
                              (results.results[0].voteCount /
                                results.totalVotes) *
                              100
                            ).toFixed(1)}
                            %)
                          </p>
                        </div>
                        <div className="ml-auto text-white text-2xl">
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
                            class="lucide lucide-trophy-icon lucide-trophy"
                          >
                            <path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978" />
                            <path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978" />
                            <path d="M18 9h1.5a1 1 0 0 0 0-5H18" />
                            <path d="M4 22h16" />
                            <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" />
                            <path d="M6 9H4.5a1 1 0 0 1 0-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Results List */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-white">
                      Vote Distribution
                    </h3>
                    {getResultsChartData().map((result, index) => {
                      const isWinner =
                        !results.isDraw &&
                        index === 0 &&
                        result.voteCount > 0 &&
                        results.totalVotes > 0;
                      const isTied =
                        results.isDraw &&
                        result.voteCount === results.results[0].voteCount &&
                        result.voteCount > 0;

                      // 1. Added a helper variable to make the logic cleaner
                      const isTopSpot = isWinner || isTied;

                      return (
                        <div
                          key={result.party.id}
                          className={`p-4 rounded-lg border shadow ${
                            // 2. Used the helper variable here
                            isTopSpot
                              ? "bg-green-900 border-green-700"
                              : "bg-white border-[#E2E8F0]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                src={result.party.symbolUrl}
                                alt={result.party.name}
                                className="w-10 h-10 rounded-full object-cover bg-white p-2"
                              />
                              <div>
                                {/* 3. Made the party name text conditional */}
                                <h4
                                  className={`font-medium flex items-center gap-2 ${
                                    isTopSpot ? "text-white" : "text-black"
                                  }`}
                                >
                                  {result.party.name}
                                  {isWinner && (
                                    <span className="text-green-400">🏆</span>
                                  )}
                                  {isTied && (
                                    <span className="text-yellow-400">⚖️</span>
                                  )}
                                </h4>
                                {/* 4. Made the position text conditional */}
                                <p
                                  className={`text-sm ${
                                    isTopSpot
                                      ? "text-gray-400"
                                      : "text-gray-500"
                                  }`}
                                >
                                  Position #{index + 1}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {/* 5. Made the vote count text conditional */}
                              <div
                                className={`font-bold ${
                                  isTopSpot ? "text-white" : "text-black"
                                }`}
                              >
                                {result.voteCount}
                              </div>
                              {/* 6. Made the percentage text conditional */}
                              <div
                                className={`text-sm ${
                                  isTopSpot ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                {result.percentage}%
                              </div>
                            </div>
                          </div>

                          {/* Vote Bar */}
                          <div className="mt-3">
                            {/* 7. BONUS: Made the bar's background track conditional */}
                            <div
                              className={`rounded-full h-2 ${
                                isTopSpot ? "bg-gray-700" : "bg-gray-200"
                              }`}
                            >
                              <div
                                className={`h-2 rounded-full ${
                                  isTopSpot ? "bg-green-500" : "bg-blue-500"
                                }`}
                                style={{ width: `${result.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-black">
                        {results.totalVotes}
                      </div>
                      <div className="text-black text-sm">Total Votes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-black">
                        {results.results.length}
                      </div>
                      <div className="text-black text-sm">Parties</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400">
                    Click "Try Again" to reload results
                  </div>
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <div className="text-black">
                  Select an election to view results
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultsPage;
