import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { blindSignature } from "../../utils/cryptoBlinding";
import { useBlockchain } from "../../context/BlockchainContext";
import BlockchainStatus from "../Blockchain/BlockchainStatus";

function VotingPage() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [selectedParty, setSelectedParty] = useState("");
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [blockchainTxHash, setBlockchainTxHash] = useState(null);
  const navigate = useNavigate();

  const {
    isConnected,
    walletAddress,
    castVoteOnBlockchain,
    loading: blockchainLoading,
  } = useBlockchain();

  useEffect(() => {
    fetchElections();
    // Initialize crypto system
    initializeCrypto();
  }, []);

  const initializeCrypto = async () => {
    const initialized = await blindSignature.initialize(api);
    if (!initialized) {
      console.error("Failed to initialize cryptographic system");
    }
  };

  const fetchElections = async () => {
    try {
      const response = await api.get("/public/elections");
      const activeElections = response.data.filter((election) => {
        const now = new Date();
        const start = new Date(election.startDate);
        const end = new Date(election.endDate);
        return now >= start && now <= end;
      });
      setElections(activeElections);
    } catch (error) {
      console.error("Error fetching elections:", error);
    } finally {
      setLoading(false);
    }
  };

  const castVote = async () => {
    if (!selectedElection || !selectedParty) return;

    // Check blockchain connection
    if (!isConnected) {
      alert("Please connect your wallet to cast vote on blockchain!");
      return;
    }

    setVoting(true);
    setBlockchainTxHash(null);

    try {
      console.log("🗳️ Starting BLOCKCHAIN-ENABLED BLIND vote process...");
      console.log("Selected Election:", selectedElection.id);
      console.log("Selected Party (will be hidden from EC):", selectedParty);
      console.log("Wallet Address:", walletAddress);

      // Step 1: Create vote message with randomness
      const voteMessage = JSON.stringify({
        partyId: selectedParty,
        electionId: selectedElection.id,
        timestamp: Date.now(),
        nonce: Math.random().toString(36).substring(2, 15),
        walletAddress: walletAddress, // Include wallet for blockchain tracking
      });

      // Step 2: BLIND the vote message using RSA blinding
      console.log("🔐 Blinding vote message (hiding from EC)...");
      const blindedMessage = blindSignature.blindMessage(voteMessage);

      console.log("📝 Requesting blind signature from EC...");
      // Step 3: Request blind signature (EC cannot see vote content)
      const signatureResponse = await api.post("/vote/request-signature", {
        blindedMessage,
        electionId: selectedElection.id,
      });
      console.log("✅ Blind signature received from EC");

      // Step 4: UNBLIND the signature
      console.log("🔓 Unblinding signature...");
      const unblindedSignature = blindSignature.unblindSignature(
        signatureResponse.data.signedBlindedMessage
      );

      console.log("📤 Submitting anonymous vote to backend...");
      // Step 5: Submit the vote with unblinded signature
      const voteResponse = await api.post("/vote/submit", {
        voteMessage: voteMessage,
        signature: unblindedSignature,
        electionId: selectedElection.id,
      });
      console.log("✅ Anonymous vote cast successfully in backend!");

      // Step 6: Store vote immutably on blockchain 🔗
      console.log("🔗 Storing vote immutably on blockchain...");
      const blockchainVoteData = {
        electionId: selectedElection.id,
        voterAddress: walletAddress,
        voteHash: voteResponse.data.receipt.receiptCode, // Use receipt as vote hash
        partyId: selectedParty, // This will be encrypted in smart contract
        timestamp: Date.now(),
        signature: unblindedSignature.slice(0, 32), // First 32 chars for blockchain storage
      };

      const blockchainResult = await castVoteOnBlockchain(blockchainVoteData);

      if (blockchainResult.success) {
        console.log("✅ Vote stored immutably on blockchain!");
        console.log("🔗 Transaction Hash:", blockchainResult.transactionHash);
        setBlockchainTxHash(blockchainResult.transactionHash);
      } else {
        console.error(
          "⚠️ Blockchain storage failed, but vote was cast in backend"
        );
      }

      // Clear sensitive cryptographic data
      blindSignature.clear();

      // Check if receipt exists in response
      if (
        !voteResponse.data.receipt ||
        !voteResponse.data.receipt.receiptCode
      ) {
        console.error("❌ No receipt in response!");
        alert("Vote cast but no receipt generated. Please contact support.");
        return;
      }

      console.log("🧾 Receipt code:", voteResponse.data.receipt.receiptCode);

      // Store receipt with blockchain info
      const receiptData = {
        receiptCode: voteResponse.data.receipt.receiptCode,
        electionName: selectedElection.name,
        timestamp: new Date().toISOString(),
        blockchainTxHash: blockchainResult.success
          ? blockchainResult.transactionHash
          : null,
        walletAddress: walletAddress,
        isBlockchainVerified: blockchainResult.success,
      };

      console.log("💾 Storing enhanced receipt data:", receiptData);
      localStorage.setItem("oneTimeReceipt", JSON.stringify(receiptData));

      console.log("🔄 Navigating to receipt view...");
      navigate("/voter/receipt-view");
    } catch (error) {
      console.error("❌ Enhanced vote casting error:", error);
      blindSignature.clear();
      alert(
        "Error casting vote: " + (error.response?.data?.error || error.message)
      );
    } finally {
      setVoting(false);
    }
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
      {/* Blockchain Status */}
      <BlockchainStatus />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">🗳️ Cast Your Vote</h1>
        <p className="text-[#3F3F46] mt-1">
          Your vote will be stored immutably on the blockchain for maximum
          security and transparency.
        </p>
      </div>

      {elections.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border shadow border-[#E2E8F0] text-center">
          <div className="text-black text-lg">
            No active elections available
          </div>
          <p className="text-[#3F3F46] text-sm mt-2">
            Check back later for upcoming elections
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Elections List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-black">
              Available Elections
            </h2>
            {elections.map((election) => {
              // Check if this election is the selected one
              const isSelected = selectedElection?.id === election.id;

              return (
                <div
                  key={election.id}
                  onClick={() => {
                    setSelectedElection(election);
                    setSelectedParty("");
                  }}
                  className={`p-4 rounded-lg border shadow cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-black border-[#E2E8F0]" // text-white is removed from here,
                      : "bg-white border-[#E2E8F0] hover:bg-[#f3f1f1]" // as we apply it to children
                  }`}
                >
                  {/* Conditionally change the h3 color */}
                  <h3
                    className={`text-lg font-bold ${
                      isSelected ? "text-white" : "text-black"
                    }`}
                  >
                    {election.name}
                  </h3>

                  {/* Conditionally change the first p color */}
                  <p
                    className={`text-sm ${
                      isSelected ? "text-gray-200" : "text-[#3F3F46]"
                    }`}
                  >
                    Ends: {new Date(election.endDate).toLocaleString()}
                  </p>

                  {/* Conditionally change the second p color */}
                  <p
                    className={`text-xs mt-1 ${
                      isSelected ? "text-gray-300" : "text-[#3F3F46]"
                    }`}
                  >
                    {election.parties.length} parties participating
                  </p>
                </div>
              );
            })}
          </div>

          {/* Voting Panel */}
          <div className="bg-white p-6 rounded-lg border shadow border-[#E2E8F0]">
            {selectedElection ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-black">
                    {selectedElection.name}
                  </h2>
                  <p className="text-[#3F3F46] text-sm">
                    Select a party to vote for
                  </p>
                </div>

                <div className="space-y-3">
                  {selectedElection.parties.map((party) => {
                    // Check if this party is the selected one
                    const isSelected = selectedParty === party.id;

                    return (
                      <div
                        key={party.id}
                        onClick={() => setSelectedParty(party.id)}
                        // 1. Add the "group" class here
                        className={`p-4 rounded-lg border shadow cursor-pointer transition-colors group ${
                          isSelected
                            ? "bg-black border-[#E2E8F0]"
                            : "bg-white border-[#E2E8F0] hover:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={party.symbolUrl}
                            alt={party.name}
                            className="w-12 h-12 rounded-full object-cover bg-white p-2"
                          />
                          <div>
                            <h3
                              className={`text-lg font-medium ${
                                // 2. Make h3 text conditional
                                isSelected
                                  ? "text-white" // Selected state
                                  : "text-black group-hover:text-white" // Unselected, but white on hover
                              }`}
                            >
                              {party.name}
                            </h3>
                            <p
                              className={`text-sm ${
                                // 3. Make p text conditional
                                isSelected
                                  ? "text-white" // Selected state (light-green/gray)
                                  : "text-black group-hover:text-white" // Unselected, but light gray on hover
                              }`}
                            >
                              Political Party
                            </p>
                          </div>
                          {isSelected && (
                            <div className="ml-auto text-white text-xl">✓</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={castVote}
                  disabled={
                    !selectedParty ||
                    voting ||
                    !isConnected ||
                    blockchainLoading
                  }
                  className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {voting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>
                        {blockchainTxHash
                          ? "Storing on Blockchain..."
                          : "Casting Vote..."}
                      </span>
                    </div>
                  ) : !isConnected ? (
                    "🔗 Connect Wallet First"
                  ) : (
                    "🗳️ Cast Vote on Blockchain"
                  )}
                </button>

                {blockchainTxHash && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm font-medium">
                      🔗 Vote stored on blockchain!
                    </p>
                    <p className="text-green-600 text-xs mt-1 break-all">
                      TX: {blockchainTxHash}
                    </p>
                  </div>
                )}

                {selectedParty && isConnected && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm font-medium">
                      🔐 Enhanced Security Features:
                    </p>
                    <ul className="text-blue-700 text-xs mt-1 space-y-1">
                      <li>
                        • Vote encrypted with blind signatures (EC cannot see
                        your choice)
                      </li>
                      <li>• Immutable storage on blockchain (tamper-proof)</li>
                      <li>
                        • Connected wallet: {walletAddress?.slice(0, 6)}...
                        {walletAddress?.slice(-4)}
                      </li>
                      <li>• You'll receive a blockchain-verified receipt</li>
                    </ul>
                  </div>
                )}

                {selectedParty && !isConnected && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-orange-800 text-sm font-medium">
                      ⚠️ Wallet Required for Blockchain Security
                    </p>
                    <p className="text-orange-700 text-xs mt-1">
                      Connect your wallet to enable immutable vote storage on
                      blockchain
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-black">
                  Select an election to start voting
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default VotingPage;
