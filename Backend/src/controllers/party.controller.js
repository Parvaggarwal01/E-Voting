const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// Get party profile
exports.getPartyProfile = async (req, res) => {
  try {
    const partyId = req.user.partyId || req.user.userId;

    const party = await prisma.party.findUnique({
      where: { id: partyId },
      select: {
        id: true,
        name: true,
        email: true,
        symbolUrl: true,
        isVerified: true,
        createdAt: true,
        elections: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
        results: {
          select: {
            electionId: true,
            voteCount: true,
            percentage: true,
            isPublished: true,
            election: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!party) {
      return res.status(404).json({ error: "Party not found" });
    }

    res.status(200).json(party);
  } catch (error) {
    console.error("Get party profile error:", error);
    res.status(500).json({ error: "Could not fetch party profile" });
  }
};

// Update party profile
exports.updatePartyProfile = async (req, res) => {
  try {
    const partyId = req.user.partyId || req.user.userId;
    const { name, symbolUrl } = req.body;

    if (!name && !symbolUrl) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (symbolUrl) updateData.symbolUrl = symbolUrl;

    const updatedParty = await prisma.party.update({
      where: { id: partyId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        symbolUrl: true,
        isVerified: true,
        createdAt: true,
      },
    });

    res.status(200).json(updatedParty);
  } catch (error) {
    console.error("Update party profile error:", error);
    if (error.code === "P2002") {
      res.status(400).json({ error: "Party name already exists" });
    } else {
      res.status(500).json({ error: "Could not update party profile" });
    }
  }
};

// Change party password
exports.changePartyPassword = async (req, res) => {
  try {
    const partyId = req.user.partyId || req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters long.",
      });
    }

    // Get current party
    const party = await prisma.party.findUnique({
      where: { id: partyId },
    });

    if (!party) {
      return res.status(404).json({ error: "Party not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      party.passwordHash
    );

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        error: "Current password is incorrect.",
      });
    }

    // Hash new password and update
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.party.update({
      where: { id: partyId },
      data: { passwordHash: newPasswordHash },
    });

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change party password error:", error);
    res.status(500).json({ error: "Could not change password" });
  }
};

// Get party elections
exports.getPartyElections = async (req, res) => {
  try {
    const partyId = req.user.partyId || req.user.userId;

    const elections = await prisma.election.findMany({
      where: {
        parties: {
          some: { id: partyId },
        },
      },
      include: {
        status: true,
        results: {
          where: { partyId: partyId },
          select: {
            voteCount: true,
            percentage: true,
            isPublished: true,
          },
        },
        parties: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { startDate: "desc" },
    });

    res.status(200).json(elections);
  } catch (error) {
    console.error("Get party elections error:", error);
    res.status(500).json({ error: "Could not fetch elections" });
  }
};

// Upload manifesto (placeholder for now - will integrate with AI service)
exports.uploadManifesto = async (req, res) => {
  try {
    const partyId = req.user.partyId || req.user.userId;

    // For now, just return success - will integrate with AI service
    res.status(200).json({
      message: "Manifesto upload endpoint ready",
      partyId: partyId,
      note: "Will integrate with AI service for PDF processing",
    });
  } catch (error) {
    console.error("Upload manifesto error:", error);
    res.status(500).json({ error: "Could not upload manifesto" });
  }
};

// Get party dashboard stats
exports.getPartyDashboard = async (req, res) => {
  try {
    const partyId = req.user.partyId || req.user.userId;

    // Get party info
    const party = await prisma.party.findUnique({
      where: { id: partyId },
      select: { name: true, isVerified: true, createdAt: true },
    });

    // Get election statistics
    const totalElections = await prisma.election.count({
      where: {
        parties: {
          some: { id: partyId },
        },
      },
    });

    // Get current elections (active ones)
    const now = new Date();
    const activeElections = await prisma.election.count({
      where: {
        parties: {
          some: { id: partyId },
        },
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    // Get total votes received
    const voteResults = await prisma.electionResult.findMany({
      where: { partyId: partyId },
      select: { voteCount: true },
    });

    const totalVotes = voteResults.reduce(
      (sum, result) => sum + result.voteCount,
      0
    );

    // Get recent elections
    const recentElections = await prisma.election.findMany({
      where: {
        parties: {
          some: { id: partyId },
        },
      },
      include: {
        status: true,
        results: {
          where: { partyId: partyId },
          select: { voteCount: true, percentage: true, isPublished: true },
        },
      },
      orderBy: { startDate: "desc" },
      take: 5,
    });

    res.status(200).json({
      party: party,
      stats: {
        totalElections,
        activeElections,
        totalVotes,
        isVerified: party?.isVerified || false,
      },
      recentElections: recentElections.map((election) => ({
        id: election.id,
        name: election.name,
        startDate: election.startDate,
        endDate: election.endDate,
        status: getElectionStatus(election),
        result: election.results[0] || null,
      })),
    });
  } catch (error) {
    console.error("Get party dashboard error:", error);
    res.status(500).json({ error: "Could not fetch dashboard data" });
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
