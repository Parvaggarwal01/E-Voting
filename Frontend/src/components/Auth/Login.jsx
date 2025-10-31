import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    aadhaarNumber: "",
  });
  const [loginType, setLoginType] = useState("voter"); // 'voter', 'ec', or 'party'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { loginWithCredentials } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const switchLoginType = (type) => {
    setLoginType(type);
    setFormData({ email: "", password: "", aadhaarNumber: "" });
    setError("");
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Client-side validation
      if (loginType === "voter" && !formData.aadhaarNumber) {
        setError("Aadhaar number is required for voter login.");
        setLoading(false);
        return;
      }

      if (loginType === "voter" && !/^\d{12}$/.test(formData.aadhaarNumber)) {
        setError("Aadhaar number must be exactly 12 digits.");
        setLoading(false);
        return;
      }

      let result;

      if (loginType === "voter") {
        // For voter login, include Aadhaar number
        console.log("Voter login attempt with:", {
          email: formData.email,
          aadhaar: formData.aadhaarNumber,
          loginType,
        });
        result = await loginWithCredentials(
          formData.email,
          formData.password,
          formData.aadhaarNumber
        );
      } else {
        // For EC and Party login, don't pass Aadhaar number
        console.log(`${loginType} login attempt with:`, {
          email: formData.email,
          loginType,
        });
        result = await loginWithCredentials(formData.email, formData.password);
      }

      if (!result.success) {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            E-Voting System
          </h1>
          <p className="text-white">Secure Digital Democracy</p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-8 rounded-lg border shadow border-[#E2E8F0]">
          <div className="mb-6">
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => switchLoginType("voter")}
                className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
                  loginType === "voter"
                    ? "bg-black text-white"
                    : "bg-gray-300 text-black"
                }`}
              >
                Voter
              </button>
              <button
                type="button"
                onClick={() => switchLoginType("party")}
                className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
                  loginType === "party"
                    ? "bg-black text-white"
                    : "bg-gray-300 text-black"
                }`}
              >
                Party
              </button>
              <button
                type="button"
                onClick={() => switchLoginType("ec")}
                className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
                  loginType === "ec"
                    ? "bg-black text-white"
                    : "bg-gray-300 text-black"
                }`}
              >
                EC
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-600/20 border border-red-600/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-black mb-2"
              >
                {loginType === "voter"
                  ? "Voter Email (@voter.gov)"
                  : loginType === "party"
                  ? "Party Email (@party.gov)"
                  : "Commissioner Email"}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-white border shadow border-[#E2E8F0] rounded-lg px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder={
                  loginType === "voter"
                    ? "voterId@voter.gov"
                    : loginType === "party"
                    ? "partyname@party.gov"
                    : "commissioner@ec.gov"
                }
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-black mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder={
                  loginType === "voter"
                    ? "DDMMYYYY@last4digits"
                    : loginType === "party"
                    ? "Party@123"
                    : "Enter your password"
                }
                required
              />
            </div>

            {loginType === "voter" && (
              <div>
                <label
                  htmlFor="aadhaarNumber"
                  className="block text-sm font-medium text-black mb-2"
                >
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  id="aadhaarNumber"
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Enter 12-digit Aadhaar number"
                  pattern="[0-9]{12}"
                  maxLength="12"
                  required={loginType === "voter"}
                />
              </div>
            )}

            {loginType === "voter" ? (
              <div className="mb-4 p-3 bg-white border border-[#E2E8F0] rounded-lg text-black text-sm">
                <p>
                  <strong>Voter Login Instructions</strong>
                </p>
                <p>• Use your @voter.gov email provided by EC</p>
                <p>• Password format: DDMMYYYY@last4digits</p>
                <p>• Enter your 12-digit Aadhaar number</p>
                <p className="mt-1 text-xs text-black">
                  Example: 15072005@9012
                </p>
              </div>
            ) : loginType === "party" ? (
              <div className="mb-4 p-3 bg-white border border-[#E2E8F0] rounded-lg text-black text-sm">
                <p>
                  <strong>Party Login Instructions</strong>
                </p>
                <p>• Use your @party.gov email provided by EC</p>
                <p>• Default password: Party@123</p>
                <p>• Change password after first login</p>
                <p className="mt-1 text-xs text-black">
                  Manage manifestos and view election results
                </p>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-white border border-[#E2E8F0] rounded-lg text-black text-sm">
                <p>
                  <strong>Election Commission Login</strong>
                </p>
                <p>• Commissioner1@ec.gov</p>
                <p>• Commissioner2@ec.gov</p>
                <p>• Commissioner3@ec.gov</p>
                <p className="mt-1 text-xs text-black">
                  Default password: ec123456
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                loginType === "voter"
                  ? "bg-black hover:bg-gray-800 text-white"
                  : "bg-black hover:bg-gray-8 00 text-white"
              }`}
            >
              {loading
                ? "Please wait..."
                : `Login as ${
                    loginType === "voter"
                      ? "Voter"
                      : loginType === "party"
                      ? "Party"
                      : "EC Commissioner"
                  }`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
