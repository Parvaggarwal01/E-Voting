const { PrismaClient } = require("@prisma/client");
const cryptoHelpers = require("../utils/crypto.helpers");

const prisma = new PrismaClient();

exports.issueBlindSignature = async ({
  voterId,
  electionId,
  blindedMessage,
}) => {
  const existingVoteStatus = await prisma.voterElectionStatus.findUnique({
    where: { voterId_electionId: { voterId, electionId } },
  });

  if (existingVoteStatus) {
    throw new Error(
      "You have already requested a signature for this election."
    );
  }

  const signedBlindedVote = cryptoHelpers.signBlindedMessage({
    blindedMessage,
  });

  await prisma.voterElectionStatus.create({
    data: { voterId, electionId },
  });

  return signedBlindedVote;
};

exports.castVote = async ({ voteMessage, signature, electionId }) => {
  console.log("🔍 Verifying vote signature...");
  console.log("Vote Message:", voteMessage);
  console.log("Signature:", signature);
  console.log("Signature Type:", typeof signature);
  console.log("Signature Length:", signature ? signature.length : 0);

  const isValid = cryptoHelpers.verifySignature({
    signature: signature,
    originalMessage: voteMessage,
  });

  console.log("Verification Result:", isValid);

  if (!isValid) {
    throw new Error("Invalid vote signature. The vote is rejected.");
  }

  const lastEntry = await prisma.centralBallotBox.findFirst({
    orderBy: { createdAt: "desc" },
  });
  const previousEntryHash = lastEntry ? lastEntry.currentEntryHash : null;

  const newEntryData = {
    voteMessage,
    voteSignature: signature,
    previousEntryHash,
  };
  const currentEntryHash = cryptoHelpers.hashData(newEntryData);

  await prisma.centralBallotBox.create({
    data: {
      voteMessage,
      voteSignature: signature,
      previousEntryHash,
      currentEntryHash,
      electionId,
    },
  });

  const receiptCode = cryptoHelpers.generateReceipt(currentEntryHash);
  console.log("🧾 Generated receipt code:", receiptCode);

  // Create anonymous receipt - no voter association
  const receipt = await prisma.receipt.create({
    data: {
      receiptCode,
      electionId,
    },
  });
  console.log("✅ Receipt saved to database:", receipt);

  const result = { receiptCode };
  console.log("📤 Returning receipt result:", result);
  return result;
};
