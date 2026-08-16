import Question from '../models/Question.js';

export const seedDefaultQuestions = async () => {
    try {
        const count = await Question.countDocuments();
        if (count > 0) return;

        console.log("Seeding default questionnaire questions into the fresh database...");

        const defaultQuestions = [
            // Below 10th
            {
                question: "Which type of activity excites you the most in your free time?",
                category: "logic",
                level: "below 10th",
                options: [
                    { text: "Solving puzzles, building LEGO, or tinkering with gadgets", weight: 3 },
                    { text: "Drawing, painting, writing stories, or listening to music", weight: 2 },
                    { text: "Organizing team games, leading group projects, or selling crafts", weight: 1 },
                    { text: "Reading science books, observing nature, or exploring experiments", weight: 2 }
                ]
            },
            {
                question: "When you face a difficult problem, how do you usually tackle it?",
                category: "logic",
                level: "below 10th",
                options: [
                    { text: "Break it down into step-by-step logic until it works", weight: 3 },
                    { text: "Brainstorm creative out-of-the-box ideas", weight: 2 },
                    { text: "Ask friends and collaborate to find the best group solution", weight: 1 },
                    { text: "Research facts and experiment with different methods", weight: 2 }
                ]
            },
            {
                question: "What school subject do you look forward to the most?",
                category: "business",
                level: "below 10th",
                options: [
                    { text: "Mathematics and Computer Science", weight: 1 },
                    { text: "Social Studies, Economics, and Group Activities", weight: 3 },
                    { text: "Science, Biology, and Physics", weight: 2 },
                    { text: "Arts, Languages, and Literature", weight: 1 }
                ]
            },

            // After 10th
            {
                question: "What stream or area of study interests you the most for your higher secondary education?",
                category: "logic",
                level: "after 10th",
                options: [
                    { text: "Science with PCM (Physics, Chemistry, Math) / Computer Science", weight: 3 },
                    { text: "Commerce with Economics, Accounting, and Business Studies", weight: 1 },
                    { text: "Arts / Humanities with Psychology, Literature, and Media", weight: 1 },
                    { text: "Science with PCB (Medical, Biotechnology, Life Sciences)", weight: 2 }
                ]
            },
            {
                question: "How do you prefer to spend your project time?",
                category: "business",
                level: "after 10th",
                options: [
                    { text: "Writing code, simulating experiments, or designing algorithms", weight: 1 },
                    { text: "Presenting, negotiating, pitch decks, and financial planning", weight: 3 },
                    { text: "Visual design, creating content, or filmmaking", weight: 2 },
                    { text: "Researching scientific papers and lab documentation", weight: 2 }
                ]
            },

            // After 12th
            {
                question: "What kind of career environment aligns best with your future ambitions?",
                category: "logic",
                level: "after 12th",
                options: [
                    { text: "High-tech software company, AI labs, or robotics development", weight: 3 },
                    { text: "Consulting firms, venture capital, startups, or executive management", weight: 1 },
                    { text: "Creative studios, media agencies, or UI/UX design firms", weight: 2 },
                    { text: "Healthcare, research institutions, or pharmaceutical labs", weight: 2 }
                ]
            },
            {
                question: "Which skill do you want to master in the next 3 years?",
                category: "business",
                level: "after 12th",
                options: [
                    { text: "Software Architecture, Machine Learning, and Cloud Computing", weight: 1 },
                    { text: "Leadership, Strategic Business Management, and Product Growth", weight: 3 },
                    { text: "Product Design, User Psychology, and Creative Direction", weight: 2 },
                    { text: "Clinical research, Biochemical analysis, and Diagnostics", weight: 1 }
                ]
            },

            // Engineering
            {
                question: "Which branch of engineering or tech specialization excites you the most?",
                category: "logic",
                level: "engineering (Specialization)",
                options: [
                    { text: "Computer Science, AI/ML, and Full Stack Web Systems", weight: 3 },
                    { text: "Data Science, Big Data Pipelines, and Quantitative Analytics", weight: 3 },
                    { text: "Product Management, Tech Strategy, and Startup Operations", weight: 1 },
                    { text: "Embedded Systems, IoT, Robotics, and Hardware Design", weight: 2 }
                ]
            },
            {
                question: "What role would you like to take in a software or technical capstone project?",
                category: "logic",
                level: "engineering (Specialization)",
                options: [
                    { text: "Backend / Core Algorithm Developer (Node.js, Python, Databases)", weight: 3 },
                    { text: "Frontend & UI/UX Developer (React, Next.js, Design Systems)", weight: 2 },
                    { text: "Product Manager / Scrum Master (Planning, Architecture, Pitching)", weight: 1 },
                    { text: "DevOps & Cloud Engineer (CI/CD, Docker, Kubernetes, AWS)", weight: 3 }
                ]
            }
        ];

        await Question.insertMany(defaultQuestions);
        console.log("Successfully seeded default questionnaire questions.");
    } catch (error) {
        console.error("Error seeding default questions:", error.message);
    }
};
