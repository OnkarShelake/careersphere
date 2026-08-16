import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../api/axios";

export default function Questionaire() {
  const navigate = useNavigate();
  const { level } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await API.get(`/questions/${level}`);
        setQuestions(response.data.questions || []);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };
    fetchQuestions();
  }, [level]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await API.post(`/questions/submit/${level}`, { answers });
      navigate(`/recommendations`, { state: { recommendations: response.data.recommendations } });
    } catch (error) {
      console.error("Error submitting answers:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = questions[currentQuestionIndex];
  const progressPercent = questions.length > 0 ? Math.round(((currentQuestionIndex + 1) * 100) / questions.length) : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-10 w-full flex-1 flex flex-col justify-center">
        {/* Minimal Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-xs text-slate-500 mb-1.5 font-medium">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
            <div
              className="bg-slate-900 h-1 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        {questions.length === 0 ? (
          <div className="bg-white border border-slate-200 p-8 rounded-xl text-center text-xs text-slate-400">
            Loading assessment questions...
          </div>
        ) : (
          <div className="bg-white border border-slate-200 p-6 sm:p-7 rounded-xl space-y-5">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {currentQ?.question}
            </h2>

            <div className="space-y-2">
              {currentQ?.options.map((option, index) => {
                const isSelected = answers[currentQuestionIndex]?.selectedOption === option.text;
                return (
                  <div
                    key={index}
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        [currentQuestionIndex]: {
                          questionId: currentQ._id,
                          selectedOption: option.text,
                          weight: option.weight,
                          category: currentQ.category
                        }
                      }))
                    }
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                      isSelected
                        ? "border-slate-900 bg-slate-50 text-slate-900 font-medium"
                        : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    {option.text}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-5">
          <button
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
            disabled={currentQuestionIndex === 0}
            className="px-3.5 py-1.5 rounded-md border border-slate-200 text-slate-700 bg-white text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Back
          </button>

          <div className="flex gap-2">
            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                disabled={!answers[currentQuestionIndex]}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(answers).length !== questions.length}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? "Analyzing..." : "Submit"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
