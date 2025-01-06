import { addDoc, collection, deleteDoc, doc as firestoreDoc, getDoc, getDocs, updateDoc,query, where } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import firestore from '../config-global';

// Collection name
const conferenceCollectionName = 'conferences';


const uploadFiles = async (files, folder = 'conference_assets') => {
  const storage = getStorage();
  const uploadPromises = files.map(async (file) => {
    const storageRef = ref(storage, `${folder}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
  });
  return Promise.all(uploadPromises);
};

// Create a new conference entry
export const createConference = async (conferenceData) => {
  try {       
    const completeConferenceData = {
      title: conferenceData.title,
      organizer: conferenceData.organizer || '',
      venue: conferenceData.venue || '',
      date: conferenceData.date || '',
      contactPerson: conferenceData.contactPerson || '',
      email: conferenceData.email || '',
      country: conferenceData.country || '',
      language: conferenceData.language || '',
      description: conferenceData.description || '',
    };

    // Handle any file upload (if applicable)
    if (conferenceData.coverImage) {
      const coverImageUrl = await uploadFiles(conferenceData.coverImage, 'conference_assets');
      completeConferenceData.coverImage = coverImageUrl;
    }

    const docRef = await addDoc(collection(firestore, conferenceCollectionName), completeConferenceData);
    console.log("Conference document written with ID: ", docRef.id);
    return { id: docRef.id, ...completeConferenceData };
  } catch (e) {
    console.error("Error adding conference document: ", e);
    throw new Error(e.message);
  }
};

// Update a conference entry
// export const updateConference = async (id, updatedData) => {
//   try {
//     const docRef = firestoreDoc(firestore, conferenceCollectionName, id);

//     // Handle any file upload (if applicable)
//     if (updatedData.coverImage) {
//       const coverImageUrl = await uploadFiles(updatedData.coverImage, 'conference_assets');
//       updatedData.coverImage = coverImageUrl;
//     }

//     // Ensure no invalid characters in field names and remove undefined values
//     const sanitizedData = {};
//     Object.keys(updatedData).forEach(key => {
//       const value = updatedData[key];

//       if (value !== undefined) {  // Filter out undefined values
//         // Replace invalid characters or handle accordingly
//         const sanitizedKey = key.replace(/[~*/[\]]/g, '_').replace(/\s+/g, '_');
//         sanitizedData[sanitizedKey] = value;
//       }
//     });

//     await updateDoc(docRef, sanitizedData);
//     console.log("Conference document updated with ID: ", id);
//     return { id, ...sanitizedData };
//   } catch (e) {
//     console.error("Error updating conference document: ", e);
//     throw new Error(e.message);
//   }
// };

// ---------------------------------------------  New Updated Function -------------------------------------------------------------------------------

export const updateConference = async (id, updatedData) => {
  try {
    const docRef = firestoreDoc(firestore, conferenceCollectionName, id);

    // Retrieve the existing document to get current coverImage if not provided in updatedData
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const existingData = docSnap.data();
      if (!updatedData.coverImage || updatedData.coverImage.length === 0) {
        // Preserve the current coverImage if no new image is uploaded
        updatedData.coverImage = existingData.coverImage || [];
      }
    } else {
      throw new Error("Document not found");
    }

    // Handle cover image upload if a new image is provided
    if (updatedData.coverImage && Array.isArray(updatedData.coverImage) && updatedData.coverImage.length > 0 && typeof updatedData.coverImage[0] === 'object') {
      // Assuming new files are objects (e.g., File instances), upload them
      const coverImageUrl = await uploadFiles(updatedData.coverImage, 'conference_assets');
      updatedData.coverImage = coverImageUrl;
    }

    // Ensure no invalid characters in field names and remove undefined values
    const sanitizedData = {};
    Object.keys(updatedData).forEach((key) => {
      const value = updatedData[key];
      if (value !== undefined) {
        const sanitizedKey = key.replace(/[~*/[\]]/g, '_').replace(/\s+/g, '_');
        sanitizedData[sanitizedKey] = value;
      }
    });

    await updateDoc(docRef, sanitizedData);
    console.log("Conference document updated with ID: ", id);
    return { id, ...sanitizedData };
  } catch (e) {
    console.error("Error updating conference document: ", e);
    throw new Error(e.message);
  }
};

// Delete a conference entry
export const deleteConference = async (id) => {
  try {
    const docRef = firestoreDoc(firestore, conferenceCollectionName, id);
    await deleteDoc(docRef);
    console.log("Conference document deleted with ID: ", id);
  } catch (e) {
    console.error("Error deleting conference document: ", e);
    throw e;
  }
};


export const getAllConferences = async () => {
  try {
    const querySnapshot = await getDocs(collection(firestore, conferenceCollectionName));
    const conferences = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        organizer: data.organizer || '',
        venue: data.venue || '',
        date: data.date || '',  // Ensure the date field is captured
        contactPerson: data.contactPerson || '',
        email: data.email || '',
        country: data.country || '',  // Ensure the country field is captured
        language: data.language || '',
        description: data.description || '',
        coverImage: data.coverImage || null
      };
    });
    return conferences;
  } catch (e) {
    console.error("Error getting conference documents: ", e);
    throw new Error(e.message);
  }
};

// Fetch a conference entry by ID
export const updateConferenceStatus = async (UserId, status) => {
  try {
    const docRef = firestoreDoc(firestore, conferenceCollectionName, UserId);
    await updateDoc(docRef, { UserStatus: status });
    console.log(`User status updated to ${status} for User ID: ${UserId}`);
  } catch (e) {
    console.error("Error updating User status: ", e);
    throw new Error(e.message);
  }
};
export const getConferenceById = async (id) => {
  try {
    const docRef = firestoreDoc(firestore, conferenceCollectionName, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error(`No such conference document with ID: ${id}`);
      throw new Error('No such document!');
    }

    // Extracting the necessary fields, including country and date
    const { title, organizer, venue, date, contactPerson, email, country, language, description, coverImage } = docSnap.data();

    return {
      id: docSnap.id,
      title: title || '',
      organizer: organizer || '',
      venue: venue || '',
      date: date || '',  // Ensure the date field is captured
      contactPerson: contactPerson || '',
      email: email || '',
      country: country || '',  // Ensure the country field is captured
      language: language || '',
      description: description || '',
      coverImage: coverImage || null
    };
  } catch (e) {
    console.error("Error getting conference document: ", e);
    throw new Error(e.message);
  }
};


export const getApprovedConferences = async () => {
  try {
    const collectionRef = collection(firestore, conferenceCollectionName);
    const querySnapshot = await getDocs(query(collectionRef, where("UserStatus", "==", "approved")));
    
    const approvedConferences = [];
    querySnapshot.forEach((doc) => {
      approvedConferences.push({ id: doc.id, ...doc.data() });
    });

    console.log("Approved conferences fetched successfully");
    return approvedConferences;
  } catch (e) {
    console.error("Error fetching approved conferences: ", e);
    throw new Error(e.message);
  }
};


