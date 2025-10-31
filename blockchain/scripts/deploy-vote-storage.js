const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying VoteStorage contract...");

  // Deploy the VoteStorage contract
  const VoteStorage = await hre.ethers.getContractFactory("VoteStorage");
  const voteStorage = await VoteStorage.deploy();

  await voteStorage.waitForDeployment();
  const contractAddress = await voteStorage.getAddress();

  console.log(`✅ VoteStorage deployed to: ${contractAddress}`);

  // Generate the ABI and config files
  const artifact = await hre.artifacts.readArtifact("VoteStorage");

  // Create blockchain config for frontend
  const blockchainConfig = {
    contractAddress: contractAddress,
    contractABI: artifact.abi,
    networkConfig: {
      chainId: 1337,
      rpcUrl: "http://127.0.0.1:7545",
      networkName: "Ganache Local",
    },
  };

  // Write config to frontend
  const frontendConfigPath = path.join(
    __dirname,
    "../../Frontend/src/config/blockchain.json"
  );
  fs.writeFileSync(
    frontendConfigPath,
    JSON.stringify(blockchainConfig, null, 2)
  );
  console.log(`📄 Frontend config written to: ${frontendConfigPath}`);

  // Save deployment info
  const deploymentInfo = {
    contractName: "VoteStorage",
    contractAddress: contractAddress,
    deployer: (await hre.ethers.getSigners())[0].address,
    deploymentTime: new Date().toISOString(),
    network: "ganache-local",
    blockNumber: await hre.ethers.provider.getBlockNumber(),
  };

  const deploymentPath = path.join(__dirname, "../deployment-info.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📋 Deployment info saved to: ${deploymentPath}`);

  console.log("\n🎯 Next Steps:");
  console.log("1. Update your .env file with the contract address");
  console.log("2. Register voters using the new contract");
  console.log("3. Test vote casting");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
