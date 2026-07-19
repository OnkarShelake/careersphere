import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { testAI, generateCareerReport, continueChat } from "../controllers/aiController.js";


const router = express.Router();

router.post("/test", testAI);
router.post("/career-report", authMiddleware, generateCareerReport);
router.post("/continue-chat", authMiddleware, continueChat);

export default router;