import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { blindSignature } from "../../utils/cryptoBlinding";
import { useAuth } from "../../context/AuthContext"; // Import useAuth
import CryptoJS from "crypto-js"; // Import CryptoJS for hashing

function VotingPage() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [selectedParty, setSelectedParty] = useState("");
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth(); // Get the logged-in voter from AuthContext

  useEffect(() => {
    fetchElections();
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

  /**
   * Hashes the voter's unique ID (e.g., "VTR123...") to match the
   * hash stored on the blockchain by the admin controller.
   */
  function hashVoterId(voterId) {
    if (!voterId) {
      throw new Error("Voter ID is not available. Please log in again.");
    }
    // Hashes the string to match the backend's hash function
    return "0x" + CryptoJS.SHA256(voterId).toString(CryptoJS.enc.Hex);
  }

  const castVote = async () => {
    if (!selectedElection || !selectedParty) return;

    setVoting(true);

    try {
      console.log("🗳️ Starting BLIND vote process...");
      console.log("Selected Election:", selectedElection.id);
      console.log("Selected Party (will be hidden from EC):", selectedParty);

      // Step 1: Create vote message with randomness
      const voteMessage = JSON.stringify({
        partyId: selectedParty,
        electionId: selectedElection.id,
        timestamp: Date.now(),
        nonce: Math.random().toString(36).substring(2, 15),
      });

      // Step 2: BLIND the vote message
      console.log("🔐 Blinding vote message (hiding from EC)...");
      const blindedMessage = blindSignature.blindMessage(voteMessage);

      // Step 3: Request blind signature from EC's backend
      console.log("📝 Requesting blind signature from EC...");
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

      // Step 5: SUBMIT VOTE THROUGH BACKEND (NO WALLET NEEDED)
      // The backend uses EC wallet to submit to blockchain
      console.log("📤 Submitting vote through backend (no wallet needed)...");

      // Get the voter's unique, non-PII ID from the auth context
      const hashedVoterId = hashVoterId(user.voterId);

      // Send vote data to backend - backend handles blockchain submission
      const voteResponse = await api.post("/vote/submit-to-chain", {
        partyId: selectedParty,
        hashedVoterId: hashedVoterId,
        unblindedSignature: "0x" + unblindedSignature,
        electionId: selectedElection.id,
      });

      console.log("✅ Vote submitted to blockchain by backend!");

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

      console.log(
        "🧾 Receipt (TxHash):",
        voteResponse.data.receipt.receiptCode
      );

      // Store receipt temporarily and redirect to one-time view
      const receiptData = {
        receiptCode: voteResponse.data.receipt.receiptCode, // This is the Blockchain TxHash
        electionName: selectedElection.name,
        timestamp: new Date().toISOString(),
        isBlockchainVerified: true,
      };

      console.log("💾 Storing receipt data:", receiptData);
      localStorage.setItem("oneTimeReceipt", JSON.stringify(receiptData));

      console.log("🔄 Navigating to receipt view...");
      navigate("/voter/receipt-view");
    } catch (error) {
      console.error("❌ Blind vote casting error:", error);
      // Clear sensitive data even on error
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black"> Cast Your Vote</h1>
        <p className="text-[#3F3F46] mt-1">
          Select an election and vote for your preferred party.
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
                      ? "bg-black border-[#E2E8F0]"
                      : "bg-white border-[#E2E8F0] hover:bg-[#f3f1f1]"
                  }`}
                >
                  <h3
                    className={`text-lg font-bold ${
                      isSelected ? "text-white" : "text-black"
                    }`}
                  >
                    {election.name}
                  </h3>
                  <p
                    className={`text-sm ${
                      isSelected ? "text-gray-200" : "text-[#3F3F46]"
                    }`}
                  >
                    Ends: {new Date(election.endDate).toLocaleString()}
                  </p>
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
                    const isSelected = selectedParty === party.id;

                    return (
                      <div
                        key={party.id}
                        onClick={() => setSelectedParty(party.id)}
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
                                isSelected
                                  ? "text-white"
                                  : "text-black group-hover:text-white"
                              }`}
                            >
                              {party.name}
                            </h3>
                            <p
                              className={`text-sm ${
                                isSelected
                                  ? "text-white"
                                  : "text-black group-hover:text-white"
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
                  disabled={!selectedParty || voting}
                  className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-lg transition-colors  disabled:cursor-not-allowed"
                >
                  {voting ? "Casting Vote..." : "Cast Your Vote"}
                </button>

                {selectedParty && (
                  <div className="p-3 bg-blue-300 rounded-lg border border-blue-400">
                    <p className="text-black text-sm">
                      Your vote will be encrypted, cast anonymously, and
                      recorded immutably on the blockchain by the system.
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
