const axios = require("axios");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testResultsAPI() {
  try {
    console.log("🧪 Testing results API...");

    // Get the first election
    const election = await prisma.election.findFirst();
    if (!election) {
      console.log("❌ No election found");
      return;
    }

    console.log(`🏛️ Testing election: ${election.name} (${election.id})`);

    // Test the API endpoint
    const response = await axios.get(
      `http://localhost:8000/api/admin/elections/${election.id}/stats`
    );

    console.log("✅ API Response:");
    console.log("Total Votes:", response.data.totalVotes);
    console.log("Results:");
    response.data.results.forEach((result) => {
      console.log(`  ${result.party.name}: ${result.voteCount} votes`);
    });
  } catch (error) {
    console.error(
      "❌ Error:",
      error.response ? error.response.data : error.message
    );
  } finally {
    await prisma.$disconnect();
  }
}

testResultsAPI();
