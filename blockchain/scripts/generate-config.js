const fs = require("fs");
const path = require("path");

// Read the compiled contract
const contractPath = path.join(
  __dirname,
  "../artifacts/contracts/ImmutableVoting.sol/ImmutableVoting.json"
);
const contractArtifact = JSON.parse(fs.readFileSync(contractPath, "utf8"));

// Read deployment info
const deploymentPath = path.join(__dirname, "../deployment-info.json");
const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

// Create config file for frontend
const config = {
  contractAddress: deploymentInfo.contractAddress,
  contractABI: contractArtifact.abi,
  networkConfig: {
    chainId: parseInt(deploymentInfo.chainId),
    networkName: "Ganache Local",
    rpcUrl: deploymentInfo.ganacheUrl,
  },
  adminAddress: deploymentInfo.adminAddress,
  deploymentTime: deploymentInfo.deploymentTime,
};

// Save to frontend directory
const frontendConfigPath = path.join(
  __dirname,
  "../../Frontend/src/config/blockchain.json"
);
fs.writeFileSync(frontendConfigPath, JSON.stringify(config, null, 2));

console.log("✅ Blockchain config generated for frontend");
console.log("📄 Saved to:", frontendConfigPath);
console.log("📍 Contract Address:", config.contractAddress);
