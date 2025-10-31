import { Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import CreateParty from "./CreateParty";
import ManageParties from "./ManageParties";
import ManageVoters from "./ManageVoters";
import CreateElection from "./CreateElection";
import ManageElections from "./ManageElections";
import Results from "./Results";

function ECPortal() {
  return (
    <div className="flex min-h-screen bg-white text-white">
      <Sidebar />
      <div className="flex-1 ml-54">
        <main className="p-6">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="create-party" element={<CreateParty />} />
            <Route path="manage-parties" element={<ManageParties />} />
            <Route path="manage-voters" element={<ManageVoters />} />
            <Route path="create-election" element={<CreateElection />} />
            <Route path="manage-elections" element={<ManageElections />} />
            <Route path="results" element={<Results />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default ECPortal;
