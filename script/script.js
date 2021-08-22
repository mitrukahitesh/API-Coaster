import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import prettyBytes from "pretty-bytes";
import setupEditor from "./editor";
import { doIfSure, showError, showSuccess } from "./modals";
import {
  APIS,
  BODY,
  COLLECTIONS,
  HEADERS,
  METHOD,
  PARAMS,
  URL,
} from "./constants";

export let currCollectionId = "";
export let currApiId = "";
const form = document.querySelector("[data-form]");
const queryParamsContainer = document.querySelector("[data-query-params]");
const requestHeaderContainer = document.querySelector("[data-request-headers]");
const keyValueTemplate = document.querySelector("[data-key-value-template]");
const responseHeadersContainer = document.querySelector(
  "[data-response-headers]"
);
const loadingSpan = document.querySelector("[request-loading]");
const openedApi = document.querySelector("[opened-api]");
const openedApiCollection = document.querySelector("[opened-api-collection]");
const openedApiUrl = document.querySelector("[opened-api-url]");
const saveOpenedApi = document.querySelector("[save-opened-api]");
const reset = document.querySelector("[reset-data]");

function createKeyValuePair(key = "", value = "") {
  const element = keyValueTemplate.content.cloneNode(true);
  element.querySelector("[data-key]").value = key;
  element.querySelector("[data-value]").value = value;
  element.querySelector("[data-remove-btn]").addEventListener("click", (e) => {
    e.target.closest("[data-key-value-pair]").remove();
  });
  return element;
}

document
  .querySelector("[data-add-query-param-btn]")
  .addEventListener("click", () => {
    queryParamsContainer.append(createKeyValuePair());
  });

document
  .querySelector("[data-add-request-header-btn]")
  .addEventListener("click", () => {
    requestHeaderContainer.append(createKeyValuePair());
  });

function keyValuePairsToObjects(container) {
  const pairs = container.querySelectorAll("[data-key-value-pair]");
  return [...pairs].reduce((data, pair) => {
    const key = pair.querySelector("[data-key]").value;
    const value = pair.querySelector("[data-value]").value;
    if (key === "") return data;
    return { ...data, [key]: value };
  }, {});
}

function updateResponseDetails(response) {
  document.querySelector("[data-status]").textContent = response.status;
  document.querySelector("[data-time]").textContent = response.customData.time;
  document.querySelector("[data-size]").textContent = prettyBytes(
    JSON.stringify(response.data).length +
      JSON.stringify(response.headers).length
  );
}

const {
  requestEditor,
  updateRequestBodyEditor,
  updateResponseBodyEditor,
  updateResponseFullEditor,
} = setupEditor();

function updateResponseEditor(response) {
  updateResponseBodyEditor(response.data);
  delete response.customData;
  updateResponseFullEditor(response);
}

function updateResponseHeaders(headers) {
  responseHeadersContainer.innerHTML = "";
  Object.entries(headers).forEach(([key, value]) => {
    const keyElement = document.createElement("div");
    keyElement.textContent = key;
    responseHeadersContainer.append(keyElement);
    const valueElement = document.createElement("div");
    valueElement.textContent = value;
    responseHeadersContainer.append(valueElement);
  });
}

axios.interceptors.request.use((request) => {
  request.customData = request.customData || {};
  request.customData.startTime = new Date().getTime();
  return request;
});

function updateEndTime(response) {
  response.customData = response.customData || {};
  response.customData.time =
    new Date().getTime() - response.config.customData.startTime;
  return response;
}

