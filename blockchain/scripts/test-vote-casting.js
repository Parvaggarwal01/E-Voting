const { ethers } = require("ethers");
const blockchainConfig = require("../../Frontend/src/config/blockchain.json");

async function testVoteCasting() {
  try {
    console.log("🧪 Testing vote casting...");

    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(
      blockchainConfig.networkConfig.rpcUrl
    );
    const ecWallet = new ethers.Wallet(
      process.env.EC_PRIVATE_KEY ||
        "0xcee72762ca55b8d09caeb2b111a8748eb566a70c874d50abf3f9de1bea2a6e98",
      provider
    );

    // Get contract
    const contract = new ethers.Contract(
      blockchainConfig.contractAddress,
      blockchainConfig.contractABI,
      ecWallet
    );

    console.log("💰 EC wallet address:", ecWallet.address);

    // Check if EC wallet is registered
    const voter = await contract.getVoter(ecWallet.address);
    console.log("👤 EC wallet voter status:", {
      registered: voter.registrationTime.toString() !== "0",
      active: voter.isActive,
      aadhaarHash: voter.aadhaarHash,
    });

    // Check election status
    const election = await contract.getElection(1);
    console.log("🗳️ Election 1 status:", {
      id: election.id.toString(),
      name: election.name,
      active: election.active,
      totalVotes: election.totalVotes.toString(),
    });

    // Check if already voted
    const hasVoted = await contract.hasVoted(ecWallet.address, 1);
    console.log("✅ Has already voted:", hasVoted);

    if (hasVoted) {
      console.log("⚠️ EC wallet has already voted in this election");
      return;
    }

    // Prepare vote data
    const electionId = 1;
    const partyId = "party1";
    const voteHash = ethers.keccak256(
      ethers.toUtf8Bytes(`test-vote-${Date.now()}`)
    );
    const blindSignature = ethers.keccak256(
      ethers.toUtf8Bytes("test-signature")
    );

    console.log("📝 Vote data:", {
      electionId,
      partyId,
      voteHashPreview: voteHash.substring(0, 10) + "...",
    });

    // Cast vote
    console.log("🗳️ Casting test vote...");
    const tx = await contract.castVote(
      electionId,
      voteHash,
      blindSignature,
      partyId
    );

    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();

    console.log("✅ Vote cast successfully!");
    console.log("🧾 Transaction hash:", receipt.hash);
    console.log("🔢 Block number:", receipt.blockNumber);

    // Check updated stats
    const updatedElection = await contract.getElection(1);
    console.log("📊 Updated election stats:", {
      totalVotes: updatedElection.totalVotes.toString(),
    });
  } catch (error) {
    console.error("❌ Test failed:", error.message);

    if (error.message.includes("Already voted")) {
      console.log("ℹ️ This is expected if EC wallet already voted");
    }
  }
}

// Run the test
if (require.main === module) {
  testVoteCasting();
}

module.exports = { testVoteCasting };
