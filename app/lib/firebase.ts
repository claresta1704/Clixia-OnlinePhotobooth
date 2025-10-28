// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvibnjzrk2DQwNY3OaM7YN9RqONRLQbVI",
  authDomain: "clixia-onlinephotobooth.firebaseapp.com",
  projectId: "clixia-onlinephotobooth",
  storageBucket: "clixia-onlinephotobooth.appspot.com",
  messagingSenderId: "853368787443",
  appId: "1:853368787443:web:9bb58f35e93de091ff8286"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);