axios.interceptors.response.use(updateEndTime, (e) => {
  return Promise.reject(updateEndTime(e.response));
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  loadingSpan.style.display = "inline-flex";

  let data;

  try {
    data = JSON.parse(requestEditor.state.doc.toString() || null);
  } catch (e) {
    showError("JSON data is malformed");
    return;
  }

  axios({
    url: document.querySelector("[data-url]").value,
    method: document.querySelector("[data-method]").value,
    params: keyValuePairsToObjects(queryParamsContainer),
    headers: keyValuePairsToObjects(requestHeaderContainer),
    data: data,
  })
    .catch((e) => e)
    .then((response) => {
      document
        .querySelector("[data-response-section]")
        .classList.remove("d-none");
      updateResponseDetails(response);
      updateResponseEditor(response);
      updateResponseHeaders(response.headers);
      loadingSpan.style.display = "none";
    });
});

saveOpenedApi.addEventListener("click", () => {
  if (currApiId === "" || currCollectionId === "") {
    openedApi.style.display = "none";
    return;
  }
  const obj = {};
  obj[URL] = document.querySelector("[data-url]").value;
  try {
    obj[BODY] = JSON.parse(requestEditor.state.doc.toString() || null);
  } catch (error) {
    showError("JSON data malformed");
    return;
  }
  obj[HEADERS] = keyValuePairsToObjects(requestHeaderContainer);
  obj[PARAMS] = keyValuePairsToObjects(queryParamsContainer);
  obj[METHOD] = document.querySelector("[data-method]").value;
  firebase
    .database()
    .ref(`${COLLECTIONS}/${currCollectionId}/${APIS}/${currApiId}`)
    .set(obj, (error) => {
      if (error) {
        showError("Error");
      } else {
        showSuccess("Success");
      }
    });
});

export function addRequest(id) {
  const obj = {};
  obj[URL] = document.querySelector("[data-url]").value;
  if (obj[URL] === "") {
    showError("URL cannot be empty");
    return;
  }
  try {
    obj[BODY] = JSON.parse(requestEditor.state.doc.toString() || null);
  } catch (error) {
    showError("JSON data malformed");
    return;
  }
  obj[HEADERS] = keyValuePairsToObjects(requestHeaderContainer);
  obj[PARAMS] = keyValuePairsToObjects(queryParamsContainer);
  obj[METHOD] = document.querySelector("[data-method]").value;
  firebase
    .database()
    .ref(`${COLLECTIONS}/${id}/${APIS}/`)
    .push(obj, (error) => {
      if (error) {
        showError("Error");
      }
    });
}

export const resetData = () => {
  currApiId = "";
  currCollectionId = "";
  openedApi.style.display = "none";
  document.querySelector("[data-url]").value = "";
  resetContainer(requestHeaderContainer);
  resetContainer(queryParamsContainer);
  document.querySelector("[data-method]").value = "GET";
  updateRequestBodyEditor({});
  updateResponseBodyEditor({});
  updateResponseFullEditor({});
  responseHeadersContainer.innerHTML = "";
};

reset.addEventListener("click", () => {
  doIfSure(resetData);
});

function resetContainer(container) {
  const pairs = container.querySelectorAll("[data-key-value-pair]");
  pairs.forEach((element) => {
    element.remove();
  });
}

export function setApiDetails(details) {
  currCollectionId = details.colId;
  currApiId = details.apiId;
  openedApi.style.display = "flex";
  openedApiCollection.textContent = details.colName;
  openedApiUrl.textContent = document.querySelector("[data-url]").value;
}

export function setHeaders(obj) {
  if (obj === null || obj === undefined) {
    return;
  }
  for (let key of Object.keys(obj)) {
    requestHeaderContainer.append(createKeyValuePair(key, obj[key]));
  }
}

export function setParams(obj) {
  if (obj === null || obj === undefined) {
    return;
  }
  for (let key of Object.keys(obj)) {
    queryParamsContainer.append(createKeyValuePair(key, obj[key]));
  }
}

export function setBody(obj) {
  updateRequestBodyEditor(obj || {});
}

export function setUrl(url) {
  document.querySelector("[data-url]").value = url;
}

export function setMethod(method) {
  document.querySelector("[data-method]").value = method;
}
