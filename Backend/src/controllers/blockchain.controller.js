const { ethers } = require("ethers");
const blockchainConfig = require("../../../Frontend/src/config/blockchain.json");

// Get real-time blockchain statistics
exports.getBlockchainStats = async (req, res) => {
  try {
    console.log("📊 Fetching blockchain statistics...");

    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(
      blockchainConfig.networkConfig.rpcUrl
    );
    const contract = new ethers.Contract(
      blockchainConfig.contractAddress,
      blockchainConfig.contractABI,
      provider
    );

    // Get basic stats from VoteStorage contract
    const totalVoters = await contract.voterCount();
    const totalVotes = await contract.voteCount();

    // Get network info
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();

    // Get admin address
    const adminAddress = await contract.admin();

    // Elections are now stored in database only, not on blockchain
    const elections = [];

    const stats = {
      totalVoters: totalVoters.toString(),
      totalVotes: totalVotes.toString(),
      contractAddress: blockchainConfig.contractAddress,
      networkConfig: {
        chainId: network.chainId.toString(),
        networkName: blockchainConfig.networkConfig.networkName,
        rpcUrl: blockchainConfig.networkConfig.rpcUrl,
        blockNumber: blockNumber,
      },
      adminAddress: adminAddress,
      elections: elections,
      lastUpdated: new Date().toISOString(),
    };

    console.log("✅ Blockchain stats fetched successfully");
    res.json(stats);
  } catch (error) {
    console.error("❌ Failed to fetch blockchain stats:", error);
    res.status(500).json({
      error: "Failed to fetch blockchain statistics",
      details: error.message,
    });
  }
};

// Get detailed voter information from blockchain
exports.getBlockchainVoters = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    console.log("👥 Fetching blockchain voters...");

    const provider = new ethers.JsonRpcProvider(
      blockchainConfig.networkConfig.rpcUrl
    );
    const contract = new ethers.Contract(
      blockchainConfig.contractAddress,
      blockchainConfig.contractABI,
      provider
    );

    const totalVoters = await contract.voterCount();
    const totalCount = parseInt(totalVoters.toString());

    const voters = [];
    const startIndex = parseInt(offset);
    const endIndex = Math.min(startIndex + parseInt(limit), totalCount);

    // Get all voter addresses first
    const allVoterAddresses = await contract.getAllVoterAddresses();

    for (
      let i = startIndex;
      i < endIndex && i < allVoterAddresses.length;
      i++
    ) {
      try {
        const voterAddress = allVoterAddresses[i];
        const voter = await contract.getVoter(voterAddress);

        // Decode encrypted data
        const decodeName = (encrypted) => {
          try {
            return Buffer.from(encrypted, "base64").toString("utf8");
          } catch {
            return encrypted;
          }
        };

        const decodedName = decodeName(voter.encryptedName);
        const decodedEmail = decodeName(voter.encryptedEmail);

        voters.push({
          index: i + 1,
          address: voterAddress,
          aadhaarHash: voter.aadhaarHash,
          encryptedName: voter.encryptedName,
          decodedName: decodedName,
          encryptedEmail: voter.encryptedEmail,
          decodedEmail: decodedEmail,
          registrationTime: new Date(
            parseInt(voter.registrationTime.toString()) * 1000
          ).toISOString(),
          isActive: voter.isActive,
        });
      } catch (error) {
        console.error(`Error fetching voter ${i}:`, error.message);
      }
    }

    res.json({
      voters: voters,
      pagination: {
        total: totalCount,
        offset: startIndex,
        limit: parseInt(limit),
        hasMore: endIndex < totalCount,
      },
    });
  } catch (error) {
    console.error("❌ Failed to fetch blockchain voters:", error);
    res.status(500).json({
      error: "Failed to fetch blockchain voters",
      details: error.message,
    });
  }
};

// Get detailed vote information from blockchain
exports.getBlockchainVotes = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    console.log("🗳️ Fetching blockchain votes...");

    const provider = new ethers.JsonRpcProvider(
      blockchainConfig.networkConfig.rpcUrl
    );
    const contract = new ethers.Contract(
      blockchainConfig.contractAddress,
      blockchainConfig.contractABI,
      provider
    );

    const totalVotes = await contract.voteCount();
    const totalCount = parseInt(totalVotes.toString());

    const votes = [];
    const startIndex = parseInt(offset);
    const endIndex = Math.min(startIndex + parseInt(limit), totalCount);

    for (let i = startIndex; i < endIndex; i++) {
      try {
        // Vote IDs start from 1 in VoteStorage contract
        const voteId = i + 1;
        const vote = await contract.getVote(voteId);

        votes.push({
          index: voteId,
          voteHash: vote.voteHash,
          electionId: vote.electionId, // This is now a string (UUID)
          partyId: vote.partyId, // This is now a string (UUID)
          timestamp: new Date(
            parseInt(vote.timestamp.toString()) * 1000
          ).toISOString(),
          blindSignature: vote.blindSignature,
        });
      } catch (error) {
        console.error(`Error fetching vote ${i + 1}:`, error.message);
      }
    }

    res.json({
      votes: votes,
      pagination: {
        total: totalCount,
        offset: startIndex,
        limit: parseInt(limit),
        hasMore: endIndex < totalCount,
      },
    });
  } catch (error) {
    console.error("❌ Failed to fetch blockchain votes:", error);
    res.status(500).json({
      error: "Failed to fetch blockchain votes",
      details: error.message,
    });
  }
};
