import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export const generateResponse = async (prompt) => {
    try {
        const response = await aiClient.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.warn("Primary model gemini-3.6-flash error, trying fallback gemini-3.5-flash-lite:", error.message);
        try {
            const fallbackResponse = await aiClient.models.generateContent({
                model: "gemini-3.5-flash-lite",
                contents: prompt,
            });
            return fallbackResponse.text;
        } catch (fallbackError) {
            console.error("Gemini AI generation error:", fallbackError);
            throw new Error("Failed to generate AI response");
        }
    }
};