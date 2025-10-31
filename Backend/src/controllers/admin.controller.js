const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const {
  encryptPassword,
  decryptPassword,
} = require("../utils/password-encryption");
const prisma = new PrismaClient();

const { ethers } = require("ethers");
const crypto = require("crypto");
const blockchainConfig = require("../../../Frontend/src/config/blockchain.json");

const provider = new ethers.JsonRpcProvider(
  blockchainConfig.networkConfig.rpcUrl
);
const ecWallet = new ethers.Wallet(process.env.EC_PRIVATE_KEY, provider);
const immutableVotingContract = new ethers.Contract(
  blockchainConfig.contractAddress,
  blockchainConfig.contractABI,
  ecWallet
);

function hashVoterId(voterId) {
  // Hashes a string (like the voterId) into a 32-byte hex string
  return "0x" + crypto.createHash("sha256").update(voterId).digest("hex");
}

exports.createParty = async (req, res) => {
  const { name, symbolUrl } = req.body;
  try {
    // Generate party credentials
    const partyEmail =
      name
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9]/g, "") + "@party.gov";
    const defaultPassword = "Party@123"; // Predefined password as requested
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const newParty = await prisma.party.create({
      data: {
        name,
        symbolUrl,
        email: partyEmail,
        passwordHash,
        isVerified: true, // EC-created parties are auto-verified
      },
    });

    // Return party info with credentials
    res.status(201).json({
      ...newParty,
      credentials: {
        email: partyEmail,
        password: defaultPassword,
      },
    });
  } catch (error) {
    console.error("Create party error:", error);
    if (error.code === "P2002") {
      res.status(400).json({ error: "Party name or email already exists." });
    } else {
      res.status(400).json({ error: "Could not create party." });
    }
  }
};

exports.deleteParty = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if party is used in any elections
    const partyInElections = await prisma.election.findFirst({
      where: {
        parties: {
          some: { id },
        },
      },
    });

    if (partyInElections) {
      return res.status(400).json({
        error:
          "Cannot delete party. It is currently registered in one or more elections.",
      });
    }

    // Check if party has any election results
    const partyResults = await prisma.electionResult.findFirst({
      where: { partyId: id },
    });

    if (partyResults) {
      return res.status(400).json({
        error:
          "Cannot delete party. It has election results that would be lost.",
      });
    }

    // Safe to delete
    await prisma.party.delete({
      where: { id },
    });

    res.status(200).json({ message: "Party deleted successfully" });
  } catch (error) {
    console.error("Delete party error:", error);
    res.status(400).json({ error: "Could not delete party." });
  }
};

exports.updateParty = async (req, res) => {
  const { id } = req.params;
  const { name, symbolUrl } = req.body;

  try {
    const updatedParty = await prisma.party.update({
      where: { id },
      data: { name, symbolUrl },
    });

    res.status(200).json(updatedParty);
  } catch (error) {
    console.error("Update party error:", error);
    res.status(400).json({ error: "Could not update party." });
  }
};

exports.createElection = async (req, res) => {
  const { name, startDate, endDate, partyIds } = req.body;
  try {
    console.log(`🏛️ Creating election in database: ${name}`);

    // Create election only in database (not blockchain)
    const newElection = await prisma.election.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        parties: {
          connect: partyIds.map((id) => ({ id })),
        },
      },
      include: { parties: true },
    });

    console.log(`✅ Election created in database: ${newElection.id}`);

    res.status(201).json(newElection);
  } catch (error) {
    console.error("❌ Election creation error:", error);
    res
      .status(400)
      .json({ error: `Could not create election: ${error.message}` });
  }
};

exports.deleteElection = async (req, res) => {
  const { id } = req.params;
  try {
    // First, delete related records to avoid foreign key constraints
    await prisma.voterElectionStatus.deleteMany({
      where: { electionId: id },
    });

    await prisma.receipt.deleteMany({
      where: { electionId: id },
    });

    await prisma.centralBallotBox.deleteMany({
      where: { electionId: id },
    });

    await prisma.electionResult.deleteMany({
      where: { electionId: id },
    });

    await prisma.electionStatus.deleteMany({
      where: { electionId: id },
    });

    // Then delete the election
    await prisma.election.delete({
      where: { id },
    });

    res.status(200).json({ message: "Election deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Could not delete election." });
  }
};

