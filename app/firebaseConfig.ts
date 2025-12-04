import { getApps, initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDFyfHQwnSTJPn_5p6JUCXbaZ3cO98dy_c",
    authDomain: "reactnative-6f538.firebaseapp.com",
    databaseURL: "https://reactnative-6f538-default-rtdb.firebaseio.com",
    projectId: "reactnative-6f538",
    storageBucket: "reactnative-6f538.firebasestorage.app",
    messagingSenderId: "644858530635",
    appId: "1:644858530635:web:aea1ebb42975c2386d36ce"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

const db = getDatabase(app);

export { db, firebaseConfig };
