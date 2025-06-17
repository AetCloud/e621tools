import { apiRequest } from "../lib/api.js";

export const render = () => {
  return `
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
    <div class="container mx-auto p-4 md:p-8">
        <div class="mb-8">
            <a href="/" data-link class="text-cyan-400 hover:text-cyan-300">&larr; Back to the hub</a>
        </div>

        <div class="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl">
            <h1 class="text-3xl md:text-4xl font-bold mb-2 text-cyan-400">Mass Downloader</h1>
            <p class="text-gray-400 mb-6">Download posts in bulk as a .zip file from a tag search.</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label for="username" class="block text-sm font-medium text-gray-300 mb-2">Username</label>
                    <input type="text" id="username" class="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" placeholder="Your e621 username">
                </div>
                <div>
                    <label for="apiKey" class="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                    <input type="password" id="apiKey" class="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" placeholder="Your e621 API key">
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label for="tags" class="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                    <input type="text" id="tags" class="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" placeholder="canine score:>50 order:score">
                </div>
                <div>
                    <label for="blacklist-input" class="block text-sm font-medium text-gray-300 mb-2">Add to Personal Blacklist</label>
                    <div class="flex">
                        <input type="text" id="blacklist-input" class="w-full bg-gray-700 border-gray-600 rounded-l-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" placeholder="e.g., my_little_pony">
                        <button id="add-blacklist-btn" class="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-r-lg">Add</button>
                    </div>
                    <div id="blacklist-tags-container" class="mt-3 flex flex-wrap gap-2"></div>
                </div>
            </div>
            
            <div class="flex items-center mb-6">
                <input id="useDefaultBlacklist" type="checkbox" checked class="h-4 w-4 rounded border-gray-500 bg-gray-700 text-cyan-600 focus:ring-cyan-500">
                <label for="useDefaultBlacklist" class="ml-2 block text-sm text-gray-300">Use default e621 blacklist</label>
            </div>

            <button id="startDownloadProcess" class="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300">
                Download Posts
            </button>

            <div id="progress-section" class="hidden mt-6 text-center p-4 bg-gray-700/50 rounded-lg">
                <p id="progress-text" class="text-lg font-semibold text-gray-300 mb-2">Preparing to download...</p>
                <div class="w-full bg-gray-700 rounded-full h-4 mt-2 border border-gray-600">
                    <div id="progress-bar" class="bg-emerald-600 h-full rounded-full text-xs text-white flex items-center justify-center" style="width: 0%">0%</div>
                </div>
            </div>
            
            <div id="log-section" class="mt-6 hidden">
                <h2 class="text-xl font-semibold mb-2 text-gray-300">Log</h2>
                <div id="log" class="w-full h-48 bg-gray-900 rounded-lg p-3 overflow-y-auto border border-gray-700"></div>
            </div>
        </div>
    </div>
    `;
};

