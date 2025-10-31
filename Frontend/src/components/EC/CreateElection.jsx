import React, { useState, useEffect } from "react";
import { api } from "../../services/api";

function CreateElection() {
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    partyIds: [],
  });
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      const response = await api.get("/public/parties");
      setParties(response.data);
    } catch (error) {
      console.error("Error fetching parties:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePartySelection = (partyId) => {
    setFormData((prev) => ({
      ...prev,
      partyIds: prev.partyIds.includes(partyId)
        ? prev.partyIds.filter((id) => id !== partyId)
        : [...prev.partyIds, partyId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (formData.partyIds.length === 0) {
      setMessage("Please select at least one party for the election.");
      setLoading(false);
      return;
    }

    try {
      await api.post("/admin/elections", formData);
      setMessage("Election created successfully!");
      setFormData({
        name: "",
        startDate: "",
        endDate: "",
        partyIds: [],
      });
    } catch (error) {
      setMessage(
        "Error creating election: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Create New Election</h1>
        <p className="text-[#3F3F46] mt-1">
          Set up a new election with participating parties and schedule.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Form */}
        <div className="col-span-2 bg-white p-6 rounded-lg border shadow border-[#E2E8F0]">
          <h2 className="text-xl font-bold text-black mb-6">
            Election Details
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#3F3F46] mb-2">
                Election Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white border shadow border-[#E2E8F0] rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter election name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Participating Parties *
              </label>
              <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                {" "}
                {/* Added a little padding */}
                {parties.map((party) => (
                  <div
                    key={party.id}
                    onClick={() => handlePartySelection(party.id)}
                    // 1. Added 'group' for hover effects and 'duration-300' for smooth animation
                    className={`p-3 rounded-lg border cursor-pointer transition-colors duration-300 group ${
                      formData.partyIds.includes(party.id)
                        ? "bg-black border-black" // Selected state
                        : "bg-white border-[#E2E8F0] hover:bg-black" // Normal and hover state
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={party.symbolUrl}
                        alt={party.name}
                        className="w-8 h-8 rounded-full object-cover bg-white p-1"
                      />
                      {/* 2. Made text color conditional and added hover/transition effects */}
                      <span
                        className={`text-sm transition-colors duration-300 ${
                          formData.partyIds.includes(party.id)
                            ? "text-white" // Text is white if selected
                            : "text-black group-hover:text-white" // Black, but turns white on parent hover
                        }`}
                      >
                        {party.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[#3F3F46] text-xs mt-2">
                Select at least one party to participate in the election
              </p>
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg ${
                  message.includes("Error")
                    ? "bg-red-900 text-red-200 border border-red-700"
                    : "bg-green-900 text-green-200 border border-green-700"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Election"}
            </button>
          </form>
        </div>

        {/* Preview */}
        <div className="bg-white p-6 rounded-lg border shadow border-[#E2E8F0]">
          <h2 className="text-xl font-bold text-black mb-6">
            Election Summary
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-black">
                {formData.name || "Election Name"}
              </h3>
              <p className="text-[#3F3F46] text-sm">
                {formData.startDate && formData.endDate
                  ? `${new Date(
                      formData.startDate
                    ).toLocaleDateString()} - ${new Date(
                      formData.endDate
                    ).toLocaleDateString()}`
                  : "Select dates"}
              </p>
            </div>

            <div>
              <p className="text-[#3F3F46] text-sm mb-2">
                Selected Parties ({formData.partyIds.length})
              </p>
              <div className="space-y-2">
                {formData.partyIds.map((partyId) => {
                  const party = parties.find((p) => p.id === partyId);
                  return party ? (
                    <div
                      key={party.id}
                      className="flex items-center gap-2 p-2 bg-white border border-[#E2E8F0] rounded"
                    >
                      <img
                        src={party.symbolUrl}
                        alt={party.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-black text-xs">{party.name}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            <div className="text-sm text-[#3F3F46]">
              <p>• Election dates cannot overlap with existing elections</p>
              <p>• At least 2 parties required</p>
              <p>• End date must be after start date</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateElection;
