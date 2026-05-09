const firebaseConfig = {
  apiKey: "AIzaSyA3TToQTNLjLUwXGNktHri1U--EgUwP1u0",
  authDomain: "asrlink-fiber.firebaseapp.com",
  projectId: "asrlink-fiber",
  storageBucket: "asrlink-fiber.firebasestorage.app",
  messagingSenderId: "412248138112",
  appId: "1:412248138112:web:7e8be6884922e183252165",
  measurementId: "G-PVSWC2WHN5"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
