import {generateResponse} from '../services/aiServices.js';
import User from '../models/User.js';
import {buildCareerPrompt} from '../utils/promptBuilder.js';
import Response from '../models/Response.js';
import Question from '../models/Question.js';
import aiReport from '../models/AIReport.js';
import AIChat from '../models/AIChat.js';
import { buildChatPrompt } from '../utils/chatPromptBuilder.js';
export const testAI = async (req, res) => {
    try {
        const { prompt } = req.body;
        if( !prompt ) return res.status(400).json({message:"Prompt is required"});

        const reply = await generateResponse(prompt);
        return res.status(200).json({
            success:true,
            reply,
        });
    }catch (error){
       res.status(500).json({
        success:false,
        message:error.message,
       });
    }
};

export const generateCareerReport = async (req, res) => {
    try{
        const userId = req.user.id;
        const response = await Response.findOne({ userId }).sort({ createdAt: -1 });

        // console.log("Response from database", response);

        // 1. Guard Clause: Check if the response document exists
        if (!response) {
            return res.status(404).json({
                success: false,
                message: "No career response found for this user."
            });
        }

        // 2. Guard Clause: Check if 'answers' exists and is an array
        if (!response.answers || !Array.isArray(response.answers)) {
            return res.status(400).json({
                success: false,
                message: "The user's response does not contain any valid answers."
            });
        }

        const answers = await Promise.all(response.answers.map(async (answer) => ({
            question: await Question.findById(answer.questionId).select('question'),
            answer: answer.selectedOption,
        })));

        // console.log("Answers after mapping: ", answers);

        const studentProfile = {
            level: response.level,
            answers: answers,
        }

        const prompt = await buildCareerPrompt(studentProfile);

        const report = await generateResponse(prompt);

        //store the report in the database
       
       const newReport = await aiReport.create({
           student : userId,
           report : report,     
       });

        return res.status(200).json({
            success: true,
            report,
        })

       
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};



export const continueChat = async (req, res) => {
    try{
        const userId = req.user.id;
        const studentProfile = await User.findById(userId).select('name');
        
        const { currentMessage } = req.body;

        if(!currentMessage) return res.status(400).json({
            success:false,
            message:"Current message is required",
        });

        const previousReport = await aiReport.findOne({student:userId}).sort({createdAt:-1});

        if(!previousReport) return res.status(404).json({
            success:false,
            message:"Attempt the questionnaire first to generate a career report before continuing the chat.",
        });

        let previousChat = await AIChat.findOne({student:userId}).sort({createdAt:-1});
        if(!previousChat){
            previousChat = await AIChat.create({
                student:userId,
                messages:[],
            });
        }
        await previousChat.messages.push({role:"user", content:currentMessage});


        const prompt = await buildChatPrompt({previousReport, previousChat, studentProfile});

        const reply = await generateResponse(prompt);

        await previousChat.messages.push({role:"assistant", content:reply});
        await previousChat.save();
        return res.status(200).json({
            success:true,
            previousChat,
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}