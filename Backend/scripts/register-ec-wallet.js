const { ethers } = require("ethers");
const blockchainConfig = require("../../Frontend/src/config/blockchain.json");
require("dotenv").config();

async function registerECWallet() {
  console.log("🔧 Registering EC Wallet as voter on blockchain...");

  try {
    // Connect to Sepolia
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const ecWallet = new ethers.Wallet(process.env.EC_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(
      blockchainConfig.contractAddress,
      blockchainConfig.contractABI,
      ecWallet
    );

    const ecAddress = await ecWallet.getAddress();
    console.log("📍 EC Wallet Address:", ecAddress);
    console.log("📍 Contract Address:", blockchainConfig.contractAddress);

    // Check if already registered
    try {
      const existingVoter = await contract.voters(ecAddress);
      if (existingVoter.isRegistered) {
        console.log("✅ EC Wallet is already registered as a voter");
        return;
      }
    } catch (error) {
      // Voter doesn't exist, continue with registration
    }

    // Register EC wallet as a voter
    const hashedAadhaar = ethers.keccak256(
      ethers.toUtf8Bytes("EC-ADMIN-AADHAAR-PROXY")
    );
    const encryptedName = Buffer.from("Election Commission Proxy").toString(
      "base64"
    );
    const encryptedEmail = Buffer.from("ec-proxy@election.gov").toString(
      "base64"
    );

    console.log("⏳ Registering EC wallet on blockchain...");

    const tx = await contract.registerVoter(
      ecAddress, // EC wallet address
      hashedAadhaar, // Hashed Aadhaar (proxy)
      encryptedName, // Encrypted name
      encryptedEmail // Encrypted email
    );

    console.log("⏳ Waiting for transaction confirmation...");
    const receipt = await tx.wait();

    console.log("✅ EC Wallet registered successfully!");
    console.log("📄 Transaction hash:", receipt.hash);
    console.log("🔗 Block number:", receipt.blockNumber);

    console.log("\n🎉 EC Wallet can now cast votes on behalf of voters!");
  } catch (error) {
    console.error("❌ Registration failed:", error.message);
    if (error.reason) {
      console.error("💡 Reason:", error.reason);
    }
  }
}

// Run the registration
registerECWallet();
