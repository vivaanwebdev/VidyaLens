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
      wakeTime,
      schoolStart,
      schoolEnd,
      tuitionStart,
      tuitionEnd,
      sleepTime,
      studyHours,
    } = await req.json();

    const prompt = `
You are VidyaLens Smart Timetable AI.

Return ONLY valid JSON.

Required format:

{
  "sessions": [
    {
      "startTime": "14:30",
      "endTime": "16:00",
      "subject": "English",
      "reason": "Lowest score and exam tomorrow"
    }
  ],
  "motivation": "Short motivational sentence"
}

Student Academic Health:
${academicHealth}/100

Subjects:
${JSON.stringify(subjects, null, 2)}

Overwhelm Mode:
${overwhelmMode ? "ON" : "OFF"}

Wake Time:
${wakeTime}

School:
${schoolStart} to ${schoolEnd}

Tuition:
${tuitionStart || "None"} to ${tuitionEnd || "None"}

Sleep Time:
${sleepTime}

Available Study Hours:
${studyHours}

Rules:

- Generate a realistic timetable for TODAY.
- Respect school timings.
- Respect tuition timings.
- Respect sleep time.
- Use approximately the available study hours.
- Prioritize subjects with low scores.
- Prioritize subjects with nearby exams.
- If overwhelm mode is ON, focus only on the top 2 subjects.
- Every session must contain:
  - startTime
  - endTime
  - subject
  - reason
- Time format must be HH:MM (24-hour format).
- Sessions must not overlap.
- Return ONLY valid JSON.
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

    const content =
      response.choices[0].message.content || "{}";

    try {
      const parsed = JSON.parse(content);

      return Response.json({
        sessions: parsed.sessions || [],
        motivation:
          parsed.motivation ||
          "Stay consistent and keep learning every day.",
      });
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("AI Response:", content);

      return Response.json({
        sessions: [],
        motivation:
          "Stay consistent and keep learning every day.",
      });
    }
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Failed to generate timetable",
      },
      {
        status: 500,
      }
    );
  }
}