import React from "react";
import Navbar from "../components/Navbar";
import { useState } from "react";
import LevelSelection from "./LevelSelection";
import { useNavigate } from 'react-router-dom'
export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
      
    const token = localStorage.getItem('token');

    if (token) {
      navigate('/level-selection');
     
    }
    else {
      navigate('/login');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      <Navbar/>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28">
        <span className="text-xs font-medium text-indigo-600 tracking-widest uppercase mb-4 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
          Career Guidance Platform
        </span>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight max-w-2xl text-slate-900 mt-2">
          Discover the Right Career Path for You
        </h1>

        <p className="mt-5 text-slate-500 max-w-lg text-base leading-relaxed">
          Personalized guidance based on your interests, skills, and goals.
        </p>


        <div className="flex *:flex-col md:flex-row gap-4 justify-center mt-6">

        <button onClick={handleGetStarted} className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm cursor-pointer">
          Get Questionnaire
        </button>
        {/* <button onClick={() => navigate('/chat')} className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm cursor-pointer">
          AI Assistant
        </button> */}

        <button
  onClick={() => navigate("/recommendations")}
  className="mt-8 inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-5 py-3 text-sm font-medium text-indigo-600 shadow-sm transition-all duration-200 hover:bg-indigo-50 hover:shadow-md cursor-pointer"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5 flex-shrink-0"
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M7 5H3" />
  </svg>

  <span className="whitespace-nowrap">
    Chat with Assistant
  </span>
</button>

        <button onClick={() => navigate('/chat')} className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm cursor-pointer">
          Connect to Mentor
        </button>

        </div>

        

      </section>

      {/* Features */}
      <section className="px-6 pb-20 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">

        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-indigo-600 text-sm font-bold">01</span>
          </div>
          <h3 className="text-base font-semibold mb-2 text-slate-800">Smart Assessment</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Answer a few questions and discover your strengths.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-indigo-600 text-sm font-bold">02</span>
          </div>
          <h3 className="text-base font-semibold mb-2 text-slate-800">Career Roadmaps</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Get step-by-step guidance tailored to your goals.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-indigo-600 text-sm font-bold">03</span>
          </div>
          <h3 className="text-base font-semibold mb-2 text-slate-800">Expert Mentorship</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Connect with mentors and attend live sessions.
          </p>
        </div>

      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center border-t border-slate-200 bg-white">
        <h2 className="text-2xl font-semibold text-slate-900">
          Start your journey today
        </h2>

        <p className="text-slate-500 mt-3 text-sm">
          Take the first step towards a better future.
        </p>

        <button onClick={handleGetStarted} className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm">
          Get Questionnaire
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-slate-400 text-xs bg-white">
        © 2026 CareerGuide. All rights reserved.
      </footer>

    </div>
  );
}