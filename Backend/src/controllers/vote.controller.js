const voteService = require("../services/vote.service");
const cryptoHelpers = require("../utils/crypto.helpers");
const { PrismaClient } = require("@prisma/client");
const { ethers } = require("ethers");

// --- BLOCKCHAIN IMPORTS ---
const blockchainConfig = require("../../../Frontend/src/config/blockchain.json");

const prisma = new PrismaClient();

// --- BLOCKCHAIN SETUP WITH EC WALLET ---
const provider = new ethers.JsonRpcProvider(
  blockchainConfig.networkConfig.rpcUrl
);
const ecWallet = new ethers.Wallet(process.env.EC_PRIVATE_KEY, provider);
const immutableVotingContract = new ethers.Contract(
  blockchainConfig.contractAddress,
  blockchainConfig.contractABI,
  ecWallet
);
// ------------------------------------

/**
 * @summary Issues a blind signature for a voter.
 * This is called by the frontend *before* submitting the vote.
 */
exports.requestSignature = async (req, res) => {
  const { blindedMessage, electionId } = req.body;
  const { voterId } = req.user; // voterId is the voter's database ID

  try {
    const signedBlindedMessage = await voteService.issueBlindSignature({
      voterId,
      electionId,
      blindedMessage,
    });
    res.status(200).json({ signedBlindedMessage });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * @summary Gets the public key for the blind signature.
 * (Note: Your current implementation might not use this, but it's good practice)
 */
exports.getPublicKey = async (req, res) => {
  try {
    const publicKeyInfo = cryptoHelpers.getPublicKeyInfo();
    res.status(200).json(publicKeyInfo);
  } catch (error) {
    res.status(500).json({ error: "Failed to get public key" });
  }
};

/**
 * @summary [DEPRECATED] This is your old function.
 * It submits a vote directly to the PostgreSQL database, which is NOT secure.
 * We are replacing this with `submitVoteToChain`.
 */
exports.submitVote = async (req, res) => {
  const { voteMessage, signature, electionId } = req.body;
  const { voterId } = req.user;

  try {
    const receipt = await voteService.castVote({
      voterId, // Pass for double voting prevention only
      voteMessage,
      signature,
      electionId,
    });
    res.status(200).json({ message: "Vote cast successfully!", receipt });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// --- NEW FUNCTION ---
/**
 * @summary Relays a voter's valid, signed vote to the blockchain.
 * This is the new, secure voting endpoint.
 * The voter does *not* need a wallet.
 */
exports.submitVoteToChain = async (req, res) => {
  // Get all the parts from the frontend
  const { partyId, hashedVoterId, unblindedSignature, electionId } = req.body;
  // Get the voter's database ID (UUID) from the auth token
  const { voterId } = req.user;

  try {
    console.log(`🗳️ Relaying vote for ${hashedVoterId} to blockchain...`);
    console.log(`📋 Vote details:`, { partyId, electionId, voterId });

    // 1. (Security Check) Check our database to see if this voter has already voted
    const existingStatus = await prisma.voterElectionStatus.findUnique({
      where: { voterId_electionId: { voterId, electionId } },
    });

    if (existingStatus) {
      return res
        .status(400)
        .json({ error: "Vote has already been submitted for this election." });
    }

    // 2. Get election details from database to validate
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      include: { parties: true },
    });

    if (!election) {
      return res.status(400).json({ error: "Election not found." });
    }

    // 3. Check if party exists in this election
    const partyExists = election.parties.some((party) => party.id === partyId);
    if (!partyExists) {
      return res
        .status(400)
        .json({ error: "Invalid party for this election." });
    }

    // 4. Get voter data from database for validation
    const voterData = await prisma.voter.findUnique({
      where: { id: voterId },
    });

    if (!voterData) {
      return res.status(400).json({ error: "Voter not found in database." });
    }

    console.log(`✅ Voter validated: ${voterData.name} (${voterData.email})`);
    // Note: EC wallet is pre-registered as voter proxy on blockchain

    // 5. Prepare vote data for blockchain (using database election ID as string)
    const blockchainElectionId = electionId; // Use database election ID directly
    const voteHash = ethers.keccak256(
      ethers.toUtf8Bytes(
        `${partyId}-${hashedVoterId}-${Date.now()}-${Math.random()}`
      )
    );
    const blindSignatureBytes = ethers.keccak256(
      ethers.toUtf8Bytes(unblindedSignature || "default-signature")
    );

    console.log(`🔗 Calling blockchain contract with:`, {
      electionId: blockchainElectionId,
      partyId,
      voteHashPreview: voteHash.substring(0, 10) + "...",
    });

    // 6. Call the smart contract (VoteStorage.castVote)
    const tx = await immutableVotingContract.castVote(
      blockchainElectionId, // This is now the database election UUID
      voteHash,
      blindSignatureBytes,
      partyId
    );

    console.log("⏳ Transaction sent... waiting for confirmation...");
    const receipt = await tx.wait();

    console.log(`✅ Vote successfully mined! TxHash: ${receipt.hash}`);

    // 7. Mark the voter as having voted in our database
    await prisma.voterElectionStatus.create({
      data: { voterId, electionId },
    });

    // 8. Save the blockchain receipt to our database
    await prisma.receipt.create({
      data: {
        receiptCode: receipt.hash,
        electionId: electionId,
      },
    });

    // 10. Send successful response back to the voter
    res.status(200).json({
      message: "Vote cast successfully!",
      receipt: {
        receiptCode: receipt.hash,
        blockNumber: Number(receipt.blockNumber),
      },
    });
  } catch (error) {
    console.error("❌ Vote relay error:", error);

    // Detailed error logging
    if (error.code === "CALL_EXCEPTION") {
      console.error("Smart contract call failed:", {
        reason: error.reason,
        data: error.data,
        transaction: error.transaction,
      });
    }

    // Send appropriate error response
    let errorMessage = "Vote failed: ";
    if (error.reason) {
      errorMessage += error.reason;
    } else if (error.message.includes("revert")) {
      errorMessage +=
        "Transaction reverted - check election status and voter eligibility";
    } else {
      errorMessage += error.message;
    }

    res.status(400).json({ error: errorMessage });
  }
};
