import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PartySidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    {
      name: "Dashboard",
      path: "/party/dashboard",
      icon: "📊",
    },
    {
      name: "Manifesto",
      path: "/party/manifesto",
      icon: "📄",
    },
    {
      name: "Elections",
      path: "/party/elections",
      icon: "🗳️",
    },
    {
      name: "Settings",
      path: "/party/settings",
      icon: "⚙️",
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed left-0 top-0 w-64 h-full bg-white border-r border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Party Portal</h1>
        <p className="text-sm text-gray-600 mt-1">
          {user?.name || "Party Account"}
        </p>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">
              {user?.name?.charAt(0) || "P"}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || "Party Account"}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default PartySidebar;
