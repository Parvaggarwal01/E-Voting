const API_BASE_URL = "http://localhost:8000/api";

class ApiService {
  constructor() {
    this.defaults = {
      headers: {
        common: {},
      },
    };
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem("token");

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...this.defaults.headers.common,
        ...options.headers,
      },
      ...options,
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return { data };
    } catch (error) {
      console.error("API request failed:", error);
      // Throw error in axios-like format
      const axiosError = new Error(error.message);
      axiosError.response = {
        data: { error: error.message },
      };
      throw axiosError;
    }
  }

  // Axios-like methods
  async get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }

  // Auth endpoints (keeping legacy methods for backward compatibility)
  async login(email, password) {
    return this.post("/auth/login", { email, password });
  }

  async register(email, password) {
    return this.post("/auth/register", { email, password });
  }

  // Public endpoints
  async getElections() {
    return this.get("/public/elections");
  }

  async getElectionDetails(id) {
    return this.get(`/public/elections/${id}`);
  }

  async getElectionResults(id) {
    return this.get(`/public/elections/${id}/results`);
  }

  async getElectionStatus(id) {
    return this.get(`/public/elections/${id}/status`);
  }

  async getReceiptsForElection(id) {
    return this.get(`/public/elections/${id}/receipts`);
  }

  async getParties() {
    return this.get("/public/parties");
  }

  // Voting endpoints
  async requestSignature(blindedMessage, electionId) {
    return this.post("/vote/request-signature", { blindedMessage, electionId });
  }

  async submitVote(voteMessage, signature, electionId) {
    return this.post("/vote/submit", { voteMessage, signature, electionId });
  }

  // Admin endpoints
  async createParty(name, symbolUrl) {
    return this.post("/admin/parties", { name, symbolUrl });
  }

  async updateParty(id, name, symbolUrl) {
    return this.put(`/admin/parties/${id}`, { name, symbolUrl });
  }

  async deleteParty(id) {
    return this.delete(`/admin/parties/${id}`);
  }

  async createElection(name, startDate, endDate, partyIds) {
    return this.post("/admin/elections", {
      name,
      startDate,
      endDate,
      partyIds,
    });
  }

  async deleteElection(id) {
    return this.delete(`/admin/elections/${id}`);
  }

  async calculateResults(electionId) {
    return this.post(`/admin/elections/${electionId}/calculate-results`);
  }

  async publishResults(electionId, publish) {
    return this.post(`/admin/elections/${electionId}/publish-results`, {
      publish,
    });
  }

  async getElectionStats(electionId) {
    return this.get(`/admin/elections/${electionId}/stats`);
  }

  // Get dashboard statistics
  async getDashboardStats() {
    return this.get("/admin/dashboard/stats");
  }
}

const apiService = new ApiService();

// Export both as default and named export for compatibility
export default apiService;
export { apiService as api };
