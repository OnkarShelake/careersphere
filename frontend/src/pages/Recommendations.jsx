// import React, { useState } from "react";
// import Navbar from "../components/Navbar";
// import { useNavigate, useLocation } from "react-router-dom";
// import ReactMarkdown from "react-markdown";
// import API from "../api/axios";

// export default function Recommendations() {
//     const navigate = useNavigate();
//     const location = useLocation();

//     const recommendations = location.state?.recommendations || [];

//     const [report, setReport] = useState("");
//     const [loadingReport, setLoadingReport] = useState(false);

//     // Chat states (currently unused in UI, but kept for your future implementation)
//     const [showChat, setShowChat] = useState(false);
//     const [messages, setMessages] = useState([]);
//     const [currentMessage, setCurrentMessage] = useState("");
//     const [sending, setSending] = useState(false);

//     const generateAIReport = async () => {
//         try {
//             setLoadingReport(true);
//             const res = await API.post("/ai/career-report");
//             setReport(res.data.report);
//         } catch (err) {
//             console.log(err);
//             alert("Unable to generate AI report.");
//         } finally {
//             setLoadingReport(false);
//         }
//     };

//     const continueChat = async () => {
//         if (currentMessage.trim() === "") return;

//         const userMessage = {
//             role: "user",
//             content: currentMessage,
//         };

//         setMessages((prev) => [...prev, userMessage]);
//         setCurrentMessage("");
//         setSending(true);

//         try {
//             const res = await API.post("/ai/continue-chat", {
//                 currentMessage: userMessage.content,
//             });
//             setMessages(res.data.previousChat.messages);
//         } catch (err) {
//             console.log(err);
//         } finally {
//             setSending(false);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-slate-100">
//             <Navbar />

//             <div className="max-w-6xl mx-auto px-6 py-10">
//                 <div className="mb-10">
//                     <h1 className="text-4xl font-bold text-slate-900">
//                         🤖 AI Career Counselor
//                     </h1>
//                     <p className="text-slate-600 mt-3">
//                         Discover your best career path using both questionnaire analysis and AI-powered personalized guidance.
//                     </p>
//                 </div>

//                 <div className="grid md:grid-cols-3 gap-6 mb-12">
//                     {recommendations.map((item, index) => (
//                         <div
//                             key={index}
//                             className={`rounded-2xl p-6 shadow-md border transition hover:-translate-y-1 duration-300 ${
//                                 index === 0 ? "bg-indigo-600 text-white" : "bg-white"
//                             }`}
//                         >
//                             <div className="text-sm mb-2">
//                                 {index === 0 ? "🏆 Top Match" : `${index + 1} Match`}
//                             </div>
//                             <h2 className="text-xl font-bold">{item.career}</h2>
//                             <p className={`${index === 0 ? "text-indigo-100" : "text-slate-500"} mt-2`}>
//                                 {item.category}
//                             </p>
//                             <div className="mt-6">
//                                 <span className={`font-bold text-lg ${index === 0 ? "text-white" : "text-indigo-600"}`}>
//                                     {item.score}%
//                                 </span>
//                             </div>
//                         </div>
//                     ))}
//                 </div>

//                 <div className="bg-white rounded-2xl shadow-md border">
//                     <div className="border-b px-8 py-6 flex justify-between items-center">
//                         <div>
//                             <h2 className="text-2xl font-bold">📄 AI Career Report</h2>
//                             <p className="text-slate-500 mt-1">
//                                 Generate a personalized report powered by Gemini.
//                             </p>
//                         </div>
//                         <button
//                             onClick={generateAIReport}
//                             disabled={loadingReport}
//                             className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl disabled:opacity-75 disabled:cursor-not-allowed"
//                         >
//                             {loadingReport ? "Generating..." : "Generate Report"}
//                         </button>
//                     </div>

//                     {loadingReport && (
//                         <div className="p-8">
//                             <div className="animate-pulse space-y-5">
//                                 <div className="h-6 bg-slate-200 rounded" />
//                                 <div className="h-6 bg-slate-200 rounded" />
//                                 <div className="h-6 bg-slate-200 rounded" />
//                                 <div className="h-6 bg-slate-200 rounded" />
//                                 <div className="h-6 bg-slate-200 rounded" />
//                                 <div className="h-6 bg-slate-200 rounded" />
//                             </div>
//                         </div>
//                     )}