export const afterRender = () => {
  const usernameInput = document.getElementById("username");
  const apiKeyInput = document.getElementById("apiKey");
  const tagsInput = document.getElementById("tags");
  const blacklistInput = document.getElementById("blacklist-input");
  const addBlacklistBtn = document.getElementById("add-blacklist-btn");
  const blacklistTagsContainer = document.getElementById(
    "blacklist-tags-container"
  );
  const useDefaultBlacklistCheckbox = document.getElementById(
    "useDefaultBlacklist"
  );
  const startDownloadBtn = document.getElementById("startDownloadProcess");
  const logSection = document.getElementById("log-section");
  const logDiv = document.getElementById("log");
  const progressSection = document.getElementById("progress-section");
  const progressText = document.getElementById("progress-text");
  const progressBar = document.getElementById("progress-bar");

  let personalBlacklist = [];
  const DEFAULT_BLACKLIST = [
    "guro",
    "scat",
    "vore",
    "watersports",
    "loli",
    "shota",
    "cub",
    "young",
  ];

  function loadCredentials() {
    const savedUsername = localStorage.getItem("e621Username");
    const savedApiKey = localStorage.getItem("e621ApiKey");
    if (savedUsername) usernameInput.value = savedUsername;
    if (savedApiKey) apiKeyInput.value = savedApiKey;
  }

  function saveCredentials() {
    localStorage.setItem("e621Username", usernameInput.value);
    localStorage.setItem("e621ApiKey", apiKeyInput.value);
  }

  function loadBlacklist() {
    const savedBlacklist = localStorage.getItem("e621PersonalBlacklist");
    if (savedBlacklist) {
      personalBlacklist = JSON.parse(savedBlacklist);
      renderBlacklistTags();
    }
  }

  function saveBlacklist() {
    localStorage.setItem(
      "e621PersonalBlacklist",
      JSON.stringify(personalBlacklist)
    );
  }

  function renderBlacklistTags() {
    blacklistTagsContainer.innerHTML = "";
    personalBlacklist.forEach((tag) => {
      const tagPill = document.createElement("span");
      tagPill.className =
        "inline-flex items-center px-2 py-1 bg-gray-600 text-sm font-medium text-gray-100 rounded-full";
      tagPill.innerHTML = `${tag} <button data-tag-to-remove="${tag}" class="remove-blacklist-tag ml-1.5 inline-flex-shrink-0 h-4 w-4 rounded-full items-center justify-center text-gray-400 hover:bg-gray-500 hover:text-gray-200 focus:outline-none"><svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8"><path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" /></svg></button>`;
      blacklistTagsContainer.appendChild(tagPill);
    });
  }

  function addBlacklistTag() {
    const tagToAdd = blacklistInput.value.trim();
    if (tagToAdd && !personalBlacklist.includes(tagToAdd)) {
      personalBlacklist.push(tagToAdd);
      blacklistInput.value = "";
      saveBlacklist();
      renderBlacklistTags();
    }
  }

  function removeBlacklistTag(tagToRemove) {
    personalBlacklist = personalBlacklist.filter((tag) => tag !== tagToRemove);
    saveBlacklist();
    renderBlacklistTags();
  }

  function logMessage(message, level = "info") {
    if (logSection.classList.contains("hidden")) {
      logSection.classList.remove("hidden");
    }
    const p = document.createElement("p");
    p.textContent = message;
    switch (level) {
      case "error":
        p.className = "text-red-400";
        break;
      case "warn":
        p.className = "text-yellow-400";
        break;
      default:
        p.className = "text-gray-300";
    }
    logDiv.appendChild(p);
    logDiv.scrollTop = logDiv.scrollHeight;
  }

  function updateProgress(percentage, text) {
    progressBar.style.width = `${percentage}%`;
    progressBar.textContent = `${Math.round(percentage)}%`;
    if (text) {
      progressText.textContent = text;
    }
  }

  function buildTagString() {
    let finalTags = tagsInput.value.trim();
    const activeBlacklist = useDefaultBlacklistCheckbox.checked
      ? [...new Set([...DEFAULT_BLACKLIST, ...personalBlacklist])]
      : personalBlacklist;

    activeBlacklist.forEach((tag) => {
      if (tag.includes(" ") || tag.startsWith("-")) finalTags += ` ${tag}`;
      else finalTags += ` -${tag}`;
    });

    return finalTags;
  }

  async function triggerDownload(blob, filename) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  async function startDownload() {
    const tags = tagsInput.value.trim();
    if (!tags) {
      logMessage("Please enter tags to search for.", "error");
      return;
    }
    if (!usernameInput.value || !apiKeyInput.value) {
      logMessage("Username and API Key are required.", "error");
      return;
    }

    logDiv.innerHTML = "";
    logMessage("Fetching post list...");
    startDownloadBtn.disabled = true;
    startDownloadBtn.textContent = "Working...";
    progressSection.classList.remove("hidden");
    updateProgress(0, "Fetching post list...");

    const fullTagString = buildTagString();
    const credentials = {
      username: usernameInput.value,
      apiKey: apiKeyInput.value,
    };
    const data = await apiRequest(
      `posts.json?tags=${encodeURIComponent(fullTagString)}&limit=320`,
      credentials
    );

    if (!data || !data.posts || data.posts.length === 0) {
      logMessage(
        "Failed to fetch posts or no posts were found for these tags.",
        "error"
      );
      startDownloadBtn.disabled = false;
      startDownloadBtn.textContent = "Download Posts";
      progressSection.classList.add("hidden");
      return;
    }

    const postsToDownload = data.posts.filter((p) => p.file.url);
    logMessage(
      `Found ${postsToDownload.length} posts with downloadable files.`
    );

    const zip = new JSZip();
    let downloadedCount = 0;

    for (const post of postsToDownload) {
      downloadedCount++;
      const progress = (downloadedCount / postsToDownload.length) * 100;
      updateProgress(
        progress,
        `Downloading image ${downloadedCount} of ${postsToDownload.length}...`
      );
      logMessage(`Downloading ${post.file.url}`);

      try {
        const response = await fetch(post.file.url);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const blob = await response.blob();
        const filename = `${post.id}.${post.file.ext}`;
        zip.file(filename, blob);
      } catch (error) {
        logMessage(
          `Failed to download post ${post.id}: ${error.message}`,
          "error"
        );
      }
    }

    logMessage("All files downloaded. Creating zip file...");
    updateProgress(100, "Creating zip file...");

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const zipFilename =
      tags.replace(/[:*?"<>|]/g, "_").substring(0, 50) + ".zip";
    triggerDownload(zipBlob, zipFilename);

    logMessage(`Zip file '${zipFilename}' created successfully.`);
    startDownloadBtn.disabled = false;
    startDownloadBtn.textContent = "Download Posts";
    updateProgress(100, "Done!");
  }

  loadCredentials();
  loadBlacklist();
  usernameInput.addEventListener("input", saveCredentials);
  apiKeyInput.addEventListener("input", saveCredentials);
  addBlacklistBtn.addEventListener("click", addBlacklistTag);
  blacklistInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addBlacklistTag();
    }
  });
  blacklistTagsContainer.addEventListener("click", (e) => {
    const removeButton = e.target.closest(".remove-blacklist-tag");
    if (removeButton) {
      removeBlacklistTag(removeButton.dataset.tagToRemove);
    }
  });
  startDownloadBtn.addEventListener("click", startDownload);
};
