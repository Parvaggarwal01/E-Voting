const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getElections = async (req, res) => {
  try {
    const elections = await prisma.election.findMany({
      include: { parties: true },
    });
    res.status(200).json(elections);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch elections." });
  }
};

exports.getElectionDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const election = await prisma.election.findUnique({
      where: { id },
      include: { parties: true },
    });
    if (!election) {
      return res.status(404).json({ error: "Election not found." });
    }
    res.status(200).json(election);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch election details." });
  }
};

exports.getReceiptsForElection = async (req, res) => {
  const { id } = req.params;
  try {
    const receipts = await prisma.receipt.findMany({
      where: { electionId: id },
      select: { receiptCode: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    res.status(200).json(receipts);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch receipts." });
  }
};

exports.getParties = async (req, res) => {
  try {
    const parties = await prisma.party.findMany({
      orderBy: { name: "asc" },
    });
    res.status(200).json(parties);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch parties." });
  }
};

// Get published election results
exports.getElectionResults = async (req, res) => {
  const { id } = req.params;

  try {
    const election = await prisma.election.findUnique({
      where: { id },
      include: {
        parties: true,
        status: true,
        results: {
          where: { isPublished: true },
          include: { party: true },
          orderBy: [
            { voteCount: "desc" },
            { party: { name: "asc" } }, // Tie-breaker
          ],
        },
      },
    });

    if (!election) {
      return res.status(404).json({ error: "Election not found" });
    }

    if (!election.status?.resultsPublished) {
      return res.status(403).json({ error: "Results not yet published" });
    }

    const totalVotes = election.status.totalVotes;

    // Check for draw/tie
    const highestVoteCount =
      election.results.length > 0 ? election.results[0].voteCount : 0;
    const winnersCount = election.results.filter(
      (r) => r.voteCount === highestVoteCount && r.voteCount > 0
    ).length;
    const isDraw = winnersCount > 1 && highestVoteCount > 0;

    const winner =
      !isDraw && election.results.length > 0 ? election.results[0] : null;
    const drawParties = isDraw
      ? election.results.filter((r) => r.voteCount === highestVoteCount)
      : [];

    res.status(200).json({
      election: {
        id: election.id,
        name: election.name,
        startDate: election.startDate,
        endDate: election.endDate,
      },
      status: election.status,
      totalVotes,
      winner: winner
        ? {
            party: winner.party,
            voteCount: winner.voteCount,
            percentage: winner.percentage,
          }
        : null,
      isDraw,
      drawParties: drawParties.map((party) => ({
        party: {
          id: party.party.id,
          name: party.party.name,
          symbolUrl: party.party.symbolUrl,
        },
        voteCount: party.voteCount,
        percentage: party.percentage,
      })),
      results: election.results.map((result) => ({
        party: {
          id: result.party.id,
          name: result.party.name,
          symbolUrl: result.party.symbolUrl,
        },
        voteCount: result.voteCount,
        percentage: result.percentage,
        publishedAt: result.publishedAt,
      })),
    });
  } catch (error) {
    console.error("Error getting election results:", error);
    res.status(500).json({ error: "Could not get election results" });
  }
};

// Get election status and basic stats
exports.getElectionStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const election = await prisma.election.findUnique({
      where: { id },
      include: {
        status: true,
        voterStatuses: true,
      },
    });

    if (!election) {
      return res.status(404).json({ error: "Election not found" });
    }

    const now = new Date();
    let currentStatus = "UPCOMING";

    if (
      now >= new Date(election.startDate) &&
      now <= new Date(election.endDate)
    ) {
      currentStatus = "ACTIVE";
    } else if (now > new Date(election.endDate)) {
      currentStatus = election.status?.resultsPublished
        ? "RESULTS_PUBLISHED"
        : "COMPLETED";
    }

    const totalRegisteredVoters = await prisma.voter.count();
    const votersWhoVoted = election.voterStatuses.length;

    res.status(200).json({
      electionId: id,
      name: election.name,
      startDate: election.startDate,
      endDate: election.endDate,
      status: currentStatus,
      resultsPublished: election.status?.resultsPublished || false,
      statistics: {
        totalRegisteredVoters,
        votersWhoVoted,
        turnoutPercentage:
          totalRegisteredVoters > 0
            ? Math.round((votersWhoVoted / totalRegisteredVoters) * 10000) / 100
            : 0,
      },
    });
  } catch (error) {
    console.error("Error getting election status:", error);
    res.status(500).json({ error: "Could not get election status" });
  }
};

// Verify a receipt code
exports.verifyReceipt = async (req, res) => {
  const { receiptCode } = req.params;

  try {
    const receipt = await prisma.receipt.findUnique({
      where: { receiptCode },
    });

    if (!receipt) {
      return res.status(404).json({
        valid: false,
        error: "Receipt not found",
      });
    }

    // Fetch the election details separately
    const election = await prisma.election.findUnique({
      where: { id: receipt.electionId },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
      },
    });

    if (!election) {
      return res.status(404).json({
        valid: false,
        error: "Election not found for this receipt",
      });
    }

    res.status(200).json({
      valid: true,
      receipt: {
        receiptCode: receipt.receiptCode,
        electionName: election.name,
        electionId: election.id,
        timestamp: receipt.createdAt,
        verificationDate: new Date(),
      },
    });
  } catch (error) {
    console.error("Error verifying receipt:", error);
    res.status(500).json({
      valid: false,
      error: "Could not verify receipt",
    });
  }
};
