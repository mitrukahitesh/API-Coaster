import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import prettyBytes from "pretty-bytes";
import setupEditor from "./editor";

// Request Response Script

const form = document.querySelector("[data-form]");
const queryParamsContainer = document.querySelector("[data-query-params]");
const requestHeaderContainer = document.querySelector("[data-request-headers]");
const keyValueTemplate = document.querySelector("[data-key-value-template]");
const responseHeadersContainer = document.querySelector(
  "[data-response-headers]"
);
const loadingSpan = document.querySelector("[request-loading]");

function createKeyValuePair() {
  const element = keyValueTemplate.content.cloneNode(true);
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

queryParamsContainer.append(createKeyValuePair());
requestHeaderContainer.append(createKeyValuePair());

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

const { requestEditor, updateResponseBodyEditor, updateResponseFullEditor } =
  setupEditor();

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
    alert("JSON data is malformed");
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

// Collection List Script

const collectionList = document.querySelector("[collection-list]");
const collectionTemplate = document.querySelector("[collection-name-template]");

addCollectionToList();

function addCollectionToList() {
  collectionList.append(createNewCollection());
}

function createNewCollection() {
  const root = collectionTemplate.content.cloneNode(true);
  const element = root.querySelector("[collection-container]");
  element.querySelector("[collection-name]").textContent = "API Coaster APIs";
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
      } else {
        chevron.classList.remove("fa-chevron-down");
        chevron.classList.add("fa-chevron-right");
      }
    });
  element
    .querySelector("[delete-collection]")
    .addEventListener("click", (e) => {
      collectionList.remove(root);
    });
  return element;
}

// Request List

const requestList = document.querySelector("[request-list]");
const requestTemplate = document.querySelector("[request-name-template]");

addRequestToList();

function addRequestToList() {
  collectionList.append(createNewRequest());
  collectionList.append(createNewRequest());
}

function createNewRequest() {
  const element = requestTemplate.content
    .cloneNode(true)
    .querySelector("[request-container]");
  element.querySelector("[request-method]").textContent = "GET";
  element.querySelector("[request-name]").textContent =
    "https://www.example.com/api/";
  element.addEventListener("mouseenter", () => {
    element.style.cursor = "pointer";
    element.querySelector("[menu-request]").style.display = "inline-flex";
  });
  element.addEventListener("mouseleave", () => {
    element.querySelector("[menu-request]").style.display = "none";
  });
  element
    .querySelector("[request-name-method]")
    .addEventListener("click", (e) => {
      alert("https://www.example.com/api/");
    });
  element.querySelector("[delete-request]").addEventListener("click", (e) => {
    e.target.closest("[request-container]").remove();
  });
  return element;
}
