import { addDoc, collection, deleteDoc, doc as firestoreDoc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import firestore from '../config-global';
// Collection name
const abstractsCollectionName = 'abstractsConference';
const uploadAbstractFile = async (file, folder = 'abstract_assets') => {
  const storage = getStorage();
  const storageRef = ref(storage, `${folder}/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
};
// Create a new abstract entry
export const createAbstract = async (abstractData) => {
  try {
    const completeAbstractData = {
      conferenceName: abstractData.conferenceName || '',
      title: abstractData.title || '',
      abstract: abstractData.abstract || '',
      linkDOI: abstractData.linkDOI || '',
      keyword: abstractData?.keyword || '',
      authors: abstractData.authors || [], // Include authors array
    };
    // Handle any file upload (if applicable)
    if (abstractData.assetFile) {
      const assetFileUrl = await uploadAbstractFile(abstractData.assetFile, 'abstract_assets');
      completeAbstractData.assetFile = assetFileUrl;
    }
    const docRef = await addDoc(collection(firestore, abstractsCollectionName), completeAbstractData);
    console.log("Abstract document written with ID: ", docRef.id);
    return { id: docRef.id, ...completeAbstractData };
  } catch (e) {
    console.error("Error adding abstract document: ", e);
    throw new Error(e.message);
  }
};
// Update an abstract entry
export const updateAbstract = async (id, updatedData) => {
  try {
    const docRef = firestoreDoc(firestore, abstractsCollectionName, id);
    // Handle any file upload (if applicable)
    if (updatedData.assetFile) {
      const assetFileUrl = await uploadAbstractFile(updatedData.assetFile, 'abstract_assets');
      updatedData.assetFile = assetFileUrl;
    }
    // Sanitize and filter updated data
    const sanitizedData = {};
    Object.keys(updatedData).forEach(key => {
      const value = updatedData[key];
      if (value !== undefined) {
        const sanitizedKey = key.replace(/[~*/[\]]/g, '_').replace(/\s+/g, '_');
        sanitizedData[sanitizedKey] = value;
      }
    });
    await updateDoc(docRef, sanitizedData);
    console.log("Abstract document updated with ID: ", id);
    return { id, ...sanitizedData };
  } catch (e) {
    console.error("Error updating abstract document: ", e);
    throw new Error(e.message);
  }
};
// Delete an abstract entry
export const deleteAbstract = async (id) => {
  try {
    const docRef = firestoreDoc(firestore, abstractsCollectionName, id);
    await deleteDoc(docRef);
    console.log("Abstract document deleted with ID: ", id);
  } catch (e) {
    console.error("Error deleting abstract document: ", e);
    throw e;
  }
};
// Fetch all abstract entries
export const getAllAbstracts = async () => {
  try {
    const querySnapshot = await getDocs(collection(firestore, abstractsCollectionName));
    const abstracts = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        conferenceName: data.conferenceName || '',
        title: data.title || '',
        abstract: data.abstract || '',
        linkDOI: data.linkDOI || '',
        keyword: data?.keyword || '',
        authors: data?.authors || [], // Include authors array
      };
    });
    return abstracts;
  } catch (e) {
    console.error("Error getting abstract documents: ", e);
    throw new Error(e.message);
  }
};
// Fetch an abstract entry by ID
export const getAbstractById = async (id) => {
  try {
    const docRef = firestoreDoc(firestore, abstractsCollectionName, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.error(`No such abstract document with ID: ${id}`);
      throw new Error('No such document!');
    }
    const {
      conferenceName, keyword, issn, publisher, title, affiliation, authors, abstract, linkDOI, articleType,
    } = docSnap.data();
    return {
      id: docSnap.id,
      conferenceName: conferenceName || '',
      title: title || '',
      abstract: abstract || '',
      linkDOI: linkDOI || '',
      keyword: keyword || '',
      authors: authors || [], // Include authors array
    };
  } catch (e) {
    console.error("Error getting abstract document: ", e);
    throw new Error(e.message);
  }
};
