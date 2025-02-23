import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage' 

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyB0VprwFOdp2GRib75LhGEAUs6hqPO6LXk',
  authDomain: 'mindcare-4e1aa.firebaseapp.com',
  projectId: 'mindcare-4e1aa',
  storageBucket: 'mindcare-4e1aa.appspot.com',
  messagingSenderId: '421526877442',
  appId: '1:421526877442:web:fbe90dbea6d44067d9be1b',
  measurementId: 'G-LS18FYWPCY'
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app) 

export { auth, db, storage } // Export storage, db and auth
