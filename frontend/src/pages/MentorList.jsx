import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import API from "../api/axios";
import { Link } from "react-router-dom";
import { Search, Star, Briefcase, Calendar, UserCheck } from "lucide-react";

export default function MentorList() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState("All");
  const [sortBy, setSortBy] = useState("rating");

  const expertiseCategories = [
    "All",
    "Software Engineering",
    "Full Stack",
    "AI/ML",
    "Data Science",
    "System Design",
    "Product Management",
    "Interview Prep",
    "Resume Review"
  ];

  useEffect(() => {
    fetchMentors();
  }, [selectedExpertise, sortBy]);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      let url = "/mentors?";
      if (selectedExpertise !== "All") {
        url += `expertise=${encodeURIComponent(selectedExpertise)}&`;
      }
      if (sortBy === "experience") {
        url += `sort=experience&`;
      } else if (sortBy === "newest") {
        url += `sort=newest&`;
      }

      const res = await API.get(url);
      setMentors(res.data.mentors || []);
    } catch (error) {
      console.error("Error fetching mentors:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMentors = mentors.filter((mentor) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      mentor.name?.toLowerCase().includes(q) ||
      mentor.title?.toLowerCase().includes(q) ||
      mentor.company?.toLowerCase().includes(q) ||
      mentor.bio?.toLowerCase().includes(q) ||
      mentor.expertise?.some((e) => e.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      {/* Header & Filter Controls */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-bold text-slate-900">Find a Mentor</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse verified mentors for 1-on-1 scheduled sessions, code reviews, and mock interviews.
          </p>

          {/* Search & Sort Bar */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, company, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs transition"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="rating">Sort: Highest Rated</option>
              <option value="experience">Sort: Most Experienced</option>
              <option value="newest">Sort: Newly Joined</option>
            </select>
          </div>

          {/* Expertise Filter Tags */}
          <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {expertiseCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedExpertise(cat)}
                className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  selectedExpertise === cat
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mentor Directory Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white p-5 rounded-xl border border-slate-200 animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                    <div className="h-2.5 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-10 bg-slate-100 rounded" />
                <div className="h-8 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6 max-w-md mx-auto">
            <UserCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900">No mentors match your search</h3>
            <p className="text-slate-500 text-xs mt-1 mb-3">
              Try adjusting your search keywords or selecting "All" categories.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedExpertise("All");
              }}
              className="px-3.5 py-1.5 bg-slate-900 text-white rounded-md text-xs font-medium transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredMentors.map((mentor) => (
              <div
                key={mentor._id}
                className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {mentor.name ? mentor.name.charAt(0).toUpperCase() : "M"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm truncate">
                        {mentor.name}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">
                        {mentor.title || "Software Engineer"}
                        {mentor.company ? ` • ${mentor.company}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex items-center gap-2 mt-3 text-xs">
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-0.5 rounded font-medium text-[11px]">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      <span>{mentor.averageRating > 0 ? mentor.averageRating.toFixed(1) : "5.0"}</span>
                      <span className="text-slate-400">({mentor.totalReviews || 0})</span>
                    </div>

                    {mentor.experienceYears > 0 && (
                      <div className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {mentor.experienceYears}+ yrs exp
                      </div>
                    )}

                    <div className="ml-auto text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {mentor.hourlyRate > 0 ? `$${mentor.hourlyRate}/session` : "Free"}
                    </div>
                  </div>

                  {/* Bio */}
                  {mentor.bio && (
                    <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {mentor.bio}
                    </p>
                  )}

                  {/* Expertise Tags */}
                  {mentor.expertise && mentor.expertise.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {mentor.expertise.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {mentor.expertise.length > 3 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{mentor.expertise.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <Link
                    to={`/mentors/${mentor._id}`}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-center py-2 rounded-lg font-medium text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>View Availability & Book</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
