// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

// Auth imports (all in one line — including updateProfile & sendEmailVerification)
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail, 
    setPersistence, 
    browserLocalPersistence, 
    browserSessionPersistence,
    updateProfile,                    // ← Now properly imported
    sendEmailVerification             // ← Now properly imported
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

// Database imports
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDShMJM6q1RAQyuYThn6FckesjjJUcgZRE",
    authDomain: "oliviafan-e408d.firebaseapp.com",
    databaseURL: "https://oliviafan-e408d-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "oliviafan-e408d",
    storageBucket: "oliviafan-e408d.firebasestorage.app",
    messagingSenderId: "1080668920862",
    appId: "1:1080668920862:web:7899f9bba86b59fe36e20f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Export everything globally so script.js can use it
window.firebaseAuth = auth;
window.firebaseDatabase = database;

window.firebaseAuthFunctions = {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    updateProfile,                    // ← Now available
    sendEmailVerification             // ← Now available
};

window.firebaseDatabaseFunctions = { 
    ref, 
    set 
};

console.log("Firebase v12.6.0 (modular) loaded successfully!");