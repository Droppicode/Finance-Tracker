const { GoogleGenerativeAI } = require("@google/generative-ai");

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000; // 2 seconds

const extractTransactionsFromText = async (text) => {
  console.log("extractTransactionsFromText called with text (first 200 chars):", text.substring(0, 200));
  const apiKey = process.env.GEMINI_API_KEY; // Use process.env for Vercel
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set.");
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    You are an expert in extracting transaction information from bank
    statements. Given the text from a bank statement, extract the following
    information for each transaction:
    - Date
    - Description (the name of the establishment)
    - Amount
    - Type (credit or debit)
    - Category in Portuguese (e.g., Alimentação, Transporte, Lazer, Salário,
      etc.)

    **Important**: The descriptions must be kept in Portuguese and should be
    short and direct.

    Return the information in a JSON format, as a list of objects.
    For example:
    [
        {
            "date": "2023-10-26",
            "description": "Supermercado Pague Menos",
            "amount": 345.60,
            "type": "debit",
            "category": "Alimentação"
        },
        {
            "date": "2023-10-27",
            "description": "Posto Shell Av. Central",
            "amount": 150.00,
            "type": "debit",
            "category": "Transporte"
        },
        {
            "date": "2023-10-28",
            "description": "Depósito de Salário",
            "amount": 5000.00,
            "type": "credit",
            "category": "Salário"
        }
    ]

    Bank statement text:
    ${text}
    `;

  let responseText;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      console.log(`Attempt ${i + 1} of ${MAX_RETRIES} to call Gemini API...`);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      responseText = response.text();
      console.log("Received response from Gemini API.");

      const replacedResponse = responseText.trim().replace("json", "");
      const cleanedResponse = replacedResponse.replace(/`/g, "");

      return JSON.parse(cleanedResponse);
    } catch (e) {
      console.error(`Attempt ${i + 1} failed:`, e);
      if (e.includes("503 Service Unavailable") && e.includes("model is overloaded") && i < MAX_RETRIES - 1) {
        console.log(`Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      } else {
        console.error("Failed to parse JSON from Gemini response:", e);
        console.error("Raw response text:", responseText);
        throw new Error("Could not parse transactions from statement.", { cause: e });
      }
    }
  }
  throw new Error("Failed to extract transactions after multiple retries.");
};

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins for development
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); // Allow POST and OPTIONS methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow Content-Type header

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  console.log("processStatement function called.");
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({
      error: "The function must be called with extracted text from a statement.",
    });
  }

  try {
    const transactions = await extractTransactionsFromText(text);
    console.log("Successfully processed statement and extracted transactions.");
    res.status(200).json({ data: transactions });
  } catch (error) {
    console.error("Error processing statement:", error);
    res.status(500).json({ error: error.message, details: error.cause?.message });
  }
};