// Calculate results from the ballot box
exports.calculateResults = async (req, res) => {
  const { electionId } = req.params;

  try {
    // Get election details with parties
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      include: { parties: true },
    });

    if (!election) {
      return res.status(404).json({ error: "Election not found" });
    }

    // Get all votes from the central ballot box for THIS SPECIFIC election only
    const electionVotes = await prisma.centralBallotBox.findMany({
      where: { electionId },
      orderBy: { createdAt: "asc" },
    });

    console.log(
      `🗳️ Found ${electionVotes.length} votes for election: ${election.name}`
    );

    // Count votes by party ID (voteMessage contains party ID)
    const voteCounts = {};
    election.parties.forEach((party) => {
      voteCounts[party.id] = 0;
    });

    // Process votes - count each vote for the correct party
    let validVoteCount = 0;
    electionVotes.forEach((vote) => {
      console.log(
        `Processing vote: ${vote.voteMessage} for election: ${vote.electionId}`
      );
      if (voteCounts.hasOwnProperty(vote.voteMessage)) {
        voteCounts[vote.voteMessage]++;
        validVoteCount++;
        console.log(`✅ Vote counted for party: ${vote.voteMessage}`);
      } else {
        console.log(`⚠️ Invalid party ID in vote: ${vote.voteMessage}`);
      }
    });

    console.log("Final vote counts:", voteCounts);

    // Calculate percentages and sort by vote count (highest first)
    const results = [];
    for (const party of election.parties) {
      const voteCount = voteCounts[party.id] || 0;
      const percentage =
        validVoteCount > 0 ? (voteCount / validVoteCount) * 100 : 0;

      results.push({
        partyId: party.id,
        partyName: party.name,
        voteCount,
        percentage: Math.round(percentage * 100) / 100,
      });
    }

    // Sort results by vote count (descending) to determine winner
    results.sort((a, b) => {
      if (b.voteCount !== a.voteCount) {
        return b.voteCount - a.voteCount; // Sort by vote count first
      }
      return a.partyName.localeCompare(b.partyName); // If tied, sort alphabetically
    });

    console.log("Sorted results:", results);

    // Check for draw/tie (multiple parties with same highest vote count)
    const highestVoteCount = results.length > 0 ? results[0].voteCount : 0;
    const winnersCount = results.filter(
      (r) => r.voteCount === highestVoteCount && r.voteCount > 0
    ).length;
    const isDraw = winnersCount > 1 && highestVoteCount > 0;

    console.log(
      `Highest vote count: ${highestVoteCount}, Winners count: ${winnersCount}, Is draw: ${isDraw}`
    );

    // Update election status
    await prisma.electionStatus.upsert({
      where: { electionId },
      create: {
        electionId,
        status: "COMPLETED",
        totalVotes: validVoteCount,
      },
      update: {
        status: "COMPLETED",
        totalVotes: validVoteCount,
      },
    });

    // Store results in database
    for (const result of results) {
      await prisma.electionResult.upsert({
        where: {
          electionId_partyId: {
            electionId,
            partyId: result.partyId,
          },
        },
        create: {
          electionId,
          partyId: result.partyId,
          voteCount: result.voteCount,
          percentage: result.percentage,
        },
        update: {
          voteCount: result.voteCount,
          percentage: result.percentage,
        },
      });
    }

    res.status(200).json({
      message: "Results calculated successfully",
      totalVotes: validVoteCount,
      results,
      isDraw,
      winnersCount,
      highestVoteCount,
    });
  } catch (error) {
    console.error("Error calculating results:", error);
    res.status(500).json({ error: "Could not calculate results" });
  }
};

// Publish or unpublish election results
exports.publishResults = async (req, res) => {
  const { electionId } = req.params;
  const { publish } = req.body; // true to publish, false to unpublish

  try {
    console.log(
      `📝 ${publish ? "Publishing" : "Unpublishing"} results for election:`,
      electionId
    );

    // Update election status
    const updatedStatus = await prisma.electionStatus.upsert({
      where: { electionId },
      create: {
        electionId,
        resultsPublished: publish,
        publishedAt: publish ? new Date() : null,
      },
      update: {
        resultsPublished: publish,
        publishedAt: publish ? new Date() : null,
      },
    });

    console.log("📊 Updated election status:", updatedStatus);

    // Update all results for this election
    const updatedResults = await prisma.electionResult.updateMany({
      where: { electionId },
      data: {
        isPublished: publish,
        publishedAt: publish ? new Date() : null,
      },
    });

    console.log(`📋 Updated ${updatedResults.count} results records`);

    const action = publish ? "published" : "unpublished";
    res.status(200).json({
      message: `Results ${action} successfully`,
      published: publish,
      electionId,
    });
  } catch (error) {
    console.error("Error publishing results:", error);
    res.status(500).json({ error: "Could not publish results" });
  }
};

