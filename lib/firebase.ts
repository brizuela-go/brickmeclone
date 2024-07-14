// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2ACd4s0nRJoTMPcMlVcRoGDc_wpifnX4",
  authDomain: "legos-ef1cc.firebaseapp.com",
  projectId: "legos-ef1cc",
  storageBucket: "legos-ef1cc.appspot.com",
  messagingSenderId: "911039121345",
  appId: "1:911039121345:web:df166eba25fdfc48b65140",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const storage = getStorage(app);

export { storage };
