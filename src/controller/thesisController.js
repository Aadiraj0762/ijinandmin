import { addDoc, collection, deleteDoc, doc as firestoreDoc, getDoc, getDocs, query, updateDoc, where,orderBy, limit, } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import firestore from '../config-global';

// Collection name
const thesisCollectionName = 'thesis';

const uploadFiles = async (files, folder = 'thesis_files') => {
  const storage = getStorage();
  const uploadPromises = files.map(async (file) => {
    const storageRef = ref(storage, `${folder}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
  });
  return Promise.all(uploadPromises);
};

// Generate Thesis ID with 10 digits following "IJI"
const generateThesisId = async () => {
  const thesesSnapshot = await getDocs(collection(firestore, thesisCollectionName));
  const thesisCount = thesesSnapshot.size + 1;
  return `IJI${thesisCount.toString().padStart(7, '0')}`; // Ensure total length is 10 digits after "IJI"
};

// Generate Volume and Year based on the latest thesis entry
const generateVolume = async () => {
  const currentYear = new Date().getFullYear();
  const thesisQuery = query(collection(firestore, thesisCollectionName), orderBy('year', 'desc'), limit(1));
  const thesisSnapshot = await getDocs(thesisQuery);
  
  if (!thesisSnapshot.empty) {
    const latestThesis = thesisSnapshot.docs[0].data();
    if (latestThesis.year === currentYear) {
      return { volume: latestThesis.volume, year: currentYear }; // Keep the same volume if the year matches
    }
    return { volume: latestThesis.volume + 1, year: currentYear }; // Increment volume if the year is new
  }

  // If no entries exist, start with Volume 1
  return { volume: 1, year: currentYear };
};

// Create a new thesis entry
export const createThesis = async (thesisData) => {
  try {
    const thesisId = await generateThesisId();
    const { volume, year } = await generateVolume(); // Generate both volume and year
    const completeThesisData = {
      thesisId,
      title: thesisData.title,
      collegeUniversity: thesisData.collegeUniversity || '',
      author: thesisData.author || '',
      volume, // Store the volume
      year,   // Store the year
    };

    // Handle file uploads (Photo ID and Full PDF)
    if (thesisData.photoId && thesisData.photoId.length > 0) {
      const photoIdUrls = await uploadFiles(thesisData.photoId, 'thesis_photos');
      completeThesisData.photoId = photoIdUrls;
    }

    if (thesisData.fullPdf && thesisData.fullPdf.length > 0) {
      const fullPdfUrls = await uploadFiles(thesisData.fullPdf, 'thesis_pdfs');
      completeThesisData.fullPdf = fullPdfUrls;
    }

    const docRef = await addDoc(collection(firestore, thesisCollectionName), completeThesisData);
    console.log("Thesis document written with ID: ", docRef.id);
    return { id: docRef.id, ...completeThesisData };
  } catch (e) {
    console.error("Error adding thesis: ", e);
    throw new Error(e.message);
  }
};

// Update an existing thesis
export const updateThesis = async (id, updatedData) => {
  try {
    const docRef = firestoreDoc(firestore, thesisCollectionName, id);

    // Retrieve the existing document to preserve current photoId and fullPdf if not provided
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const existingData = docSnap.data();

      // Handle photoId: Check if it's an array of files or URLs
      const photoIdFiles = Array.isArray(updatedData.photoId) ? updatedData.photoId : [updatedData.photoId];
      if (photoIdFiles.every(file => typeof file === 'string')) {
        // If the array contains URLs (strings), we don't need to upload them
        updatedData.photoId = photoIdFiles;
      } else {
        // Upload new photo files and map URLs
        const photoIdUrls = await Promise.all(
          photoIdFiles.map(async (file) => uploadFiles(file, 'thesis_photos'))
        );
        updatedData.photoId = photoIdUrls;
      }

      // Handle fullPdf: Check if it's an array of files or URLs
      const fullPdfFiles = Array.isArray(updatedData.fullPdf) ? updatedData.fullPdf : [updatedData.fullPdf];
      if (fullPdfFiles.every(file => typeof file === 'string')) {
        // If the array contains URLs (strings), we don't need to upload them
        updatedData.fullPdf = fullPdfFiles;
      } else {
        // Upload new PDF files and map URLs
        const fullPdfUrls = await Promise.all(
          fullPdfFiles.map(async (file) => uploadFiles(file, 'thesis_pdfs'))
        );
        updatedData.fullPdf = fullPdfUrls;
      }
    } else {
      throw new Error("Document not found");
    }

    // Update the document in Firestore
    await updateDoc(docRef, updatedData);
    console.log("Thesis updated with ID: ", id);
    return { id, ...updatedData };
  } catch (e) {
    console.error("Error updating thesis: ", e);
    throw new Error(e.message);
  }
};


// Delete a thesis entry
export const deleteThesis = async (id) => {
  try {
    const docRef = firestoreDoc(firestore, thesisCollectionName, id);
    await deleteDoc(docRef);
    console.log("Thesis deleted with ID: ", id);
  } catch (e) {
    console.error("Error deleting thesis: ", e);
    throw e;
  }
};

// Fetch all thesis entries

export const getAllTheses = async () => {
  try {
    const querySnapshot = await getDocs(collection(firestore, 'thesis')); // Adjust 'thesis' to your collection name
    const theses = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Group by volume
    const groupedByVolume = theses.reduce((acc, thesis) => {
      const { volume } = thesis;
      if (!acc[volume]) {
        acc[volume] = [];
      }
      acc[volume].push(thesis);
      return acc;
    }, {});

    // Convert grouped object to array for rendering
    const groupedArray = Object.keys(groupedByVolume).map(volume => ({
      volume,
      theses: groupedByVolume[volume]
    }));

    return groupedArray;
  } catch (e) {
    console.error("Error getting theses: ", e);
    throw new Error(e.message);
  }
};

// Fetch a thesis entry by ID
export const getThesisById = async (id) => {
  try {
    const docRef = firestoreDoc(firestore, thesisCollectionName, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error(`No such thesis with ID: ${id}`);
      throw new Error('No such document!');
    }

    return { id: docSnap.id, ...docSnap.data() };
  } catch (e) {
    console.error("Error getting thesis: ", e);
    throw new Error(e.message);
  }
};
// Fetch and group thesis entries by volume
// Fetch and group thesis entries by volume
export const getThesesByVolume = async (volume) => {
  try {
    // Validate volume
    if (typeof volume === 'undefined' || volume === null) {
      throw new Error('Volume is undefined or null');
    }

    // Log volume for debugging
    console.log('Fetching theses for volume:', volume);

    // Reference to the collection
    const thesisCollectionRef = collection(firestore, 'thesis'); // replace 'thesis' with your collection name if different

    // Query to filter theses by volume
    const q = query(thesisCollectionRef, where('volume', '==', volume));

    // Execute the query
    const querySnapshot = await getDocs(q);

    // Check if any documents were found
    if (querySnapshot.empty) {
      console.error(`No theses found for volume: ${volume}`);
      throw new Error('No documents found!');
    }

    // Grouping results by volume
    const theses = [];
    querySnapshot.forEach(doc => {
      theses.push({ id: doc.id, ...doc.data() });
    });

    return {
      volume,
      theses,
    };

  } catch (e) {
    console.error("Error getting theses: ", e);
    throw new Error(e.message);
  }
};
// Fetch a conference entry by ID
export const updateConferenceStatus = async (UserId, status) => {
  try {
    const docRef = firestoreDoc(firestore, thesisCollectionName, UserId);
    await updateDoc(docRef, { UserStatus: status });
    console.log(`User status updated to ${status} for User ID: ${UserId}`);
  } catch (e) {
    console.error("Error updating User status: ", e);
    throw new Error(e.message);
  }
};