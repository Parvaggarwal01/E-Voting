const { PrismaClient } = require("@prisma/client");
const cryptoHelpers = require("../utils/crypto.helpers");

const prisma = new PrismaClient();

exports.issueBlindSignature = async ({
  voterId,
  electionId,
  blindedMessage,
}) => {
  console.log("🔐 Processing blind signature request...");
  console.log("Voter ID:", voterId);
  console.log("Election ID:", electionId);
  console.log("Blinded message (EC cannot see vote content):", blindedMessage.substring(0, 50) + "...");

  // Check if voter has already requested a signature for this election
  const existingVoteStatus = await prisma.voterElectionStatus.findUnique({
    where: { voterId_electionId: { voterId, electionId } },
  });

  if (existingVoteStatus) {
    throw new Error(
      "You have already requested a signature for this election."
    );
  }

  // CRITICAL: Sign the blinded message WITHOUT knowing its content
  // The EC cannot see what party the voter is voting for
  const signedBlindedVote = cryptoHelpers.signBlindedMessage({
    blindedMessage,
  });

  // Record that this voter has used their signature for this election
  // This prevents double voting but doesn't link the vote content to the voter
  await prisma.voterElectionStatus.create({
    data: { voterId, electionId },
  });

  console.log("✅ Blind signature issued (vote content remains private)");
  return signedBlindedVote;
};

exports.castVote = async ({ voteMessage, signature, electionId }) => {
  console.log("🔍 Verifying anonymous vote signature...");
  console.log("Vote Message:", voteMessage);
  console.log("Signature Type:", typeof signature);
  console.log("Signature Length:", signature ? signature.length : 0);

  // Verify the unblinded signature against the original message
  const isValid = cryptoHelpers.verifySignature({
    signature: signature,
    originalMessage: voteMessage,
  });

  console.log("✅ Signature verification result:", isValid);

  if (!isValid) {
    throw new Error("Invalid vote signature. The vote is rejected.");
  }

  // Extract party ID from the vote message for ballot box storage
  let partyId;
  try {
    const parsedMessage = JSON.parse(voteMessage);
    partyId = parsedMessage.partyId;
  } catch (error) {
    // Fallback: if it's just a party ID string
    partyId = voteMessage;
  }

  console.log("📊 Recording vote for party:", partyId);

  const lastEntry = await prisma.centralBallotBox.findFirst({
    orderBy: { createdAt: "desc" },
  });
  const previousEntryHash = lastEntry ? lastEntry.currentEntryHash : null;

  const newEntryData = {
    voteMessage: partyId, // Store only party ID for counting
    voteSignature: signature,
    previousEntryHash,
  };
  const currentEntryHash = cryptoHelpers.hashData(newEntryData);

  await prisma.centralBallotBox.create({
    data: {
      voteMessage: partyId, // Store only party ID, not full message
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
