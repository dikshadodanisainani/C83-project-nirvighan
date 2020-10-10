import firebase from 'firebase';
require('@firebase/firestore')

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyC--fsO2nwu5UBCkI5fNLchUMsgwKnBDyo",
  authDomain: "booksanta-925a8.firebaseapp.com",
  databaseURL: "https://booksanta-925a8.firebaseio.com",
  projectId: "booksanta-925a8",
  storageBucket: "booksanta-925a8.appspot.com",
  messagingSenderId: "403039503614",
  appId: "1:403039503614:web:e0a8e2190655f5a923d1af"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
export default firebase.firestore();
