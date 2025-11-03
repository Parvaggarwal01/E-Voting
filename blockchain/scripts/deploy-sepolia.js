const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying VotingSystem contract to Sepolia...");
  console.log("🌐 Network:", hre.network.name);

  // Get the ContractFactory and Signers
  const VotingSystem = await hre.ethers.getContractFactory("VotingSystem");
  const [deployer] = await hre.ethers.getSigners();

  const deployerAddress = deployer.address;
  const balance = await hre.ethers.provider.getBalance(deployerAddress);

  console.log("📝 Deploying with account:", deployerAddress);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Check if we have enough balance (at least 0.01 ETH for deployment)
  if (balance < hre.ethers.parseEther("0.01")) {
    console.log(
      "⚠️  Warning: Low balance. Make sure you have enough ETH for deployment."
    );
  }

  console.log("⏳ Deploying contract...");

  // Deploy the contract with gas estimation
  const votingSystem = await VotingSystem.deploy();

  console.log("⏳ Waiting for deployment confirmation...");
  await votingSystem.waitForDeployment();

  const contractAddress = await votingSystem.getAddress();
  console.log("✅ VotingSystem deployed to:", contractAddress);

  // Get deployment receipt for gas used
  const deploymentTx = votingSystem.deploymentTransaction();
  if (deploymentTx) {
    const receipt = await deploymentTx.wait();
    console.log("⛽ Gas used:", receipt.gasUsed.toString());
    console.log("💵 Transaction hash:", receipt.hash);
  }

  // Save deployment info
  const deploymentInfo = {
    contractName: "VotingSystem",
    contractAddress: contractAddress,
    deployer: deployerAddress,
    deploymentTime: new Date().toISOString(),
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    transactionHash: deploymentTx ? deploymentTx.hash : null,
  };

  const deploymentPath = path.join(__dirname, "..", "deployment-info.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to deployment-info.json");

  // Update blockchain.json with new contract address and ABI
  console.log("🔧 Updating blockchain configuration...");

  // Get the contract artifact for ABI
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "VotingSystem.sol",
    "VotingSystem.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const networkConfig = {
    chainId: hre.network.config.chainId,
    networkName:
      hre.network.name === "sepolia" ? "Sepolia Testnet" : hre.network.name,
    rpcUrl: hre.network.config.url,
  };

  const blockchainConfig = {
    contractAddress: contractAddress,
    contractABI: artifact.abi,
    networkConfig: networkConfig,
  };

  const frontendConfigPath = path.join(
    __dirname,
    "..",
    "..",
    "Frontend",
    "src",
    "config",
    "blockchain.json"
  );
  fs.writeFileSync(
    frontendConfigPath,
    JSON.stringify(blockchainConfig, null, 2)
  );
  console.log("✅ Updated frontend blockchain.json");

  // Update backend .env file
  console.log("🔧 Updating backend environment variables...");
  const backendEnvPath = path.join(__dirname, "..", "..", "Backend", ".env");
  let envContent = fs.readFileSync(backendEnvPath, "utf8");

  // Update the contract address
  if (envContent.includes("VOTING_SYSTEM_ADDRESS=")) {
    envContent = envContent.replace(
      /VOTING_SYSTEM_ADDRESS="[^"]*"/,
      `VOTING_SYSTEM_ADDRESS="${contractAddress}"`
    );
  } else {
    envContent += `\nVOTING_SYSTEM_ADDRESS="${contractAddress}"\n`;
  }

  fs.writeFileSync(backendEnvPath, envContent);
  console.log("✅ Updated backend .env file");

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📋 Contract Details:");
  console.log(`   - Address: ${contractAddress}`);
  console.log(`   - Admin: ${deployerAddress}`);
  console.log(
    `   - Network: ${hre.network.name} (Chain ID: ${hre.network.config.chainId})`
  );
  console.log(`   - Block: ${await hre.ethers.provider.getBlockNumber()}`);

  if (hre.network.name === "sepolia") {
    console.log(`\n🔍 View on Etherscan:`);
    console.log(`   https://sepolia.etherscan.io/address/${contractAddress}`);
  }

  console.log("\n📝 Next steps:");
  console.log(
    "1. Update your .env file with your Alchemy API key and private key"
  );
  console.log("2. Test the contract functions");
  console.log("3. Register some voters and test voting");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
