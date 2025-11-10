const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {GoogleGenerativeAI} = require("@google/generative-ai");
const pdf = require("pdf-parse");
const logger = require("firebase-functions/logger");
const {defineString} = require("firebase-functions/params");

const geminiApiKey = defineString("GEMINI_API_KEY");

const extractTextFromPDF = async (pdfBuffer) => {
  try {
    const data = await pdf(pdfBuffer);
    return data.text;
  } catch (error) {
    logger.error("Error extracting text from PDF:", error);
    throw new HttpsError("internal", "Error extracting text from PDF.", error);
  }
};

const extractTransactionsFromText = async (text) => {
  const apiKey = geminiApiKey.value();
  if (!apiKey) {
    logger.error("GEMINI_API_KEY is not set.");
    throw new HttpsError("internal", "GEMINI_API_KEY is not configured.");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});

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
    const result = await model.generateContent(prompt);
    const response = await result.response;
    responseText = response.text();

    const replacedResponse = responseText.trim().replace("json", "");
    const cleanedResponse = replacedResponse.replace(/`/g, "");

    return JSON.parse(cleanedResponse);
  } catch (e) {
    logger.error("Failed to parse JSON from Gemini response:", e);
    logger.error("Raw response text:", responseText);
    throw new HttpsError("internal",
        "Could not parse transactions from statement.", e);
  }
};

exports.processStatement = onCall(async (data, context) => {
  logger.info("processStatement function called.");
  if (!data.file) {
    throw new HttpsError("invalid-argument",
        "The function must be called with a base64 encoded file string.");
  }

  try {
    const pdfBuffer = Buffer.from(data.file, "base64");
    const text = await extractTextFromPDF(pdfBuffer);
    const transactions = await extractTransactionsFromText(text);
    logger.info("Successfully processed statement and extracted transactions.");
    return transactions;
  } catch (error) {
    logger.error("Error processing statement:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "Error processing statement.", error);
  }
});
