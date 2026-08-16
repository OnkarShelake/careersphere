import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  Calendar,
  Sparkles,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Briefcase,
  MessageSquare
} from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isLoggedIn = !!token;
  const isMentor = user.role === "mentor";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link
            to={isMentor ? "/mentor" : "/"}
            className="flex items-center gap-2 font-bold text-base tracking-tight text-slate-900"
          >
            <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center text-white text-xs font-black">
              CS
            </div>
            <span>CareerSphere</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {isLoggedIn ? (
              isMentor ? (
                <>
                  <Link
                    to="/mentor"
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                      isActive("/mentor")
                        ? "bg-slate-100 text-slate-900 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    Mentor Portal
                  </Link>
                  <Link
                    to="/my-sessions"
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                      isActive("/my-sessions")
                        ? "bg-slate-100 text-slate-900 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    My Sessions
                  </Link>
                  <Link
                    to="/chat"
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                      isActive("/chat")
                        ? "bg-slate-100 text-slate-900 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    Messages
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/mentors"
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                      isActive("/mentors")
                        ? "bg-slate-100 text-slate-900 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    Find Mentors
                  </Link>
                  <Link
                    to="/my-sessions"
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                      isActive("/my-sessions")
                        ? "bg-slate-100 text-slate-900 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    My Sessions
                  </Link>
                  <Link
                    to="/chat"
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                      isActive("/chat")
                        ? "bg-slate-100 text-slate-900 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    Messages
                  </Link>
                  <Link
                    to="/level-selection"
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                      isActive("/level-selection")
                        ? "bg-slate-100 text-slate-900 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    Career Assessment
                  </Link>
                </>
              )
            ) : (
              <Link
                to="/mentors"
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  isActive("/mentors")
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Browse Mentors
              </Link>
            )}
          </nav>

          {/* Right Side / Auth Actions */}
          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-slate-50 transition border border-slate-200 text-xs font-medium text-slate-700"
                >
                  <div className="w-5 h-5 rounded bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="max-w-[120px] truncate">{user.name || "Profile"}</span>
                </Link>

                <button
                  onClick={handleLogOut}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 transition"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-md text-xs font-medium transition"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {isLoggedIn ? (
            <>
              <div className="py-2 border-b border-slate-100 mb-2">
                <p className="font-semibold text-slate-900 text-xs">{user.name}</p>
                <p className="text-[11px] text-slate-400 capitalize">{user.role || "User"}</p>
              </div>

              {isMentor ? (
                <>
                  <Link
                    to="/mentor"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 text-xs text-slate-700 hover:text-slate-900"
                  >
                    Mentor Portal
                  </Link>
                  <Link
                    to="/my-sessions"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 text-xs text-slate-700 hover:text-slate-900"
                  >
                    My Sessions
                  </Link>
                  <Link
                    to="/chat"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 text-xs text-slate-700 hover:text-slate-900"
                  >
                    Messages
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/mentors"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 text-xs text-slate-700 hover:text-slate-900"
                  >
                    Find Mentors
                  </Link>
                  <Link
                    to="/my-sessions"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 text-xs text-slate-700 hover:text-slate-900"
                  >
                    My Sessions
                  </Link>
                  <Link
                    to="/chat"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 text-xs text-slate-700 hover:text-slate-900"
                  >
                    Messages
                  </Link>
                  <Link
                    to="/level-selection"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 text-xs text-slate-700 hover:text-slate-900"
                  >
                    Career Assessment
                  </Link>
                </>
              )}

              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs text-slate-700 hover:text-slate-900"
              >
                Profile Settings
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogOut();
                }}
                className="w-full text-left py-1.5 text-xs text-red-600 font-medium"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/mentors"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs text-slate-700"
              >
                Browse Mentors
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs text-slate-700"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs font-semibold text-slate-900"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}