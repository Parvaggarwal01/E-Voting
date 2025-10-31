import React, { useState, useEffect } from "react";
import { api } from "../../services/api";

function ManageParties() {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingParty, setEditingParty] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    name: "",
    symbolUrl: "",
  });

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      setLoading(true);
      const response = await api.get("/public/parties");
      setParties(response.data);
    } catch (error) {
      console.error("Error fetching parties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (party) => {
    setEditingParty(party);
    setEditForm({
      name: party.name,
      symbolUrl: party.symbolUrl,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingParty) return;

    try {
      setUpdating(true);
      await api.updateParty(editingParty.id, editForm.name, editForm.symbolUrl);

      // Update local state
      setParties(
        parties.map((p) =>
          p.id === editingParty.id
            ? { ...p, name: editForm.name, symbolUrl: editForm.symbolUrl }
            : p
        )
      );

      setEditingParty(null);
      setEditForm({ name: "", symbolUrl: "" });
    } catch (error) {
      console.error("Error updating party:", error);
      alert("Failed to update party. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClick = (party) => {
    setDeleteConfirmation(party);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation) return;

    try {
      setDeleting(true);
      await api.deleteParty(deleteConfirmation.id);

      // Remove from local state
      setParties(parties.filter((p) => p.id !== deleteConfirmation.id));
      setDeleteConfirmation(null);

      // Show success message
      alert("Party deleted successfully!");
    } catch (error) {
      console.error("Error deleting party:", error);
      const errorMessage =
        error.response?.data?.error ||
        "Failed to delete party. Please try again.";
      alert(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingParty(null);
    setEditForm({ name: "", symbolUrl: "" });
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Loading parties...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">Manage Parties</h1>
          <p className="text-[#3F3F46] mt-1">
            View, edit, and delete political parties in the system.
          </p>
        </div>
        <div className="text-sm text-[#3F3F46]">
          Total Parties: {parties.length}
        </div>
      </div>

      {/* Parties List */}
      <div className="space-y-4">
        {parties.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border shadow border-[#E2E8F0] text-center">
            <div className="text-6xl mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 8h7" /> <path d="M8 12h6" /> <path d="M11 16h5" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black mb-2">
              No Parties Found
            </h3>
            <p className="text-[#3F3F46]">
              No political parties have been created yet. Create your first
              party to get started.
            </p>
          </div>
        ) : (
          parties.map((party) => (
            <div
              key={party.id}
              className="bg-white p-6 rounded-lg border shadow border-[#E2E8F0] hover:border-gray-400 transition-colors"
            >
              {editingParty?.id === party.id ? (
                // Edit Form
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Party Name
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-black"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Symbol URL
                      </label>
                      <input
                        type="url"
                        value={editForm.symbolUrl}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            symbolUrl: e.target.value,
                          })
                        }
                        className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-black"
                        required
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  {editForm.symbolUrl && (
                    <div className="flex items-center gap-3 p-3 bg-white border border-[#E2E8F0] rounded-lg">
                      <img
                        src={editForm.symbolUrl}
                        alt="Party Symbol Preview"
                        className="w-12 h-12 rounded-full object-cover bg-white p-1"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <span className="text-black">
                        Preview: {editForm.name}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={updating}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {updating ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <span>✅</span>
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={updating}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                // Display Mode
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={party.symbolUrl}
                      alt={party.name}
                      className="w-16 h-16 rounded-full object-cover bg-white p-2"
                      onError={(e) => {
                        e.target.src =
                          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23374151"/><text x="32" y="36" font-family="sans-serif" font-size="24" fill="%23d1d5db" text-anchor="middle">🏛️</text></svg>';
                      }}
                    />
                    <div>
                      <h3 className="text-xl font-bold text-black">
                        {party.name}
                      </h3>
                      <p className="text-[#3F3F46] text-sm">
                        Party ID: {party.id}
                      </p>
                      <p className="text-[#3F3F46] text-xs mt-1">
                        Symbol URL:
                        <a
                          href={party.symbolUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-300 ml-1"
                        >
                          {party.symbolUrl.length > 50
                            ? party.symbolUrl.substring(0, 50) + "..."
                            : party.symbolUrl}
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEditClick(party)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
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
                          class="lucide lucide-pen-icon lucide-pen"
                        >
                          <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                        </svg>
                      </span>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(party)}
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
              )}
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Delete Party
              </h3>
              <div className="flex items-center justify-center gap-3 mb-4">
                <img
                  src={deleteConfirmation.symbolUrl}
                  alt={deleteConfirmation.name}
                  className="w-12 h-12 rounded-full object-cover bg-white p-1"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <span className="text-white font-medium">
                  {deleteConfirmation.name}
                </span>
              </div>
              <p className="text-gray-400 mb-4">
                Are you sure you want to delete this party?
              </p>
              <div className="bg-red-900 border border-red-700 p-4 rounded-lg mb-6">
                <p className="text-red-200 text-sm">
                  <strong>Warning:</strong> This action cannot be undone. The
                  party will be permanently removed from the system.
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

export default ManageParties;
