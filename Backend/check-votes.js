const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkVotes() {
  console.log("🗳️ Checking CentralBallotBox votes...");
  const votes = await prisma.centralBallotBox.findMany({
    orderBy: { createdAt: "desc" },
  });
  console.log("Total votes in CentralBallotBox:", votes.length);
  votes.forEach((vote, i) => {
    console.log(`Vote ${i + 1}:`, {
      id: vote.id,
      electionId: vote.electionId,
      createdAt: vote.createdAt,
      voteMessage: JSON.parse(vote.voteMessage),
    });
  });

  console.log("\n📋 Checking receipts...");
  const receipts = await prisma.receipt.findMany({
    orderBy: { createdAt: "desc" },
  });
  console.log("Total receipts:", receipts.length);
  receipts.forEach((receipt, i) => {
    console.log(`Receipt ${i + 1}:`, {
      receiptCode: receipt.receiptCode,
      electionId: receipt.electionId,
      createdAt: receipt.createdAt,
    });
  });

  await prisma.$disconnect();
}

checkVotes().catch(console.error);
