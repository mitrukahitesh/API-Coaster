import { errorAlertModal } from "./alerts.js";
import { addCollectionToList } from "./collection-list.js";
import { COLLECTIONS, USERS } from "./constants.js";

const button = document.querySelector("[sign-in-button]");
const navBar = document.querySelector("[nav-bar]");
const dp = document.querySelector("[user-dp]");
const username = document.querySelector("[user-name]");
const signOutButton = document.querySelector("[sign-out-button]");
const navBarRow = document.querySelector("[nav-bar-row]");
const collectionList = document.querySelector("[collection-list]");

const provider = new firebase.auth.GoogleAuthProvider();

button.addEventListener("click", () => {
  firebase
    .auth()
    .signInWithPopup(provider)
    .then((res) => {
      console.log(res);
      navBar.style.display = "block";
      username.textContent = res.user.displayName;
      dp.setAttribute("src", res.user.photoURL);
      saveUserData(res.user);
    })
    .catch((err) => {
      console.log(err);
    });
});

function checkAuthState() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      button.style.display = "none";
      username.textContent = user.displayName;
      dp.style.display = "block";
      dp.classList.add("d-inline-block");
      signOutButton.style.display = "block";
      dp.setAttribute("src", user.photoURL);
      navBarRow.classList.remove("text-center");
      collectionList.style.display = "block";
      getCollections(user.uid);
    } else {
      button.style.display = "block";
      username.textContent = "API Coaster";
      dp.style.display = "none";
      dp.classList.remove("d-inline-block");
      signOutButton.style.display = "none";
      navBarRow.classList.add("text-center");
      collectionList.style.display = "none";
    }
  });
}

signOutButton.addEventListener("click", () => {
  firebase.auth().signOut();
  checkAuthState();
});

function saveUserData(user) {
  const obj = {
    email: user.email,
    name: user.displayName,
    photoURL: user.photoURL,
  };
  firebase
    .database()
    .ref(USERS + "/" + user.uid)
    .update(obj, (error) => {
      if (error) {
        firebase.auth().signOut();
        errorAlertModal.show();
      }
    });
}

checkAuthState();

function getCollections(uid) {
  firebase
    .database()
    .ref(`${USERS}/${uid}/${COLLECTIONS}`)
    .on("value", (snapsot) => {
      if (snapsot.exists()) {
        console.log(snapsot.val());
        for (let key of Object.keys(snapsot.val())) {
          addCollectionToList(key, snapsot.val()[key]);
        }
      }
    });
}
