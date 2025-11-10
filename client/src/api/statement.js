import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

const processStatementFunction = httpsCallable(functions, 'transactions-processStatement');

export const processStatement = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64File = reader.result.split(',')[1];
        const result = await processStatementFunction({ file: base64File });
        resolve(result.data);
      } catch (error) {
        console.error("Error processing statement:", error);
        reject(error);
      }
    };
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      reject(error);
    };
  });
};
