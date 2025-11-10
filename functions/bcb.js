const axios = require("axios");
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {format, subDays, addDays, subMonths, addMonths} = require("date-fns");

const BASE_URL = "https://api.bcb.gov.br/dados/serie";

const _makeRequest = async (seriesId, params = {}) => {
  let url = `${BASE_URL}/bcdata.sgs.${seriesId}/dados`;

  if (!params || (!params.dataInicial && !params.dataFinal)) {
    url += "/ultimos/1";
  }

  params["formato"] = "json";

  try {
    const response = await axios.get(url, {params});
    return response.data;
  } catch (error) {
    console.error("Error making request to BCB API:", error);
    throw new HttpsError("internal", "Error making request to BCB API", error);
  }
};

const getDailySeries = async (seriesId, startDateStr, endDateStr) => {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  const bufferedStartDate = subDays(start, 5);
  const bufferedEndDate = addDays(end, 5);

  const formattedStartDate = format(bufferedStartDate, "dd/MM/yyyy");
  const formattedEndDate = format(bufferedEndDate, "dd/MM/yyyy");

  const params = {
    "dataInicial": formattedStartDate,
    "dataFinal": formattedEndDate,
  };
  return await _makeRequest(seriesId, params);
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

exports.getIpca = onCall(async (data, context) => {
  const result = await _makeRequest(433);
  return Array.isArray(result) && result.length > 0 ? result[0].valor : null;
});

exports.getIgpm = onCall(async (data, context) => {
  const result = await _makeRequest(189);
  return Array.isArray(result) && result.length > 0 ? result[0].valor : null;
});

exports.getDailySeries = onCall(async (data, context) => {
  const {seriesId, startDate, endDate} = data;
  if (!seriesId || !startDate || !endDate) {
    throw new HttpsError("invalid-argument",
        "Missing required parameters: seriesId, startDate, endDate");
  }
  return await getDailySeries(seriesId, startDate, endDate);
});

exports.getMonthlySeries = onCall(async (data, context) => {
  const {seriesId, startDate, endDate} = data;
  if (!seriesId || !startDate || !endDate) {
    throw new HttpsError("invalid-argument",
        "Missing required parameters: seriesId, startDate, endDate");
  }
  return await getMonthlySeries(seriesId, startDate, endDate);
});