//                     {report && (
//                         <div className="prose prose-slate max-w-none p-8">
//                             <ReactMarkdown>{report}</ReactMarkdown>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }





// import React, { useState, useRef, useEffect } from "react";
// import Navbar from "../components/Navbar";
// import { useNavigate, useLocation } from "react-router-dom";
// import ReactMarkdown from "react-markdown";
// import API from "../api/axios";

// export default function Recommendations() {
//     const navigate = useNavigate();
//     const location = useLocation();

//     const recommendations = location.state?.recommendations || [];

//     // Report States
//     const [report, setReport] = useState("");
//     const [loadingReport, setLoadingReport] = useState(false);

//     // Chat States
//     const [showChat, setShowChat] = useState(false);
//     const [messages, setMessages] = useState([]);
//     const [currentMessage, setCurrentMessage] = useState("");
//     const [sending, setSending] = useState(false);

//     // Auto-scroll reference for chat
//     const chatEndRef = useRef(null);

//     useEffect(() => {
//         if (chatEndRef.current) {
//             chatEndRef.current.scrollIntoView({ behavior: "smooth" });
//         }
//     }, [messages, sending]);

//     const generateAIReport = async () => {
//         try {
//             setLoadingReport(true);
//             const res = await API.post("/ai/career-report");
//             setReport(res.data.report);
//         } catch (err) {
//             console.log(err);
//             alert("Unable to generate AI report. Please try again.");
//         } finally {
//             setLoadingReport(false);
//         }
//     };

//     const continueChat = async () => {
//         if (currentMessage.trim() === "") return;

//         const userMessage = {
//             role: "user",
//             content: currentMessage,
//         };

//         setMessages((prev) => [...prev, userMessage]);
//         setCurrentMessage("");
//         setSending(true);

//         try {
//             const res = await API.post("/ai/continue-chat", {
//                 currentMessage: userMessage.content,
//             });
//             // Assuming the API returns the full updated message history
//             setMessages(res.data.previousChat.messages);
//         } catch (err) {
//             console.log(err);
//             // Fallback error message in chat if API fails
//             setMessages((prev) => [
//                 ...prev,
//                 { role: "model", content: "Sorry, I'm having trouble connecting right now. Please try again." }
//             ]);
//         } finally {
//             setSending(false);
//         }
//     };

//     const handleKeyPress = (e) => {
//         if (e.key === "Enter" && !e.shiftKey) {
//             e.preventDefault();
//             continueChat();
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative pb-20">
//             <Navbar />

//             <div className="max-w-6xl mx-auto px-6 py-10">
//                 {/* Header Section */}
//                 <div className="mb-12 text-center md:text-left">
//                     <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight pb-2">
//                         AI Career Counselor
//                     </h1>
//                     <p className="text-slate-600 mt-3 text-lg max-w-2xl">
//                         Discover your optimal career path combining your questionnaire analysis with personalized, AI-powered guidance.
//                     </p>
//                 </div>

//                 {/* Recommendations Grid */}
//                 {recommendations.length > 0 && (
//                     <div className="grid md:grid-cols-3 gap-6 mb-12">
//                         {recommendations.map((item, index) => (
//                             <div
//                                 key={index}
//                                 className={`rounded-3xl p-8 shadow-xl border border-opacity-50 transition-all hover:-translate-y-2 duration-300 ${
//                                     index === 0
//                                         ? "bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-indigo-500 ring-4 ring-indigo-100"
//                                         : "bg-white border-slate-100 hover:shadow-indigo-100"
//                                 }`}
//                             >
//                                 <div className="flex items-center justify-between mb-4">
//                                     <div className={`text-sm font-semibold tracking-wide uppercase px-3 py-1 rounded-full ${
//                                         index === 0 ? "bg-indigo-500/50 text-indigo-100" : "bg-slate-100 text-slate-500"
//                                     }`}>
//                                         {index === 0 ? "🏆 Top Match" : `#${index + 1} Match`}
//                                     </div>
//                                     <span className={`text-2xl font-black ${index === 0 ? "text-white" : "text-indigo-600"}`}>
//                                         {item.score}%
//                                     </span>
//                                 </div>
//                                 <h2 className="text-2xl font-bold mb-2">{item.career}</h2>
//                                 <p className={`${index === 0 ? "text-indigo-200" : "text-slate-500"} font-medium`}>
//                                     {item.category}
//                                 </p>
//                             </div>
//                         ))}
//                     </div>
//                 )}

