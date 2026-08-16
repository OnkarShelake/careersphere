import React, { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import API from "../api/axios";
import { FileText, Send, MessageSquare, X, ChevronRight, Sparkles } from "lucide-react";
import { toast } from "react-toastify";

export default function Recommendations() {
  const navigate = useNavigate();
  const location = useLocation();

  const [recommendations, setRecommendations] = useState(location.state?.recommendations || []);
  const [report, setReport] = useState("");
  const [loadingReport, setLoadingReport] = useState(false);

  const [showChat, setShowChat] = useState(true);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [sending, setSending] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (recommendations.length === 0) {
      API.get("/recommendations")
        .then((res) => {
          if (res.data?.response?.recommendations) {
            setRecommendations(res.data.response.recommendations);
          }
        })
        .catch(() => {});
    }
  }, []);

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
      toast.success("AI Career Report generated!");
    } catch (err) {
      console.error("AI Report generation error:", err);
      toast.error(err.response?.data?.message || "Please take the questionnaire first to generate your report.");
    } finally {
      setLoadingReport(false);
    }
  };

  const continueChat = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = {
      role: "user",
      content: currentMessage.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setSending(true);

    try {
      const res = await API.post("/ai/continue-chat", {
        currentMessage: userMessage.content,
      });

      if (res.data?.previousChat?.messages) {
        setMessages(res.data.previousChat.messages);
      } else if (res.data?.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: res.data.reply }]);
      }
    } catch (err) {
      console.error("AI Chat error:", err);
      const errMsg = err.response?.data?.message || "Sorry, I'm having trouble connecting right now. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errMsg }
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
    <div className="min-h-screen bg-slate-50 text-slate-900 relative pb-24 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Career Assessment Results</h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-sm">
            Analysis based on your cognitive and career interest responses.
          </p>
        </div>

        {/* Recommendations Matches */}
        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {recommendations.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-5 border border-slate-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">
                    {index === 0 ? "Top Match" : `Match #${index + 1}`}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {item.score}%
                  </span>
                </div>
                <h2 className="text-sm font-bold text-slate-900">{item.career}</h2>
                <p className="text-xs text-slate-500 capitalize mt-0.5">
                  Category: {item.category}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-5 rounded-xl border border-slate-200 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Assessment Not Attempted</h3>
              <p className="text-xs text-slate-500 mt-0.5">Take the 2-minute questionnaire to view your scores.</p>
            </div>
            <button
              onClick={() => navigate("/level-selection")}
              className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1 cursor-pointer"
            >
              <span>Take Assessment</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* AI Detailed Report */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-700" />
                <span>Personalized AI Career Report</span>
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Detailed roadmap and recommended action steps generated via Gemini.
              </p>
            </div>
            <button
              onClick={generateAIReport}
              disabled={loadingReport}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-md disabled:opacity-50 transition cursor-pointer"
            >
              {loadingReport ? "Analyzing..." : "Generate AI Report"}
            </button>
          </div>

          {loadingReport && (
            <div className="p-6 space-y-3 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-3 bg-slate-100 rounded w-full"></div>
              <div className="h-3 bg-slate-100 rounded w-4/5"></div>
            </div>
          )}

          {report && !loadingReport && (
            <div className="prose prose-slate max-w-none p-6 text-xs sm:text-sm leading-relaxed">
              <ReactMarkdown>{report}</ReactMarkdown>
            </div>
          )}

          {!report && !loadingReport && (
            <div className="p-8 text-center text-slate-400 text-xs">
              Click <strong>"Generate AI Report"</strong> to produce a roadmap tailored to your assessment.
            </div>
          )}
        </div>
      </main>

      {/* Floating AI Guide Chat Widget */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-5 right-5 p-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-md transition z-40 cursor-pointer"
        title="Toggle AI Career Guide"
      >
        {showChat ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      </button>

      {showChat && (
        <div className="fixed bottom-18 right-4 sm:right-5 w-[calc(100vw-2rem)] sm:w-88 bg-white rounded-xl shadow-xl border border-slate-200 flex flex-col z-40 overflow-hidden h-[440px] max-h-[70vh]">
          {/* Header */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-xs">AI Career Guide</h3>
                <p className="text-[10px] text-slate-400">Online • Gemini</p>
              </div>
            </div>
            <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto bg-slate-50 space-y-2.5 text-xs">
            {messages.length === 0 ? (
              <div className="text-center text-slate-400 py-8 px-2 text-xs">
                Ask any questions about career paths, technical skills, or roadmaps.
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isUser = msg.role === "user";
                return (
                  <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-1.5 text-xs leading-relaxed ${
                        isUser
                          ? "bg-slate-900 text-white rounded-br-xs"
                          : "bg-white border border-slate-200 text-slate-900 rounded-bl-xs"
                      }`}
                    >
                      <div className="prose prose-xs max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {sending && (
              <div className="text-[11px] text-slate-500 italic bg-white border border-slate-200 px-2.5 py-1 rounded w-fit">
                AI is thinking...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-2.5 bg-white border-t border-slate-200 flex gap-1.5">
            <textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask a question..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none"
              rows="1"
              disabled={sending}
            />
            <button
              onClick={continueChat}
              disabled={!currentMessage.trim() || sending}
              className="px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs transition cursor-pointer disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}