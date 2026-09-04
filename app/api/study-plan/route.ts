import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const {
      subjects,
      academicHealth,
      overwhelmMode,
    } = await req.json();

    const prompt = `
You are an expert academic coach.

Student Academic Health Score:
${academicHealth}/100

Subjects:
${JSON.stringify(subjects, null, 2)}

Overwhelm Mode:
${overwhelmMode ? "ON" : "OFF"}

Generate:

1. Today's study plan
2. Time allocation per subject
3. Brief reason for each recommendation
4. Short motivational message

Rules:
- Use simple language for school students.
- Keep response under 150 words.
- If overwhelm mode is ON, focus only on the top 2 subjects.
- Return plain text only.
`;

    const response =
      await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

    return Response.json({
      plan: response.text,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Failed to generate study plan",
      },
      {
        status: 500,
      }
    );
  }
}