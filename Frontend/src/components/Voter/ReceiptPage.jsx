import React, { useState } from "react";
import { api } from "../../services/api";

function ReceiptPage() {
  const [receiptCode, setReceiptCode] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const verifyReceipt = async () => {
    if (!receiptCode.trim()) return;

    setLoading(true);
    setVerificationResult(null);

    try {
      const response = await api.get(`/public/verify-receipt/${receiptCode}`);
      setVerificationResult({
        valid: true,
        data: response.data,
      });
    } catch (error) {
      setVerificationResult({
        valid: false,
        error: error.response?.data?.error || "Receipt not found",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Receipt Verification</h1>
        <p className="text-[#3F3F46] mt-1">
          Verify any vote receipt to confirm it was properly recorded.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Left Sidebar - Input Section */}
        <div className="lg:col-span-1 space-y-6">
          {/* Receipt Input */}
          <div className="bg-white p-6 rounded-lg border shadow border-[#E2E8F0]">
            <h2 className="text-xl font-bold text-black mb-4">
              Verify Receipt
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3F3F46] mb-2">
                  Receipt Code
                </label>
                <input
                  type="text"
                  value={receiptCode}
                  onChange={(e) => setReceiptCode(e.target.value)}
                  placeholder="Enter receipt code..."
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <button
                onClick={verifyReceipt}
                disabled={!receiptCode.trim() || loading}
                className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Verifying...
                  </div>
                ) : (
                  "Verify Receipt"
                )}
              </button>
            </div>
          </div>

          {/* Info Panel */}
          <div className="bg-black p-6 rounded-lg border shadow border-[#E2E8F0]">
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <span className="text-xl">
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
                  class="lucide lucide-lock-icon lucide-lock"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              About Vote Receipts
            </h4>
            <ul className="text-white text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-white mt-0.5">•</span>
                Receipts prove your vote was counted
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white mt-0.5">•</span>
                They don't reveal who you voted for
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white mt-0.5">•</span>
                Each receipt has a unique cryptographic hash
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white mt-0.5">•</span>
                Anyone can verify any receipt code
              </li>
            </ul>
          </div>

          {/* How It Works */}
          <div className="bg-white p-6 rounded-lg border shadow border-[#E2E8F0]">
            <h4 className="text-black font-medium mb-4 flex items-center gap-2">
              <span className="text-xl">
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
                  class="lucide lucide-clipboard-list-icon lucide-clipboard-list"
                >
                  <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <path d="M12 11h4" />
                  <path d="M12 16h4" />
                  <path d="M8 11h.01" />
                  <path d="M8 16h.01" />
                </svg>
              </span>
              How It Works
            </h4>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white border shadow border-[#E2E8F0] rounded-lg">
                <div className="text-2xl">
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
                    class="lucide lucide-vote-icon lucide-vote"
                  >
                    <path d="m9 12 2 2 4-4" />
                    <path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z" />
                    <path d="M22 19H2" />
                  </svg>
                </div>
                <div>
                  <h5 className="text-black font-medium text-sm">1. Vote</h5>
                  <p className="text-[#3F3F46] text-xs">
                    Cast your vote in any active election
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border shadow border-[#E2E8F0] rounded-lg">
                <div className="text-2xl">
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
                    class="lucide lucide-ticket-check-icon lucide-ticket-check"
                  >
                    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h5 className="text-black font-medium text-sm">
                    2. Get Receipt
                  </h5>
                  <p className="text-[#3F3F46] text-xs">
                    Receive a one-time receipt code
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border shadow border-[#E2E8F0] rounded-lg">
                <div className="text-2xl">
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
                    class="lucide lucide-circle-check-big-icon lucide-circle-check-big"
                  >
                    <path d="M21.801 10A10 10 0 1 1 17 3.335" />
                    <path d="m9 11 3 3L22 4" />
                  </svg>
                </div>
                <div>
                  <h5 className="text-black font-medium text-sm">
                    3. Verify Here
                  </h5>
                  <p className="text-[#3F3F46] text-xs">
                    Use this page to verify your receipt
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Response Section */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg border shadow border-[#E2E8F0] h-full min-h-96">
            {!verificationResult ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-6xl text-black mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-search-icon lucide-search"
                  >
                    <path d="m21 21-4.34-4.34" />
                    <circle cx="11" cy="11" r="8" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black mb-2">
                  Ready to Verify
                </h3>
                <p className="text-black max-w-md">
                  Enter a receipt code in the left panel and click "Verify
                  Receipt" to check if your vote was properly recorded.
                </p>
              </div>
            ) : verificationResult.valid ? (
              <div className="space-y-6">
                {/* Success Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-black">
                  <span className="text-4xl text-black">
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
                      class="lucide lucide-circle-check-big-icon lucide-circle-check-big"
                    >
                      <path d="M21.801 10A10 10 0 1 1 17 3.335" />
                      <path d="m9 11 3 3L22 4" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="text-2xl font-bold text-black">
                      Receipt Valid
                    </h3>
                    <p className="text-black text-sm">
                      Your vote was successfully recorded
                    </p>
                  </div>
                </div>

                {/* Receipt Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-black p-4 rounded-lg border shadow border-[#E2E8F0]">
                      <h4 className="text-white font-medium mb-2">
                        Election Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-white font-medium">
                            Election:
                          </span>
                          <p className="text-white mt-1">
                            {verificationResult.data.receipt.electionName}
                          </p>
                        </div>
                        <div>
                          <span className="text-white font-medium">
                            Election ID:
                          </span>
                          <p className="text-white mt-1 font-mono text-xs">
                            {verificationResult.data.receipt.electionId}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-black p-4 rounded-lg border shadow border-[#E2E8F0]">
                      <h4 className="text-white font-medium mb-2">
                        Timestamps
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-white font-medium">
                            Vote Recorded:
                          </span>
                          <p className="text-white mt-1">
                            {new Date(
                              verificationResult.data.receipt.timestamp
                            ).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-white font-medium">
                            Verified:
                          </span>
                          <p className="text-white mt-1">
                            {new Date(
                              verificationResult.data.receipt.verificationDate
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-black p-4 rounded-lg border shadow border-[#E2E8F0]">
                      <h4 className="text-white font-medium mb-2">
                        Receipt Code
                      </h4>
                      <div className="bg-white p-3 rounded border shadow border-[#E2E8F0]">
                        <code className="text-black text-xs font-mono break-all leading-relaxed">
                          {verificationResult.data.receipt.receiptCode}
                        </code>
                      </div>
                    </div>

                    <div className="bg-black p-4 rounded-lg border shadow border-[#E2E8F0]">
                      <h4 className="text-white font-medium mb-2 flex items-center gap-2">
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
                            class="lucide lucide-shield-icon lucide-shield"
                          >
                            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                          </svg>
                        </span>
                        Security Verified
                      </h4>
                      <ul className="text-white text-sm space-y-1">
                        <li className="flex items-center gap-2">
                          <span className="text-white">✓</span>
                          Cryptographic signature valid
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-white">✓</span>
                          Vote recorded in blockchain
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-white">✓</span>
                          Receipt authenticity confirmed
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-black">
                  <button
                    onClick={() => setVerificationResult(null)}
                    className="bg-black hover:bg-gray-800 border shadow text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Verify Another Receipt
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        verificationResult.data.receipt.receiptCode
                      );
                    }}
                    className="bg-white hover:bg-gray-200 text-black border shadow border-[#E2E8F0] px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Copy Receipt Code
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-6xl mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="50"
                    height="50"
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
                </div>
                <h3 className="text-2xl font-bold text-black mb-2">
                  Invalid Receipt
                </h3>
                <div className="bg-white p-4 rounded-lg border shadow border-[#E2E8F0] max-w-md">
                  <p className="text-black text-sm mb-4">
                    {verificationResult.error}
                  </p>
                  <button
                    onClick={() => setVerificationResult(null)}
                    className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Try Another Receipt
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceiptPage;
