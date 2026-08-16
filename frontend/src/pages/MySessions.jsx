import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import API from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  FileText
} from "lucide-react";
import { toast } from "react-toastify";

export default function MySessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("confirmed"); // 'confirmed' | 'pending' | 'completed'
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isMentor = currentUser.role === "mentor";
  const navigate = useNavigate();

  // Review Modal State
  const [selectedReviewSession, setSelectedReviewSession] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await API.get("/sessions/my-sessions");
      setSessions(res.data.sessions || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to load your sessions.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (sessionId, newStatus) => {
    try {
      await API.patch(`/sessions/${sessionId}/status`, { status: newStatus });
      toast.success(`Session marked as ${newStatus}`);
      fetchSessions();
    } catch (error) {
      console.error("Status update error:", error);
      toast.error(error.response?.data?.message || "Failed to update session status.");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedReviewSession) return;

    setSubmittingReview(true);
    try {
      await API.post(`/sessions/${selectedReviewSession._id}/review`, {
        rating,
        comment: reviewComment
      });

      toast.success("Review recorded. Thank you!");
      setSelectedReviewSession(null);
      setReviewComment("");
      setRating(5);
      fetchSessions();
    } catch (error) {
      console.error("Review error:", error);
      toast.error(error.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const confirmedSessions = sessions.filter((s) => s.status === "confirmed");
  const pendingSessions = sessions.filter((s) => s.status === "pending");
  const completedSessions = sessions.filter((s) => s.status === "completed" || s.status === "rejected" || s.status === "cancelled");

  const displayedSessions =
    activeTab === "confirmed"
      ? confirmedSessions
      : activeTab === "pending"
      ? pendingSessions
      : completedSessions;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isMentor ? "Mentorship Sessions" : "My Guidance Sessions"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your scheduled 1:1 sessions, live calls, and messaging.
            </p>
          </div>

          {!isMentor && (
            <Link
              to="/mentors"
              className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-md text-xs font-medium transition self-start sm:self-auto"
            >
              + Find Mentor
            </Link>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("confirmed")}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition cursor-pointer ${
              activeTab === "confirmed"
                ? "border-slate-900 text-slate-900 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Confirmed ({confirmedSessions.length})
          </button>

          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition cursor-pointer ${
              activeTab === "pending"
                ? "border-slate-900 text-slate-900 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Pending ({pendingSessions.length})
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition cursor-pointer ${
              activeTab === "completed"
                ? "border-slate-900 text-slate-900 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            History ({completedSessions.length})
          </button>
        </div>

        {/* Sessions list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white p-5 rounded-xl border border-slate-200 animate-pulse h-28" />
            ))}
          </div>
        ) : displayedSessions.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-md mx-auto">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900">No {activeTab} sessions</h3>
            <p className="text-slate-500 text-xs mt-1 mb-4">
              {activeTab === "confirmed"
                ? "You have no upcoming confirmed sessions."
                : activeTab === "pending"
                ? "No pending requests in your queue."
                : "No past session history yet."}
            </p>
            {!isMentor && (
              <Link
                to="/mentors"
                className="bg-slate-900 text-white px-3.5 py-1.5 rounded-md text-xs font-medium"
              >
                Browse Mentors
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3.5">
            {displayedSessions.map((session) => {
              const otherUser = isMentor ? session.studentId : session.mentorId;
              const isConfirmed = session.status === "confirmed";
              const isPending = session.status === "pending";
              const isCompleted = session.status === "completed";

              return (
                <div
                  key={session._id}
                  className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                          isConfirmed
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : isPending
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {session.status}
                      </span>
                      <span className="text-slate-500">
                        {session.date} • {session.startTime} - {session.endTime}
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-sm flex-shrink-0">
                        {otherUser?.name ? otherUser.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          {isMentor ? `Student: ${otherUser?.name || "Student"}` : `Mentor: ${otherUser?.name || "Mentor"}`}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {otherUser?.title || otherUser?.educationLevel || "User"} {otherUser?.company && `• ${otherUser.company}`}
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1">
                      <p className="text-slate-800">
                        <span className="text-slate-400">Topic:</span> <strong>{session.topic}</strong>
                      </p>
                      {session.notes && (
                        <p className="text-slate-600 italic">"{session.notes}"</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col items-center justify-end gap-2 flex-shrink-0">
                    {isConfirmed && (
                      <>
                        <Link
                          to={`/call/${session.meetingRoomId}?with=${otherUser?._id}`}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-md font-medium text-xs transition flex items-center justify-center gap-1.5"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Video Call</span>
                        </Link>

                        <Link
                          to={`/chat?with=${otherUser?._id}`}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-md font-medium text-xs transition flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>1:1 Chat</span>
                        </Link>

                        <button
                          onClick={() => handleStatusUpdate(session._id, "completed")}
                          className="text-[11px] text-slate-500 hover:text-slate-900 underline py-0.5"
                        >
                          Mark Completed
                        </button>
                      </>
                    )}

                    {isPending && isMentor && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusUpdate(session._id, "confirmed")}
                          className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-md font-medium text-xs"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(session._id, "rejected")}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-md font-medium text-xs"
                        >
                          Decline
                        </button>
                      </div>
                    )}

                    {isPending && !isMentor && (
                      <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 font-medium">
                        Waiting for mentor confirmation
                      </span>
                    )}

                    {isCompleted && !isMentor && (
                      <div>
                        {session.rating ? (
                          <div className="text-xs text-slate-700 flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            <span>Rated {session.rating} / 5</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedReviewSession(session)}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-1.5 rounded-md font-medium text-xs transition flex items-center gap-1"
                          >
                            <Star className="w-3.5 h-3.5 fill-white" />
                            <span>Rate Mentor</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Review Modal */}
        {selectedReviewSession && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-5 border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Rate & Review Mentor</h3>
              <form onSubmit={handleSubmitReview} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1">Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 font-bold text-slate-800">{rating} / 5</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Feedback</label>
                  <textarea
                    rows="3"
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe your session experience..."
                    className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReviewSession(null)}
                    className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-100 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
