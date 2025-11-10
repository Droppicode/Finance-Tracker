const { GoogleGenerativeAI } = require("@google/generative-ai");

const extractTransactionsFromText = async (text) => {
  console.log("extractTransactionsFromText called with text (first 200 chars):", text.substring(0, 200));
  const apiKey = process.env.GEMINI_API_KEY; // Use process.env for Vercel
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set.");
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
  try {
    console.log("Calling Gemini API for transaction extraction...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    responseText = response.text();
    console.log("Received response from Gemini API.");

    const replacedResponse = responseText.trim().replace("json", "");
    const cleanedResponse = replacedResponse.replace(/`/g, "");

    return JSON.parse(cleanedResponse);
  } catch (e) {
    console.error("Failed to parse JSON from Gemini response:", e); // Replace logger.error
    console.error("Raw response text:", responseText); // Replace logger.error
    throw new Error("Could not parse transactions from statement.", { cause: e });
  }
};

module.exports = async (req, res) => {
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
