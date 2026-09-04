import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    const prompt = `
You are VidyaLens AI Tutor.

Rules:
- Explain concepts for school students.
- Use simple and friendly English.
- Do NOT use markdown.
- Do NOT use LaTeX.
- Keep answers under 250 words.
- Use real-life examples whenever possible.
- If solving a numerical problem, show step-by-step calculations.
- If the answer is complex, break it into simple points.
- Encourage learning instead of just giving answers.

Student Question:
${question}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    return Response.json({
      answer: response.text,
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