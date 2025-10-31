const { PrismaClient } = require("@prisma/client");
const { ethers } = require("ethers");

const prisma = new PrismaClient();

async function syncVotersToNewContract() {
  try {
    console.log("🔄 Syncing voters to new VoteStorage contract...");

    // Load blockchain config
    const blockchainConfig = require("../../Frontend/src/config/blockchain.json");

    // Setup blockchain connection
    const provider = new ethers.JsonRpcProvider(
      blockchainConfig.networkConfig.rpcUrl
    );
    const ecWallet = new ethers.Wallet(process.env.EC_PRIVATE_KEY, provider);

    console.log(`💰 Using EC wallet: ${ecWallet.address}`);

    // Connect to the new VoteStorage contract
    const voteStorageContract = new ethers.Contract(
      blockchainConfig.contractAddress,
      blockchainConfig.contractABI,
      ecWallet
    );

    // Get voters from database
    const voters = await prisma.voter.findMany();
    console.log(`📊 Found ${voters.length} voters in database`);

    if (voters.length === 0) {
      console.log("⚠️ No voters found in database");
      return;
    }

    let registered = 0;
    let alreadyRegistered = 0;
    let errors = 0;

    for (const voter of voters) {
      try {
        console.log(`\n📝 Processing voter: ${voter.name} (${voter.voterId})`);

        // Generate a unique address for this voter (since they don't have wallets)
        const voterAddressHash = ethers.keccak256(ethers.toUtf8Bytes(voter.id));
        const voterAddress = "0x" + voterAddressHash.slice(26); // Take last 20 bytes as address

        // Check if voter is already registered
        try {
          const existingVoter = await voteStorageContract.getVoter(
            voterAddress
          );
          if (existingVoter.isActive) {
            console.log(`ℹ️ ${voter.name} already registered`);
            alreadyRegistered++;
            continue;
          }
        } catch (e) {
          // Voter not found, proceed to register
        }

        // Create encrypted data
        const aadhaarHash = ethers.keccak256(
          ethers.toUtf8Bytes(voter.aadhaarNumber || voter.id)
        );
        const encryptedName = Buffer.from(voter.name || "").toString("base64");
        const encryptedEmail = Buffer.from(voter.email || "").toString(
          "base64"
        );

        console.log(`🔐 Registering with address: ${voterAddress}`);

        // Register voter on blockchain
        const tx = await voteStorageContract.registerVoter(
          voterAddress,
          aadhaarHash,
          encryptedName,
          encryptedEmail
        );

        console.log(`⏳ Transaction sent: ${tx.hash}`);
        await tx.wait();

        console.log(`✅ ${voter.name} registered on blockchain`);
        registered++;
      } catch (error) {
        console.log(`❌ Failed to register ${voter.name}:`, error.message);
        errors++;
      }
    }

    console.log(`\n📊 SYNC RESULTS:`);
    console.log(`✅ Newly registered: ${registered}`);
    console.log(`ℹ️ Already registered: ${alreadyRegistered}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📋 Total processed: ${voters.length}`);

    // Get updated blockchain total
    const totalVoters = await voteStorageContract.voterCount();
    console.log(`🔗 Updated blockchain total: ${totalVoters} voters`);
  } catch (error) {
    console.error("❌ Sync failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

syncVotersToNewContract();
