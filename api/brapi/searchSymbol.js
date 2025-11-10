const axios = require("axios");

const BASE_URL = "https://brapi.dev/api";

const makeRequest = async (endpoint, params) => {
  const apiKey = process.env.BRAPI_API_KEY; // Use process.env for Vercel
  if (apiKey) {
    params["token"] = apiKey;
  }

  const url = `${BASE_URL}/${endpoint}`;
  console.log(`Making request to Brapi API: ${url}`, {params}); // Replace logger.info
  try {
    const response = await axios.get(url, {params});
    return response.data;
  } catch (error) {
    console.error("Error making request to Brapi API:", error); // Replace logger.error
    throw new Error("Error making request to Brapi API", { cause: error });
  }
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

  const symbol = req.body.symbol;

  console.log("searchSymbol function called with data:", req.body);
  if (!process.env.BRAPI_API_KEY) { // Use process.env for Vercel
    console.error("BRAPI_API_KEY is not set.");
    return res.status(500).json({ error: "BRAPI_API_KEY is not configured." });
  }

  if (!symbol) {
    return res.status(400).json({
      error: "The function must be called with one argument 'symbol'.",
    });
  }

  const endpoint = "quote/list";
  const params = {
    search: symbol,
    limit: 10,
  };

  try {
    const results = await makeRequest(endpoint, params);
    console.log("searchSymbol function results:", results);
    res.status(200).json({ data: results.stocks || [] });
  } catch (error) {
    console.error("Error in searchSymbol Vercel function:", error);
    res.status(500).json({ error: error.message, details: error.cause?.message });
  }
};
