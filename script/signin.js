const button = document.querySelector("[sign-in-button]");
const navBar = document.querySelector("[nav-bar]");
const dp = document.querySelector("[user-dp]");
const username = document.querySelector("[user-name]");
const signOutButton = document.querySelector("[sign-out-button]");

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
    })
    .catch((err) => {
      console.log(err);
    });
});

function checkAuthState() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      navBar.style.display = "block";
      button.style.display = "none";
      username.textContent = user.displayName;
      dp.setAttribute("src", user.photoURL);
    } else {
      navBar.style.display = "none";
      button.style.display = "block";
    }
  });
}

signOutButton.addEventListener("click", () => {
  firebase.auth().signOut();
  checkAuthState();
});

checkAuthState();
