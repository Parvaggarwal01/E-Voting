import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import React, { useState } from "react";
import ChangePassword from "../Auth/ChangePassword";

function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showChangePassword, setShowChangePassword] = useState(false);

  // --- I've corrected all SVG attributes to use camelCase (e.g., strokeWidth) ---
  const menuItems = [
    {
      name: "Dashboard",
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
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      ),
      path: "/ec/dashboard",
    },
    {
      name: "Create Party",
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
          <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
          <line x1="12" x2="12" y1="8" y2="16" />
          <line x1="8" x2="16" y1="12" y2="12" />
        </svg>
      ),
      path: "/ec/create-party",
    },
    {
      name: "Manage Parties",
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
          <path d="m11 17 2 2a1 1 0 1 0 3-3" />
          <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
          <path d="m21 3 1 11h-2" />
          <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
          <path d="M3 4h8" />
        </svg>
      ),
      path: "/ec/manage-parties",
    },
    {
      name: "Manage Voters",
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
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <path d="M16 3.128a4 4 0 0 1 0 7.744" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      ),
      path: "/ec/manage-voters",
    },
    {
      name: "Create Election",
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
          <path d="M8 2v4" /> <path d="M16 2v4" />
          <rect width="18" height="18" x="3" y="4" rx="2" />
          <path d="M3 10h18" /> <path d="M10 16h4" /> <path d="M12 14v4" />
        </svg>
      ),
      path: "/ec/create-election",
    },
    {
      name: "Manage Elections",
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
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M9 8h7" /> <path d="M8 12h6" /> <path d="M11 16h5" />
        </svg>
      ),
      path: "/ec/manage-elections",
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
      path: "/ec/results",
    },
    {
      name: "Blockchain",
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
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      path: "/ec/blockchain",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="fixed left-0 top-0 h-full w-54 bg-[#FAFAFA] border-r border-[#E8EDF3]">
      <div className="p-6 border-b border-[#E8EDF3]">
        <h1 className="text-l font-bold text-black">EC Portal</h1>
        <p className="text-[#3F3F46] text-xs mt-1">Election Commission</p>
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
        <div className="text-xs text-[#3F3F46]">
          <p className="truncate"> {user?.email}</p>
          <p className="font-black">{user?.name || "EC Commissioner"}</p>
        </div>

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

      {showChangePassword && (
        <ChangePassword
          onClose={() => setShowChangePassword(false)}
          userEmail={user?.email}
        />
      )}
    </div>
  );
}

export default Sidebar;
