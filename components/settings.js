export const render = () => {
  return `
    <div class="container mx-auto p-4 md:p-8">
        <div class="mb-8">
            <a href="/" data-link class="text-cyan-400 hover:text-cyan-300">&larr; Back to the hub</a>
        </div>

        <div class="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl max-w-2xl mx-auto">
            <h1 class="text-3xl md:text-4xl font-bold mb-2 text-cyan-400">Settings</h1>
            <p class="text-gray-400 mb-6">Your API credentials are saved securely in your browser's local storage.</p>

            <div class="space-y-6">
                <div>
                    <label for="username" class="block text-sm font-medium text-gray-300 mb-2">Username</label>
                    <input type="text" id="username" class="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" placeholder="Your e621 username">
                </div>
                <div>
                    <label for="apiKey" class="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                    <input type="password" id="apiKey" class="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" placeholder="Your e621 API key">
                    <div class="mt-2 text-sm text-gray-400">
                        <details>
                            <summary class="cursor-pointer hover:text-white select-none list-none group">
                                <div class="flex items-center">
                                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                                    How do I get my API Key?
                                </div>
                            </summary>
                        </details>
                        <div class="animated-dropdown">
                            <div>
                                <div class="mt-2 p-4 bg-gray-900 rounded-lg border border-gray-700">
                                    <ol class="list-decimal list-inside space-y-2">
                                        <li>Click on the drop down on the top right and go to <strong>Profile</strong>.</li>
                                        <li>Click on the <strong>cog icon</strong> on the top right.</li>
                                        <li>Under Profile, click on the <strong>View</strong> button beside API Key.</li>
                                        <li>Place your password in the box.</li>
                                        <li>Your API key is shown. Copy and paste it to the box above.</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
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

  function loadCredentials() {
    const savedUsername = localStorage.getItem("e621Username");
    const savedApiKey = localStorage.getItem("e621ApiKey");
    if (savedUsername) usernameInput.value = savedUsername;
    if (savedApiKey) apiKeyInput.value = savedApiKey;
  }

  function saveCredentials() {
    localStorage.setItem("e621Username", usernameInput.value);
    localStorage.setItem("e621ApiKey", apiKeyInput.value);
    saveConfirmMsg.textContent = "Saved!";
    setTimeout(() => {
      saveConfirmMsg.textContent = "";
    }, 2000);
  }

  loadCredentials();
  saveBtn.addEventListener("click", saveCredentials);
};
