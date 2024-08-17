// Import the functions you need from the SDKs you need
import {collection, addDoc, increment, updateDoc, doc, getDoc, setDoc} from 'firebase/firestore'
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { CourseProps } from '../popup/Popup';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // not supported

export const firestore = getFirestore(app);
export async function logCourseSearchEvent(course: CourseProps){
    // add course to seacrhes collection
    const docRef = await addDoc(collection(firestore, "searches"), {...course, timestamp: new Date()});
    // increment seacrh count for today
    const stringDate = (new Date()).toLocaleDateString('en-US').replaceAll("/", "-");
    const countRef = await doc(firestore, "count", stringDate);
    const countRefSnap = await getDoc(countRef);
    if (!countRefSnap.exists()){
        await setDoc(doc(firestore, "count", stringDate), {"count": 1});
    } else{
      await updateDoc(countRef, {"count": increment(1)});
    }
    console.log("Document written with ID: ", docRef);
}