// Get detailed election statistics for admin
exports.getElectionStats = async (req, res) => {
  const { electionId } = req.params;

  try {
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      include: {
        status: true,
        voterStatuses: true,
        results: {
          include: { party: true },
          orderBy: { voteCount: "desc" },
        },
      },
    });

    if (!election) {
      return res.status(404).json({ error: "Election not found" });
    }

    const totalRegisteredVoters = await prisma.voter.count();
    const votersWhoVoted = election.voterStatuses.length;

    res.status(200).json({
      status: {
        resultsPublished: election.status?.resultsPublished || false,
      },
      statistics: {
        totalRegisteredVoters,
        votersWhoVoted,
        turnoutPercentage:
          totalRegisteredVoters > 0
            ? Math.round((votersWhoVoted / totalRegisteredVoters) * 100)
            : 0,
      },
      totalVotes: election.status?.totalVotes || 0,
      results: election.results,
    });
  } catch (error) {
    console.error("Error getting election stats:", error);
    res.status(500).json({ error: "Could not get election statistics" });
  }
};

// Get comprehensive dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get basic counts
    const [totalElections, totalParties, totalVoters, totalReceipts] =
      await Promise.all([
        prisma.election.count(),
        prisma.party.count(),
        prisma.voter.count(),
        prisma.receipt.count(),
      ]);

    // Get elections with status information
    const elections = await prisma.election.findMany({
      include: {
        status: true,
        parties: true,
        voterStatuses: true,
      },
      orderBy: { startDate: "desc" },
    });

    const now = new Date();
    let activeElections = 0;
    let upcomingElections = 0;
    let completedElections = 0;
    let totalVotes = 0;

    elections.forEach((election) => {
      const start = new Date(election.startDate);
      const end = new Date(election.endDate);

      if (now < start) {
        upcomingElections++;
      } else if (now >= start && now <= end) {
        activeElections++;
      } else {
        completedElections++;
      }

      totalVotes += election.status?.totalVotes || 0;
    });

    // Get recent activity (last 10 activities)
    const recentActivity = [];

    // Recent elections
    const recentElections = await prisma.election.findMany({
      take: 3,
      orderBy: { startDate: "desc" },
    });

    recentElections.forEach((election) => {
      recentActivity.push({
        type: "election",
        message: `New election "${election.name}" created`,
        time: election.startDate, // Use startDate since no createdAt
        timeAgo: getTimeAgo(election.startDate),
      });
    });

    // Recent parties
    const recentParties = await prisma.party.findMany({
      take: 2,
      orderBy: { id: "desc" },
    });

    recentParties.forEach((party) => {
      recentActivity.push({
        type: "party",
        message: `Party "${party.name}" registered`,
        time: new Date(), // Mock time since Party doesn't have createdAt
        timeAgo: "Recently",
      });
    });

    // Recent votes (from receipt creation)
    const recentReceipts = await prisma.receipt.findMany({
      take: 2,
      orderBy: { createdAt: "desc" },
      include: {
        // We'll need to get election info separately since no direct relation
      },
    });

    // Get election names for recent receipts
    for (const receipt of recentReceipts) {
      const election = await prisma.election.findUnique({
        where: { id: receipt.electionId },
        select: { name: true },
      });

      if (election) {
        recentActivity.push({
          type: "vote",
          message: `New vote cast in "${election.name}"`,
          time: receipt.createdAt,
          timeAgo: getTimeAgo(receipt.createdAt),
        });
      }
    }

    // Recent results published
    const recentResults = await prisma.electionStatus.findMany({
      where: { resultsPublished: true },
      take: 2,
      orderBy: { publishedAt: "desc" },
      include: {
        election: { select: { name: true } },
      },
    });

    recentResults.forEach((status) => {
      if (status.publishedAt) {
        recentActivity.push({
          type: "result",
          message: `Results published for "${status.election.name}"`,
          time: status.publishedAt,
          timeAgo: getTimeAgo(status.publishedAt),
        });
      }
    });

    // Sort activity by time and take latest 8
    recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time));
    const limitedActivity = recentActivity.slice(0, 8);

    res.status(200).json({
      stats: {
        totalElections,
        activeElections,
        upcomingElections,
        completedElections,
        totalParties,
        totalVoters,
        totalVotes,
        totalReceipts,
      },
      recentActivity: limitedActivity,
      elections: elections.map((election) => ({
        id: election.id,
        name: election.name,
        startDate: election.startDate,
        endDate: election.endDate,
        partiesCount: election.parties.length,
        votersCount: election.voterStatuses.length,
        totalVotes: election.status?.totalVotes || 0,
        status: getElectionStatus(election),
      })),
    });
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({ error: "Could not get dashboard statistics" });
  }
};

