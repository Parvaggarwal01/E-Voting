import React, { createContext, useContext, useState, useEffect } from "react";
import blockchainService from "../services/blockchainService";

const BlockchainContext = createContext();

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error("useBlockchain must be used within a BlockchainProvider");
  }
  return context;
};

export const BlockchainProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [blockchainStats, setBlockchainStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize blockchain connection
  const connectWallet = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await blockchainService.initialize();

      setIsConnected(result.success);
      setWalletAddress(result.address);
      setChainId(result.chainId);

      // Load blockchain stats
      const stats = await blockchainService.getBlockchainStats();
      setBlockchainStats(stats);

      console.log("🟢 Wallet connected:", result.address);
    } catch (error) {
      setError(error.message);
      console.error("❌ Wallet connection failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Register voter on blockchain
  const registerVoterOnBlockchain = async (voterData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await blockchainService.registerVoter(voterData);

      // Update stats after registration
      const stats = await blockchainService.getBlockchainStats();
      setBlockchainStats(stats);

      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cast vote on blockchain
  const castVoteOnBlockchain = async (voteData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await blockchainService.castVote(voteData);

      // Update stats after vote
      const stats = await blockchainService.getBlockchainStats();
      setBlockchainStats(stats);

      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Create election on blockchain
  const createElectionOnBlockchain = async (electionData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await blockchainService.createElection(electionData);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Verify voter on blockchain
  const verifyVoterOnBlockchain = async (walletAddress) => {
    try {
      const voter = await blockchainService.getVoterFromBlockchain(
        walletAddress
      );
      return voter;
    } catch (error) {
      console.error("❌ Voter verification failed:", error);
      return null;
    }
  };

  // Verify vote on blockchain
  const verifyVoteOnBlockchain = async (voteHash) => {
    try {
      const vote = await blockchainService.getVoteFromBlockchain(voteHash);
      return vote;
    } catch (error) {
      console.error("❌ Vote verification failed:", error);
      return null;
    }
  };

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        try {
          await connectWallet();
        } catch (error) {
          console.log("Auto-connect failed:", error.message);
        }
      }
    };

    autoConnect();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // User disconnected
          setIsConnected(false);
          setWalletAddress(null);
        } else if (accounts[0] !== walletAddress) {
          // User switched accounts
          connectWallet();
        }
      };

      const handleChainChanged = (chainId) => {
        // Reload page when chain changes
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener(
            "accountsChanged",
            handleAccountsChanged
          );
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [walletAddress]);

  const value = {
    isConnected,
    walletAddress,
    chainId,
    blockchainStats,
    loading,
    error,
    connectWallet,
    registerVoterOnBlockchain,
    castVoteOnBlockchain,
    createElectionOnBlockchain,
    verifyVoterOnBlockchain,
    verifyVoteOnBlockchain,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

export default BlockchainContext;
