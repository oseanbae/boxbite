import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Firebase configuration
// Replace these values with your Firebase project config, or use Vite environment variables:
// import.meta.env.VITE_FIREBASE_API_KEY
// import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
// import.meta.env.VITE_FIREBASE_PROJECT_ID
// import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
// import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
// import.meta.env.VITE_FIREBASE_APP_ID
const firebaseConfig = {
  apiKey: "AIzaSyC9NRSL1ZAESt7JxfazCasPfJsob077u-A",
  authDomain: "boxbite-24480.firebaseapp.com",
  projectId: "boxbite-24480",
  storageBucket: "boxbite-24480.firebasestorage.app",
  messagingSenderId: "168103067468",
  appId: "1:168103067468:web:9e53c3bb48acdf3d4799e9"
};

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

export default app