// Helper function to determine election status
function getElectionStatus(election) {
  const now = new Date();
  const start = new Date(election.startDate);
  const end = new Date(election.endDate);

  if (now < start) {
    return "UPCOMING";
  } else if (now >= start && now <= end) {
    return "ACTIVE";
  } else if (election.status?.resultsPublished) {
    return "RESULTS_PUBLISHED";
  } else {
    return "COMPLETED";
  }
}

// Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  } else {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  }
}

// Bulk Voter Registration
const bulkRegisterVoters = async (req, res) => {
  try {
    const { votersData } = req.body; // Array of voter objects from CSV
    const results = {
      success: [],
      errors: [],
      total: votersData.length,
    };

    for (const voterData of votersData) {
      try {
        // === 1. VALIDATE CSV DATA ===
        if (
          !voterData.aadhaarNumber ||
          !/^\d{12}$/.test(voterData.aadhaarNumber)
        ) {
          throw new Error("Invalid Aadhaar number. Must be 12 digits.");
        }

        const existingAadhaar = await prisma.voter.findFirst({
          where: { aadhaarNumber: voterData.aadhaarNumber },
        });

        if (existingAadhaar) {
          throw new Error("Aadhaar number already registered in database.");
        }

        // === 2. CREATE VOTER & CREDENTIALS ===
        const voterId = generateVoterId(); // Assumes generateVoterId() is in your file
        const voterEmail = `${voterId}@voter.gov`;

        const dob = new Date(voterData.dateOfBirth);
        const day = String(dob.getDate()).padStart(2, "0");
        const month = String(dob.getMonth() + 1).padStart(2, "0");
        const year = dob.getFullYear();
        const last4Aadhaar = voterData.aadhaarNumber.slice(-4);
        const password = `${day}${month}${year}@${last4Aadhaar}`;

        const hashedPassword = await bcrypt.hash(password, 12);

        // === 3. SAVE SENSITIVE DATA TO POSTGRESQL ===
        const voter = await prisma.voter.create({
          data: {
            voterId,
            email: voterEmail,
            passwordHash: hashedPassword,
            name: voterData.name,
            realEmail: voterData.email, // Store real email for sending credentials
            phone: voterData.phone,
            address: voterData.address,
            dateOfBirth: new Date(voterData.dateOfBirth),
            aadhaarNumber: voterData.aadhaarNumber,
            isVerified: true, // EC-registered voters are auto-verified
          },
        });

        // === 4. REGISTER VOTER ON BLOCKCHAIN (IMMUTABLE VOTING CONTRACT) ===
        // Register individual voters on blockchain with their encrypted data
        const hashedAadhaar = ethers.keccak256(
          ethers.toUtf8Bytes(voter.aadhaarNumber)
        );
        const encryptedName = Buffer.from(voter.name).toString("base64");
        const encryptedEmail = Buffer.from(voter.email).toString("base64");
        const voterAddress = ethers.Wallet.createRandom().address; // Generate random address

        console.log(`📝 Registering voter ${voter.voterId} on blockchain...`);

        try {
          // Call the ImmutableVoting contract registerVoter function
          const tx = await immutableVotingContract.registerVoter(
            voterAddress,
            hashedAadhaar,
            encryptedName,
            encryptedEmail
          );
          await tx.wait(); // Wait for the transaction to be mined

          console.log(
            `✅ Voter ${voter.name} registered on blockchain: ${tx.hash}`
          );
        } catch (blockchainError) {
          if (blockchainError.message.includes("Voter already registered")) {
            console.log(
              `ℹ️ Voter ${voter.name} already registered on blockchain`
            );
          } else {
            console.error(
              `❌ Blockchain registration failed for ${voter.name}:`,
              blockchainError.message
            );
            // Don't throw - we still want to save to database
          }
        }
        // --- END OF BLOCKCHAIN REGISTRATION ---

        // === 5. REPORT SUCCESS ===
        results.success.push({
          name: voter.name,
          voterId: voter.voterId,
          email: voter.email,
          password: password, // Include generated password
          realEmail: voterData.email,
          aadhaarNumber: voter.aadhaarNumber,
        });
      } catch (error) {
        // This catch block handles errors for a *single voter*
        // including duplicates or blockchain failures
        results.errors.push({
          name: voterData.name || "Unknown",
          email: voterData.email || "Unknown",
          error: error.reason || error.message, // error.reason is for blockchain errors
        });
      }
    }

    res.json(results);
  } catch (error) {
    // This catch block handles errors for the *entire function*
    console.error("Critical error in bulk voter registration:", error);
    res.status(500).json({ error: "Could not register voters" });
  }
};

