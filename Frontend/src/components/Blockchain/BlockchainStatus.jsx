import React from "react";
import { useBlockchain } from "../../context/BlockchainContext";

const BlockchainStatus = () => {
  const {
    isConnected,
    walletAddress,
    chainId,
    blockchainStats,
    loading,
    error,
    connectWallet,
  } = useBlockchain();

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId) => {
    switch (chainId) {
      case 1337:
        return "Ganache Local";
      case 1:
        return "Ethereum Mainnet";
      case 5:
        return "Goerli Testnet";
      case 80001:
        return "Mumbai Testnet";
      default:
        return `Chain ${chainId}`;
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-red-700 font-medium">
              Blockchain Disconnected
            </span>
          </div>
          <button
            onClick={connectWallet}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? "Connecting..." : "Connect Wallet"}
          </button>
        </div>
        {error && (
          <div className="mt-2 text-red-600 text-sm">Error: {error}</div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-green-700 font-medium">
            Blockchain Connected
          </span>
        </div>
        <div className="text-xs text-gray-500">{getNetworkName(chainId)}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-white rounded-lg p-3 border">
          <div className="text-gray-500 text-xs uppercase font-medium mb-1">
            Wallet Address
          </div>
          <div className="text-gray-800 font-mono">
            {formatAddress(walletAddress)}
          </div>
        </div>

        {blockchainStats && (
          <>
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-gray-500 text-xs uppercase font-medium mb-1">
                Total Voters
              </div>
              <div className="text-gray-800 font-bold text-lg">
                {blockchainStats.totalVoters}
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border">
              <div className="text-gray-500 text-xs uppercase font-medium mb-1">
                Total Votes
              </div>
              <div className="text-gray-800 font-bold text-lg">
                {blockchainStats.totalVotes}
              </div>
            </div>
          </>
        )}
      </div>

      {blockchainStats && (
        <div className="mt-3 text-xs text-gray-600">
          <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
          All voter registrations and votes are stored immutably on the
          blockchain
        </div>
      )}
    </div>
  );
};

export default BlockchainStatus;
