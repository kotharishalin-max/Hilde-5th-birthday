import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyA7bCJ740dlOwfB7jzZ9RPZ49JO8-XzMcc",
  authDomain: "hilde-5th-birthday.firebaseapp.com",
  databaseURL: "https://hilde-5th-birthday-default-rtdb.firebaseio.com",
  projectId: "hilde-5th-birthday",
  storageBucket: "hilde-5th-birthday.firebasestorage.app",
  messagingSenderId: "37156501458",
  appId: "1:37156501458:web:bbbf39de05a681fbec3a0b"
}

const app = initializeApp(firebaseConfig)
export const database = getDatabase(app)
