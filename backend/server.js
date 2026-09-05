require('dotenv').config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require('@google/genai');

const app = express();
const ai = process.env.GOOGLE_API_KEY ? new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY }) : null;
const modelName = process.env.GOOGLE_MODEL || 'gemini-2.0-flash';

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend is running successfully 🚀");
});

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

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});