// Get all voters
const getAllVoters = async (req, res) => {
  try {
    const voters = await prisma.voter.findMany({
      select: {
        id: true,
        voterId: true,
        name: true,
        email: true,
        realEmail: true,
        phone: true,
        address: true,
        dateOfBirth: true,
        isVerified: true,
        createdAt: true,
        encryptedPassword: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // For now, return voters without decrypted passwords
    // TODO: Re-enable decryption after migration is complete
    const votersWithoutEncryption = voters.map((voter) => ({
      ...voter,
      encryptedPassword: undefined,
    }));

    res.json(votersWithoutEncryption);
  } catch (error) {
    console.error("Error getting voters:", error);
    res.status(500).json({ error: "Could not get voters" });
  }
};

// Delete voter
const deleteVoter = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if voter exists first
    const voter = await prisma.voter.findUnique({
      where: { id },
    });

    if (!voter) {
      return res.status(404).json({ error: "Voter not found" });
    }

    // Check if voter has participated in any elections
    const voterElectionStatus = await prisma.voterElectionStatus.findFirst({
      where: { voterId: id },
    });

    if (voterElectionStatus) {
      return res.status(400).json({
        error: "Cannot delete voter who has participated in elections",
      });
    }

    // Delete voter (this will cascade delete related records if configured)
    await prisma.voter.delete({
      where: { id },
    });

    res.json({ message: "Voter deleted successfully" });
  } catch (error) {
    console.error("Error deleting voter:", error);

    // Handle specific Prisma errors
    if (error.code === "P2003") {
      return res.status(400).json({
        error:
          "Cannot delete voter due to existing references. Voter may have participated in elections.",
      });
    }

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Voter not found" });
    }

    res.status(500).json({ error: "Could not delete voter" });
  }
};

// Reset voter password
const resetVoterPassword = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if voter exists
    const voter = await prisma.voter.findUnique({
      where: { id },
    });

    if (!voter) {
      return res.status(404).json({ error: "Voter not found" });
    }

    // Generate new password
    const newPassword = generateSecurePassword();
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update voter password (skip encryption for now)
    const updatedVoter = await prisma.voter.update({
      where: { id },
      data: {
        passwordHash: hashedPassword,
      },
    });

    res.json({
      message: "Password reset successfully",
      voter: {
        id: updatedVoter.id,
        name: updatedVoter.name,
        email: updatedVoter.email,
        voterId: updatedVoter.voterId,
      },
      newPassword: newPassword,
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Could not reset password" });
  }
};

// Helper function to generate unique voter ID
function generateVoterId() {
  const prefix = "VTR";
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

// Helper function to generate secure password
function generateSecurePassword() {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Export voter management functions
exports.bulkRegisterVoters = bulkRegisterVoters;
exports.getAllVoters = getAllVoters;
exports.deleteVoter = deleteVoter;
exports.resetVoterPassword = resetVoterPassword;
