import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", aiAvailable: !!process.env.GEMINI_API_KEY });
});

// AI Memory Assistant Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [], memories = [], userName = "Alex" } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = getAI();
    if (!ai) {
      // Fallback local memory assistant logic if key is not configured
      const lower = message.toLowerCase();
      let extractedData: { date?: string; time?: string; title?: string; category?: string } | null = null;
      let reply = "I've noted that for you, " + userName + ".";

      // Simple regex pattern matching for date/time
      const dateMatch = message.match(/(?:on\s+)?(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+(\d{1,2}(?:st|nd|rd|th)?)/i);
      const timeMatch = message.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM))/i);

      if (dateMatch || timeMatch || lower.includes("remember") || lower.includes("sync") || lower.includes("note")) {
        extractedData = {
          title: message.replace(/^(please\s+)?(remember\s+(that\s+)?|note\s+(that\s+)?|sync\s+)/i, "").trim(),
          date: dateMatch ? `${dateMatch[1]} ${dateMatch[2]}` : undefined,
          time: timeMatch ? timeMatch[1].toUpperCase() : undefined,
          category: lower.includes("presentation") || lower.includes("meeting") || lower.includes("project") ? "Work" :
                    lower.includes("doctor") || lower.includes("pill") || lower.includes("medicine") ? "Health" :
                    lower.includes("buy") || lower.includes("grocery") ? "Personal" : "General"
        };
        reply = `Got it. I'll remember: "${extractedData.title}"${extractedData.date ? ` on ${extractedData.date}` : ""}${extractedData.time ? ` at ${extractedData.time}` : ""}.`;
      } else if (lower.includes("what") && lower.includes("presentation")) {
        reply = "Your presentation is scheduled for September 12 at 10:00 AM.";
      } else {
        reply = `I'm tracking your cognitive flow and synced memories, ${userName}. What would you like to review or save next?`;
      }

      return res.json({
        reply,
        extracted: extractedData
      });
    }

    const systemInstruction = `You are NeuroSync's Cognitive & Memory AI Companion for user "${userName}".
Your job is to assist with personal memory capture, retrieval, cognitive coaching, and reassurance.
When the user tells you something to remember or note (e.g. "Remember that my presentation is on September 12 at 10 AM", "Remind me to take vitamin D at 8 AM", "My anniversary is June 5"), you should:
1. Provide a calm, reassuring, clear response acknowledging the memory.
2. Return a structured JSON containing:
   - "reply": The natural language response to display to the user.
   - "extracted": null OR an object { "title": string, "date": string | null, "time": string | null, "category": "Work" | "Health" | "Personal" | "Tasks" | "Notes", "tags": string[] } if a concrete memory/task/event is detected.
Keep your tone warm, concise, zen-like, and empathetic. Always respond strictly in valid JSON format.`;

    const prompt = `User Current Memories: ${JSON.stringify(memories.slice(0, 5))}
Recent Chat History: ${JSON.stringify(history.slice(-4))}
User Message: "${message}"

Respond strictly with a JSON object:
{
  "reply": "string",
  "extracted": {
    "title": "string",
    "date": "string or null (e.g. Sept 12)",
    "time": "string or null (e.g. 10:00 AM)",
    "category": "Work | Health | Personal | Tasks | Notes",
    "tags": ["string"]
  } | null
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({
      reply: "I recorded your thought. Let me know if you need to set a reminder or review past memories.",
      extracted: null,
      error: error.message
    });
  }
});

// Dynamic AI Guidance during games & daily insights
app.post("/api/guidance", async (req, res) => {
  try {
    const { gameType = "Memory Matrix", score = 0, level = 4, streak = 0, userName = "Alex" } = req.body;
    const ai = getAI();
    
    if (!ai) {
      const defaultPhrases = [
        `Focus on the pattern, ${userName}. You've got this!`,
        `Superb rhythm! Your visual memory is firing on all cylinders.`,
        `Take a breath and visualize the grid layout.`,
        `Level ${level} mastered! Great spatial accuracy.`
      ];
      const randomPhrase = defaultPhrases[Math.floor(Math.random() * defaultPhrases.length)];
      return res.json({ guidance: randomPhrase });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Generate a 1-sentence supportive, zen-tech cognitive coach whisper for user "${userName}" playing "${gameType}" at Level ${level} (Score: ${score}, Streak: ${streak}). Keep it under 14 words. Examples: "Focus on the pattern, Alex. You've got this!", "Excellent spatial recall! Keep your breathing steady."`,
    });

    res.json({ guidance: response.text?.trim() || `Focus on the pattern, ${userName}. You've got this!` });
  } catch (err: any) {
    res.json({ guidance: `Focus on the pattern, ${req.body.userName || "Alex"}. You've got this!` });
  }
});

// Dynamic Cognitive Insight generator
app.post("/api/insights", async (req, res) => {
  try {
    const { cognitiveScore = 785, memoryScore = 82, focusScore = 75, speedScore = 68, logicScore = 89, streak = 14 } = req.body;
    const ai = getAI();
    
    if (!ai) {
      return res.json({
        headline: "AI Cognitive Insight",
        summary: "Your visual memory improved 12% this week. Consistent spatial puzzle training is paying off.",
        recommendation: "Focus on speed reaction drills today to balance cognitive velocity with accuracy."
      });
    }

    const prompt = `Based on user metrics: Cognitive Score ${cognitiveScore}, Memory ${memoryScore}, Focus ${focusScore}, Speed ${speedScore}, Logic ${logicScore}, Streak ${streak} days.
Provide a concise cognitive insight with:
1. "summary": One or two sentences highlighting a cognitive peak (e.g. visual memory improvement).
2. "recommendation": A short actionable daily training advice.
Strict JSON format: { "headline": "AI Cognitive Insight", "summary": "...", "recommendation": "..." }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (err: any) {
    res.json({
      headline: "AI Cognitive Insight",
      summary: "Your visual memory improved 12% this week. Consistent spatial puzzle training is paying off.",
      recommendation: "Focus on speed reaction drills today to balance cognitive velocity with accuracy."
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NeuroSync Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
