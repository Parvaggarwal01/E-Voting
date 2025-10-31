import React, { useState, useEffect } from "react";
import { api } from "../../services/api";

function ManageElections() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const response = await api.get("/public/elections");
      setElections(response.data);
    } catch (error) {
      console.error("Error fetching elections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (election) => {
    setDeleteConfirmation(election);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation) return;

    try {
      setDeleting(true);
      await api.delete(`/admin/elections/${deleteConfirmation.id}`);

      // Remove from local state
      setElections(elections.filter((e) => e.id !== deleteConfirmation.id));
      setDeleteConfirmation(null);

      // Show success message (you could add a toast notification here)
      alert("Election deleted successfully!");
    } catch (error) {
      console.error("Error deleting election:", error);
      alert("Failed to delete election. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const getElectionStatus = (election) => {
    const now = new Date();
    const start = new Date(election.startDate);
    const end = new Date(election.endDate);

    if (now < start) {
      return { status: "Upcoming", color: "text-blue-400", bg: "bg-blue-900" };
    } else if (now >= start && now <= end) {
      return { status: "Active", color: "text-green-400", bg: "bg-green-900" };
    } else {
      return { status: "Ended", color: "text-white", bg: "bg-gray-900" };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Loading elections...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">Manage Elections</h1>
          <p className="text-[#3F3F46] mt-1">
            View, edit, and delete elections in the system.
          </p>
        </div>
        <div className="text-sm text-[#3F3F46]">
          Total Elections: {elections.length}
        </div>
      </div>

      {/* Elections List */}
      <div className="space-y-4">
        {elections.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border shadow border-[#E2E8F0] text-center">
            <div className="text-6xl mb-4">🗳️</div>
            <h3 className="text-xl font-bold text-white mb-2">
              No Elections Found
            </h3>
            <p className="text-[#3F3F46]">
              No elections have been created yet. Create your first election to
              get started.
            </p>
          </div>
        ) : (
          elections.map((election) => {
            const statusInfo = getElectionStatus(election);
            return (
              <div
                key={election.id}
                className="bg-white p-6 rounded-lg border shadow border-[#E2E8F0] hover:border-gray-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-black">
                        {election.name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color} ${statusInfo.bg}`}
                      >
                        {statusInfo.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-[#3F3F46]">Start Date:</span>
                        <p className="text-black">
                          {formatDate(election.startDate)}
                        </p>
                      </div>
                      <div>
                        <span className="text-[#3F3F46]">End Date:</span>
                        <p className="text-black">
                          {formatDate(election.endDate)}
                        </p>
                      </div>
                      <div>
                        <span className="text-[#3F3F46]">Parties:</span>
                        <p className="text-black">
                          {election.parties?.length || 0} registered
                        </p>
                      </div>
                      <div>
                        <span className="text-[#3F3F46]">Election ID:</span>
                        <p className="text-black font-mono text-xs">
                          {election.id}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 ml-6">
                    <button
                      onClick={() => handleDeleteClick(election)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                      disabled={deleting}
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
                          class="lucide lucide-delete-icon lucide-delete"
                        >
                          <path d="M10 5a2 2 0 0 0-1.344.519l-6.328 5.74a1 1 0 0 0 0 1.481l6.328 5.741A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" />
                          <path d="m12 9 6 6" />
                          <path d="m18 9-6 6" />
                        </svg>
                      </span>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Delete Election
              </h3>
              <p className="text-gray-400 mb-4">
                Are you sure you want to delete the election "
                {deleteConfirmation.name}"?
              </p>
              <div className="bg-red-900 border border-red-700 p-4 rounded-lg mb-6">
                <p className="text-red-200 text-sm">
                  <strong>Warning:</strong> This action cannot be undone. All
                  votes, results, and associated data will be permanently
                  deleted.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <span>🗑️</span>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageElections;
