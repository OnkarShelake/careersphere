import React from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import { Eye, EyeOff } from 'lucide-react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
export default function Signup() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ name:'', email:'', password:''});
    const navigate = useNavigate();
    const handleRegister = async (e) =>{
        e.preventDefault();
        try {

        const response = await API.post('/auth/register', formData);
        console.log(response);
        if(response.data && response.data.token){
           await localStorage.setItem('token', response.data.token);
           await localStorage.setItem('user', JSON.stringify(response.data.user));
           
            alert('Registration successful!');
            navigate('/');
        }
        else{
            alert('Registration failed. Please try again.');
        }
        } catch (error) {
            console.error('Registration error:', error);
        }
    }
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      
      {/* <Navbar /> */}
      <div className="flex items-center justify-center pt-10 pb-4">
        <span className="text-xl font-bold text-indigo-600 tracking-tight">CareerGuide</span>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-8">
        
        <div className="w-full max-w-sm bg-white border border-slate-200 p-8 rounded-xl shadow-sm">
          
          <h2 className="text-xl font-semibold text-center text-slate-900 mb-1">
            Create Account
          </h2>
          <p className="text-slate-500 text-sm text-center mb-6">Join CareerGuide today</p>

          {/* Name */}
          <form onSubmit={handleRegister} action="">

            <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Full Name
            </label>
            <input onChange={(e)=> setFormData({...formData, name: e.target.value})}
            value={formData.name}
            name="name"
              type="text"
              placeholder="Enter your name"
              className="w-full px-3 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-sm"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email
            </label>
            <input onChange={(e) => setFormData({...formData, email:e.target.value})}
            name="email"
            value={formData.email}
              type="email"
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-sm"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <div className="flex relative">
            <input name="password"
            name="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password:e.target.value})}
            minLength={6}
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              className="w-full px-3 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-sm"
            />
            <button className="absolute right-3 top-2.5 cursor-pointer text-slate-400 hover:text-slate-600 transition-colors duration-200" type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            </div>
            
          </div>

          {/* Signup Button */}
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors duration-200 text-sm shadow-sm">
            Sign Up
          </button>

          </form>
          

          {/* Footer */}
          <p className="text-sm text-slate-500 text-center mt-5">
            Already have an account?{" "}
            <span onClick={()=>navigate('/login')} className="text-indigo-600 cursor-pointer hover:text-indigo-700 font-medium transition-colors duration-200">
              Sign In
            </span>
          </p>

        </div>

      </div>
    </div>
  );
}