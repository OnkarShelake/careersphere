import { generateResponse } from '../services/aiServices.js';
import User from '../models/User.js';
import { buildCareerPrompt } from '../utils/promptBuilder.js';
import Response from '../models/Response.js';
import Question from '../models/Question.js';
import aiReport from '../models/AIReport.js';
import AIChat from '../models/AIChat.js';
import { buildChatPrompt } from '../utils/chatPromptBuilder.js';

export const testAI = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ message: "Prompt is required" });

        const reply = await generateResponse(prompt);
        return res.status(200).json({
            success: true,
            reply,
        });
    } catch (error) {
        console.error("Test AI error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const generateCareerReport = async (req, res) => {
    try {
        const userId = req.user.id;
        const response = await Response.findOne({ userId }).sort({ createdAt: -1 });

        if (!response) {
            return res.status(404).json({
                success: false,
                message: "No career assessment response found for this user. Please take the questionnaire first."
            });
        }

        if (!response.answers || !Array.isArray(response.answers) || response.answers.length === 0) {
            return res.status(400).json({
                success: false,
                message: "The user's response does not contain any valid answers."
            });
        }

        const answers = await Promise.all(response.answers.map(async (answer) => {
            let questionText = "Question";
            if (answer.questionId) {
                const qDoc = await Question.findById(answer.questionId).select('question');
                if (qDoc) questionText = qDoc.question;
            }
            return {
                question: questionText,
                answer: answer.selectedOption || answer.answer || "Selected Option",
            };
        }));

        const studentProfile = {
            level: response.level,
            answers: answers,
        };

        const prompt = await buildCareerPrompt(studentProfile);
        const report = await generateResponse(prompt);

        const newReport = await aiReport.create({
            student: userId,
            report: report,
        });

        return res.status(200).json({
            success: true,
            report,
            reportId: newReport._id
        });
    } catch (error) {
        console.error("Generate career report error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const continueChat = async (req, res) => {
    try {
        const userId = req.user.id;
        const studentProfile = await User.findById(userId).select('name skills educationLevel targetCareer role');

        const { currentMessage } = req.body;

        if (!currentMessage || !currentMessage.trim()) {
            return res.status(400).json({
                success: false,
                message: "Current message is required",
            });
        }

        // Fetch previous career report if it exists (optional)
        const previousReport = await aiReport.findOne({ student: userId }).sort({ createdAt: -1 });

        // Fetch or create chat history
        let previousChat = await AIChat.findOne({ student: userId }).sort({ createdAt: -1 });
        if (!previousChat) {
            previousChat = await AIChat.create({
                student: userId,
                messages: [],
            });
        }

        // Append user message
        previousChat.messages.push({ role: "user", content: currentMessage.trim() });

        // Build prompt with rich context
        const prompt = buildChatPrompt({
            previousReport,
            previousChat,
            studentProfile: studentProfile || { name: "Student" }
        });

        const reply = await generateResponse(prompt);

        // Append assistant message
        previousChat.messages.push({ role: "assistant", content: reply });
        await previousChat.save();

        return res.status(200).json({
            success: true,
            reply,
            previousChat,
        });
    } catch (error) {
        console.error("Continue AI chat error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to generate AI response",
        });
    }
};