import { Modal } from "bootstrap";
import { ADMIN, COLLECTIONS, USERS } from "./constants";

const successAlertDom = document.getElementById("successAlertModal");
const errorAlertDom = document.getElementById("errorAlertModal");
const signinAlertDom = document.getElementById("signinAlertModal");
export const successAlertModal = Modal.getOrCreateInstance(successAlertDom);
export const errorAlertModal = Modal.getOrCreateInstance(errorAlertDom);
export const signinAlertModal = Modal.getOrCreateInstance(signinAlertDom);

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
          errorAlertModal.show();
          setTimeout(() => {
            errorAlertModal.hide();
          }, 4000);
        } else {
          firebase
            .database()
            .ref(COLLECTIONS + "/" + newKey)
            .update({ NAME: name });
          successAlertModal.show();
          setTimeout(() => {
            successAlertModal.hide();
          }, 4000);
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
