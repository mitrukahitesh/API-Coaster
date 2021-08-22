import { Modal } from "bootstrap";
import {
  ADMIN,
  COLLECTIONS,
  DEV,
  DEVELOPER,
  EMAIL,
  NAME,
  PRIVILEGE,
  REQUESTS,
  USERS,
} from "./constants";

const successAlertDom = document.getElementById("successAlertModal");
const errorAlertDom = document.getElementById("errorAlertModal");
const signinAlertDom = document.getElementById("signinAlertModal");
const successAlertModal = Modal.getOrCreateInstance(successAlertDom);
const errorAlertModal = Modal.getOrCreateInstance(errorAlertDom);
const signinAlertModal = Modal.getOrCreateInstance(signinAlertDom);

const modalNewDom = document.getElementById("modalNew");
const formNew = document.querySelector("[new-collection-form]");
const modalNew = Modal.getOrCreateInstance(modalNewDom);

const modalImportDom = document.getElementById("modalImport");
const formImport = document.querySelector("[import-collection-form]");
const modalImport = Modal.getOrCreateInstance(modalImportDom);

const collectionName = formNew.querySelector("[new-collection-name]");
const collectionUrl = formImport.querySelector("[import-collection-url]");

const modalAssureDom = document.getElementById("modalAssure");
const formAssure = document.querySelector("[assurance-form]");
const modalAssure = Modal.getOrCreateInstance(modalAssureDom);

const modalTeamDom = document.getElementById("modalTeam");
const modalTeam = Modal.getOrCreateInstance(modalTeamDom);

formNew.addEventListener("submit", (e) => {
  e.preventDefault();
  modalNew.hide();
  let name = collectionName.value;
  createNewCollection(name);
});

formImport.addEventListener("submit", (e) => {
  e.preventDefault();
  modalImport.hide();
  let url = collectionUrl.value;
  firebase
    .database()
    .ref(`${REQUESTS}/${url}/${firebase.auth().currentUser.uid}`)
    .on("value", (snapshot) => {
      if (!snapshot.exists()) {
        showError("Invalid request");
        return;
      }
      const val = snapshot.val();
      const obj = {};
      obj[NAME] = val[NAME];
      obj[PRIVILEGE] = val[ADMIN] ? ADMIN : DEVELOPER;
      firebase
        .database()
        .ref(
          `${USERS}/${firebase.auth().currentUser.uid}/${COLLECTIONS}/${url}`
        )
        .set(obj, (err) => {
          if (err) {
            showError("Some error occurred");
          } else {
            modalImport.hide();
          }
        });
    });
});

function createNewCollection(name) {
  let user = firebase.auth().currentUser;
  const obj = {
    NAME: name,
    PRIVILEGE: ADMIN,
  };
  if (user) {
    const uid = user.uid;
    const newKey = firebase
      .database()
      .ref(USERS + "/" + uid + "/" + COLLECTIONS)
      .push().key;
    firebase
      .database()
      .ref(USERS + "/" + uid + "/" + COLLECTIONS + "/" + newKey)
      .set(obj, (error) => {
        if (error) {
          showError("Error");
        } else {
          firebase
            .database()
            .ref(COLLECTIONS + "/" + newKey)
            .update({ NAME: name });
          showSuccess("Success");
        }
      });
  } else {
    signinAlertModal.show();
    setTimeout(() => {
      signinAlertModal.hide();
    }, 4000);
  }
}

export function doIfSure(task) {
  formAssure.querySelector("[yes-reset]").onclick = task;
  modalAssure.show();
}

export function showError(message) {
  errorAlertDom.querySelector("[error-message]").textContent = message;
  errorAlertModal.show();
  setTimeout(() => {
    errorAlertModal.hide();
  }, 4000);
}

export function showSuccess(message) {
  successAlertDom.querySelector("[success-message]").textContent = message;
  successAlertModal.show();
  setTimeout(() => {
    successAlertModal.hide();
  }, 4000);
}

const memberTemplate = document.querySelector("[team-member-template]");

export function showTeamManagement(collectionId, collectionName, admin) {
  const link = modalTeamDom.querySelector("[link]");
  const copy = modalTeamDom.querySelector("[copy-code]");
  copy.addEventListener("click", () => {
    navigator.clipboard.writeText(collectionId).then(() => {
      showSuccess("Copied!");
    });
  });
  const priv = modalTeamDom
    .querySelector("[new-member]")
    .querySelector("[member-privilege]");
  const email = modalTeamDom
    .querySelector("[new-member]")
    .querySelector("[member-email]");
  const add = modalTeamDom
    .querySelector("[new-member]")
    .querySelector("[member-add]");
  const members = modalTeamDom.querySelector("[list-of-members]");
  firebase
    .database()
    .ref(`${REQUESTS}/${collectionId}`)
    .on("value", (snapshot) => {
      members.innerHTML = "";
      if (snapshot.exists()) {
        for (let key of Object.keys(snapshot.val())) {
          const element = memberTemplate.content
            .cloneNode(true)
            .querySelector("[team-member]");
          const obj = snapshot.val()[key];
          element.querySelector("[priv]").textContent = obj[ADMIN]
            ? ADMIN
            : DEV;
          element.querySelector("[email]").textContent = obj[EMAIL];
          element.querySelector("[remove]").addEventListener("click", (e) => {
            if (!admin) {
              showError("Admin privilege required!");
              return;
            }
            doIfSure(() => {
              firebase
                .database()
                .ref(`${USERS}/${key}/${COLLECTIONS}/${collectionId}`)
                .remove()
                .then(() => {
                  firebase
                    .database()
                    .ref(`${REQUESTS}/${collectionId}/${key}`)
                    .remove();
                });
            });
          });
          members.append(element);
        }
      }
    });
  link.textContent = collectionId;
  add.addEventListener("click", (e) => {
    e.preventDefault();
    firebase
      .database()
      .ref(`${USERS}`)
      .orderByChild("email")
      .equalTo(email.value)
      .on("value", (snapshot) => {
        if (!snapshot.exists()) {
          showError("User does not exist");
          return;
        }
        const key = Object.keys(snapshot.val())[0];
        const obj = {};
        obj[EMAIL] = email.value;
        obj[ADMIN] = priv.value === ADMIN ? true : false;
        obj[NAME] = collectionName;
        firebase
          .database()
          .ref(`${REQUESTS}/${collectionId}/${key}`)
          .set(obj, (error) => {
            if (error) {
              showError("Error");
            }
          });
      });
  });
  modalTeam.show();
}
