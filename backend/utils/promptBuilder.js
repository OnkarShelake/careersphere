export const buildCareerPrompt = (studentProfile) => {

    const formattedAnswers = studentProfile.answers
        .map((item, index) =>
            `${index + 1}. ${item.question}
Answer: ${item.answer}`
        )
        .join("\n\n");

    return `
You are an experienced career counselor specializing in Indian education and career guidance.

A student has completed a career assessment questionnaire.

Student Level:
${studentProfile.level}

Questionnaire Responses:

${formattedAnswers}

Based on these responses, generate a detailed career report.

Include:

1. Personality Summary

2. Top Strengths

3. Areas of Improvement

4. Top 3 Recommended Career Paths

For each career explain:

- Why it suits the student
- Skills required
- Future opportunities

Then generate:

A 6-month learning roadmap.

Finally,

End with motivational advice.

Keep the response friendly and practical.

Format the response using Markdown.
`;
};