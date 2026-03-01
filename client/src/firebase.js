import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Firebase configuration provided by user
const firebaseConfig = {
    apiKey: "AIzaSyAYqz5C6YBQijGDVmJSPuEbOAQf2CguWhg",
    authDomain: "building-project-7df2b.firebaseapp.com",
    databaseURL: "https://building-project-7df2b-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "building-project-7df2b",
    storageBucket: "building-project-7df2b.firebasestorage.app",
    messagingSenderId: "1024987284573",
    appId: "1:1024987284573:web:3cd3d889c60f66ea3cb9b4",
    measurementId: "G-YJGGVNNHPF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup };
