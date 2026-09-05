const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const path = require("path");
const { GoogleGenAI } = require('@google/genai');
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const locationRoutes = require("./routes/locationRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const riskRoutes = require("./routes/riskRoutes");
const alertRoutes = require("./routes/alertRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const statsRoutes = require("./routes/statsRoutes");

const app = express();
const ai = process.env.GOOGLE_API_KEY ? new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY }) : null;
const modelName = process.env.GOOGLE_MODEL || 'gemini-2.0-flash';

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/risk", riskRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/stats", statsRoutes);

app.post('/api/ai/chat', async (req, res) => {
    try {
        if (!ai) {
            return res.status(500).json({
                error: 'GOOGLE_API_KEY is not configured in the backend environment.',
            });
        }

        const { message, history = [] } = req.body || {};

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'A message is required.' });
        }

        const systemInstruction = [
            'You are an AI assistant for a water-borne disease early warning system.',
            'Focus on public health, water safety, symptom awareness, district-level risk interpretation, and practical next steps.',
            'Do not claim to diagnose medical conditions. Encourage urgent professional help for severe symptoms.',
            'Keep responses concise, actionable, and easy to understand.',
        ].join(' ');

        const contents = [
            ...history
                .filter((entry) => entry && (entry.role === 'user' || entry.role === 'model') && typeof entry.content === 'string')
                .map((entry) => ({
                    role: entry.role,
                    parts: [{ text: entry.content }],
                })),
            {
                role: 'user',
                parts: [{ text: message }],
            },
        ];

        const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
                systemInstruction,
                temperature: 0.4,
                maxOutputTokens: 512,
            },
        });

        return res.json({ reply: (response.text || '').trim() });
    } catch (error) {
        console.error('AI chat error:', error);
        return res.status(500).json({ error: 'Failed to generate AI response.' });
    }
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
