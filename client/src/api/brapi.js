import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

const searchSymbolFunction = httpsCallable(functions, 'brapi-searchSymbol');
const getQuoteFunction = httpsCallable(functions, 'brapi-getQuote');

export const searchSymbol = async (symbol) => {
    try {
        const result = await searchSymbolFunction({ symbol });
        return result.data;
    } catch (error) {
        console.error("Error calling searchSymbol function:", error);
        throw error;
    }
};

export const getQuote = async (symbol, range, interval) => {
    try {
        const result = await getQuoteFunction({ symbol, range, interval });
        return result.data;
    } catch (error) {
        console.error("Error calling getQuote function:", error);
        throw error;
    }
};
