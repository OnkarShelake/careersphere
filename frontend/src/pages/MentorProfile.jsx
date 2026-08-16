import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../api/axios";
import {
  Star,
  Briefcase,
  Calendar,
  ArrowLeft,
  ShieldCheck,
  CheckCircle,
  MessageSquare
} from "lucide-react";
import { toast } from "react-toastify";

export default function MentorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mentor, setMentor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking State
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [topic, setTopic] = useState("Career Guidance & Mentorship");
  const [notes, setNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchMentorDetails();
  }, [id]);

  const fetchMentorDetails = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/mentors/${id}`);
      setMentor(res.data.mentor);
      setAvailableSlots(res.data.availableSlots || []);
      setReviews(res.data.reviews || []);
    } catch (error) {
      console.error("Error fetching mentor:", error);
      toast.error("Could not load mentor details.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.info("Please sign in or register to book a session.");
      navigate("/login");
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (currentUser.role === "mentor") {
      toast.error("Mentors cannot book sessions with other mentors. Please switch to a student account.");
      return;
    }

    if (!selectedSlot) {
      toast.error("Please select an available time slot.");
      return;
    }

    setBookingLoading(true);
    try {
      const payload = {
        mentorId: mentor._id,
        slotId: selectedSlot._id,
        date: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        topic,
        notes
      };

      await API.post("/sessions/book", payload);
      toast.success("Session request sent to mentor!");
      navigate("/my-sessions");
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(error.response?.data?.message || "Failed to book session.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-xs">
        Loading mentor profile...
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-base font-bold text-slate-900 mb-1">Mentor Not Found</h2>
        <p className="text-slate-500 text-xs mb-3">The mentor profile you are looking for does not exist.</p>
        <Link to="/mentors" className="bg-slate-900 text-white px-3.5 py-1.5 rounded-md text-xs font-medium">
          Browse Mentors
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        {/* Back link */}
        <Link
          to="/mentors"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-4 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Mentors</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mentor Profile Details */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-800 text-white font-bold text-xl flex items-center justify-center flex-shrink-0">
                  {mentor.name ? mentor.name.charAt(0).toUpperCase() : "M"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-slate-900">{mentor.name}</h1>
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Verified
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {mentor.title || "Senior Software Engineer"} {mentor.company && <span>at {mentor.company}</span>}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                    <div className="flex items-center gap-1 text-slate-800 font-medium bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      <span>{mentor.averageRating > 0 ? mentor.averageRating.toFixed(1) : "5.0"}</span>
                      <span className="text-slate-400">({mentor.totalReviews || 0} reviews)</span>
                    </div>

                    {mentor.experienceYears > 0 && (
                      <div className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {mentor.experienceYears}+ Years Exp
                      </div>
                    )}

                    <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {mentor.hourlyRate > 0 ? `$${mentor.hourlyRate} / session` : "Free"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {mentor.bio && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">About</h3>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{mentor.bio}</p>
                </div>
              )}

              {/* Expertise Tags */}
              {mentor.expertise && mentor.expertise.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Expertise
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {mentor.expertise.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-slate-100 text-slate-700 font-medium rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Student Reviews */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">Student Reviews ({reviews.length})</h3>
                <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{mentor.averageRating > 0 ? mentor.averageRating.toFixed(1) : "5.0"} / 5.0</span>
                </div>
              </div>

              {reviews.length === 0 ? (
                <p className="text-slate-400 text-xs py-4 text-center">No student reviews yet.</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">
                          {rev.studentId?.name || "Student"}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      {rev.comment && <p className="text-slate-600 italic">"{rev.comment}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Booking Widget Sidebar */}
          <div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-18">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                <Calendar className="w-4 h-4 text-slate-700" />
                <h3 className="font-bold text-slate-900 text-sm">Book a Session</h3>
              </div>

              <form onSubmit={handleBookSession} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Available Time Slots *
                  </label>

                  {availableSlots.length === 0 ? (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs">
                      No open slots posted by mentor currently.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-52 overflow-y-auto">
                      {availableSlots.map((slot) => {
                        const isSelected = selectedSlot?._id === slot._id;
                        return (
                          <button
                            type="button"
                            key={slot._id}
                            onClick={() => setSelectedSlot(slot)}
                            className={`w-full text-left p-2.5 rounded-lg border text-xs transition flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "bg-slate-900 border-slate-900 text-white font-medium"
                                : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                            }`}
                          >
                            <div>
                              <span className="font-semibold block">{slot.date}</span>
                              <span className={`text-[11px] ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                            {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Topic
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="Career Guidance & Mentorship">Career Guidance & Mentorship</option>
                    <option value="Resume & Portfolio Review">Resume & Portfolio Review</option>
                    <option value="Technical Mock Interview">Technical Mock Interview</option>
                    <option value="System Design Discussion">System Design Discussion</option>
                    <option value="General Q&A and Advice">General Q&A and Advice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Notes for Mentor
                  </label>
                  <textarea
                    rows="3"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Questions or topics you would like to discuss..."
                    className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading || availableSlots.length === 0 || !selectedSlot}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg font-semibold text-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? "Requesting..." : "Request 1-on-1 Session"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
