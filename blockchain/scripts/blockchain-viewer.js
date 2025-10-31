const { ethers } = require("ethers");
const blockchainConfig = require("../../Frontend/src/config/blockchain.json");

async function viewBlockchainData() {
  try {
    console.log("🔍 Viewing Blockchain Data...");
    console.log("=".repeat(50));

    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(
      blockchainConfig.networkConfig.rpcUrl
    );
    const contract = new ethers.Contract(
      blockchainConfig.contractAddress,
      blockchainConfig.contractABI,
      provider
    );

    console.log("📋 Contract Address:", blockchainConfig.contractAddress);
    console.log("🌐 Network:", blockchainConfig.networkConfig.networkName);
    console.log("");

    // 1. Get Total Statistics
    console.log("📊 BLOCKCHAIN STATISTICS");
    console.log("-".repeat(30));

    const totalVoters = await contract.getTotalVoters();
    const totalVotes = await contract.getTotalVotes();

    console.log(`👥 Total Voters: ${totalVoters.toString()}`);
    console.log(`🗳️ Total Votes: ${totalVotes.toString()}`);
    console.log("");

    // 2. List All Voters
    console.log("👤 REGISTERED VOTERS");
    console.log("-".repeat(30));

    if (totalVoters.toString() === "0") {
      console.log("⚠️ No voters found on blockchain");
    } else {
      for (let i = 0; i < parseInt(totalVoters.toString()); i++) {
        try {
          const voterAddress = await contract.voterAddresses(i);
          const voter = await contract.getVoter(voterAddress);

          console.log(`Voter ${i + 1}:`);
          console.log(`  Address: ${voterAddress}`);
          console.log(`  Aadhaar Hash: ${voter.aadhaarHash}`);
          console.log(`  Encrypted Name: ${voter.encryptedName}`);
          console.log(`  Encrypted Email: ${voter.encryptedEmail}`);
          console.log(
            `  Registration Time: ${new Date(
              parseInt(voter.registrationTime.toString()) * 1000
            ).toLocaleString()}`
          );
          console.log(`  Active: ${voter.isActive}`);
          console.log("");
        } catch (error) {
          console.log(`❌ Error reading voter ${i}: ${error.message}`);
        }
      }
    }

    // 3. List All Elections
    console.log("🗳️ BLOCKCHAIN ELECTIONS");
    console.log("-".repeat(30));

    try {
      // Try to get elections (starting from ID 1)
      let electionFound = false;
      for (let electionId = 1; electionId <= 10; electionId++) {
        try {
          const election = await contract.getElection(electionId);
          if (election.id.toString() !== "0") {
            electionFound = true;
            console.log(`Election ${electionId}:`);
            console.log(`  Name: ${election.name}`);
            console.log(`  Active: ${election.active}`);
            console.log(
              `  Start Time: ${new Date(
                parseInt(election.startTime.toString()) * 1000
              ).toLocaleString()}`
            );
            console.log(
              `  End Time: ${new Date(
                parseInt(election.endTime.toString()) * 1000
              ).toLocaleString()}`
            );
            console.log(`  Parties: ${election.parties.join(", ")}`);
            console.log(`  Total Votes: ${election.totalVotes.toString()}`);
            console.log("");
          }
        } catch (error) {
          // Election doesn't exist, continue
          break;
        }
      }

      if (!electionFound) {
        console.log("⚠️ No elections found on blockchain");
      }
    } catch (error) {
      console.log(`❌ Error reading elections: ${error.message}`);
    }

    // 4. List All Votes
    console.log("📋 BLOCKCHAIN VOTES");
    console.log("-".repeat(30));

    if (totalVotes.toString() === "0") {
      console.log("⚠️ No votes found on blockchain");
    } else {
      for (let i = 0; i < Math.min(parseInt(totalVotes.toString()), 10); i++) {
        try {
          const voteHash = await contract.voteHashes(i);
          const vote = await contract.getVote(voteHash);

          console.log(`Vote ${i + 1}:`);
          console.log(`  Vote Hash: ${voteHash}`);
          console.log(`  Election ID: ${vote.electionId.toString()}`);
          console.log(`  Party ID: ${vote.partyId}`);
          console.log(
            `  Timestamp: ${new Date(
              parseInt(vote.timestamp.toString()) * 1000
            ).toLocaleString()}`
          );
          console.log(`  Blind Signature: ${vote.blindSignature}`);
          console.log("");
        } catch (error) {
          console.log(`❌ Error reading vote ${i}: ${error.message}`);
        }
      }

      if (parseInt(totalVotes.toString()) > 10) {
        console.log(
          `... and ${parseInt(totalVotes.toString()) - 10} more votes`
        );
      }
    }

    // 5. Contract Admin Info
    console.log("🔐 CONTRACT ADMIN");
    console.log("-".repeat(30));

    try {
      const admin = await contract.admin();
      console.log(`Admin Address: ${admin}`);
      console.log("");
    } catch (error) {
      console.log(`❌ Error reading admin: ${error.message}`);
    }

    console.log("=".repeat(50));
    console.log("✅ Blockchain data viewing completed!");
  } catch (error) {
    console.error("❌ Failed to view blockchain data:", error);
  }
}

// Function to decode encrypted data
function decodeEncryptedData(encryptedData) {
  try {
    return Buffer.from(encryptedData, "base64").toString("utf8");
  } catch (error) {
    return encryptedData; // Return as-is if decoding fails
  }
}

// Function to check specific voter
async function checkVoter(voterAddress) {
  try {
    const provider = new ethers.JsonRpcProvider(
      blockchainConfig.networkConfig.rpcUrl
    );
    const contract = new ethers.Contract(
      blockchainConfig.contractAddress,
      blockchainConfig.contractABI,
      provider
    );

    const voter = await contract.getVoter(voterAddress);

    if (voter.registrationTime.toString() === "0") {
      console.log("❌ Voter not found on blockchain");
      return null;
    }

    console.log("👤 Voter Details:");
    console.log(`  Address: ${voterAddress}`);
    console.log(`  Aadhaar Hash: ${voter.aadhaarHash}`);
    console.log(`  Name (encrypted): ${voter.encryptedName}`);
    console.log(
      `  Name (decoded): ${decodeEncryptedData(voter.encryptedName)}`
    );
    console.log(`  Email (encrypted): ${voter.encryptedEmail}`);
    console.log(
      `  Email (decoded): ${decodeEncryptedData(voter.encryptedEmail)}`
    );
    console.log(
      `  Registration Time: ${new Date(
        parseInt(voter.registrationTime.toString()) * 1000
      ).toLocaleString()}`
    );
    console.log(`  Active: ${voter.isActive}`);

    return voter;
  } catch (error) {
    console.error("❌ Error checking voter:", error.message);
    return null;
  }
}

// Run the viewer
if (require.main === module) {
  if (process.argv[2] === "voter" && process.argv[3]) {
    // Check specific voter: node blockchain-viewer.js voter 0x1234...
    checkVoter(process.argv[3]);
  } else {
    // View all data: node blockchain-viewer.js
    viewBlockchainData();
  }
}

module.exports = { viewBlockchainData, checkVoter, decodeEncryptedData };
