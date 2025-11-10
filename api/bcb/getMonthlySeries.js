const axios = require("axios");
const { format, subMonths, addMonths } = require("date-fns");

const BASE_URL = "https://api.bcb.gov.br/dados/serie";

const _makeRequest = async (seriesId, params = {}) => {
  let url = `${BASE_URL}/bcdata.sgs.${seriesId}/dados`;

  if (!params || (!params.dataInicial && !params.dataFinal)) {
    url += "/ultimos/1";
  }

  params["formato"] = "json";

  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error making request to BCB API:", error);
    throw new Error("Error making request to BCB API", { cause: error });
  }
};

const getMonthlySeries = async (seriesId, startDateStr, endDateStr) => {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  const bufferedStartDate = subMonths(start, 2);
  const bufferedEndDate = addMonths(end, 2);

  const formattedStartDate = format(bufferedStartDate, "dd/MM/yyyy");
  const formattedEndDate = format(bufferedEndDate, "dd/MM/yyyy");

  const params = {
    "dataInicial": formattedStartDate,
    "dataFinal": formattedEndDate,
  };
  return await _makeRequest(seriesId, params);
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

  const { seriesId, startDate, endDate } = req.body;

  if (!seriesId || !startDate || !endDate) {
    return res.status(400).json({
      error: "Missing required parameters: seriesId, startDate, endDate",
    });
  }

  try {
    const result = await getMonthlySeries(seriesId, startDate, endDate);
    res.status(200).json({ data: result });
  } catch (error) {
    console.error("Error in getMonthlySeries Vercel function:", error);
    res.status(500).json({ error: error.message, details: error.cause?.message });
  }
};
