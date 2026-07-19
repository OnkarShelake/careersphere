import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();
console.log("Gemini API key : ", process.env.GEMINI_API_KEY);

const aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export const generateResponse = async (prompt) => {
    try {
        const response = await aiClient.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        })
        return response.text;
    }
    catch (error){
        console.error(error);
        throw new Error("Failed to generate AI response");
    }
};