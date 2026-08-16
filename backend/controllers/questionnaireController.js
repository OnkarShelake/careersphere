import Question from '../models/Question.js';
import Response from '../models/Response.js';

export const getQuestionsByLevel = async (req, res) => {
    try {
        const raw_level = req.params.level;
        const normalized = raw_level.replace(/_/g, " ").trim();

        // Search with flexible regex
        const regex = new RegExp(`^${normalized}`, 'i');
        let questions = await Question.find({ level: regex });

        if (!questions || questions.length === 0) {
            // Fallback to all questions if specific level not found
            questions = await Question.find();
        }

        if (!questions || questions.length === 0) {
            return res.status(404).json({ message: "No questions found for this level" });
        }

        return res.status(200).json({
            message: "Questions fetched successfully",
            questions
        });
    } catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({ message: error.message });
    }
};

export const submitAnswers = async (req, res) => {
    try {
        const { answers } = req.body;
        const level = req.params.level;
        const userId = req.user.id;

        // Process the answers and calculate scores for each category
        const scores = {
            logic: 0,
            business: 0
        };

        if (answers && typeof answers === 'object') {
            Object.values(answers).forEach(ans => {
                if (ans && ans.category) {
                    if (!scores[ans.category]) scores[ans.category] = 0;
                    scores[ans.category] += Number(ans.weight) || 1;
                }
            });
        }

        // Based on scores, recommend career paths
        let recommendations = [
            { career: "Software Engineer / AI Developer", score: scores.logic || 10, category: "logic" },
            { career: "Tech Entrepreneur / Product Leader", score: scores.business || 8, category: "business" },
            { career: "Data Scientist & Analytics Architect", score: Math.round((scores.logic || 5) * 0.9), category: "logic" }
        ];

        recommendations.sort((a, b) => b.score - a.score);

        const response = await Response.create({
            userId,
            level,
            answers: answers ? Object.values(answers) : [],
            scores,
            recommendations
        });

        return res.status(200).json({
            message: "These are your career recommendations",
            recommendations,
            response
        });
    } catch (error) {
        console.error("Error submitting questionnaire answers:", error);
        res.status(500).json({ message: error.message });
    }
};
