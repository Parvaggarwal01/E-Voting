const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts to Ganache...");

  // 1. Deploy the VoterRegistry first
  const voterRegistry = await hre.ethers.deployContract("VoterRegistry");
  await voterRegistry.waitForDeployment();
  console.log(
    `✅ VoterRegistry deployed to: ${voterRegistry.target}`
  );

  // FOR YOUR HACKATHON, JUST HARDCODE THEM:
  const hardcodedPartyIds = ["bjp@party.gov", "congress@party.gov", "aap@party.gov"];
  console.log(`Configuring with parties: ${hardcodedPartyIds.join(", ")}`);

  // 3. Deploy the BallotBox
  const ballotBox = await hre.ethers.deployContract("BallotBox", [
    voterRegistry.target, // Pass the registry address
    hardcodedPartyIds,
  ]);
  await ballotBox.waitForDeployment();
  console.log(
    `✅ BallotBox deployed to: ${ballotBox.target}`
  );

  console.log("\n--- 🚀 DEPLOYMENT COMPLETE ---");
  console.log("Save these addresses in your .env files!");
  console.log(`VOTER_REGISTRY_ADDRESS="${voterRegistry.target}"`);
  console.log(`BALLOT_BOX_ADDRESS="${ballotBox.target}"`);
  console.log("---------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});