import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
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
      plan:
        response.choices[0].message.content,
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