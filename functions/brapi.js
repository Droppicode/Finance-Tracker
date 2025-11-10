const axios = require("axios");
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const {defineString} = require("firebase-functions/params");

const brapiApiKey = defineString("BRAPI_API_KEY");
const BASE_URL = "https://brapi.dev/api";

const makeRequest = async (endpoint, params) => {
  const apiKey = brapiApiKey.value();
  if (apiKey) {
    params["token"] = apiKey;
  }

  const url = `${BASE_URL}/${endpoint}`;
  logger.info(`Making request to Brapi API: ${url}`, {params});
  try {
    const response = await axios.get(url, {params});
    return response.data;
  } catch (error) {
    logger.error("Error making request to Brapi API:", error);
    throw new HttpsError(
        "internal",
        "Error making request to Brapi API",
        error,
    );
  }
};

const searchSymbol = onCall(async (data) => {
  logger.info("searchSymbol function called with data:", data);
  if (!brapiApiKey.value()) {
    logger.error("BRAPI_API_KEY is not set.");
    throw new HttpsError("internal", "BRAPI_API_KEY is not configured.");
  }

  const symbol = data.symbol;
  if (!symbol) {
    throw new HttpsError(
        "invalid-argument",
        "The function must be called with one argument 'symbol'.",
    );
  }

  const endpoint = "quote/list";
  const params = {
    search: symbol,
    limit: 10,
  };

  const results = await makeRequest(endpoint, params);
  logger.info("searchSymbol function results:", results);
  return results.stocks || [];
});

const getQuote = onCall(async (data) => {
  logger.info("getQuote function called with data:", data);
  if (!brapiApiKey.value()) {
    logger.error("BRAPI_API_KEY is not set.");
    throw new HttpsError("internal", "BRAPI_API_KEY is not configured.");
  }

  const {symbol, range = "1mo", interval = "1d"} = data;

  if (!symbol) {
    throw new HttpsError(
        "invalid-argument",
        "The function must be called with 'symbol'.",
    );
  }

  const endpoint = `quote/${symbol.replace(".SA", "")}`;
  const params = {
    range,
    interval,
  };

  const results = await makeRequest(endpoint, params);
  logger.info("getQuote function results:", results);
  return results.results?.[0] || {};
});

module.exports = {
  searchSymbol,
  getQuote,
};
