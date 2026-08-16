import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Video,
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  FileText,
  ExternalLink
} from "lucide-react";
import { toast } from "react-toastify";

export default function MentorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'sessions' | 'availability' | 'reviews'
  const [loading, setLoading] = useState(true);

  const [mentorProfile, setMentorProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [slots, setSlots] = useState([]);
  const [reviews, setReviews] = useState([]);

  // New Slot Input State
  const [newSlot, setNewSlot] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "11:00"
  });
  const [addingSlot, setAddingSlot] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "mentor") {
      toast.error("Access restricted to mentors only.");
      navigate("/");
      return;
    }

    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [profileRes, sessionsRes, slotsRes] = await Promise.all([
        API.get("/users/profile"),
        API.get("/sessions/my-sessions"),
        API.get("/mentors/availability/me")
      ]);

      setMentorProfile(profileRes.data.user);
      setSessions(sessionsRes.data.sessions || []);
      setSlots(slotsRes.data.slots || []);

      if (profileRes.data.user?._id) {
        const mentorDetailsRes = await API.get(`/mentors/${profileRes.data.user._id}`);
        setReviews(mentorDetailsRes.data.reviews || []);
      }
    } catch (error) {
      console.error("Mentor dashboard load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (sessionId, status) => {
    try {
      await API.patch(`/sessions/${sessionId}/status`, { status });
      toast.success(`Session ${status === "confirmed" ? "accepted" : status}`);
      loadDashboardData();
    } catch (error) {
      console.error("Status update error:", error);
      toast.error(error.response?.data?.message || "Action failed.");
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) {
      toast.error("Please fill in date, start time, and end time.");
      return;
    }

    setAddingSlot(true);
    try {
      await API.post("/mentors/availability", newSlot);
      toast.success("Time slot added to your schedule!");
      const res = await API.get("/mentors/availability/me");
      setSlots(res.data.slots || []);
    } catch (error) {
      console.error("Add slot error:", error);
      toast.error(error.response?.data?.message || "Failed to add slot.");
    } finally {
      setAddingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      await API.delete(`/mentors/availability/${slotId}`);
      toast.success("Slot removed.");
      setSlots((prev) => prev.filter((s) => s._id !== slotId));
    } catch (error) {
      console.error("Delete slot error:", error);
      toast.error(error.response?.data?.message || "Could not delete slot.");
    }
  };

  const pendingRequests = sessions.filter((s) => s.status === "pending");
  const confirmedSessions = sessions.filter((s) => s.status === "confirmed");

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-xs">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        {/* Mentor Header Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-lg flex-shrink-0">
              {mentorProfile?.name ? mentorProfile.name.charAt(0).toUpperCase() : "M"}
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">{mentorProfile?.name}</h1>
              <p className="text-xs text-slate-500">
                {mentorProfile?.title || "Mentor"} {mentorProfile?.company && `• ${mentorProfile.company}`} • {mentorProfile?.experienceYears || 0}+ yrs exp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/profile"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition"
            >
              Edit Profile
            </Link>
            <button
              onClick={() => setActiveTab("availability")}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium transition cursor-pointer"
            >
              + Add Availability
            </button>
          </div>
        </div>

        {/* Minimal Stat Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500 block">Pending Requests</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">{pendingRequests.length}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500 block">Upcoming Live Sessions</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">{confirmedSessions.length}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500 block">Average Rating</span>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xl font-bold text-slate-900">
                {mentorProfile?.averageRating > 0 ? mentorProfile.averageRating.toFixed(1) : "5.0"}
              </span>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500 block">Open Slots</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {slots.filter((s) => !s.isBooked).length}
            </span>
          </div>
        </div>

        {/* Segmented Tab Controls */}
        <div className="flex items-center gap-1 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition cursor-pointer ${
              activeTab === "overview"
                ? "border-slate-900 text-slate-900 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Booking Requests ({pendingRequests.length})
          </button>

          <button
            onClick={() => setActiveTab("sessions")}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition cursor-pointer ${
              activeTab === "sessions"
                ? "border-slate-900 text-slate-900 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Live Sessions ({confirmedSessions.length})
          </button>

          <button
            onClick={() => setActiveTab("availability")}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition cursor-pointer ${
              activeTab === "availability"
                ? "border-slate-900 text-slate-900 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Schedule Manager ({slots.length})
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition cursor-pointer ${
              activeTab === "reviews"
                ? "border-slate-900 text-slate-900 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {/* Tab 1: Requests */}
        {activeTab === "overview" && (
          <div className="space-y-3">
            {pendingRequests.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">
                No pending student booking requests.
              </div>
            ) : (
              pendingRequests.map((session) => (
                <div
                  key={session._id}
                  className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        Pending Request
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {session.date} • {session.startTime} - {session.endTime}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {session.studentId?.name || "Student"}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {session.studentId?.educationLevel || "Student"} {session.studentId?.college && `• ${session.studentId.college}`}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                      <p className="font-semibold text-slate-800">
                        <span className="text-slate-400 font-normal">Topic:</span> {session.topic}
                      </p>
                      {session.notes && (
                        <p className="text-slate-600 italic">"{session.notes}"</p>
                      )}
                      {session.studentId?.resumeUrl && (
                        <a
                          href={session.studentId.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 font-medium mt-1 underline"
                        >
                          <FileText className="w-3 h-3" />
                          <span>View Student Resume</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleStatusUpdate(session._id, "confirmed")}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-md font-medium text-xs transition cursor-pointer"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(session._id, "rejected")}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-md font-medium text-xs transition cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Confirmed Sessions */}
        {activeTab === "sessions" && (
          <div className="space-y-3">
            {confirmedSessions.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">
                No upcoming confirmed sessions.
              </div>
            ) : (
              confirmedSessions.map((session) => (
                <div
                  key={session._id}
                  className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Confirmed Session
                      </span>
                      <span className="text-xs text-slate-500">
                        {session.date} • {session.startTime} - {session.endTime}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm">
                      {session.studentId?.name || "Student"}
                    </h3>
                    <p className="text-xs text-slate-600">
                      Topic: {session.topic}
                    </p>
                  </div>

                  <div className="flex md:flex-col gap-2 flex-shrink-0">
                    <Link
                      to={`/call/${session.meetingRoomId}?with=${session.studentId?._id}`}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-md font-medium text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Video</span>
                    </Link>

                    <Link
                      to={`/chat?with=${session.studentId?._id}`}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-md font-medium text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </Link>

                    <button
                      onClick={() => handleStatusUpdate(session._id, "completed")}
                      className="text-[11px] text-slate-500 hover:text-slate-900 underline py-0.5 text-center cursor-pointer"
                    >
                      Mark Completed
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Availability Manager */}
        {activeTab === "availability" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 h-fit">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Add Time Slot</h3>
              <form onSubmit={handleAddSlot} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1">Date</label>
                  <input
                    required
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={newSlot.date}
                    onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-1">Start Time</label>
                    <input
                      required
                      type="time"
                      value={newSlot.startTime}
                      onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">End Time</label>
                    <input
                      required
                      type="time"
                      value={newSlot.endTime}
                      onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={addingSlot}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-md font-medium text-xs transition cursor-pointer"
                >
                  {addingSlot ? "Posting..." : "Post Slot"}
                </button>
              </form>
            </div>

            {/* Slots List */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Your Schedule Slots ({slots.length})</h3>
              {slots.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-xs text-slate-400">
                  No slots created yet. Add a time slot using the form.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {slots.map((slot) => (
                    <div
                      key={slot._id}
                      className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                        slot.isBooked ? "bg-slate-100 border-slate-300" : "bg-white border-slate-200"
                      }`}
                    >
                      <div>
                        <span className="font-semibold text-slate-900 block">{slot.date}</span>
                        <span className="text-slate-500">{slot.startTime} - {slot.endTime}</span>
                        <span className={`block text-[10px] mt-0.5 ${slot.isBooked ? "text-indigo-600 font-medium" : "text-emerald-700"}`}>
                          {slot.isBooked ? "Booked" : "Open"}
                        </span>
                      </div>

                      {!slot.isBooked && (
                        <button
                          onClick={() => handleDeleteSlot(slot._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Reviews */}
        {activeTab === "reviews" && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Student Feedback ({reviews.length})</h3>
            {reviews.length === 0 ? (
              <p className="text-slate-400 text-xs py-4 text-center">No reviews submitted yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reviews.map((rev) => (
                  <div key={rev._id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{rev.studentId?.name || "Student"}</span>
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
        )}
      </main>
    </div>
  );
}
