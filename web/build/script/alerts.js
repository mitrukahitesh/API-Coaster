import { Modal } from "../_snowpack/pkg/bootstrap.js";

const successAlertDom = document.getElementById("successAlertModal");
const errorAlertDom = document.getElementById("errorAlertModal");
const signinAlertDom = document.getElementById("signinAlertModal");

export const successAlertModal = Modal.getOrCreateInstance(successAlertDom);
export const errorAlertModal = Modal.getOrCreateInstance(errorAlertDom);
export const signinAlertModal = Modal.getOrCreateInstance(signinAlertDom);
