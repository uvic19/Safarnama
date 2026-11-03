import { GoogleGenerativeAI } from '@google/generative-ai';

const VALID_CATEGORIES = ['Food', 'Stay', 'Transport', 'Fuel', 'Entry', 'Shopping', 'Misc'];
const MODEL_LADDER = [
  'gemini-3.5-flash',       // Verified stable multimodal workhorse
  'gemini-3.5-flash-lite',  // Verified fast fallback
  'gemini-3.8-flash',       // Next-gen flagship
  'gemini-flash-latest',    // Dynamic latest alias
  'gemini-flash-lite-latest',
  'gemini-2.5-flash-lite',
];

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    amount: { type: 'NUMBER', nullable: true },
    currency: { type: 'STRING', nullable: true },
    category: { type: 'STRING', enum: VALID_CATEGORIES, nullable: true },
    description: { type: 'STRING', nullable: true },
  },
  required: ['amount', 'currency', 'category', 'description'],
};

const PROMPT = `Extract expense details from this receipt image.
- CRITICAL FOR AMOUNT: Inspect the bottom of the bill carefully. If there are handwritten additions, tips, or an updated handwritten final total/sum written below or near the printed total (e.g. 1142 + 1128 = 2270), the FINAL handwritten total represents the actual amount paid and MUST be used as the amount. Otherwise use the printed net total.
- Do NOT insert decimal points unless an explicit dot '.' is physically drawn or printed. If numbers are written across columns or boxes without a dot, extract the full integer amount as written (e.g. 17 51 is 1751).
- category must be one of: ${VALID_CATEGORIES.join(', ')}.
- currency: standard 3-letter currency code (e.g. INR, USD, EUR, GBP) ONLY if an explicit currency symbol or code is clearly visible on the receipt. If not clearly present, return null — do not guess.
- description: concise summary of purchased items or merchant name.
- If a field is absent or illegible, return null — do not guess.`;

async function tryModel(modelName, imageBase64, mimeType, genAI) {
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0,
    },
  });
  const result = await model.generateContent([
    { inlineData: { mimeType, data: imageBase64 } },
    PROMPT,
  ]);
  return JSON.parse(result.response.text());
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'GEMINI_API_KEY_MISSING' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'INVALID_JSON' }),
    };
  }

  const { imageBase64, mimeType } = body;
  if (!imageBase64 || !mimeType) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'MISSING_IMAGE_PAYLOAD' }),
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  for (const modelName of MODEL_LADDER) {
    try {
      const extracted = await tryModel(modelName, imageBase64, mimeType, genAI);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extracted),
      };
    } catch (err) {
      console.warn(`[scan-receipt] ${modelName} failed (${err?.status || err?.message || 'error'}), falling back in ladder...`);
    }
  }

  return {
    statusCode: 503,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'LADDER_EXHAUSTED' }),
  };
};

