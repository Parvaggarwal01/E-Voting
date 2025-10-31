const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkElections() {
  try {
    console.log("🔍 Checking elections in database...");

    const elections = await prisma.election.findMany({
      include: { parties: true },
    });

    console.log(`📊 Found ${elections.length} elections in database:`);

    elections.forEach((election, index) => {
      console.log(`\nElection ${index + 1}:`);
      console.log(`  Database ID: ${election.id}`);
      console.log(`  Name: ${election.name}`);
      console.log(`  Start: ${election.startDate}`);
      console.log(`  End: ${election.endDate}`);
      console.log(
        `  Parties: ${election.parties.map((p) => p.name).join(", ")}`
      );

      // Show what blockchain ID would be generated
      const blockchainId =
        parseInt(election.id.replace(/[^0-9]/g, "")) ||
        Math.floor(Math.random() * 1000000);
      console.log(`  Blockchain ID (generated): ${blockchainId}`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkElections();
