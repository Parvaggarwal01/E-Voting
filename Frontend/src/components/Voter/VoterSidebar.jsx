import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import React, { useState } from "react";
import ChangePassword from "../Auth/ChangePassword";

function VoterSidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showChangePassword, setShowChangePassword] = useState(false);

  const menuItems = [
    {
      name: "Voting",
      icon: (
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
      ),
      path: "/voter/voting",
    },
    {
      name: "Results",
      icon: (
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
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M15 18a3 3 0 1 0-6 0" />
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
          <circle cx="12" cy="13" r="2" />
        </svg>
      ),
      path: "/voter/results",
    },
    {
      name: "Verify Receipt",
      icon: (
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
          class="lucide lucide-shield-check-icon lucide-shield-check"
        >
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
      path: "/voter/receipts",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="fixed left-0 top-0 h-full w-54 bg-[#FAFAFA] border-r border-[#E8EDF3]">
      <div className="p-6 border-b border-[#E8EDF3]">
        <h1 className="text-l font-bold text-black">Voter Portal</h1>
        <p className="text-[#3F3F46] text-xs mt-1">Cast your vote securely</p>
      </div>

      <nav className="mt-6 p-2">
        {" "}
        {/* Added some padding for spacing */}
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              // --- MODIFIED SECTION for ANIMATION ---
              className={`flex items-center gap-3 px-4 py-2 my-1 text-sm rounded-md
                transition-all duration-300 ease-in-out  ${
                  // Base classes for animation
                  isActive
                    ? "bg-black text-white shadow-md" // Style for the active link
                    : "text-[#3F3F46] hover:bg-gray-200" // Style for inactive and hover
                }`}
            >
              <span className="h-6 w-6">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#E8EDF3] space-y-3">
        {/* User Info */}
        <div className="text-xs text-[#3F3F46]">
          <p className="truncate">{user?.email}</p>
          <p className="font-black">{user?.name || "Voter"}</p>
        </div>

        {/* Change Password Button */}
        <button
          onClick={() => setShowChangePassword(true)}
          className="flex items-center gap-3 text-gray-600 hover:text-black transition-colors text-sm w-full"
        >
          <span className="w-6 h-6">
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </span>
          <span>Change Password</span>
        </button>

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-500 hover:text-red-700 transition-colors text-sm w-full"
        >
          <span className="w-6 h-6">
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
          </span>
          <span>Sign Out</span>
        </button>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePassword
          onClose={() => setShowChangePassword(false)}
          userEmail={user?.email}
        />
      )}
    </div>
  );
}

export default VoterSidebar;
