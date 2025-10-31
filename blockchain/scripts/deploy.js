const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Deploying ImmutableVoting contract to Ganache...");

  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name);
  console.log("🆔 Chain ID:", network.chainId);

  // Deploy the contract
  const ImmutableVoting = await hre.ethers.getContractFactory(
    "ImmutableVoting"
  );
  const voting = await ImmutableVoting.deploy();

  await voting.waitForDeployment();
  const contractAddress = await voting.getAddress();

  console.log("✅ ImmutableVoting deployed to:", contractAddress);
  console.log("🔧 Admin address:", await voting.admin());

  // Save deployment info for frontend
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: network.name,
    chainId: network.chainId.toString(),
    deploymentTime: new Date().toISOString(),
    ganacheUrl: "http://127.0.0.1:7545",
    adminAddress: await voting.admin(),
  };

  // Write to file for frontend integration
  fs.writeFileSync(
    "./deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("📄 Deployment info saved to deployment-info.json");
  console.log("\n🎉 Contract successfully deployed!");
  console.log(
    "📋 Copy this address for frontend integration:",
    contractAddress
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
