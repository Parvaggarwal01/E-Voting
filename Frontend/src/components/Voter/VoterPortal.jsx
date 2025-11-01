import { Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import VoterSidebar from "./VoterSidebar";
import VotingPage from "./VotingPage";
import ResultsPage from "./ResultsPage";
import ReceiptPage from "./ReceiptPage";
import OneTimeReceiptView from "./OneTimeReceiptView";
import ManifestoChatbot from "./ManifestoChatbot";

function VoterPortal() {
  return (
    <div className="flex min-h-screen bg-white text-black">
      <VoterSidebar />
      <div className="flex-1 ml-64">
        <main className="p-6">
          <Routes>
            <Route index element={<Navigate to="voting" replace />} />
            <Route path="voting" element={<VotingPage />} />
            <Route path="results" element={<ResultsPage />} />
            <Route path="receipts" element={<ReceiptPage />} />
            <Route path="receipt-view" element={<OneTimeReceiptView />} />
            <Route path="chat" element={<ManifestoChatbot />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default VoterPortal;
