
import Question from '../models/Question.js';
import Response from '../models/Response.js';

export const getQuestionsByLevel = async (req, res) => {
    try {
        const raw_level = req.params.level;
        let level;
        if(raw_level !== "engineering"){
             level = raw_level.replace(/_/g," ");
        }
        else{
           level = "engineering (Specialization)";
        }
        
        const questions = await Question.find({ level });
        
        if(questions.length === 0) return res.status(404).json({message:"No questions found for this level"});
       

        const filterdQuestions = questions.filter(q => q.level === level);
        return res.status(200).json({message:"Questions fetched successfully", questions: filterdQuestions});
    } catch (error) {
        res.status(500).json({message:error.message});
    }
}

export const submitAnswers = async (req, res)=>{
    try {
         const {answers} = req.body;
        const level = req.params.level;
        const userId = req.user.id;
       
     //process the answers and calculate scores for each category
     let scores = {
        logic:0,
        business:0
     };

   
    Object.values(answers).forEach(ans =>{
        if(!scores[ans.category]) scores[ans.category] = 0;
        scores[ans.category] += ans.weight;
    })
   

     //based on the scores we will recommend the career paths
     let recommendations = [
        {career:"software engineer", score: scores.logic, category:"logic"},
        {career:"entrepreneur", score: scores.business, category:"business"}
     ];

    recommendations.sort((a,b) => b.score - a.score);
    
    recommendations = recommendations.filter(rec => rec.score > 0);

    const response = await Response.create({
        userId,
        level,
        answers: Object.values(answers),
        scores,
        recommendations
    });

    return res.status(200).json({message:"these are your career recommendations", recommendations});


    } catch (error) {
        res.status(500).json({message:error.message});
    }
}
