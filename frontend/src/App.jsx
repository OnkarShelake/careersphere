import { useState } from 'react'
import Home from './pages/Home.jsx'
import LevelSelection from './pages/LevelSelection.jsx'
import {BrowserRouter, Routes, Route, Link} from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Questions from './pages/Questionaire.jsx'
import Recommendations from './pages/Recommendations.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Chat from './pages/Chat.jsx'
import MentorDashboard from './pages/MentorDashboard.jsx'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function App() {
  

  return (
    <>
     <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/level-selection" element={<LevelSelection />} />
        <Route path="/login" element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/questions/:level' element={<Questions/>}/>
        <Route path='/recommendations' element={<Recommendations/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/chat' element={<Chat/>} />
        <Route path='/mentor' element={<MentorDashboard/>} />
        
      </Routes>
    </BrowserRouter>
    <ToastContainer/>

    </>
     
  )
}

export default App
