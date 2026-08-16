import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function LevelSelection() {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const levels = [
    { id: 1, title: "Below 10th", description: "Explore foundational interests and early strengths." },
    { id: 2, title: "After 10th", description: "Choose the right higher secondary stream and subjects." },
    { id: 3, title: "After 12th", description: "Select undergraduate degrees and career trajectories." },
    { id: 4, title: "Engineering", description: "Specialized domains: Software, AI/ML, Cloud, Data." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full flex-1 flex flex-col justify-center">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Choose Your Current Level
          </h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-sm max-w-md mx-auto">
            Questions will be customized based on your current stage of education.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8">
          {levels.map((level) => (
            <div
              key={level.id}
              onClick={() => {
                setSelectedLevel(level.title.split(" ").join("_").toLowerCase());
                setSelectedId(level.id);
              }}
              className={`bg-white p-5 rounded-xl cursor-pointer transition border text-left ${
                selectedId === level.id
                  ? "border-slate-900 bg-slate-50/50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <h2 className="text-sm font-bold text-slate-900 mb-1">{level.title}</h2>
              <p className="text-slate-500 text-xs leading-relaxed">
                {level.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate(`/questions/${selectedLevel}`)}
            disabled={!selectedLevel}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue to Assessment
          </button>
        </div>
      </main>
    </div>
  );
}