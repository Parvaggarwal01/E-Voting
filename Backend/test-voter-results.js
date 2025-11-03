const axios = require("axios");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testVoterResultsAPI() {
  try {
    console.log("🧪 Testing voter results API...");

    // Get the first election
    const election = await prisma.election.findFirst();
    if (!election) {
      console.log("❌ No election found");
      return;
    }

    console.log(`🏛️ Testing election: ${election.name} (${election.id})`);

    // First, make sure results are published
    console.log("📢 Publishing results first...");
    try {
      await axios.post(
        `http://localhost:8000/api/admin/elections/${election.id}/publish-results`,
        {
          publish: true,
        }
      );
      console.log("✅ Results published");
    } catch (error) {
      console.log(
        "⚠️ Error publishing results (may already be published):",
        error.response?.data || error.message
      );
    }

    // Test the voter results API endpoint
    console.log("🔍 Fetching voter results...");
    const response = await axios.get(
      `http://localhost:8000/api/public/elections/${election.id}/results`
    );

    console.log("✅ Voter API Response:");
    console.log("Election:", response.data.election.name);
    console.log("Total Votes:", response.data.totalVotes);
    console.log(
      "Winner:",
      response.data.winner ? response.data.winner.party.name : "None"
    );
    console.log("Results:");
    response.data.results.forEach((result) => {
      console.log(
        `  ${result.party.name}: ${result.voteCount} votes (${result.percentage}%)`
      );
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

testVoterResultsAPI();
