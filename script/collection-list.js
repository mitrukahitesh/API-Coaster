import {
  APIS,
  COLLECTIONS,
  METHOD,
  NAME,
  URL,
  BODY,
  HEADERS,
  PARAMS,
} from "./constants";
import setupEditor from "./editor";
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

function createNewCollection(key, value) {
  const root = collectionTemplate.content
    .cloneNode(true)
    .querySelector("[root-collection]");
  const element = root.querySelector("[collection-container]");
  const reqList = root.querySelector("[request-list]");
  element.querySelector("[collection-name]").textContent = value[NAME];
  element.addEventListener("mouseenter", () => {
    element.style.cursor = "pointer";
    element.querySelector("[menu-collection]").style.display = "inline-flex";
  });
  element.addEventListener("mouseleave", () => {
    element.querySelector("[menu-collection]").style.display = "none";
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
    .querySelector("[add-request-collection]")
    .addEventListener("click", () => {
      addRequest(key);
    });
  element
    .querySelector("[delete-collection]")
    .addEventListener("click", (e) => {
      e.target.closest("[root-collection]").remove();
    });
  getApis(key, value[NAME], reqList);
  return root;
}

function getApis(colId, colName, reqList) {
  firebase
    .database()
    .ref(`${COLLECTIONS}/${colId}/${APIS}`)
    .on("value", (snapshot) => {
      if (snapshot.exists()) {
        reqList.innerHTML = "";
        for (let key of Object.keys(snapshot.val())) {
          reqList.append(
            createNewRequest(colId, colName, key, snapshot.val()[key])
          );
        }
      }
    });
}

function createNewRequest(colId, colName, apiId, obj) {
  const element = requestTemplate.content
    .cloneNode(true)
    .querySelector("[request-container]");
  if (currApiId === apiId && currCollectionId === colId) {
    openApi(obj, { colName: colName, colId: colId, apiId: apiId });
  }
  element
    .querySelector("[request-name-method]")
    .addEventListener("click", (e) => {
      openApi(obj, { colName: colName, colId: colId, apiId: apiId });
    });
  element.querySelector("[request-method]").textContent = obj[METHOD];
  element.querySelector("[request-name]").textContent = obj[URL];
  element.addEventListener("mouseenter", () => {
    element.style.cursor = "pointer";
    element.querySelector("[menu-request]").style.display = "inline-flex";
  });
  element.addEventListener("mouseleave", () => {
    element.querySelector("[menu-request]").style.display = "none";
  });
  element.querySelector("[delete-request]").addEventListener("click", (e) => {
    e.target.closest("[request-container]").remove();
  });
  return element;
}

function openApi(obj, details) {
  setBody(obj[BODY]);
  setHeaders(obj[HEADERS]);
  setParams(obj[PARAMS]);
  setUrl(obj[URL]);
  setMethod(obj[METHOD]);
  setApiDetails(details);
}
