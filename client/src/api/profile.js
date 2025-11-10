import { db, auth } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const getProfileDoc = () => {
    if (!auth.currentUser) throw new Error("User not authenticated");
    const userId = auth.currentUser.uid;
    return doc(db, 'users', userId);
};

export const getProfile = async () => {
    const profileDoc = getProfileDoc();
    const docSnap = await getDoc(profileDoc);
    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        // If no profile exists, create a default one
        const defaultProfile = {
            theme: 'dark',
            filtered_categories: [],
        };
        await setDoc(profileDoc, defaultProfile);
        return defaultProfile;
    }
};

export const updateProfile = (profile) => {
    const profileDoc = getProfileDoc();
    return setDoc(profileDoc, profile, { merge: true });
};
