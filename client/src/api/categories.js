import { db, auth } from './firebase';
import { collection, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore';

const getCategoriesCollection = () => {
    if (!auth.currentUser) throw new Error("User not authenticated");
    const userId = auth.currentUser.uid;
    return collection(db, 'users', userId, 'categories');
};

export const getCategories = async () => {
    const categoriesCol = getCategoriesCollection();
    const snapshot = await getDocs(categoriesCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createCategory = async (category) => {
    const categoriesCol = getCategoriesCollection();
    const docRef = await addDoc(categoriesCol, category);
    return { id: docRef.id, ...category };
};

export const deleteCategory = (id) => {
    const categoriesCol = getCategoriesCollection();
    const categoryDoc = doc(categoriesCol, id);
    return deleteDoc(categoryDoc);
};
