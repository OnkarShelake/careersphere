import React from "react";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { Users, Video, Calendar, ArrowRight, ShieldCheck, Briefcase, Sparkles } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
            1-on-1 Mentorship & Career Guidance
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Connect with experienced software engineers and industry mentors for scheduled 1:1 video guidance, code reviews, and interview preparation.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/mentors"
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>Browse Mentors</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/level-selection"
              className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-slate-500" />
              <span>Career Assessment</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Step Workflow */}
      <section className="py-14 max-w-5xl mx-auto px-4 sm:px-6 w-full">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900">How it works</h2>
          <p className="text-xs text-slate-500 mt-1">A simple, transparent process to get personalized guidance.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-400">01</span>
            <h3 className="text-sm font-bold text-slate-900 mt-2 mb-1.5">Find a Mentor</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Filter mentors by tech stack, experience, and domain expertise. Review their public profile and student feedback.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-400">02</span>
            <h3 className="text-sm font-bold text-slate-900 mt-2 mb-1.5">Book Available Slot</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Choose an open time slot from the mentor's schedule and include your discussion topics or resume link.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-400">03</span>
            <h3 className="text-sm font-bold text-slate-900 mt-2 mb-1.5">1:1 Video & Real-Time Chat</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Join the live WebRTC session directly from your browser. Message back and forth and leave a review.
            </p>
          </div>
        </div>
      </section>

      {/* Mentor Callout */}
      <section className="bg-white border-y border-slate-200 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Interested in mentoring?</h2>
            <p className="text-xs text-slate-500 mt-1">
              Set your own availability, help students transition into tech, and conduct 1-on-1 sessions.
            </p>
          </div>

          <Link
            to="/register"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition whitespace-nowrap"
          >
            Apply as a Mentor
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-slate-400 bg-slate-50 mt-auto">
        © 2026 CareerSphere. All rights reserved.
      </footer>
    </div>
  );
}