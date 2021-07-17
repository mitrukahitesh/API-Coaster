const collectionList = document.querySelector("[collection-list]");
const collectionTemplate = document.querySelector("[collection-name-template]");
const requestTemplate = document.querySelector("[request-name-template]");

export const addCollectionToList = (key, value) => {
  collectionList.append(createNewCollection(key, value));
};

function createNewCollection(key, value) {
  const root = collectionTemplate.content
    .cloneNode(true)
    .querySelector("[root-collection]");
  firebase.auth().onAuthChangeListener((user) => {
    if (user) {
    } else {
      collectionList.remove(root);
    }
  });
  const element = root.querySelector("[collection-container]");
  const reqList = root.querySelector("[request-list]");
  element.querySelector("[collection-name]").textContent = value;
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
    .querySelector("[delete-collection]")
    .addEventListener("click", (e) => {
      collectionList.remove(root);
    });
  addRequestToList(reqList);
  console.log(reqList);
  return root;
}

function addRequestToList(requestList) {
  requestList.append(createNewRequest());
  requestList.append(createNewRequest());
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
