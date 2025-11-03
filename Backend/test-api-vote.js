const axios = require("axios");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testAPIVote() {
  try {
    console.log("🧪 Testing API vote casting...");

    // Get test data
    const voter = await prisma.voter.findFirst();
    const election = await prisma.election.findFirst({
      include: { parties: true },
    });

    if (!voter || !election) {
      console.log("❌ No voter or election found");
      return;
    }

    console.log(`👤 Voter: ${voter.name}`);
    console.log(`🏛️ Election: ${election.name}`);
    console.log(`🎯 Party: ${election.parties[0].name}`);

    // Prepare vote data
    const voteData = {
      partyId: election.parties[0].id,
      hashedVoterId: "test-hashed-voter-id-" + Date.now(),
      unblindedSignature: "0x1234567890abcdef",
      electionId: election.id,
    };

    console.log("📤 Sending vote to API...");

    // Make API call
    const response = await axios.post(
      "http://localhost:8000/api/vote/submit-to-chain",
      voteData
    );

    console.log("✅ API Response:", response.data);

    // Check if receipt structure is correct
    if (
      response.data.data &&
      response.data.data.receipt &&
      response.data.data.receipt.receiptCode
    ) {
      console.log("🧾 Receipt found:", response.data.data.receipt.receiptCode);
      console.log("✅ Receipt structure is correct!");
    } else {
      console.log("❌ Receipt structure is incorrect");
      console.log(
        "Response structure:",
        JSON.stringify(response.data, null, 2)
      );
    }
  } catch (error) {
    console.error(
      "❌ Error:",
      error.response ? error.response.data : error.message
    );
  } finally {
    await prisma.$disconnect();
  }
}

testAPIVote();
