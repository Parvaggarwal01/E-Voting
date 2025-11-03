const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkResults() {
  console.log("📊 Checking election results...");

  // Get all elections
  const elections = await prisma.election.findMany({
    include: { parties: true },
  });

  for (const election of elections) {
    console.log(`\n🏛️ Election: ${election.name} (${election.id})`);

    // Count votes in CentralBallotBox for this election
    const votes = await prisma.centralBallotBox.findMany({
      where: { electionId: election.id },
    });

    console.log(`Total votes cast: ${votes.length}`);

    // Parse votes and count by party
    const partyCounts = {};
    election.parties.forEach((party) => {
      partyCounts[party.id] = {
        name: party.name,
        count: 0,
      };
    });

    votes.forEach((vote) => {
      const voteData = JSON.parse(vote.voteMessage);
      if (partyCounts[voteData.partyId]) {
        partyCounts[voteData.partyId].count++;
      }
    });

    // Display results
    console.log("📊 Results:");
    Object.entries(partyCounts).forEach(([partyId, data]) => {
      console.log(`  ${data.name}: ${data.count} votes`);
    });
  }

  await prisma.$disconnect();
}

checkResults().catch(console.error);
