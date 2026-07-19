import React from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
export default function LevelSelection() {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const levels = [
    { id: 1, title: "Below 10th", description: "Explore your interests and strengths early." },
    { id: 2, title: "After 10th", description: "Choose the right stream and direction." },
    { id: 3, title: "After 12th", description: "Decide your career path and courses." },
    { id: 4, title: "Engineering", description: "Specialize and plan your career growth." }
  ]
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      
      <Navbar />

      {/* Heading */}
      <div className="text-center mt-16 px-6">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          Choose Your Current Level
        </h1>
        <p className="text-slate-500 mt-3 text-sm max-w-md mx-auto">
          We'll tailor questions based on where you are in your journey.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-12 max-w-5xl mx-auto">
        {levels.map(level => (
          <div key={level.id}
            onClick={() => {
              setSelectedLevel(level.title.split(" ").join("_").toLowerCase());
              setSelectedId(level.id);
            }}
            className={`bg-white p-6 rounded-xl cursor-pointer transition-all duration-200 border shadow-sm ${
              selectedId === level.id
                ? "border-indigo-500 ring-2 ring-indigo-100"
                : "border-slate-200 hover:border-slate-300 hover:shadow-md"
            }`}
          >
            <h2 className="text-base font-semibold mb-2 text-slate-900">{level.title}</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              {level.description}
            </p>
          </div>
        ))}
      </div>

      {/* Continue Button */}
      
      {/* <div className="text-center pb-16">
        <button onClick={()=> navigate(`/questions/${selectedLevel}`)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm">
          Continue
        </button>
      </div> */}

     { !selectedLevel ? (
  <div className="text-center pb-16">
    <button disabled className="bg-indigo-300 text-white px-8 py-3 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm cursor-not-allowed">
      Continue
    </button>
  </div>
) : (
  <div className="text-center pb-16">
    <button onClick={() => navigate(`/questions/${selectedLevel}`)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm">
      Continue
    </button>
  </div>
)}

    </div>
  );
}