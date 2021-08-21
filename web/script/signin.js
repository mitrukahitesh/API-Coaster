import { showError } from "./modals";
import { addCollectionsToList } from "./collection-list";
import { COLLECTIONS, USERS } from "./constants";
import { resetData } from "./script";

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
      collectionList.innerHTML = "";
      collectionList.style.display = "none";
    }
  });
}

signOutButton.addEventListener("click", () => {
  firebase.auth().signOut();
  resetData();
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
        showError("Error");
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
        let arr = [];
        for (let key of Object.keys(snapsot.val())) {
          arr = [...arr, { key: key, value: snapsot.val()[key] }];
        }
        addCollectionsToList(arr);
      }
    });
}
