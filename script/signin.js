const button = document.querySelector("[sign-in-button]");
const navBar = document.querySelector("[nav-bar]");
const dp = document.querySelector("[user-dp]");
const username = document.querySelector("[user-name]");
const signOutButton = document.querySelector("[sign-out-button]");
const navBarRow = document.querySelector("[nav-bar-row]");

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
      button.style.display = "none";
      username.textContent = user.displayName;
      dp.style.display = "block";
      dp.classList.add("d-inline-block");
      signOutButton.style.display = "block";
      dp.setAttribute("src", user.photoURL);
      navBarRow.classList.remove("text-center");
    } else {
      button.style.display = "block";
      username.textContent = "API Coaster";
      dp.style.display = "none";
      dp.classList.remove("d-inline-block");
      signOutButton.style.display = "none";
      navBarRow.classList.add("text-center");
    }
  });
}

signOutButton.addEventListener("click", () => {
  firebase.auth().signOut();
  checkAuthState();
});

checkAuthState();
