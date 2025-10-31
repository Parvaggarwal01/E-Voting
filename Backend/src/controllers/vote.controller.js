const voteService = require("../services/vote.service");
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

exports.submitVote = async (req, res) => {
  const { voteMessage, signature, electionId } = req.body;

  try {
    const receipt = await voteService.castVote({
      voteMessage,
      signature,
      electionId,
    });
    res.status(200).json({ message: "Vote cast successfully!", receipt });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
