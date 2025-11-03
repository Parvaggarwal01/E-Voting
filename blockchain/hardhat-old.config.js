require("@nomicfoundation/hardhat-toolbox");

// --- CONFIGURE THIS ---
// 1. Get your RPC URL from a free Alchemy or Infura account.
// 2. Get your Private Key from MetaMask (Account Details -> Show Private Key)
//    This must be the key for the wallet you funded with Sepolia-ETH.
const ALCHEMY_RPC_URL = "YOUR_ALCHEMY_HTTPS_URL_HERE";
const SEPOLIA_PRIVATE_KEY = "YOUR_METAMASK_PRIVATE_KEY_HERE";
// --------------------

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: "http://127.0.0.1:7545", // For Ganache
    },
    sepolia: {
      url: "ALCHEMY_RPC_URL",
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
  },
};