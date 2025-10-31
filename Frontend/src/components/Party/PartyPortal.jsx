import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PartyDashboard from "./PartyDashboard";
import ManifestoUpload from "./ManifestoUpload";
import PartyElections from "./PartyElections";
import PartySettings from "./PartySettings";
import PartySidebar from "./PartySidebar";

const PartyPortal = () => {
  const { user } = useAuth();

  if (!user || user.role !== "PARTY") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <PartySidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="p-8">
          <Routes>
            <Route index element={<PartyDashboard />} />
            <Route path="dashboard" element={<PartyDashboard />} />
            <Route path="manifesto" element={<ManifestoUpload />} />
            <Route path="elections" element={<PartyElections />} />
            <Route path="settings" element={<PartySettings />} />
            <Route
              path="*"
              element={<Navigate to="/party/dashboard" replace />}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default PartyPortal;
