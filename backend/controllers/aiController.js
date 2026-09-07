const fs = require('fs');
const pdfParse = require('pdf-parse');

const { GoogleGenAI } = require('@google/genai');
const ai = process.env.GOOGLE_API_KEY ? new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY }) : null;
const modelName = process.env.GOOGLE_MODEL || 'gemini-3.6-flash';

const SYSTEM_PROMPT = [
  'You are an expert AI analyst for a Water-Borne Disease Early Warning System.',
  'You specialize in analyzing medical reports, water quality lab results, and public health documents.',
  'When given a document, extract key findings and provide a structured health risk assessment.',
  'Always include: risk level, key findings, affected population concerns, recommended actions.',
  'Be specific about water-borne diseases like cholera, typhoid, dysentery, hepatitis A, giardiasis.',
  'If the document is a medical report, assess disease likelihood based on symptoms and lab markers.',
  'If the document is a water quality report, assess contamination risks and health implications.',
  'Format your response in clear sections with headers.',
  'Do not claim to diagnose definitively. Always recommend professional medical consultation.',
].join(' ');

const RISK_PROMPT = [
  'You are an expert AI risk assessor for a Water-Borne Disease Early Warning System.',
  'Given patient symptoms, environmental conditions, and location data, provide a comprehensive risk assessment.',
  'Analyze the combination of symptoms, water source, weather conditions, and environmental factors.',
  'Provide: overall risk score (0-100), risk level, likely water-borne diseases, reasoning, and recommended actions.',
  'Consider diseases like cholera, typhoid, dysentery, hepatitis A, giardiasis, cryptosporidiosis.',
  'Factor in: symptom severity, water source safety, recent flooding, temperature/humidity conditions.',
  'Format your response with clear sections.',
  'Always recommend professional medical consultation for moderate or high risk.',
].join(' ');

exports.analyzePdf = async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({
        error: 'GOOGLE_API_KEY is not configured in the backend environment.',
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file.' });
    }

    const pdfPath = req.file.path;
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(pdfBuffer);

    // Clean up the uploaded PDF after reading
    fs.unlink(pdfPath, () => {});

    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({
        error: 'Could not extract text from the PDF. The file may be image-based or empty.',
      });
    }

    // Truncate to ~8000 chars to stay within token limits while keeping key info
    const truncatedText = extractedText.length > 8000
      ? extractedText.substring(0, 8000) + '\n\n[Document truncated for analysis]'
      : extractedText;

    const prompt = [
      'Analyze the following document and provide a comprehensive health risk assessment.',
      'Extract key findings, identify potential water-borne disease risks, and recommend actions.',
      '',
      '--- DOCUMENT CONTENT ---',
      truncatedText,
      '--- END DOCUMENT ---',
      '',
      'Provide your analysis in this structure:',
      '## Document Summary',
      '## Key Findings',
      '## Water-Borne Disease Risk Assessment',
      '## Risk Level (Low / Moderate / High / Very High)',
      '## Recommended Actions',
      '## When to Seek Medical Help',
    ].join('\n');

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.3,
        maxOutputTokens: 4096,
      },
    });

    const pages = pdfData.numpages || 0;
    const reply = (response.text || '').trim();

    return res.json({
      analysis: reply,
      documentInfo: {
        pages,
        characters: extractedText.length,
        fileName: req.file.originalname,
      },
    });
  } catch (error) {
    console.error('PDF analysis error:', error);
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
    const errStatus = Number(error.status) || 500;
    if (errStatus === 429) {
      return res.status(429).json({ error: 'AI service rate limit reached. Please wait a moment and try again.' });
    }
    return res.status(errStatus).json({ error: error.message || 'Failed to analyze the PDF document.' });
  }
};

exports.predictRisk = async (req, res) => {
  if (!ai) {
    return res.status(500).json({
      error: 'GOOGLE_API_KEY is not configured in the backend environment.',
    });
  }

  const { symptoms, waterSource, recentFlooding, location, temperature, humidity, rainfall, patientInfo } = req.body || {};

  const inputParts = [];
  if (patientInfo) {
    inputParts.push(`Patient Info: Age ${patientInfo.age || 'unknown'}, Gender ${patientInfo.gender || 'unknown'}, District: ${patientInfo.district || 'unknown'}`);
  }
  if (symptoms && Object.keys(symptoms).length > 0) {
    const activeSymptoms = Object.entries(symptoms).filter(([, v]) => v).map(([k]) => k);
    inputParts.push(`Symptoms: ${activeSymptoms.length > 0 ? activeSymptoms.join(', ') : 'None reported'}`);
  }
  if (waterSource) inputParts.push(`Water Source: ${waterSource}`);
  if (recentFlooding) inputParts.push(`Recent Flooding: ${recentFlooding}`);
  if (location) inputParts.push(`Location: ${location}`);
  if (temperature) inputParts.push(`Temperature: ${temperature}°C`);
  if (humidity) inputParts.push(`Humidity: ${humidity}%`);
  if (rainfall) inputParts.push(`Rainfall: ${rainfall}mm`);

  if (inputParts.length === 0) {
    return res.status(400).json({ error: 'Please provide symptom, environmental, or patient data for risk prediction.' });
  }

  const prompt = [
    'Assess the water-borne disease risk based on the following data:',
    '',
    ...inputParts,
    '',
    'Provide your assessment in this structure:',
    '## Risk Score: [0-100]/100',
    '## Risk Level: [Low / Moderate / High / Very High]',
    '## Likely Diseases',
    '## Analysis',
    '## Recommended Immediate Actions',
    '## When to Seek Emergency Medical Help',
  ].join('\n');

  let response;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      response = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: RISK_PROMPT,
          temperature: 0.3,
          maxOutputTokens: 4096,
        },
      });
      break;
    } catch (retryErr) {
      console.error(`AI predict attempt ${attempt + 1} failed:`, retryErr.message);
      if (Number(retryErr.status) === 429 && attempt < 2) {
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }
      const errStatus = Number(retryErr.status) || 500;
      if (errStatus === 429) {
        return res.status(429).json({ error: 'AI service rate limit reached. Please wait a moment and try again.' });
      }
      return res.status(errStatus).json({ error: retryErr.message || 'Failed to generate risk prediction.' });
    }
  }

  if (!response) {
    return res.status(500).json({ error: 'Failed to generate AI response after retries.' });
  }

  const reply = (response.text || '').trim();

  let aiScore = null;
  const scoreMatch = reply.match(/(?:Risk Score|Score)[:\s]*(\d{1,3})/i);
  if (scoreMatch) {
    aiScore = Math.min(100, Math.max(0, parseInt(scoreMatch[1], 10)));
  }

  let aiLevel = 'Moderate';
  if (/very high/i.test(reply)) aiLevel = 'Very High';
  else if (/\bhigh\b/i.test(reply)) aiLevel = 'High';
  else if (/\blow\b/i.test(reply)) aiLevel = 'Low';
  else if (/moderate/i.test(reply)) aiLevel = 'Moderate';

  return res.json({
    prediction: reply,
    riskScore: aiScore,
    riskLevel: aiLevel,
    inputs: inputParts,
  });
};
