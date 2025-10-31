const { ethers } = require("ethers");
const blockchainConfig = require("../../Frontend/src/config/blockchain.json");

async function setupBlockchainData() {
  try {
    console.log("🔗 Setting up blockchain data...");

    // Connect to Ganache
    const provider = new ethers.JsonRpcProvider(
      blockchainConfig.networkConfig.rpcUrl
    );
    const ecWallet = new ethers.Wallet(
      process.env.EC_PRIVATE_KEY ||
        "0xcee72762ca55b8d09caeb2b111a8748eb566a70c874d50abf3f9de1bea2a6e98",
      provider
    );

    // Get contract instance
    const contract = new ethers.Contract(
      blockchainConfig.contractAddress,
      blockchainConfig.contractABI,
      ecWallet
    );

    console.log("📋 Contract address:", blockchainConfig.contractAddress);
    console.log("💰 EC wallet address:", ecWallet.address);

    // 1. Register the EC wallet as a voter on blockchain
    // This allows the EC wallet to cast votes on behalf of all voters
    const ecAddress = ecWallet.address;
    const hashedAadhaar = "ec-voter-proxy";
    const encryptedName = "Election Commission Proxy";
    const encryptedEmail = "ec@proxy.system";

    console.log("👤 Registering EC wallet as voter proxy on blockchain...");
    try {
      const registerTx = await contract.registerVoter(
        ecAddress,
        hashedAadhaar,
        encryptedName,
        encryptedEmail
      );
      await registerTx.wait();
      console.log("✅ EC voter proxy registered:", registerTx.hash);
    } catch (error) {
      if (error.message.includes("Voter already registered")) {
        console.log("ℹ️ EC voter proxy already registered");
      } else {
        throw error;
      }
    }

    // 2. Create a test election on blockchain
    console.log("🗳️ Creating test election on blockchain...");
    const electionId = 1;
    const electionName = "Test Election 2025";
    const startTime = Math.floor(Date.now() / 1000); // Current time
    const endTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 hours from now
    const partyIds = ["party1", "party2", "party3"];
    const partyNames = ["Party One", "Party Two", "Party Three"];

    const createElectionTx = await contract.createElection(
      electionId,
      electionName,
      startTime,
      endTime,
      partyIds,
      partyNames
    );
    await createElectionTx.wait();
    console.log("✅ Test election created:", createElectionTx.hash);

    // 3. Get blockchain stats
    console.log("📊 Getting blockchain stats...");
    const totalVoters = await contract.getTotalVoters();
    const totalVotes = await contract.getTotalVotes();

    console.log("📈 Blockchain Stats:");
    console.log("  Total Voters:", totalVoters.toString());
    console.log("  Total Votes:", totalVotes.toString());

    // 4. Get election details
    const election = await contract.getElection(electionId);
    console.log("🗳️ Election Details:");
    console.log("  ID:", election.id.toString());
    console.log("  Name:", election.name);
    console.log("  Active:", election.active);
    console.log("  Parties:", election.parties);

    console.log("🎉 Blockchain data setup completed!");
  } catch (error) {
    console.error("❌ Setup failed:", error);

    if (error.message.includes("Election already exists")) {
      console.log("ℹ️ Election already exists, that's okay!");
    }

    if (error.message.includes("Voter already registered")) {
      console.log("ℹ️ Voter already registered, that's okay!");
    }
  }
}

// Run the setup
if (require.main === module) {
  setupBlockchainData();
}

module.exports = { setupBlockchainData };
