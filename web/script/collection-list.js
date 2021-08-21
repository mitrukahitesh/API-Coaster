import {
  APIS,
  COLLECTIONS,
  METHOD,
  NAME,
  URL,
  BODY,
  HEADERS,
  PARAMS,
  PRIVILEGE,
  ADMIN,
  USERS,
} from "./constants";
import setupEditor from "./editor";
import { doIfSure, showError, showTeamManagement } from "./modals";
import {
  setBody,
  setHeaders,
  setParams,
  setUrl,
  setApiDetails,
  setMethod,
  currApiId,
  currCollectionId,
  addRequest,
  resetData,
} from "./script";

const collectionList = document.querySelector("[collection-list]");
const collectionTemplate = document.querySelector("[collection-name-template]");
const requestTemplate = document.querySelector("[request-name-template]");

export const addCollectionsToList = (arr) => {
  collectionList.innerHTML = "";
  arr.forEach((element) => {
    collectionList.append(createNewCollection(element.key, element.value));
  });
};

// key is id
// value is object
function createNewCollection(key, value) {
  let hide = true;
  let admin = value[PRIVILEGE] === ADMIN;
  const root = collectionTemplate.content
    .cloneNode(true)
    .querySelector("[root-collection]");
  const element = root.querySelector("[collection-container]");
  const reqList = root.querySelector("[request-list]");
  element.querySelector("[collection-name]").textContent = value[NAME];
  element.addEventListener("mouseenter", () => {
    element.style.cursor = "pointer";
    element.querySelector("[menu-collection]").style.display = "inline-flex";
    hide = false;
  });
  element.addEventListener("mouseleave", () => {
    hide = true;
    setTimeout(() => {
      if (hide)
        element.querySelector("[menu-collection]").style.display = "none";
    }, 200);
  });
  element
    .querySelector("[collection-name-chevron]")
    .addEventListener("click", (e) => {
      const chevron = element
        .querySelector("[collection-name-chevron]")
        .querySelector("[collection-chevron]");
      if (chevron.classList.contains("fa-chevron-right")) {
        chevron.classList.remove("fa-chevron-right");
        chevron.classList.add("fa-chevron-down");
        reqList.style.display = "block";
      } else {
        chevron.classList.remove("fa-chevron-down");
        chevron.classList.add("fa-chevron-right");
        reqList.style.display = "none";
      }
    });
  element
    .querySelector("[menu-collection]")
    .querySelector("[team-collection]")
    .addEventListener("click", () => {
      showTeamManagement(key, value[NAME], admin);
    });
  element
    .querySelector("[add-request-collection]")
    .addEventListener("click", () => {
      if (!admin) {
        showError("Admin privilege required!");
        return;
      }
      addRequest(key);
    });
  element
    .querySelector("[delete-collection]")
    .addEventListener("click", (e) => {
      if (!admin) {
        showError("Admin privilege required!");
        return;
      }
      doIfSure(() => {
        firebase
          .database()
          .ref(
            `${USERS}/${firebase.auth().currentUser.uid}/${COLLECTIONS}/${key}`
          )
          .remove();
      });
    });
  getApis(key, value[NAME], reqList, admin);
  return root;
}

function getApis(colId, colName, reqList, admin) {
  firebase
    .database()
    .ref(`${COLLECTIONS}/${colId}/${APIS}`)
    .on("value", (snapshot) => {
      if (snapshot.exists()) {
        reqList.innerHTML = "";
        for (let key of Object.keys(snapshot.val())) {
          reqList.append(
            createNewRequest(colId, colName, key, snapshot.val()[key], admin)
          );
        }
      }
    });
}

function createNewRequest(colId, colName, apiId, obj, admin) {
  let hide = true;
  const element = requestTemplate.content
    .cloneNode(true)
    .querySelector("[request-container]");
  if (currApiId === apiId && currCollectionId === colId) {
    openApi(obj, { colName: colName, colId: colId, apiId: apiId });
  }
  element
    .querySelector("[request-name-method]")
    .addEventListener("click", (e) => {
      openApi(obj, { colName: colName, colId: colId, apiId: apiId }, admin);
    });
  element.querySelector("[request-method]").textContent = obj[METHOD];
  element.querySelector("[request-name]").textContent = obj[URL];
  element.addEventListener("mouseenter", () => {
    element.style.cursor = "pointer";
    element.querySelector("[menu-request]").style.display = "inline-flex";
    hide = false;
  });
  element.addEventListener("mouseleave", () => {
    hide = true;
    setTimeout(() => {
      if (hide) element.querySelector("[menu-request]").style.display = "none";
    }, 200);
  });
  element.querySelector("[delete-request]").addEventListener("click", (e) => {
    if (!admin) {
      showError("Admin privilege required!");
      return;
    }
    doIfSure(() => {
      firebase
        .database()
        .ref(`${COLLECTIONS}/${colId}/${APIS}/${apiId}`)
        .remove();
    });
  });
  return element;
}

function openApi(obj, details, admin) {
  resetData();
  setBody(obj[BODY]);
  setHeaders(obj[HEADERS]);
  setParams(obj[PARAMS]);
  setUrl(obj[URL]);
  setMethod(obj[METHOD]);
  if (admin) {
    setApiDetails(details);
  }
}
