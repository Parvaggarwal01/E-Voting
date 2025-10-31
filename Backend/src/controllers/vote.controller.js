const voteService = require("../services/vote.service");
const cryptoHelpers = require("../utils/crypto.helpers");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.requestSignature = async (req, res) => {
  const { blindedMessage, electionId } = req.body;
  const { voterId } = req.user;

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

exports.getPublicKey = async (req, res) => {
  try {
    const publicKeyInfo = cryptoHelpers.getPublicKeyInfo();
    res.status(200).json(publicKeyInfo);
  } catch (error) {
    res.status(500).json({ error: "Failed to get public key" });
  }
};

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
