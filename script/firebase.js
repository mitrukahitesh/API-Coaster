import secrets from "../secrets";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
let secrets = require();
var firebaseConfig = {
  apiKey: secrets.apiKey,
  authDomain: secrets.authDomain,
  projectId: secrets.projectId,
  storageBucket: secrets.storageBucket,
  messagingSenderId: secrets.messagingSenderId,
  appId: secrets.appId,
  measurementId: secrets.measurementId,
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
