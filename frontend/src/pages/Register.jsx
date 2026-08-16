import React, { useState } from "react";
import API from "../api/axios";
import { Eye, EyeOff, GraduationCap, Briefcase } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student"); // 'student' | 'mentor'
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    // Mentor fields
    title: "",
    company: "",
    experienceYears: "",
    expertiseInput: "",
    hourlyRate: 0,
    // Student fields
    educationLevel: "Undergraduate",
    college: "",
    skillsInput: "",
    resumeUrl: "",
    targetCareer: "",
    bio: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role,
        bio: formData.bio
      };

      if (role === "mentor") {
        payload.title = formData.title;
        payload.company = formData.company;
        payload.experienceYears = Number(formData.experienceYears) || 0;
        payload.expertise = formData.expertiseInput
          ? formData.expertiseInput.split(",").map((s) => s.trim()).filter(Boolean)
          : [];
        payload.hourlyRate = Number(formData.hourlyRate) || 0;
      } else {
        payload.educationLevel = formData.educationLevel;
        payload.college = formData.college;
        payload.skills = formData.skillsInput
          ? formData.skillsInput.split(",").map((s) => s.trim()).filter(Boolean)
          : [];
        payload.resumeUrl = formData.resumeUrl;
        payload.targetCareer = formData.targetCareer;
      }

      const response = await API.post("/auth/register", payload);

      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        toast.success(`Welcome, ${response.data.user.name}!`);

        if (response.data.user.role === "mentor") {
          navigate("/mentor");
        } else {
          navigate("/mentors");
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center py-10 px-4 sm:px-6 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-2 font-bold text-lg text-slate-900">
          <div className="w-6 h-6 rounded bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
            CS
          </div>
          <span>CareerSphere</span>
        </Link>
        <h2 className="mt-3 text-xl font-bold text-slate-900">Create an account</h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-6 px-6 border border-slate-200 rounded-xl sm:px-8">
          {/* Role segmented toggle */}
          <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`py-2 rounded-md transition flex items-center justify-center gap-1.5 cursor-pointer ${
                role === "student" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("mentor")}
              className={`py-2 rounded-md transition flex items-center justify-center gap-1.5 cursor-pointer ${
                role === "mentor" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Mentor</span>
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Full Name *</label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Email Address *</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Password *</label>
              <div className="relative">
                <input
                  required
                  minLength={6}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Minimum 6 characters"
                  className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Student Specific Fields */}
            {role === "student" ? (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-600 mb-1">Education Level</label>
                    <select
                      name="educationLevel"
                      value={formData.educationLevel}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 rounded-md bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    >
                      <option value="High School">High School (10th/12th)</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Undergraduate">Undergraduate (B.Tech / BCA)</option>
                      <option value="Postgraduate">Postgraduate (M.Tech / MCA)</option>
                      <option value="Job Seeker">Early Career / Job Seeker</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">College / Institution</label>
                    <input
                      type="text"
                      name="college"
                      value={formData.college}
                      onChange={handleInputChange}
                      placeholder="University name"
                      className="w-full px-2 py-1.5 rounded-md bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Skills (Comma separated)</label>
                  <input
                    type="text"
                    name="skillsInput"
                    value={formData.skillsInput}
                    onChange={handleInputChange}
                    placeholder="e.g. Python, React, Data Structures"
                    className="w-full px-2 py-1.5 rounded-md bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Resume Link (Google Drive, GitHub PDF URL)</label>
                  <input
                    type="url"
                    name="resumeUrl"
                    value={formData.resumeUrl}
                    onChange={handleInputChange}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-2 py-1.5 rounded-md bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-600 mb-1">Professional Title *</label>
                    <input
                      required
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Senior Software Engineer"
                      className="w-full px-2 py-1.5 rounded-md bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Company *</label>
                    <input
                      required
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="e.g. Google, Microsoft"
                      className="w-full px-2 py-1.5 rounded-md bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-600 mb-1">Years of Experience</label>
                    <input
                      type="number"
                      min="0"
                      name="experienceYears"
                      value={formData.experienceYears}
                      onChange={handleInputChange}
                      placeholder="e.g. 5"
                      className="w-full px-2 py-1.5 rounded-md bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Rate ($ / session)</label>
                    <input
                      type="number"
                      min="0"
                      name="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleInputChange}
                      placeholder="0 for free"
                      className="w-full px-2 py-1.5 rounded-md bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Expertise (Comma separated) *</label>
                  <input
                    required
                    type="text"
                    name="expertiseInput"
                    value={formData.expertiseInput}
                    onChange={handleInputChange}
                    placeholder="Full Stack, AI/ML, System Design"
                    className="w-full px-2 py-1.5 rounded-md bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-md font-medium transition cursor-pointer disabled:opacity-50 mt-3"
            >
              {loading ? "Registering..." : `Register as ${role === "mentor" ? "Mentor" : "Student"}`}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="text-slate-900 font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}