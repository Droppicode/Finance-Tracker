const axios = require("axios");
const { format, subDays, addDays, subMonths, addMonths } = require("date-fns");

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

module.exports = async (req, res) => {
  try {
    const result = await _makeRequest(433);
    const value = Array.isArray(result) && result.length > 0 ? result[0].valor : null;
    res.status(200).json({ data: value });
  } catch (error) {
    console.error("Error in getIpca Vercel function:", error);
    res.status(500).json({ error: error.message, details: error.cause?.message });
  }
};
