import { db, auth } from './firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const getTransactionsCollection = () => {
    if (!auth.currentUser) throw new Error("User not authenticated");
    const userId = auth.currentUser.uid;
    return collection(db, 'users', userId, 'transactions');
};

export const getTransactions = async () => {
    const transactionsCol = getTransactionsCollection();
    const snapshot = await getDocs(transactionsCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createTransaction = async (transaction) => {
    const transactionsCol = getTransactionsCollection();
    const docRef = await addDoc(transactionsCol, transaction);
    const newTransaction = { id: docRef.id, ...transaction };
    // In Firestore, relational data is handled differently.
    // Instead of returning the full category object, we might just use the ID.
    // For now, returning the transaction as is, assuming the calling context will handle it.
    return newTransaction;
};

export const updateTransaction = (id, transaction) => {
    const transactionsCol = getTransactionsCollection();
    const transactionDoc = doc(transactionsCol, id);
    return updateDoc(transactionDoc, transaction);
};

export const deleteTransaction = (id) => {
    const transactionsCol = getTransactionsCollection();
    const transactionDoc = doc(transactionsCol, id);
    return deleteDoc(transactionDoc);
};

export const classifyTransactions = async (descriptions) => {
    try {
        const response = await fetch('https://classify-transactions.vercel.app/api/classify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ descriptions }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to classify transactions');
        }

        const result = await response.json();
        return result.data.results;
    } catch (error) {
        console.error('Error classifying transactions:', error);
        // Returns an empty array to avoid breaking the flow
        return [];
    }
};