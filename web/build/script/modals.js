import { Modal } from "../_snowpack/pkg/bootstrap.js";
import { errorAlertModal, signinAlertModal, successAlertModal } from "./alerts.js";
import { COLLECTIONS, USERS } from "./constants.js";

const modalNewDom = document.getElementById("modalNew");
const modalImportDom = document.getElementById("modalImport");
const formNew = document.querySelector("[new-collection-form]");
const formImport = document.querySelector("[import-collection-form]");
const modalNew = Modal.getOrCreateInstance(modalNewDom);
const modalImport = Modal.getOrCreateInstance(modalImportDom);
const collectionName = formNew.querySelector("[new-collection-name]");
const collectionUrl = formImport.querySelector("[import-collection-url]");

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
  if (user) {
    let uid = user.uid;
    firebase
      .database()
      .ref(USERS + "/" + uid + "/" + COLLECTIONS)
      .push()
      .set(name, (error) => {
        if (error) {
          errorAlertModal.show();
          setTimeout(() => {
            errorAlertModal.hide();
          }, 4000);
        } else {
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
