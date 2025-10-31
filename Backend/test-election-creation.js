const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testElectionCreation() {
  try {
    console.log("🗳️ Creating test election...");

    // Get party IDs
    const parties = await prisma.party.findMany();
    console.log(
      "📋 Available parties:",
      parties.map((p) => `${p.name} (${p.id})`)
    );

    if (parties.length < 2) {
      console.log("❌ Need at least 2 parties to create election");
      return;
    }

    const partyIds = parties.slice(0, 2).map((p) => p.id);
    console.log("🎯 Using parties:", partyIds);

    console.log(`🏛️ Creating election in database only (not blockchain)`);

    // Create election only in database (not blockchain anymore)
    const electionName = "Prime Minister Election 2025";
    const newElection = await prisma.election.create({
      data: {
        name: electionName,
        startDate: new Date("2025-10-31T22:00:00Z"),
        endDate: new Date("2025-10-31T23:00:00Z"),
        parties: {
          connect: partyIds.map((id) => ({ id })),
        },
      },
      include: { parties: true },
    });

    console.log(`✅ Election created in database:`, {
      id: newElection.id,
      name: newElection.name,
      parties: newElection.parties.map((p) => p.name),
    });
  } catch (error) {
    console.error("❌ Election creation error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testElectionCreation();
