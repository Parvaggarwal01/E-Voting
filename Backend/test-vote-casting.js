const { PrismaClient } = require("@prisma/client");
const { ethers } = require("ethers");

const prisma = new PrismaClient();

async function testVoteCasting() {
  try {
    console.log("🗳️ Testing vote casting...");

    // Get the first voter and election
    const voter = await prisma.voter.findFirst();
    const election = await prisma.election.findFirst({
      include: { parties: true },
    });

    if (!voter || !election) {
      console.log("❌ No voter or election found");
      return;
    }

    console.log(`👤 Voter: ${voter.name} (${voter.id})`);
    console.log(`🏛️ Election: ${election.name} (${election.id})`);
    console.log(
      `🎯 Parties: ${election.parties.map((p) => p.name).join(", ")}`
    );

    // Load blockchain config
    const blockchainConfig = require("../Frontend/src/config/blockchain.json");

    // Setup blockchain connection using environment variables for RPC
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const ecWallet = new ethers.Wallet(process.env.EC_PRIVATE_KEY, provider);
    const voteStorageContract = new ethers.Contract(
      blockchainConfig.contractAddress,
      blockchainConfig.contractABI,
      ecWallet
    );

    // Prepare vote data
    const partyId = election.parties[0].id; // Vote for first party
    const voteHash = ethers.keccak256(
      ethers.toUtf8Bytes(
        `${partyId}-${voter.id}-${Date.now()}-${Math.random()}`
      )
    );
    const blindSignature = ethers.keccak256(
      ethers.toUtf8Bytes("test-signature")
    );

    console.log(`🔗 Casting vote for party: ${election.parties[0].name}`);
    console.log(`📋 Vote hash: ${voteHash}`);
    console.log(`🏛️ Election ID: ${election.id}`);

    // Cast vote on blockchain (VotingSystem.castVote: voteHash, electionId, partyId, blindSignature)
    const tx = await voteStorageContract.castVote(
      voteHash, // bytes32 - First parameter
      election.id, // string - Second parameter (database election UUID)
      partyId, // string - Third parameter
      blindSignature // bytes32 - Fourth parameter
    );

    console.log(`⏳ Transaction sent: ${tx.hash}`);
    await tx.wait();
    console.log(`✅ Vote cast successfully on blockchain!`);

    // Mark voter as voted in database
    await prisma.voterElectionStatus.create({
      data: {
        voterId: voter.id,
        electionId: election.id,
      },
    });

    // Create receipt
    await prisma.receipt.create({
      data: {
        receiptCode: tx.hash,
        electionId: election.id,
      },
    });

    console.log(`✅ Vote recorded in database with receipt: ${tx.hash}`);

    // Check blockchain stats
    const voteCount = await voteStorageContract.voteCount();
    console.log(`📊 Total votes on blockchain: ${voteCount}`);
  } catch (error) {
    console.error("❌ Vote casting failed:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testVoteCasting();
