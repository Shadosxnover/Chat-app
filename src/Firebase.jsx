import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyCFDQ5rnRgiu3VRO_leMYw2ysqMYsnWyV8",
    authDomain: "chat-app-16972.firebaseapp.com",
    projectId: "chat-app-16972",
    storageBucket: "chat-app-16972.firebasestorage.app",
    messagingSenderId: "814536752623",
    appId: "1:814536752623:web:f1087d77f563aed15f8a1a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const analytics = getAnalytics(app);

export { auth, firestore, analytics };
