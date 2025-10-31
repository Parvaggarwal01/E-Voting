const { PrismaClient } = require("@prisma/client");
const { ethers } = require("ethers");
const blockchainConfig = require("../../Frontend/src/config/blockchain.json");

const prisma = new PrismaClient();

async function syncDatabaseVotersToBlockchain() {
  try {
    console.log("🔄 Syncing database voters to blockchain...");

    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(
      blockchainConfig.networkConfig.rpcUrl
    );
    const ecWallet = new ethers.Wallet(
      process.env.EC_PRIVATE_KEY ||
        "0xcee72762ca55b8d09caeb2b111a8748eb566a70c874d50abf3f9de1bea2a6e98",
      provider
    );
    const contract = new ethers.Contract(
      blockchainConfig.contractAddress,
      blockchainConfig.contractABI,
      ecWallet
    );

    console.log("💰 Using EC wallet:", ecWallet.address);

    // Get all voters from database
    const dbVoters = await prisma.voter.findMany({
      select: {
        id: true,
        voterId: true,
        name: true,
        email: true,
        aadhaarNumber: true,
        createdAt: true,
      },
    });

    console.log(`📊 Found ${dbVoters.length} voters in database`);

    if (dbVoters.length === 0) {
      console.log("⚠️ No voters found in database");
      return;
    }

    let registered = 0;
    let skipped = 0;
    let errors = 0;

    for (const voter of dbVoters) {
      try {
        console.log(`\n📝 Processing voter: ${voter.name} (${voter.voterId})`);

        // Prepare blockchain data
        const hashedAadhaar = ethers.keccak256(
          ethers.toUtf8Bytes(voter.aadhaarNumber)
        );
        const encryptedName = Buffer.from(voter.name).toString("base64");
        const encryptedEmail = Buffer.from(voter.email).toString("base64");
        const voterAddress = ethers.Wallet.createRandom().address; // Generate unique address

        // Try to register on blockchain
        const tx = await contract.registerVoter(
          voterAddress,
          hashedAadhaar,
          encryptedName,
          encryptedEmail
        );

        console.log(`⏳ Transaction sent: ${tx.hash}`);
        await tx.wait();

        console.log(`✅ ${voter.name} registered on blockchain`);
        registered++;
      } catch (error) {
        if (error.message.includes("Voter already registered")) {
          console.log(`ℹ️ ${voter.name} already registered on blockchain`);
          skipped++;
        } else {
          console.log(`❌ Failed to register ${voter.name}: ${error.message}`);
          errors++;
        }
      }
    }

    console.log(`\n📊 SYNC RESULTS:`);
    console.log(`✅ Newly registered: ${registered}`);
    console.log(`ℹ️ Already registered: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📋 Total processed: ${dbVoters.length}`);

    // Show updated blockchain stats
    const totalVoters = await contract.getTotalVoters();
    console.log(
      `\n🔗 Updated blockchain total: ${totalVoters.toString()} voters`
    );
  } catch (error) {
    console.error("❌ Sync failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync
if (require.main === module) {
  syncDatabaseVotersToBlockchain();
}

module.exports = { syncDatabaseVotersToBlockchain };
