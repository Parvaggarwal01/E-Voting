import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const OneTimeReceiptView = () => {
  const [receipt, setReceipt] = useState(null); // Restored to null
  const [copied, setCopied] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const [countdown, setCountdown] = useState(30); // 30 seconds countdown
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // --- Logic restored ---
  useEffect(() => {
    console.log("🧾 OneTimeReceiptView loaded");
    setDebugInfo("OneTimeReceiptView loaded");

    // Get receipt data from localStorage (set by voting page)
    const receiptData = localStorage.getItem("oneTimeReceipt");
    console.log("📥 Receipt data from localStorage:", receiptData);
    setDebugInfo((prev) => prev + "\nChecking localStorage...");

    if (receiptData) {
      try {
        const parsedReceipt = JSON.parse(receiptData);
        console.log("✅ Parsed receipt:", parsedReceipt);
        setDebugInfo(
          (prev) => prev + `\nFound receipt: ${parsedReceipt.receiptCode}`
        );
        setReceipt(parsedReceipt);
        // Immediately clear it from localStorage for security
        localStorage.removeItem("oneTimeReceipt");
        console.log("🗑️ Cleared receipt from localStorage");
        setDebugInfo((prev) => prev + "\nReceipt loaded successfully!");
      } catch (error) {
        console.error("❌ Error parsing receipt data:", error);
        setDebugInfo(
          (prev) => prev + `\nError parsing receipt: ${error.message}`
        );
        setTimeout(() => navigate("/voter/voting"), 30000); // Increased to 10 seconds
      }
    } else {
      console.log("❌ No receipt data found, redirecting back");
      setDebugInfo((prev) => prev + "\nNo receipt data found in localStorage");
      // Add a delay to show debug info - increased to 10 seconds
      setTimeout(() => navigate("/voter/voting"), 30000);
    }
  }, [navigate]);
  // ------------------------------------------

  // --- Logic restored ---
  // Countdown timer effect for successful receipt display
  useEffect(() => {
    if (receipt && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (receipt && countdown === 0) {
      navigate("/voter/voting");
    }
  }, [receipt, countdown, navigate]);
  // ------------------------------------------

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadReceipt = () => {
    const receiptData = {
      receiptCode: receipt.receiptCode,
      electionName: receipt.electionName,
      timestamp: receipt.timestamp,
      note: "This receipt confirms your vote was counted. Keep it safe for verification.",
      warning: "This receipt was shown only once. Save this file securely.",
    };

    const dataStr = JSON.stringify(receiptData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `vote-receipt-${receipt.receiptCode.substring(
      0,
      8
    )}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const continueToVoting = () => {
    navigate("/voter/voting");
  };

  if (!receipt) {
    // This is the loading/debug view (styles unchanged)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-black text-lg mb-4">Loading your receipt...</div>
          <div className="bg-gray-900 p-4 rounded-lg text-left">
            <h3 className="text-white font-bold mb-2">Debug Info:</h3>
            <pre className="text-gray-300 text-sm whitespace-pre-wrap">
              {debugInfo}
            </pre>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate("/voter/voting")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Return to Voting
            </button>
          </div>
        </div>
      </div>
    );
  }

  //
  // --- This is your newly styled receipt view ---
  //
  return (
    <div className="min-h-screen bg-white border shadow border-[#E8EDF3] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-receipt-text-icon lucide-receipt-text"
            >
              <path d="M13 16H8" />
              <path d="M14 8H8" />
              <path d="M16 12H8" />
              <path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">
            Your Vote Receipt
          </h1>
          <p className="text-black font-medium">
            This receipt will only be shown ONCE. Please save it now!
          </p>
          <div className="mt-4 bg-black text-white border shadow border-[#E8EDF3] px-4 py-2 rounded-lg inline-block">
            Auto-close in {countdown} seconds
          </div>
        </div>

        {/* Receipt Card */}
        <div className="bg-white p-8 rounded-lg border shadow border-[#E8EDF3] mb-6">
          <div className="space-y-6">
            {/* Success Message */}
            <div className="p-4 bg-black rounded-lg border shadow border-[#E8EDF3] text-center">
              <div className="text-white flex items-center justify-center text-2xl mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-circle-check-icon lucide-circle-check"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h2 className="text-white font-bold text-lg">
                Vote Successfully Cast!
              </h2>
              <p className="text-white text-sm">
                Your vote has been encrypted and recorded securely.
              </p>
            </div>

            {/* Receipt Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Election
                </label>
                <div className="bg-black border border-gray-600 rounded-lg px-4 py-3 text-white">
                  {receipt.electionName}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Vote Timestamp
                </label>
                <div className="bg-black border border-gray-600 rounded-lg px-4 py-3 text-white">
                  {new Date(receipt.timestamp).toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Receipt Code (Save this for verification)
                </label>
                <div className="bg-black border border-[#E8EDF3] rounded-lg px-4 py-3">
                  <div className="flex items-center justify-between">
                    <code className="text-white font-mono text-lg break-all">
                      {receipt.receiptCode}
                    </code>
                    <button
                      onClick={() => copyToClipboard(receipt.receiptCode)}
                      className={`ml-4 px-3 py-1 rounded text-sm border shadow border-[#E8EDF3] transition-colors flex-shrink-0 ${
                        copied
                          ? "bg-white text-black"
                          : "bg-white hover:bg-gray-300 text-black"
                      }`}
                    >
                      {copied ? "✓ Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Blockchain Verification Info */}
              {receipt.blockchainTxHash && (
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    🔗 Blockchain Transaction Hash
                  </label>
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                    <div className="flex items-center justify-between">
                      <code className="text-green-800 font-mono text-sm break-all">
                        {receipt.blockchainTxHash}
                      </code>
                      <button
                        onClick={() =>
                          copyToClipboard(receipt.blockchainTxHash)
                        }
                        className="ml-4 px-3 py-1 rounded text-sm bg-green-600 hover:bg-green-700 text-white transition-colors flex-shrink-0"
                      >
                        Copy TX
                      </button>
                    </div>
                    <p className="text-green-700 text-xs mt-2">
                      ✅ Your vote is permanently stored on blockchain -
                      tamper-proof and immutable
                    </p>
                  </div>
                </div>
              )}

              {receipt.walletAddress && (
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Connected Wallet
                  </label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                    <code className="text-blue-800 font-mono text-sm">
                      {receipt.walletAddress}
                    </code>
                    <p className="text-blue-700 text-xs mt-1">
                      Vote linked to your blockchain identity for verification
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={downloadReceipt}
                className="flex-1 bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-receipt-text-icon lucide-receipt-text"
                  >
                    <path d="M13 16H8" />
                    <path d="M14 8H8" />
                    <path d="M16 12H8" />
                    <path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z" />
                  </svg>
                </span>
                Download Receipt
              </button>

              <button
                onClick={() => copyToClipboard(receipt.receiptCode)}
                className={`flex-1 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  copied
                    ? "bg-black text-white"
                    : "bg-black hover:bg-gray-800 text-white"
                }`}
              >
                <span>
                  {copied ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-check-icon lucide-check"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-copy-icon lucide-copy"
                    >
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      D{" "}
                    </svg>
                  )}
                </span>
                {copied ? "Copied!" : "Copy Code"}
              </button>

              <button
                onClick={continueToVoting}
                className="flex-1 bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-x-icon lucide-x"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </span>
                Close Receipt
              </button>
            </div>

            {/* Enhanced Security Notice */}
            <div className="p-4 bg-black rounded-lg border border-[#E8EDF3]">
              <h3 className="text-white font-bold mb-2">
                🔐 Enhanced Blockchain Security
              </h3>
              <ul className="text-white text-sm space-y-1">
                <li>
                  • Your vote is encrypted with blind signatures (EC can't see
                  your choice)
                </li>
                <li>
                  •{" "}
                  {receipt.isBlockchainVerified
                    ? "✅ Stored immutably on blockchain"
                    : "⚠️ Blockchain storage failed"}
                </li>
                <li>• Receipt code proves your vote was counted</li>
                <li>
                  •{" "}
                  {receipt.blockchainTxHash
                    ? "Blockchain TX hash provides tamper-proof verification"
                    : "Save receipt code for traditional verification"}
                </li>
                <li>• Your identity remains completely anonymous</li>
                <li>
                  • Commissioner cannot manipulate blockchain-stored votes
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={continueToVoting}
            className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Return to Voting ({countdown}s)
          </button>
          <p className="text-black text-sm mt-2">
            Receipt will auto-close in {countdown} seconds
          </p>
        </div>
      </div>
    </div>
  );
};

export default OneTimeReceiptView;
