import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { initializeApp } from "firebase/app";
import { getEnv } from "./getEnv";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: getEnv('VITE_FIREBASE_API'),
    authDomain: "crime-blog-25970.firebaseapp.com",
    projectId: "crime-blog-25970",
    storageBucket: "crime-blog-25970.firebasestorage.app",
    messagingSenderId: "1077042998311",
    appId: "1:1077042998311:web:0d85e44027acd32adeb202"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export { auth, provider }