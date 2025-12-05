import { db } from './firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Saves or updates a statement processing configuration for a user.
 *
 * @param {string} userId - The user's ID.
 * @param {string} configId - The ID of the configuration to save. If it exists, it will be updated.
 * @param {object} configData - The configuration data to save.
 * @returns {Promise<void>}
 */
export const saveStatementConfig = async (userId, configId, configData) => {
  if (!userId || !configId) {
    throw new Error('User ID and Config ID are required to save a configuration.');
  }
  const configRef = doc(db, 'users', userId, 'statementConfigs', configId);
  await setDoc(configRef, { 
    ...configData,
    updatedAt: serverTimestamp() 
  }, { merge: true });
};

/**
 * Fetches all statement processing configurations for a user.
 *
 * @param {string} userId - The user's ID.
 * @returns {Promise<Array<object>>} - An array of configuration objects, each with its ID.
 */
export const getStatementConfigs = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required to fetch configurations.');
  }
  const configsCollectionRef = collection(db, 'users', userId, 'statementConfigs');
  const snapshot = await getDocs(configsCollectionRef);
  
  if (snapshot.empty) {
    return [];
  }
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Deletes a statement processing configuration for a user.
 *
 * @param {string} userId - The user's ID.
 * @param {string} configId - The ID of the configuration to delete.
 * @returns {Promise<void>}
 */
export const deleteStatementConfig = async (userId, configId) => {
  if (!userId || !configId) {
    throw new Error('User ID and Config ID are required to delete a configuration.');
  }
  const configRef = doc(db, 'users', userId, 'statementConfigs', configId);
  await deleteDoc(configRef);
};
