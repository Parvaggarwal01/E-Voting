import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BlockchainProvider } from "./context/BlockchainContext";
import Login from "./components/Auth/Login";
import ECPortal from "./components/EC/ECPortal";
import VoterPortal from "./components/Voter/VoterPortal";
import PartyPortal from "./components/Party/PartyPortal";
import ManifestoChatbot from "./components/Voter/ManifestoChatbot";

// Protected Route Component
function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// Unauthorized access component
const Unauthorized = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center">
      <div className="text-red-400 text-6xl mb-4">🚫</div>
      <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
      <p className="text-gray-400">
        You don't have permission to access this page.
      </p>
      <button
        onClick={() => (window.location.href = "/login")}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
      >
        Go to Login
      </button>
    </div>
  </div>
);

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate
                to={
                  user.role === "EC"
                    ? "/ec"
                    : user.role === "PARTY"
                    ? "/party"
                    : "/voter"
                }
                replace
              />
            ) : (
              <Login />
            )
          }
        />

        <Route
          path="/ec/*"
          element={
            <ProtectedRoute requiredRole="EC">
              <ECPortal />
            </ProtectedRoute>
          }
        />

        <Route
          path="/voter/*"
          element={
            <ProtectedRoute requiredRole="VOTER">
              <VoterPortal />
            </ProtectedRoute>
          }
        />

        {/* Full-screen chatbot route */}
        <Route
          path="/manifesto-chat"
          element={
            <ProtectedRoute requiredRole="VOTER">
              <ManifestoChatbot />
            </ProtectedRoute>
          }
        />

        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route
          path="/party/*"
          element={
            <ProtectedRoute requiredRole="PARTY">
              <PartyPortal />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            user ? (
              <Navigate
                to={
                  user.role === "EC"
                    ? "/ec"
                    : user.role === "PARTY"
                    ? "/party"
                    : "/voter"
                }
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BlockchainProvider>
        <AppContent />
      </BlockchainProvider>
    </AuthProvider>
  );
}

export default App;
