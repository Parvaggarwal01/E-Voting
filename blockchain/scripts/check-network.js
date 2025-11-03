const hre = require("hardhat");

async function main() {
  console.log("🔍 Network Configuration Check");
  console.log("==============================");

  try {
    // Test network connection
    console.log("🌐 Current network:", hre.network.name);
    console.log("⚙️  Network config:", hre.network.config);

    const provider = new hre.ethers.JsonRpcProvider(hre.network.config.url);

    // Get network info
    const network = await provider.getNetwork();
    console.log("📊 Chain ID:", network.chainId.toString());
    console.log("🏷️  Network name:", network.name);

    // Get block number
    const blockNumber = await provider.getBlockNumber();
    console.log("📦 Latest block:", blockNumber);

    // Test account access
    if (hre.network.config.accounts && hre.network.config.accounts.length > 0) {
      const [deployer] = await hre.ethers.getSigners();
      const address = deployer.address;
      const balance = await provider.getBalance(address);

      console.log("\n💰 Account Information:");
      console.log("📍 Address:", address);
      console.log("💵 Balance:", hre.ethers.formatEther(balance), "ETH");

      // Check if balance is sufficient for deployment
      const minBalance = hre.ethers.parseEther("0.01");
      if (balance >= minBalance) {
        console.log("✅ Sufficient balance for deployment");
      } else {
        console.log("⚠️  Low balance - may not be sufficient for deployment");
        console.log(
          "💡 Recommended: At least 0.01 ETH for contract deployment"
        );
      }
    } else {
      console.log("⚠️  No accounts configured for this network");
    }

    // Test contract compilation
    console.log("\n🔨 Testing contract compilation...");
    await hre.run("compile");
    console.log("✅ Contracts compiled successfully");

    console.log("\n🎉 Network check completed successfully!");

    if (hre.network.name === "sepolia") {
      console.log("\n📋 Sepolia Network Information:");
      console.log("🔗 RPC URL:", hre.network.config.url);
      console.log("⛽ Gas Price:", hre.network.config.gasPrice || "Auto");
      console.log("🔍 Explorer: https://sepolia.etherscan.io/");
    }
  } catch (error) {
    console.error("❌ Network check failed:", error.message);

    if (error.message.includes("could not detect network")) {
      console.log("💡 Suggestion: Check your RPC URL and API key");
    }

    if (error.message.includes("insufficient funds")) {
      console.log("💡 Suggestion: Add more ETH to your account");
    }

    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Unexpected error:", error);
    process.exit(1);
  });
