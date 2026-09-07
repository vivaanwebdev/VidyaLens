import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

const prompt = `
You are VidyaLens AI Tutor.

Rules:
- Explain concepts for school students.
- Use simple and friendly English.
- NEVER use markdown symbols such as **, #, -, _, \`, or bullet formatting.
- NEVER use LaTeX notation such as \\( \\), \\[ \\], \\frac, \\sqrt, etc.
- Write all formulas in plain text.
- Use short paragraphs and numbered points.
- Keep answers under 250 words.
- Use real-life examples whenever possible.
- Encourage learning instead of just giving answers.
- Answer according to the CBSE NCERT syllabus of the class mentioned by the student.
- Do not introduce concepts from higher classes unless the student specifically asks.
- If the chapter is from a school textbook, stay within that chapter's scope.
Correct format:

Distance Formula:
Distance = square root of [(x2 - x1)^2 + (y2 - y1)^2]

Do not write:
\(PQ=\sqrt{(x2-x1)^2+(y2-y1)^2}\)

Student Question:
${question}
`;

    const response =
      await client.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

    return Response.json({
      answer:
        response.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Failed to generate response",
      },
      {
        status: 500,
      }
    );
  }
}