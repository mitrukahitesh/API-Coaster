const button = document.querySelector("[sign-in-button]");

const provider = new firebase.auth.GoogleAuthProvider();

button.addEventListener("click", () => {
  firebase
    .auth()
    .signInWithPopup(provider)
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
});
