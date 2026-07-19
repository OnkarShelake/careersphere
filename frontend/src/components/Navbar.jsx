import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  const handleLogOut = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }
  return (
    <nav className="flex justify-between items-center px-8 py-3.5 border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">

      {/* Logo */}
      {/* <h1 onClick={() => navigate('/')} className="text-base font-semibold tracking-tight text-slate-900 cursor-pointer">
        CareerGuide
      </h1> */}

      <h1
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-2xl font-bold tracking-tight cursor-pointer hover:scale-[1.02] transition-transform duration-200 select-none"
      >
        <svg
          className="w-7 h-7 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
        <div>
          <span className="text-slate-900">Career</span>
          <span className="text-blue-600">Guide</span>
        </div>
      </h1>

      {/* Right Side */}
      {isLoggedIn ? (
        <div className="flex items-center gap-4">
          <button onClick={handleLogOut} className="text-sm text-slate-500 cursor-pointer hover:text-slate-800 transition-colors duration-200">
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <button className="text-sm text-slate-500 hover:text-slate-800 transition-colors duration-200">
            Sign In
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
            Sign Up
          </button>
        </div>
      )}

    </nav>
  );
}