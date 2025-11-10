import { db, auth } from './firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const getInvestmentsCollection = () => {
    if (!auth.currentUser) throw new Error("User not authenticated");
    const userId = auth.currentUser.uid;
    return collection(db, 'users', userId, 'investments');
};

const getOtherInvestmentsCollection = () => {
    if (!auth.currentUser) throw new Error("User not authenticated");
    const userId = auth.currentUser.uid;
    return collection(db, 'users', userId, 'other-investments');
};

export const getInvestments = async () => {
    const investmentsCol = getInvestmentsCollection();
    const snapshot = await getDocs(investmentsCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createInvestment = async (data) => {
    const investmentsCol = getInvestmentsCollection();
    const docRef = await addDoc(investmentsCol, data);
    return { id: docRef.id, ...data };
};

export const updateInvestment = (id, data) => {
    const investmentsCol = getInvestmentsCollection();
    const investmentDoc = doc(investmentsCol, id);
    return updateDoc(investmentDoc, data);
};

export const deleteInvestment = (id) => {
    const investmentsCol = getInvestmentsCollection();
    const investmentDoc = doc(investmentsCol, id);
    return deleteDoc(investmentDoc);
};

export const getOtherInvestments = async () => {
    const otherInvestmentsCol = getOtherInvestmentsCollection();
    const snapshot = await getDocs(otherInvestmentsCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createOtherInvestment = async (data) => {
    const otherInvestmentsCol = getOtherInvestmentsCollection();
    const docRef = await addDoc(otherInvestmentsCol, data);
    return { id: docRef.id, ...data };
};

export const deleteOtherInvestment = (id) => {
    const otherInvestmentsCol = getOtherInvestmentsCollection();
    const otherInvestmentDoc = doc(otherInvestmentsCol, id);
    return deleteDoc(otherInvestmentDoc);
};
