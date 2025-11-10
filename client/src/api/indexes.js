import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

const getDailySeriesFunction = httpsCallable(functions, 'bcb-getDailySeries');
const getMonthlySeriesFunction = httpsCallable(functions, 'bcb-getMonthlySeries');

export const getRates = async (seriesId, startDate, endDate, periodicity) => {
  try {
    const params = { seriesId, startDate, endDate };
    let result;
    if (periodicity === 'daily') {
      result = await getDailySeriesFunction(params);
    } else { // monthly
      result = await getMonthlySeriesFunction(params);
    }
    return result.data;
  } catch (error) {
    console.error(`Error fetching rates for series ${seriesId}:`, error);
    throw error;
  }
};
