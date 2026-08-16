import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import API from "../api/axios";
import { User, GraduationCap, Briefcase, Save, X, Star } from "lucide-react";
import { toast } from "react-toastify";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState("student");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    avatar: "",
    // Student fields
    educationLevel: "",
    college: "",
    skills: [],
    newSkill: "",
    resumeUrl: "",
    targetCareer: "",
    // Mentor fields
    title: "",
    company: "",
    experienceYears: 0,
    expertise: [],
    newExpertise: "",
    hourlyRate: 0,
    linkedin: "",
    github: "",
    averageRating: 0,
    totalReviews: 0
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await API.get("/users/profile");
      const user = res.data.user;
      setRole(user.role || "student");
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
        educationLevel: user.educationLevel || "Undergraduate",
        college: user.college || "",
        skills: user.skills || [],
        newSkill: "",
        resumeUrl: user.resumeUrl || "",
        targetCareer: user.targetCareer || "",
        title: user.title || "",
        company: user.company || "",
        experienceYears: user.experienceYears || 0,
        expertise: user.expertise || [],
        newExpertise: "",
        hourlyRate: user.hourlyRate || 0,
        linkedin: user.linkedin || "",
        github: user.github || "",
        averageRating: user.averageRating || 0,
        totalReviews: user.totalReviews || 0
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (formData.newSkill.trim() && !formData.skills.includes(formData.newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, prev.newSkill.trim()],
        newSkill: ""
      }));
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove)
    }));
  };

  const handleAddExpertise = () => {
    if (formData.newExpertise.trim() && !formData.expertise.includes(formData.newExpertise.trim())) {
      setFormData((prev) => ({
        ...prev,
        expertise: [...prev.expertise, prev.newExpertise.trim()],
        newExpertise: ""
      }));
    }
  };

  const handleRemoveExpertise = (itemToRemove) => {
    setFormData((prev) => ({
      ...prev,
      expertise: prev.expertise.filter((e) => e !== itemToRemove)
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        avatar: formData.avatar,
      };

      if (role === "mentor") {
        payload.title = formData.title;
        payload.company = formData.company;
        payload.experienceYears = Number(formData.experienceYears) || 0;
        payload.expertise = formData.expertise;
        payload.hourlyRate = Number(formData.hourlyRate) || 0;
        payload.linkedin = formData.linkedin;
        payload.github = formData.github;
      } else {
        payload.educationLevel = formData.educationLevel;
        payload.college = formData.college;
        payload.skills = formData.skills;
        payload.resumeUrl = formData.resumeUrl;
        payload.targetCareer = formData.targetCareer;
      }

      const res = await API.put("/users/profile", payload);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Profile saved successfully!");
    } catch (error) {
      console.error("Save profile error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400">
        Loading profile...
      </div>
    );
  }

  const isMentor = role === "mentor";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xl flex-shrink-0">
            {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 truncate">{formData.name}</h1>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {isMentor ? "Mentor" : "Student"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isMentor
                ? `${formData.title || "Mentor"} ${formData.company ? `@ ${formData.company}` : ""}`
                : `${formData.educationLevel || "Student"} ${formData.college ? `@ ${formData.college}` : ""}`}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Basic Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Email Address</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Bio / Overview</label>
              <textarea
                rows="3"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="A brief overview about your background and interests..."
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Role specific section */}
          {isMentor ? (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                Mentor Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Job Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Rate ($ / Session)</label>
                  <input
                    type="number"
                    min="0"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Areas of Expertise</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.newExpertise}
                    onChange={(e) => setFormData({ ...formData, newExpertise: e.target.value })}
                    placeholder="e.g. System Design, AI/ML..."
                    className="flex-1 px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddExpertise();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddExpertise}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-md text-xs font-medium cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {formData.expertise.map((exp, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-800 rounded text-[11px]"
                    >
                      <span>{exp}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExpertise(exp)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                Student Education & Skills
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Education Level</label>
                  <select
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="High School">High School (10th/12th)</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Undergraduate">Undergraduate (B.Tech / BCA)</option>
                    <option value="Postgraduate">Postgraduate (M.Tech / MCA)</option>
                    <option value="Job Seeker">Early Career / Job Seeker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">College / University</label>
                  <input
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">My Skills</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.newSkill}
                    onChange={(e) => setFormData({ ...formData, newSkill: e.target.value })}
                    placeholder="e.g. Python, React..."
                    className="flex-1 px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-md text-xs font-medium cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {formData.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-800 rounded text-[11px]"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Resume Link</label>
                  <input
                    type="url"
                    name="resumeUrl"
                    value={formData.resumeUrl}
                    onChange={handleInputChange}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Target Career Goal</label>
                  <input
                    type="text"
                    name="targetCareer"
                    value={formData.targetCareer}
                    onChange={handleInputChange}
                    placeholder="e.g. AI Engineer"
                    className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-md font-medium text-xs transition cursor-pointer disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
