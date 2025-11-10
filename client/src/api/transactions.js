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
