import { logger } from "../lib/utils.js";

export const render = () => {
  return `
    <div class="page-container anim-fade-in-up">
        <div class="mb-8">
            <a href="#/" data-link class="bg-gray-700 text-cyan-400 font-bold py-2 px-4 rounded-lg inline-flex items-center">&larr; Back to the hub</a>
        </div>

        <div class="content-box max-w-2xl mx-auto">
            <h1 class="text-3xl md:text-4xl font-bold mb-6 text-cyan-400">Settings</h1>

            <div class="space-y-8">
                <div>
                    <h2 class="text-2xl font-bold text-cyan-500 mb-4 pb-2 border-b border-gray-700">Credentials</h2>
                    <div class="space-y-4">
                        <div>
                            <label for="username" class="block text-sm font-medium text-gray-300 mb-2">Username</label>
                            <input type="text" id="username" class="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" placeholder="Your e621 username">
                        </div>
                        <div>
                            <label for="apiKey" class="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                            <input type="password" id="apiKey" class="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" placeholder="Your e621 API key">
                        </div>
                    </div>
                </div>

                <div>
                    <h2 class="text-2xl font-bold text-cyan-500 mb-4 pb-2 border-b border-gray-700">Application</h2>
                    <div class="flex items-center justify-between">
                        <div>
                            <label for="debug-toggle" class="font-medium text-gray-300">Enable Debug Logging</label>
                            <p class="text-sm text-gray-400">Shows verbose logs in the developer console.</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="debug-toggle">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>

             <div class="mt-8 text-right">
                <button id="save-credentials-btn" class="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300">
                    Save
                </button>
            </div>
            <p id="save-confirm-msg" class="text-green-400 text-right mt-2 h-4"></p>
        </div>
    </div>
    `;
};

export const afterRender = () => {
  const usernameInput = document.getElementById("username");
  const apiKeyInput = document.getElementById("apiKey");
  const saveBtn = document.getElementById("save-credentials-btn");
  const saveConfirmMsg = document.getElementById("save-confirm-msg");
  const debugToggle = document.getElementById("debug-toggle");

  function loadSettings() {
    const savedUsername = localStorage.getItem("e621Username");
    const savedApiKey = localStorage.getItem("e621ApiKey");
    if (savedUsername) usernameInput.value = savedUsername;
    if (savedApiKey) apiKeyInput.value = savedApiKey;
    debugToggle.checked = logger.isDebug;
  }

  function saveCredentials() {
    localStorage.setItem("e621Username", usernameInput.value);
    localStorage.setItem("e621ApiKey", apiKeyInput.value);
    saveConfirmMsg.textContent = "Saved!";
    setTimeout(() => {
      saveConfirmMsg.textContent = "";
    }, 2000);
  }

  function handleDebugToggle() {
    logger.setDebug(debugToggle.checked);
  }

  loadSettings();
  saveBtn.addEventListener("click", saveCredentials);
  debugToggle.addEventListener("change", handleDebugToggle);
};