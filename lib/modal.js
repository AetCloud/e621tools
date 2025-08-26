import { logger } from "./utils.js";

let confirmActionCallback = null;

const openModal = (modalId, text, onConfirm) => {
  logger.log(`[Modal] Opening modal: ${modalId}`);
  const modal = document.getElementById(modalId);
  if (!modal) {
    logger.error(`[Modal] Modal with ID "${modalId}" not found.`);
    return;
  }

  if (text) modal.querySelector("#modal-text").textContent = text;
  if (onConfirm) confirmActionCallback = onConfirm;

  modal.classList.remove("pointer-events-none", "opacity-0");
  document.body.classList.add("modal-active");
};

const closeModal = () => {
  logger.log("[Modal] Closing all modals.");
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.classList.add("pointer-events-none", "opacity-0");
  });
  document.body.classList.remove("modal-active");
  confirmActionCallback = null;
};

export function initModalSystem() {
  const modalHtml = `
      <div id="credentials-modal" class="modal pointer-events-none fixed w-full h-full top-0 left-0 flex items-center justify-center opacity-0">
        <div class="modal-overlay absolute w-full h-full bg-gray-900 opacity-50"></div>
        <div class="modal-container bg-gray-800 w-11/12 md:max-w-md mx-auto rounded-lg shadow-lg z-50 overflow-y-auto">
            <div class="modal-content py-4 text-left px-6">
                <p class="text-2xl font-bold text-white pb-3">Credentials Required</p>
                <p class="text-gray-300 mb-4">You need to set your Username and API Key in the settings before using this tool.</p>
                <div class="flex justify-end pt-2">
                    <button class="modal-cancel px-4 bg-transparent p-3 rounded-lg text-cyan-400 hover:bg-gray-700 mr-2">Cancel</button>
                    <a href="#/settings" data-link class="modal-go-to-settings px-4 bg-cyan-600 p-3 rounded-lg text-white hover:bg-cyan-700">Go to Settings</a>
                </div>
            </div>
        </div>
      </div>
      <div id="confirmation-modal" class="modal pointer-events-none fixed w-full h-full top-0 left-0 flex items-center justify-center opacity-0">
        <div class="modal-overlay absolute w-full h-full bg-gray-900 opacity-50"></div>
        <div class="modal-container bg-gray-800 w-11/12 md:max-w-md mx-auto rounded-lg shadow-lg z-50 overflow-y-auto">
            <div class="modal-content py-4 text-left px-6">
                <p class="text-2xl font-bold text-white">Confirm Action</p>
                <p id="modal-text" class="text-gray-300 my-4">Are you sure?</p>
                <div class="flex justify-end pt-2">
                    <button class="modal-cancel px-4 bg-transparent p-3 rounded-lg text-cyan-400 hover:bg-gray-700 mr-2">Cancel</button>
                    <button id="modal-confirm" class="px-4 bg-pink-600 p-3 rounded-lg text-white hover:bg-pink-700">Confirm</button>
                </div>
            </div>
        </div>
      </div>
    `;
  document.body.insertAdjacentHTML("beforeend", modalHtml);

  window.addEventListener("show-modal", (e) => {
    logger.log('[Modal] "show-modal" event received.', e.detail);
    openModal(e.detail.modalId, e.detail.text, e.detail.onConfirm);
  });

  document
    .querySelectorAll(".modal-overlay, .modal-cancel")
    .forEach((el) => el.addEventListener("click", closeModal));

  document.getElementById("modal-confirm").addEventListener("click", () => {
    if (typeof confirmActionCallback === "function") {
      logger.log("[Modal] Confirm button clicked, executing callback.");
      confirmActionCallback();
    } else {
      logger.warn(
        "[Modal] Confirm button clicked, but no callback was attached."
      );
    }
    closeModal();
  });

  document.body.addEventListener("click", (e) => {
    if (e.target.closest(".modal-go-to-settings")) {
      closeModal();
    }
  });
}