//                 {/* AI Report Section */}
//                 <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
//                     <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
//                         <div>
//                             <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
//                                 📄 Comprehensive Career Report
//                             </h2>
//                             <p className="text-slate-500 mt-1">
//                                 Generate a highly detailed, personalized roadmap powered by Gemini.
//                             </p>
//                         </div>
//                         <button
//                             onClick={generateAIReport}
//                             disabled={loadingReport}
//                             className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all text-white font-semibold px-6 py-3 rounded-xl disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
//                         >
//                             {loadingReport ? (
//                                 <>
//                                     <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                     </svg>
//                                     Generating...
//                                 </>
//                             ) : (
//                                 "Generate Report"
//                             )}
//                         </button>
//                     </div>

//                     {/* Report Loading Skeleton */}
//                     {loadingReport && (
//                         <div className="p-8">
//                             <div className="animate-pulse space-y-6">
//                                 <div className="h-8 bg-slate-200 rounded w-1/3"></div>
//                                 <div className="space-y-3">
//                                     <div className="h-4 bg-slate-100 rounded"></div>
//                                     <div className="h-4 bg-slate-100 rounded"></div>
//                                     <div className="h-4 bg-slate-100 rounded w-5/6"></div>
//                                 </div>
//                                 <div className="h-8 bg-slate-200 rounded w-1/4 mt-8"></div>
//                                 <div className="space-y-3">
//                                     <div className="h-4 bg-slate-100 rounded"></div>
//                                     <div className="h-4 bg-slate-100 rounded w-4/5"></div>
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     {/* Report Content */}
//                     {report && !loadingReport && (
//                         <div className="prose prose-slate prose-indigo max-w-none p-8 lg:p-12">
//                             <ReactMarkdown>{report}</ReactMarkdown>
//                         </div>
//                     )}

//                     {!report && !loadingReport && (
//                         <div className="p-12 text-center text-slate-400">
//                             Click "Generate Report" to see your personalized career breakdown.
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* --- Floating Chat Widget --- */}
            
//             {/* Chat Toggle Button */}
//             <button
//                 onClick={() => setShowChat(!showChat)}
//                 className={`fixed bottom-8 right-8 p-4 rounded-full shadow-2xl transition-all duration-300 z-50 flex items-center justify-center ${
//                     showChat ? "bg-slate-800 hover:bg-slate-900 text-white rotate-90" : "bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1 text-white"
//                 }`}
//             >
//                 {showChat ? (
//                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
//                         <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                 ) : (
//                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
//                         <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
//                     </svg>
//                 )}
//             </button>

//             {/* Chat Window */}
//             {showChat && (
//                 <div className="fixed bottom-24 right-8 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col z-40 overflow-hidden origin-bottom-right transition-all duration-300" style={{ height: '500px', maxHeight: '70vh' }}>
//                     {/* Chat Header */}
//                     <div className="bg-indigo-600 text-white px-5 py-4 flex items-center justify-between shadow-md z-10">
//                         <div className="flex items-center gap-3">
//                             <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-lg">🤖</div>
//                             <div>
//                                 <h3 className="font-bold text-sm">AI Career Guide</h3>
//                                 <p className="text-indigo-100 text-xs">Online</p>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Chat Messages */}
//                     <div className="flex-1 p-5 overflow-y-auto bg-slate-50 space-y-4">
//                         {messages.length === 0 ? (
//                             <div className="text-center text-slate-400 text-sm mt-10">
//                                 <span className="text-4xl block mb-2">👋</span>
//                                 Ask me anything about your career report, interview tips, or skills to learn!
//                             </div>
//                         ) : (
//                             messages.map((msg, idx) => (
//                                 <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
//                                     <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
//                                         msg.role === "user" 
//                                             ? "bg-indigo-600 text-white rounded-br-none" 
//                                             : "bg-white border border-slate-200 text-slate-700 rounded-bl-none"
//                                     }`}>
//                                         <ReactMarkdown className={`prose prose-sm max-w-none ${msg.role === "user" ? "prose-invert" : ""}`}>
//                                             {msg.content}
//                                         </ReactMarkdown>
//                                     </div>
//                                 </div>
//                             ))
//                         )}
                        
