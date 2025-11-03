import React, { useState, useEffect } from "react";
import { useBlockchain } from "../../context/BlockchainContext";
import { api } from "../../services/api";

function BlockchainManager() {
  const {
    isConnected,
    walletAddress,
    chainId,
    loading,
    error,
    connectWallet,
    clearError,
  } = useBlockchain();

  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [realBlockchainStats, setRealBlockchainStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [voters, setVoters] = useState([]);
  const [votes, setVotes] = useState([]);
  const [activeTab, setActiveTab] = useState("stats");

  useEffect(() => {
    if (isConnected) {
      setConnectionStatus("connected");
      fetchBlockchainData();
    } else {
      setConnectionStatus("disconnected");
    }
  }, [isConnected]);

  // Fetch real blockchain data from backend API
  const fetchBlockchainData = async () => {
    setStatsLoading(true);
    try {
      console.log("📊 Fetching real blockchain data...");

      // Fetch blockchain stats
      const statsResponse = await api.get("/blockchain/stats");
      setRealBlockchainStats(statsResponse.data);

      // Fetch voters
      const votersResponse = await api.get("/blockchain/voters?limit=20");
      setVoters(votersResponse.data.voters);

      // Fetch votes
      const votesResponse = await api.get("/blockchain/votes?limit=20");
      setVotes(votesResponse.data.votes);

      console.log("✅ Blockchain data fetched successfully");
    } catch (error) {
      console.error("❌ Failed to fetch blockchain data:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Refresh blockchain data
  const refreshData = () => {
    if (isConnected) {
      fetchBlockchainData();
    }
  };

  const handleConnect = async () => {
    // Clear any previous errors
    clearError();

    try {
      await connectWallet();
      // Success case is handled by the context
    } catch (error) {
      console.error("Connection failed:", error);
      // Error is handled by the context
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Blockchain Management</h1>
        <p className="text-[#3F3F46] mt-1">
          Manage blockchain connection for the Election Commission
        </p>
      </div>

      {/* Connection Status Card */}
      <div className="bg-white p-6 rounded-lg border shadow border-[#E2E8F0]">
        <h2 className="text-xl font-bold text-black mb-4">
          Wallet Connection Status
        </h2>

        {/* Status Indicator */}
        <div className="flex items-center space-x-3 mb-4">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-black font-medium">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>

        {/* Connection Details */}
        {isConnected ? (
          <div className="space-y-3">
            <div>
              <label className="text-sm text-[#3F3F46]">Wallet Address:</label>
              <p className="text-black font-mono text-sm break-all">
                {walletAddress}
              </p>
            </div>
            <div>
              <label className="text-sm text-[#3F3F46]">Network:</label>
              <p className="text-black">
                {chainId === "11155111"
                  ? "Sepolia Testnet"
                  : chainId === "1337"
                  ? "Ganache Local"
                  : "Unknown Network"}
                (Chain ID: {chainId})
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[#3F3F46]">
              Connect your MetaMask wallet to manage blockchain operations for
              the Election Commission.
            </p>

            <button
              onClick={handleConnect}
              disabled={loading}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Connecting..." : "Connect Wallet"}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex justify-between items-start">
              <p className="text-red-600 text-sm flex-1">{error}</p>
              <button
                onClick={clearError}
                className="ml-3 text-red-400 hover:text-red-600 text-sm"
              >
                ✕
              </button>
            </div>
            {error.includes("Chain ID") && (
              <p className="text-red-500 text-xs mt-2">
                💡 Switch to Sepolia Testnet in MetaMask and try connecting
                again.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Blockchain Data Tabs */}
      {isConnected && (
        <div className="bg-white p-6 rounded-lg border shadow border-[#E2E8F0]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-black">
              Live Blockchain Data
            </h2>
            <button
              onClick={refreshData}
              disabled={statsLoading}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {statsLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-6 border-b border-gray-200">
            {[
              { id: "stats", label: "Statistics" },
              { id: "voters", label: "Voters" },
              { id: "votes", label: "Votes" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 px-1 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-black border-b-2 border-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "stats" && realBlockchainStats && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm text-blue-600 mb-1">Total Voters</h3>
                  <p className="text-3xl font-bold text-blue-800">
                    {realBlockchainStats.totalVoters}
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="text-sm text-green-600 mb-1">Total Votes</h3>
                  <p className="text-3xl font-bold text-green-800">
                    {realBlockchainStats.totalVotes}
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="text-sm text-purple-600 mb-1">Elections</h3>
                  <p className="text-3xl font-bold text-purple-800">
                    {realBlockchainStats.elections.length}
                  </p>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="text-sm text-orange-600 mb-1">Block Number</h3>
                  <p className="text-3xl font-bold text-orange-800">
                    {realBlockchainStats.networkConfig.blockNumber}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-black rounded-lg">
                <h3 className="text-sm text-black mb-2">Contract Details</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Address:</strong>{" "}
                    <code className=" px-1 rounded">
                      {realBlockchainStats.contractAddress}
                    </code>
                  </p>
                  <p>
                    <strong>Network:</strong>{" "}
                    {realBlockchainStats.networkConfig.networkName}
                  </p>
                  <p>
                    <strong>Chain ID:</strong>{" "}
                    {realBlockchainStats.networkConfig.chainId}
                  </p>
                  <p>
                    <strong>Admin:</strong>{" "}
                    <code className=" px-1 rounded">
                      {realBlockchainStats.adminAddress}
                    </code>
                  </p>
                  <p>
                    <strong>Last Updated:</strong>{" "}
                    {new Date(realBlockchainStats.lastUpdated).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "voters" && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Showing {voters.length} registered voters on blockchain
              </p>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {voters.map((voter, index) => (
                  <div
                    key={voter.address}
                    className="p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-black">
                          {voter.decodedName}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {voter.decodedEmail}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Registered:{" "}
                          {new Date(voter.registrationTime).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs ${
                            voter.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {voter.isActive ? "Active" : "Inactive"}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          #{voter.index}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "votes" && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Showing {votes.length} votes cast on blockchain
              </p>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {votes.map((vote) => (
                  <div
                    key={vote.voteHash}
                    className="p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-black">
                          Vote #{vote.index}
                        </h4>
                        <p className="text-sm text-gray-700">
                          Party: <strong>{vote.partyId}</strong>
                        </p>
                        <p className="text-xs text-gray-500">
                          Election ID: {vote.electionId}
                        </p>
                        <p className="text-xs text-gray-500">
                          Cast: {new Date(vote.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 font-mono break-all w-32">
                          {vote.voteHash.substring(0, 10)}...
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {statsLoading && (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading blockchain data...</div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-2">
          Important Information
        </h3>
        <ul className="text-blue-700 text-sm space-y-2">
          <li>• Only Election Commission officials should connect wallets</li>
          <li>
            • Voters do NOT need to connect wallets - the system handles all
            blockchain operations for them
          </li>
          <li>
            • All votes are submitted to the blockchain using the EC wallet to
            pay for gas fees
          </li>
          <li>
            • This ensures voter privacy and removes technical barriers for
            voters
          </li>
        </ul>
      </div>
    </div>
  );
}

export default BlockchainManager;
