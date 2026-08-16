export const buildChatPrompt = ({ previousReport, previousChat, studentProfile }) => {
    const conversation = (previousChat?.messages || [])
        .map(msg => {
            return `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`;
        })
        .join("\n\n");

    const studentName = studentProfile?.name || "Student";
    const education = studentProfile?.educationLevel ? `Education: ${studentProfile.educationLevel}` : "";
    const skills = studentProfile?.skills?.length ? `Skills: ${studentProfile.skills.join(", ")}` : "";
    const targetCareer = studentProfile?.targetCareer ? `Target Career: ${studentProfile.targetCareer}` : "";

    const profileContext = [education, skills, targetCareer].filter(Boolean).join(" | ");

    const reportSection = previousReport?.report
        ? `
==========================
PREVIOUS CAREER REPORT
==========================
${previousReport.report}
`
        : `
==========================
STUDENT CONTEXT
==========================
${profileContext || "General Career Mentorship & Guidance"}
`;

    return `
You are an experienced, empathetic, and highly knowledgeable AI Career Counselor and Tech Industry Mentor.

The student's name is ${studentName}.
${profileContext ? `Student Profile: ${profileContext}` : ""}

Guidelines:
- Give clear, practical, and highly actionable career advice.
- If asked about specific fields (e.g. Software Engineering, Data Science, AI, Product Management), provide structured roadmaps, essential skills, interview tips, project ideas, and industry best practices.
- Be encouraging, concise, and structured (use bullet points and bold text where helpful).
- Answer the student's questions directly and naturally.

${reportSection}

==========================
CONVERSATION HISTORY
==========================
${conversation}

==========================
TASK
==========================
Reply to the student's latest message as their supportive AI Career Guide.
`;
};