//                         {/* Typing Indicator */}
//                         {sending && (
//                             <div className="flex justify-start">
//                                 <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
//                                     <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
//                                     <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
//                                     <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
//                                 </div>
//                             </div>
//                         )}
                        
//                         {/* Invisible div to anchor auto-scroll */}
//                         <div ref={chatEndRef} />
//                     </div>
                    
//                     {/* Chat Input */}
//                     <div className="p-3 bg-white border-t border-slate-100">
//                         <div className="relative flex items-center">
//                             <textarea
//                                 value={currentMessage}
//                                 onChange={(e) => setCurrentMessage(e.target.value)}
//                                 onKeyDown={handleKeyPress}
//                                 placeholder="Type your message..."
//                                 className="w-full bg-slate-100 border-transparent rounded-xl pl-4 pr-12 py-3 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none transition-all scrollbar-hide"
//                                 rows="1"
//                                 disabled={sending}
//                             />
//                             <button
//                                 onClick={continueChat}
//                                 disabled={currentMessage.trim() === "" || sending}
//                                 className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                             >
//                                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
//                                     <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
//                                 </svg>
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }



import React, { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import API from "../api/axios";

export default function Recommendations() {
    const navigate = useNavigate();
    const location = useLocation();

    const recommendations = location.state?.recommendations || [];

   
    const [report, setReport] = useState("");
    const [loadingReport, setLoadingReport] = useState(false);

  
    const [showChat, setShowChat] = useState(true);
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [sending, setSending] = useState(false);

   
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, sending]);

    const generateAIReport = async () => {
        try {
            setLoadingReport(true);
            const res = await API.post("/ai/career-report");
            setReport(res.data.report);
        } catch (err) {
            console.log(err);
            alert("Unable to generate AI report. Please try again.");
        } finally {
            setLoadingReport(false);
        }
    };

    const continueChat = async () => {
        if (currentMessage.trim() === "") return;

        const userMessage = {
            role: "user",
            content: currentMessage,
        };

        setMessages((prev) => [...prev, userMessage]);
        setCurrentMessage("");
        setSending(true);

        try {
            const res = await API.post("/ai/continue-chat", {
                currentMessage: userMessage.content,
            });
           
            setMessages(res.data.previousChat.messages);
        } catch (err) {
            console.log(err);
            
            setMessages((prev) => [
                ...prev,
                { role: "model", content: "Sorry, I'm having trouble connecting right now. Please try again." }
            ]);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            continueChat();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative pb-20">
            <Navbar />

            <div className="max-w-6xl mx-auto px-6 py-10">
                {/* Header Section */}
                <div className="mb-12 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight pb-2">
                        AI Career Counselor
                    </h1>
                    <p className="text-slate-600 mt-3 text-lg max-w-2xl">
                        Discover your optimal career path combining your questionnaire analysis with personalized, AI-powered guidance.
                    </p>
                </div>

                {/* Recommendations Grid */}
                {recommendations.length > 0 && (
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        {recommendations.map((item, index) => (
                            <div
                                key={index}
                                className={`rounded-3xl p-8 shadow-xl border border-opacity-50 transition-all hover:-translate-y-2 duration-300 ${
                                    index === 0
                                        ? "bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-indigo-500 ring-4 ring-indigo-100"
                                        : "bg-white border-slate-100 hover:shadow-indigo-100"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`text-sm font-semibold tracking-wide uppercase px-3 py-1 rounded-full ${
                                        index === 0 ? "bg-indigo-500/50 text-indigo-100" : "bg-slate-100 text-slate-500"
                                    }`}>
                                        {index === 0 ? "🏆 Top Match" : `#${index + 1} Match`}
                                    </div>
                                    <span className={`text-2xl font-black ${index === 0 ? "text-white" : "text-indigo-600"}`}>
                                        {item.score}%
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold mb-2">{item.career}</h2>
                                <p className={`${index === 0 ? "text-indigo-200" : "text-slate-500"} font-medium`}>
                                    {item.category}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* AI Report Section */}
                <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
                    <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                📄 Comprehensive Career Report
                            </h2>
                            <p className="text-slate-500 mt-1">
                                Generate a highly detailed, personalized roadmap powered by Gemini.
                            </p>
                        </div>
                        <button
                            onClick={generateAIReport}
                            disabled={loadingReport}
                            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all text-white font-semibold px-6 py-3 rounded-xl disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                            {loadingReport ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating...
                                </>
                            ) : (
                                "Generate Report"
                            )}
                        </button>
                    </div>

                    {/* Report Loading Skeleton */}
                    {loadingReport && (
                        <div className="p-8">
                            <div className="animate-pulse space-y-6">
                                <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                                <div className="space-y-3">
                                    <div className="h-4 bg-slate-100 rounded"></div>
                                    <div className="h-4 bg-slate-100 rounded"></div>
                                    <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                                </div>
                                <div className="h-8 bg-slate-200 rounded w-1/4 mt-8"></div>
                                <div className="space-y-3">
                                    <div className="h-4 bg-slate-100 rounded"></div>
                                    <div className="h-4 bg-slate-100 rounded w-4/5"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Report Content */}
                    {report && !loadingReport && (
                        <div className="prose prose-slate prose-indigo max-w-none p-8 lg:p-12">
                            <ReactMarkdown>{report}</ReactMarkdown>
                        </div>
                    )}

                    {!report && !loadingReport && (
                        <div className="p-12 text-center text-slate-400">
                            Click "Generate Report" to see your personalized career breakdown.
                        </div>
                    )}
                </div>
            </div>

            {/* --- Floating Chat Widget --- */}
            
            {/* Chat Toggle Button */}
            <button
                onClick={() => setShowChat(!showChat)}
                className={`fixed bottom-8 right-8 p-4 rounded-full shadow-2xl transition-all duration-300 z-50 flex items-center justify-center ${
                    showChat ? "bg-slate-800 hover:bg-slate-900 text-white rotate-90" : "bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1 text-white"
                }`}
            >
                {showChat ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                )}
            </button>

            {/* Chat Window */}
            {showChat && (
                <div className="fixed bottom-24 right-8 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col z-40 overflow-hidden origin-bottom-right transition-all duration-300" style={{ height: '500px', maxHeight: '70vh' }}>
                    {/* Chat Header */}
                    <div className="bg-indigo-600 text-white px-5 py-4 flex items-center justify-between shadow-md z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-lg">🤖</div>
                            <div>
                                <h3 className="font-bold text-sm">AI Career Guide</h3>
                                <p className="text-indigo-100 text-xs">Online</p>
                            </div>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 p-5 overflow-y-auto bg-slate-50 space-y-4">
                        {messages.length === 0 ? (
                            <div className="text-center text-slate-400 text-sm mt-10">
                                <span className="text-4xl block mb-2">👋</span>
                                Ask me anything about your career report, interview tips, or skills to learn!
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                                        msg.role === "user" 
                                            ? "bg-indigo-600 text-white rounded-br-none" 
                                            : "bg-white border border-slate-200 text-slate-700 rounded-bl-none"
                                    }`}>
                                        {/* FIXED: Moving className off of ReactMarkdown and onto a wrapper div */}
                                        <div className={`prose prose-sm max-w-none ${msg.role === "user" ? "prose-invert" : ""}`}>
                                            <ReactMarkdown>
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        
                        {/* Typing Indicator */}
                        {sending && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
                                </div>
                            </div>
                        )}
                        
                        {/* Invisible div to anchor auto-scroll */}
                        <div ref={chatEndRef} />
                    </div>
                    
                    {/* Chat Input */}
                    <div className="p-3 bg-white border-t border-slate-100">
                        <div className="relative flex items-center">
                            <textarea
                                value={currentMessage}
                                onChange={(e) => setCurrentMessage(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Type your message..."
                                className="w-full bg-slate-100 border-transparent rounded-xl pl-4 pr-12 py-3 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none transition-all scrollbar-hide"
                                rows="1"
                                disabled={sending}
                            />
                            <button
                                onClick={continueChat}
                                disabled={currentMessage.trim() === "" || sending}
                                className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}