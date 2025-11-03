import { ethers } from "ethers";
import blockchainConfig from "../config/blockchain.json";

// Contract configuration from generated config
const CONTRACT_ADDRESS = blockchainConfig.contractAddress;
const CONTRACT_ABI = blockchainConfig.contractABI;
const CHAIN_ID = blockchainConfig.networkConfig.chainId;

// Legacy ABI - replaced with generated config above
const LEGACY_CONTRACT_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "electionId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "ElectionCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "voteHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "electionId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "VoteCast",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "voter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "aadhaarHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "VoterRegistered",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "electionId",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "voteHash",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "blindSignature",
        type: "bytes32",
      },
    ],
    name: "castVote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "electionId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "startTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
      {
        internalType: "string[]",
        name: "parties",
        type: "string[]",
      },
    ],
    name: "createElection",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "voterAddress",
        type: "address",
      },
    ],
    name: "deactivateVoter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "electionId",
        type: "uint256",
      },
    ],
    name: "endElection",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "electionId",
        type: "uint256",
      },
    ],
    name: "getElection",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "startTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "active",
        type: "bool",
      },
      {
        internalType: "string[]",
        name: "parties",
        type: "string[]",
      },
      {
        internalType: "uint256",
        name: "totalVotes",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalVoters",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalVotes",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "voteHash",
        type: "bytes32",
      },
    ],
    name: "getVote",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "electionId",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "voteHash",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "blindSignature",
            type: "bytes32",
          },
        ],
        internalType: "struct ImmutableVoting.Vote",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "voterAddress",
        type: "address",
      },
    ],
    name: "getVoter",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "aadhaarHash",
            type: "string",
          },
          {
            internalType: "string",
            name: "encryptedName",
            type: "string",
          },
          {
            internalType: "string",
            name: "encryptedEmail",
            type: "string",
          },
          {
            internalType: "address",
            name: "walletAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "registrationTime",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
        ],
        internalType: "struct ImmutableVoting.Voter",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "voterAddress",
        type: "address",
      },
      {
        internalType: "string",
        name: "aadhaarHash",
        type: "string",
      },
      {
        internalType: "string",
        name: "encryptedName",
        type: "string",
      },
      {
        internalType: "string",
        name: "encryptedEmail",
        type: "string",
      },
    ],
    name: "registerVoter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.isConnected = false;
  }

  // Initialize Web3 connection
  async initialize() {
    try {
      if (window.ethereum) {
        this.provider = new ethers.BrowserProvider(window.ethereum);

        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });

        this.signer = await this.provider.getSigner();
        this.contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          this.signer
        );

        // Check if connected to correct network
        const network = await this.provider.getNetwork();
        if (network.chainId !== BigInt(CHAIN_ID)) {
          const networkName =
            CHAIN_ID === 11155111 ? "Sepolia Testnet" : "Ganache Local";
          throw new Error(
            `Please switch to ${networkName} (Chain ID: ${CHAIN_ID}). Currently connected to Chain ID: ${network.chainId}`
          );
        }

        this.isConnected = true;
        console.log("🟢 Blockchain connected successfully");

        return {
          success: true,
          address: await this.signer.getAddress(),
          network: network.name,
          chainId: network.chainId.toString(),
        };
      } else {
        throw new Error(
          "MetaMask not found. Please install MetaMask extension."
        );
      }
    } catch (error) {
      console.error("❌ Blockchain connection failed:", error);
      throw error;
    }
  }

  // Register voter on blockchain (immutable)
  async registerVoter(voterData) {
    try {
      if (!this.isConnected) {
        throw new Error("Blockchain not connected");
      }

      console.log("📝 Registering voter on blockchain...");

      // Hash Aadhaar for privacy (as string, not bytes32)
      const aadhaarHashString = ethers.keccak256(
        ethers.toUtf8Bytes(voterData.aadhaarNumber)
      );
      const encryptedName = btoa(voterData.name); // Simple base64 encoding for demo
      const encryptedEmail = btoa(voterData.email);

      // Call smart contract function
      const tx = await this.contract.registerVoter(
        voterData.walletAddress,
        aadhaarHashString,
        encryptedName,
        encryptedEmail
      );

      console.log("⏳ Waiting for transaction confirmation...");
      const receipt = await tx.wait();

      console.log("✅ Voter registered on blockchain:", receipt.hash);

      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        aadhaarHash: aadhaarHashString,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("❌ Blockchain voter registration failed:", error);
      throw error;
    }
  }

  // Cast vote on blockchain (immutable)
  async castVote(voteData) {
    try {
      if (!this.isConnected) {
        throw new Error("Blockchain not connected");
      }

      console.log("🗳️ Casting vote on blockchain...");

      // Create vote hash from vote data
      const voteHash = ethers.keccak256(
        ethers.toUtf8Bytes(
          JSON.stringify({
            electionId: voteData.electionId,
            partyId: voteData.partyId,
            timestamp: Date.now(),
            nonce: Math.random().toString(),
          })
        )
      );

      // Create blind signature (simplified for demo)
      const blindSignature = ethers.keccak256(
        ethers.toUtf8Bytes(voteData.signature || "demo_signature")
      );

      console.log("🔍 Vote data:", {
        electionId: voteData.electionId,
        partyId: voteData.partyId,
        voteHash: voteHash,
      });

      const tx = await this.contract.castVote(
        voteHash,
        voteData.electionId, // String electionId (UUID)
        voteData.partyId, // String partyId (UUID)
        blindSignature
      );

      console.log("⏳ Waiting for vote confirmation...");
      const receipt = await tx.wait();

      console.log("✅ Vote cast on blockchain:", receipt.hash);

      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        voteHash: voteHash,
        gasUsed: receipt.gasUsed.toString(),
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("❌ Blockchain vote casting failed:", error);
      throw error;
    }
  }

  // Verify voter exists on blockchain
  async getVoterFromBlockchain(walletAddress) {
    try {
      if (!this.isConnected) {
        throw new Error("Blockchain not connected");
      }

      const voter = await this.contract.getVoter(walletAddress);

      if (voter.registrationTime.toString() === "0") {
        return null; // Voter not found
      }

      return {
        aadhaarHash: voter.aadhaarHash,
        encryptedName: voter.encryptedName,
        encryptedEmail: voter.encryptedEmail,
        walletAddress: voter.walletAddress,
        registrationTime: voter.registrationTime.toString(),
        isActive: voter.isActive,
      };
    } catch (error) {
      console.error("❌ Failed to get voter from blockchain:", error);
      return null;
    }
  }

  // Verify vote exists on blockchain
  async getVoteFromBlockchain(voteHash) {
    try {
      if (!this.isConnected) {
        throw new Error("Blockchain not connected");
      }

      const vote = await this.contract.getVote(voteHash);

      if (vote.timestamp.toString() === "0") {
        return null; // Vote not found
      }

      return {
        electionId: vote.electionId.toString(),
        voteHash: vote.voteHash,
        timestamp: vote.timestamp.toString(),
        blindSignature: vote.blindSignature,
      };
    } catch (error) {
      console.error("❌ Failed to get vote from blockchain:", error);
      return null;
    }
  }

  // Get blockchain statistics
  async getBlockchainStats() {
    try {
      if (!this.isConnected) {
        throw new Error("Blockchain not connected");
      }

      const totalVoters = await this.contract.voterCount();
      const totalVotes = await this.contract.voteCount();

      return {
        totalVoters: totalVoters.toString(),
        totalVotes: totalVotes.toString(),
        contractAddress: CONTRACT_ADDRESS,
        networkConfig: blockchainConfig.networkConfig,
      };
    } catch (error) {
      console.error("❌ Failed to get blockchain stats:", error);
      return null;
    }
  }

  // Create election on blockchain (admin only)
  // Note: VotingSystem contract doesn't have createElection function
  // Elections are managed in the database only
  async createElection(electionData) {
    try {
      console.log("🏛️ Elections are managed in database, not on blockchain");

      // Return success since elections are database-only
      return {
        success: true,
        message: "Elections are managed in database",
        txHash: null,
        blockNumber: null,
      };
    } catch (error) {
      console.error("❌ Election creation note:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();
export default blockchainService;
