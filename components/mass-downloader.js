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

            <button id="fetchPosts" class="w-full mt-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300">
                Fetch Posts for Download
            </button>

            <div id="action-button-container" class="hidden mt-6">
                <button id="startDownloadProcess" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300" disabled>
                    Download All Fetched Posts
                </button>
            </div>

            <div id="progress-section" class="hidden mt-6 text-center p-4 bg-gray-700/50 rounded-lg">
                <p id="progress-text" class="text-lg font-semibold text-gray-300 mb-2">Preparing to download...</p>
                <div class="w-full bg-gray-700 rounded-full h-4 mt-2 border border-gray-600">
                    <div id="progress-bar" class="bg-emerald-600 h-full rounded-full text-xs text-white flex items-center justify-center" style="width: 0%">0%</div>
                </div>
            </div>
            
            <div id="log-section" class="hidden mt-6 animated-dropdown">
                <div>
                    <h2 class="text-xl font-semibold mb-2 text-gray-300">Log</h2>
                    <div id="log" class="w-full h-48 bg-gray-900 rounded-lg p-3 overflow-y-auto border border-gray-700"></div>
                </div>
            </div>

            <div id="previews-section" class="hidden mt-6">
                <h2 class="text-xl font-semibold mb-2 text-gray-300">Download Previews</h2>
                <div id="postsContainer" class="mt-2 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4"></div>
                <div id="load-more-container" class="text-center mt-6 hidden">
                    <button id="loadMoreBtn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Load More</button>
                </div>
            </div>
        </div>
    </div>

    <div id="confirmation-modal" class="modal pointer-events-none fixed w-full h-full top-0 left-0 flex items-center justify-center opacity-0">
        <div class="modal-overlay absolute w-full h-full bg-gray-900 opacity-50"></div>
        <div class="modal-container bg-gray-800 w-11/12 md:max-w-md mx-auto rounded-lg shadow-lg z-50 overflow-y-auto">
            <div class="modal-content py-4 text-left px-6">
                <div class="flex justify-between items-center pb-3">
                    <p class="text-2xl font-bold text-white">Confirm Download</p>
                    <button id="modal-close" class="modal-close cursor-pointer z-50">
                        <svg class="fill-current text-white" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path></svg>
                    </button>
                </div>
                <p id="modal-text" class="text-gray-300 mb-4">Are you sure?</p>
                <div class="flex justify-end pt-2">
                    <button id="modal-cancel" class="px-4 bg-transparent p-3 rounded-lg text-cyan-400 hover:bg-gray-700 hover:text-cyan-300 mr-2">Cancel</button>
                    <button id="modal-confirm" class="px-4 bg-emerald-600 p-3 rounded-lg text-white hover:bg-emerald-700">Confirm</button>
                </div>
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
  const fetchPostsBtn = document.getElementById("fetchPosts");
  const actionButtonContainer = document.getElementById(
    "action-button-container"
  );
  const startDownloadBtn = document.getElementById("startDownloadProcess");
  const logSection = document.getElementById("log-section");
  const logDiv = document.getElementById("log");
  const progressSection = document.getElementById("progress-section");
  const progressText = document.getElementById("progress-text");
  const progressBar = document.getElementById("progress-bar");
  const previewsSection = document.getElementById("previews-section");
  const postsContainer = document.getElementById("postsContainer");
  const loadMoreContainer = document.getElementById("load-more-container");
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  const modal = document.getElementById("confirmation-modal");
  const modalText = document.getElementById("modal-text");
  const modalCloseBtn = document.getElementById("modal-close");
  const modalCancelBtn = document.getElementById("modal-cancel");
  const modalConfirmBtn = document.getElementById("modal-confirm");

  let fetchedPosts = [];
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
  let displayedPostCount = 0;
  const POSTS_PER_PAGE = 24;
  let lazyLoadObserver;

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

  async function fetchAllPosts() {
    logDiv.innerHTML = "";
    logSection.classList.add("is-open");
    logMessage("Starting to fetch all posts, this may take a moment...");

    const allPosts = [];
    let page = 1;
    const credentials = {
      username: usernameInput.value,
      apiKey: apiKeyInput.value,
    };
    const fullTagString = buildTagString();

    while (true) {
      logMessage(`Fetching page ${page}...`);
      const data = await apiRequest(
        `posts.json?tags=${encodeURIComponent(
          fullTagString
        )}&limit=320&page=${page}`,
        credentials
      );

      if (data && data.posts && data.posts.length > 0) {
        allPosts.push(...data.posts);
        page++;
        await new Promise((resolve) => setTimeout(resolve, 250));
      } else {
        if (data && data.error) {
          logMessage(`API Error while fetching: ${data.error}`, "error");
        }
        break;
      }
    }
    return allPosts;
  }

  async function handleFetch() {
    const tags = tagsInput.value.trim();
    if (!tags) {
      logMessage("Please enter tags to search for.", "error");
      return;
    }
    if (!usernameInput.value || !apiKeyInput.value) {
      logMessage("Username and API Key are required.", "error");
      return;
    }

    fetchPostsBtn.disabled = true;
    fetchPostsBtn.textContent = "Fetching All Pages...";
    postsContainer.innerHTML = "";
    fetchedPosts = [];
    displayedPostCount = 0;
    actionButtonContainer.classList.add("hidden");
    previewsSection.classList.add("hidden");
    progressSection.classList.add("hidden");
    loadMoreContainer.classList.add("hidden");

    const allPosts = await fetchAllPosts();

    if (allPosts.length > 0) {
      fetchedPosts = allPosts.filter((p) => p.file.url);
      logMessage(
        `Finished fetching. Found ${fetchedPosts.length} posts with downloadable files.`
      );
      actionButtonContainer.classList.remove("hidden");
      previewsSection.classList.remove("hidden");
      displayFetchedPosts();
    } else {
      logMessage("No posts found for the given tags and blacklists.", "warn");
    }
    fetchPostsBtn.disabled = false;
    fetchPostsBtn.textContent = "Fetch Posts for Download";
  }

  function createPostPreviewElement(post) {
    const imageUrl = post.sample.has ? post.sample.url : post.preview.url;
    if (!imageUrl) return null;
    const link = document.createElement("a");
    link.href = `https://e621.net/posts/${post.id}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    const itemDiv = document.createElement("div");
    itemDiv.className = "flex flex-col items-center";
    const img = document.createElement("img");
    img.dataset.src = imageUrl;
    img.className =
      "lazy-load preview-image w-full bg-gray-700 rounded-lg shadow-lg";
    const idText = document.createElement("p");
    idText.className = "text-xs text-gray-400 mt-1";
    idText.textContent = `ID: ${post.id}`;
    link.appendChild(img);
    itemDiv.appendChild(link);
    itemDiv.appendChild(idText);
    return itemDiv;
  }

  function displayFetchedPosts() {
    const postsToRender = fetchedPosts.slice(
      displayedPostCount,
      displayedPostCount + POSTS_PER_PAGE
    );
    postsToRender.forEach((post) => {
      const postElement = createPostPreviewElement(post);
      if (postElement) {
        postsContainer.appendChild(postElement);
        lazyLoadObserver.observe(postElement.querySelector(".lazy-load"));
      }
    });
    displayedPostCount += postsToRender.length;
    if (displayedPostCount < fetchedPosts.length) {
      loadMoreContainer.classList.remove("hidden");
    } else {
      loadMoreContainer.classList.add("hidden");
    }
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
    if (typeof JSZip === "undefined") {
      logMessage(
        "JSZip library is not loaded. Please wait or refresh.",
        "error"
      );
      return;
    }

    logDiv.innerHTML = "";
    logSection.classList.add("is-open");
    logMessage(`Starting download for ${fetchedPosts.length} posts...`);
    startDownloadBtn.disabled = true;
    progressSection.classList.remove("hidden");

    const zip = new JSZip();
    let downloadedCount = 0;

    for (const post of fetchedPosts) {
      downloadedCount++;
      const progress = (downloadedCount / fetchedPosts.length) * 100;
      updateProgress(
        progress,
        `Downloading image ${downloadedCount} of ${fetchedPosts.length}...`
      );
      logMessage(`Downloading ${post.file.url}`);

      try {
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(
          post.file.url
        )}`;
        const response = await fetch(proxyUrl);
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
      tagsInput.value
        .trim()
        .replace(/[:*?"<>|]/g, "_")
        .substring(0, 50) + ".zip";
    triggerDownload(zipBlob, zipFilename);

    logMessage(`Zip file '${zipFilename}' created successfully.`);
    startDownloadBtn.disabled = false;
    updateProgress(100, "Done!");
  }

  function openModal() {
    modalText.textContent = `You are about to download all ${fetchedPosts.length} fetched posts as a .zip file. This may take some time. Are you sure?`;
    modal.classList.remove("pointer-events-none", "opacity-0");
    document.body.classList.add("modal-active");
  }

  function closeModal() {
    modal.classList.add("pointer-events-none", "opacity-0");
    document.body.classList.remove("modal-active");
  }

  function initializeLazyLoader() {
    lazyLoadObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove("lazy-load");
          observer.unobserve(img);
        }
      });
    });
  }

  function initializePage() {
    const jszipScript = document.createElement("script");
    jszipScript.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    jszipScript.onload = () => {
      console.log("JSZip loaded successfully.");
      if (startDownloadBtn) {
        startDownloadBtn.disabled = false;
        startDownloadBtn.textContent = "Download All Fetched Posts";
      }
    };
    jszipScript.onerror = () => {
      console.error("Failed to load JSZip.");
      if (startDownloadBtn) {
        startDownloadBtn.textContent = "Download Disabled";
      }
      logMessage(
        "Critical Error: Could not load the JSZip library. Downloading is disabled.",
        "error"
      );
    };
    document.head.appendChild(jszipScript);

    loadCredentials();
    loadBlacklist();
    initializeLazyLoader();

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
      if (removeButton) removeBlacklistTag(removeButton.dataset.tagToRemove);
    });
    fetchPostsBtn.addEventListener("click", handleFetch);
    startDownloadBtn.addEventListener("click", openModal);
    loadMoreBtn.addEventListener("click", displayFetchedPosts);
    modalConfirmBtn.addEventListener("click", () => {
      closeModal();
      startDownload();
    });
    modalCloseBtn.addEventListener("click", closeModal);
    modalCancelBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  initializePage();
};
