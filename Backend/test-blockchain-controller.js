const { ethers } = require("ethers");

async function testBlockchainController() {
  try {
    console.log("🧪 Testing blockchain controller methods...");

    // Load blockchain config
    const blockchainConfig = require("../Frontend/src/config/blockchain.json");

    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(
      blockchainConfig.networkConfig.rpcUrl
    );
    const contract = new ethers.Contract(
      blockchainConfig.contractAddress,
      blockchainConfig.contractABI,
      provider
    );

    console.log(`📋 Contract Address: ${blockchainConfig.contractAddress}`);

    // Test basic stats
    console.log("\n📊 Testing stats...");
    const totalVoters = await contract.voterCount();
    const totalVotes = await contract.voteCount();
    const adminAddress = await contract.admin();

    console.log(`✅ Total Voters: ${totalVoters}`);
    console.log(`✅ Total Votes: ${totalVotes}`);
    console.log(`✅ Admin Address: ${adminAddress}`);

    // Test voter fetching
    console.log("\n👥 Testing voter fetching...");
    const allVoterAddresses = await contract.getAllVoterAddresses();
    console.log(`✅ Found ${allVoterAddresses.length} voter addresses`);

    if (allVoterAddresses.length > 0) {
      const firstVoter = await contract.getVoter(allVoterAddresses[0]);
      console.log(`✅ First voter: ${firstVoter.encryptedName}`);
    }

    // Test vote fetching
    console.log("\n🗳️ Testing vote fetching...");
    if (totalVotes > 0) {
      const firstVote = await contract.getVote(1);
      console.log(
        `✅ First vote: Election ${firstVote.electionId}, Party ${firstVote.partyId}`
      );
    }

    console.log("\n✅ All blockchain controller tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testBlockchainController();
