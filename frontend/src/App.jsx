import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import LevelSelection from './pages/LevelSelection.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Questions from './pages/Questionaire.jsx';
import Recommendations from './pages/Recommendations.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Chat from './pages/Chat.jsx';
import MentorDashboard from './pages/MentorDashboard.jsx';
import MentorList from './pages/MentorList.jsx';
import MentorProfile from './pages/MentorProfile.jsx';
import MySessions from './pages/MySessions.jsx';
import Profile from './pages/Profile.jsx';
import VideoCallPage from './pages/VideoCallPage.jsx';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mentors" element={<MentorList />} />
          <Route path="/mentors/:id" element={<MentorProfile />} />
          <Route path="/my-sessions" element={<MySessions />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/level-selection" element={<LevelSelection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/questions/:level" element={<Questions />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:recipientId" element={<Chat />} />
          <Route path="/call/:roomId" element={<VideoCallPage />} />
          <Route path="/mentor" element={<MentorDashboard />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </>
  );
}

export default App;
