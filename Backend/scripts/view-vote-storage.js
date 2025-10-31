const { ethers } = require("ethers");

async function viewVoteStorage() {
  try {
    console.log("🔍 Viewing VoteStorage Contract Data...");
    console.log("==================================================");

    // Load blockchain config
    const blockchainConfig = require("../../Frontend/src/config/blockchain.json");

    console.log(`📋 Contract Address: ${blockchainConfig.contractAddress}`);
    console.log(`🌐 Network: ${blockchainConfig.networkConfig.networkName}`);

    // Setup blockchain connection
    const provider = new ethers.JsonRpcProvider(
      blockchainConfig.networkConfig.rpcUrl
    );
    const voteStorageContract = new ethers.Contract(
      blockchainConfig.contractAddress,
      blockchainConfig.contractABI,
      provider
    );

    // Get statistics
    const voterCount = await voteStorageContract.voterCount();
    const voteCount = await voteStorageContract.voteCount();

    console.log(`\n📊 BLOCKCHAIN STATISTICS`);
    console.log(`------------------------------`);
    console.log(`👥 Total Voters: ${voterCount}`);
    console.log(`🗳️ Total Votes: ${voteCount}`);

    // Get all voter addresses
    console.log(`\n👤 REGISTERED VOTERS`);
    console.log(`------------------------------`);

    const voterAddresses = await voteStorageContract.getAllVoterAddresses();

    for (let i = 0; i < voterAddresses.length; i++) {
      const voterAddress = voterAddresses[i];
      const voter = await voteStorageContract.getVoter(voterAddress);

      console.log(`Voter ${i + 1}:`);
      console.log(`  Address: ${voter.voterAddress}`);
      console.log(`  Aadhaar Hash: ${voter.aadhaarHash}`);
      console.log(`  Encrypted Name: ${voter.encryptedName}`);
      console.log(`  Encrypted Email: ${voter.encryptedEmail}`);
      console.log(
        `  Registration Time: ${new Date(
          Number(voter.registrationTime) * 1000
        ).toLocaleString()}`
      );
      console.log(`  Active: ${voter.isActive}`);
      console.log(``);
    }

    // Get all votes
    console.log(`📋 BLOCKCHAIN VOTES`);
    console.log(`------------------------------`);

    for (let i = 1; i <= voteCount; i++) {
      const vote = await voteStorageContract.getVote(i);

      console.log(`Vote ${i}:`);
      console.log(`  Vote Hash: ${vote.voteHash}`);
      console.log(`  Election ID: ${vote.electionId}`);
      console.log(`  Party ID: ${vote.partyId}`);
      console.log(
        `  Timestamp: ${new Date(
          Number(vote.timestamp) * 1000
        ).toLocaleString()}`
      );
      console.log(`  Blind Signature: ${vote.blindSignature}`);
      console.log(``);
    }

    // Get admin
    const admin = await voteStorageContract.admin();
    console.log(`🔐 CONTRACT ADMIN`);
    console.log(`------------------------------`);
    console.log(`Admin Address: ${admin}`);

    console.log(`\n==================================================`);
    console.log(`✅ VoteStorage data viewing completed!`);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

viewVoteStorage();
