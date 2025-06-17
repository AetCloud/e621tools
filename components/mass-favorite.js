import { apiRequest } from "../lib/api.js";

export const render = () => {
  return `
    <div class="container mx-auto p-4 md:p-8">
        <div class="mb-8">
            <a href="/" data-link class="text-cyan-400 hover:text-cyan-300">&larr; Back to the hub</a>
        </div>

        <div class="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl">
            <h1 class="text-3xl md:text-4xl font-bold mb-2 text-cyan-400">Mass Favorite Tool</h1>
            <p class="text-gray-400 mb-6">Favorite posts in bulk based on a tag search.</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label for="tags" class="block text-sm font-medium text-gray-300 mb-2">Tags (e.g., wolf score:>100)</label>
                    <input type="text" id="tags" class="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" placeholder="canine score:>50 order:score">
                </div>
                <div>
                    <label for="blacklist-input" class="block text-sm font-medium text-gray-300 mb-2">Add to Personal Blacklist</label>
                    <div class="flex">
                        <input type="text" id="blacklist-input" class="w-full bg-gray-700 border-gray-600 rounded-l-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" placeholder="e.g., my_little_pony">
                        <button id="add-blacklist-btn" class="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-r-lg transition-colors duration-300">Add</button>
                    </div>
                    <div id="blacklist-tags-container" class="mt-3 flex flex-wrap gap-2">
                    </div>
                </div>
            </div>
            
            <div class="flex items-center mb-6">
                <input id="useDefaultBlacklist" type="checkbox" checked class="h-4 w-4 rounded border-gray-500 bg-gray-700 text-cyan-600 focus:ring-cyan-500">
                <label for="useDefaultBlacklist" class="ml-2 block text-sm text-gray-300">Use default e621 blacklist</label>
            </div>

            <button id="fetchPosts" class="w-full mt-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300">
                Fetch Posts
            </button>

            <div id="action-button-container" class="hidden mt-6">
                <button id="startFavoriteProcess" class="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300">
                    Favorite All Fetched Posts
                </button>
            </div>

            <div id="live-preview-section" class="hidden mt-6 text-center p-4 bg-gray-700/50 rounded-lg">
                <h3 class="text-lg font-semibold text-gray-300 mb-2">Processing...</h3>
                <img id="current-preview-image" src="" alt="Currently Processing Post" class="max-w-xs mx-auto rounded-lg shadow-lg opacity-0">
                <p id="current-preview-id" class="text-sm text-gray-400 mt-2"></p>
            </div>

            <div id="progress-container" class="hidden w-full bg-gray-700 rounded-full h-2.5 mt-4">
              <div id="progress-bar" class="bg-pink-600 h-2.5 rounded-full" style="width: 0%"></div>
            </div>
            
            <div id="log-section" class="animated-dropdown mt-6">
                <div>
                    <h2 class="text-xl font-semibold mb-2 text-gray-300">Log</h2>
                    <div id="log" class="w-full h-48 bg-gray-900 rounded-lg p-3 overflow-y-auto border border-gray-700">
                    </div>
                </div>
            </div>

            <div id="previews-section" class="hidden mt-6">
                <h2 class="text-xl font-semibold mb-2 text-gray-300">Fetched Post Previews</h2>
                <div id="postsContainer" class="mt-2 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4"></div>
                <div id="load-more-container" class="text-center mt-6 hidden">
                    <button id="loadMoreBtn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                        Load More
                    </button>
                </div>
            </div>
            
            <div id="history-section" class="hidden mt-6">
                <h2 class="text-xl font-semibold mb-2 text-gray-300">Favoriting History</h2>
                <div id="historyContainer" class="mt-2 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4"></div>
            </div>
        </div>
    </div>

    <div id="confirmation-modal" class="modal pointer-events-none fixed w-full h-full top-0 left-0 flex items-center justify-center opacity-0">
        <div class="modal-overlay absolute w-full h-full bg-gray-900 opacity-50"></div>
        <div class="modal-container bg-gray-800 w-11/12 md:max-w-md mx-auto rounded-lg shadow-lg z-50 overflow-y-auto">
            <div class="modal-content py-4 text-left px-6">
                <div class="flex justify-between items-center pb-3">
                    <p class="text-2xl font-bold text-white">Confirm Action</p>
                    <button id="modal-close" class="modal-close cursor-pointer z-50">
                        <svg class="fill-current text-white" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path></svg>
                    </button>
                </div>
                <p id="modal-text" class="text-gray-300 mb-4">Are you sure?</p>
                <div class="flex justify-end pt-2">
                    <button id="modal-cancel" class="px-4 bg-transparent p-3 rounded-lg text-cyan-400 hover:bg-gray-700 hover:text-cyan-300 mr-2">Cancel</button>
                    <button id="modal-confirm" class="px-4 bg-pink-600 p-3 rounded-lg text-white hover:bg-pink-700">Confirm</button>
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
  const startFavoriteProcessBtn = document.getElementById(
    "startFavoriteProcess"
  );
  const logSection = document.getElementById("log-section");
  const logDiv = document.getElementById("log");
  const postsContainer = document.getElementById("postsContainer");
  const historyContainer = document.getElementById("historyContainer");
  const actionButtonContainer = document.getElementById(
    "action-button-container"
  );
  const previewsSection = document.getElementById("previews-section");
  const historySection = document.getElementById("history-section");
  const progressContainer = document.getElementById("progress-container");
  const progressBar = document.getElementById("progress-bar");
  const livePreviewSection = document.getElementById("live-preview-section");
  const currentPreviewImage = document.getElementById("current-preview-image");
  const currentPreviewId = document.getElementById("current-preview-id");
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
  const POSTS_PER_PAGE = 20;

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
    logSection.classList.add("is-open");
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

  function updateProgress(percentage) {
    progressBar.style.width = `${percentage}%`;
  }

  function buildTagString() {
    let finalTags = tagsInput.value.trim();
    const activeBlacklist = useDefaultBlacklistCheckbox.checked
      ? [...new Set([...DEFAULT_BLACKLIST, ...personalBlacklist])]
      : personalBlacklist;

    activeBlacklist.forEach((tag) => {
      if (tag.includes(" ") || tag.startsWith("-")) {
        finalTags += ` ${tag}`;
      } else {
        finalTags += ` -${tag}`;
      }
    });

    return finalTags;
  }

  async function fetchPosts() {
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
    logMessage("Fetching posts...");
    fetchPostsBtn.disabled = true;
    fetchPostsBtn.textContent = "Fetching...";

    postsContainer.innerHTML = "";
    historyContainer.innerHTML = "";
    fetchedPosts = [];
    displayedPostCount = 0;
    actionButtonContainer.classList.add("hidden");
    previewsSection.classList.add("hidden");
    historySection.classList.add("hidden");
    progressContainer.classList.add("hidden");
    livePreviewSection.classList.add("hidden");
    loadMoreContainer.classList.add("hidden");
    updateProgress(0);

    const fullTagString = buildTagString();
    logMessage(`Requesting with tags: ${fullTagString}`);

    const credentials = {
      username: usernameInput.value,
      apiKey: apiKeyInput.value,
    };
    const data = await apiRequest(
      `posts.json?tags=${encodeURIComponent(fullTagString)}&limit=320`,
      credentials
    );

    if (data && data.posts && data.posts.length > 0) {
      fetchedPosts = data.posts;
      logMessage(`Successfully fetched ${fetchedPosts.length} posts.`);
      actionButtonContainer.classList.remove("hidden");
      previewsSection.classList.remove("hidden");
      displayFetchedPosts();
    } else {
      if (data && data.error) {
        logMessage(`Failed to fetch posts: ${data.error}`, "error");
      } else {
        logMessage(
          "Failed to fetch posts or no posts were found for those tags and blacklists.",
          "error"
        );
      }
    }
    fetchPostsBtn.disabled = false;
    fetchPostsBtn.textContent = "Fetch Posts";
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
    img.src = imageUrl;
    img.alt = `Post ${post.id}`;
    img.title = `Post ID: ${post.id}\nTags: ${post.tags.general.join(" ")}`;
    img.className = "preview-image w-full bg-gray-700 rounded-lg shadow-lg";
    img.onerror = () => {
      img.src = "https://placehold.co/150x150/000000/FFFFFF?text=Error";
    };

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
      if (postElement) postsContainer.appendChild(postElement);
    });
    displayedPostCount += postsToRender.length;
    if (displayedPostCount < fetchedPosts.length) {
      loadMoreContainer.classList.remove("hidden");
    } else {
      loadMoreContainer.classList.add("hidden");
    }
  }

  function displayHistoryPosts(posts, container) {
    container.innerHTML = "";
    posts.forEach((post) => {
      const postElement = createPostPreviewElement(post);
      if (postElement) container.appendChild(postElement);
    });
  }

  function updateLivePreview(post) {
    const imageUrl = post.sample.has ? post.sample.url : post.preview.url;
    currentPreviewImage.classList.add("opacity-0");
    setTimeout(() => {
      currentPreviewImage.src = imageUrl;
      currentPreviewId.textContent = `ID: ${post.id}`;
      currentPreviewImage.classList.remove("opacity-0");
    }, 100);
  }

  async function massFavorite() {
    logMessage(`Starting to favorite ${fetchedPosts.length} posts...`);
    startFavoriteProcessBtn.disabled = true;
    progressContainer.classList.remove("hidden");
    livePreviewSection.classList.remove("hidden");
    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;
    let favoritedPosts = [];
    const credentials = {
      username: usernameInput.value,
      apiKey: apiKeyInput.value,
    };

    for (const [index, post] of fetchedPosts.entries()) {
      updateLivePreview(post);
      if (post.is_favorited) {
        logMessage(`Skipping post ${post.id}, already in favorites.`, "warn");
        skipCount++;
      } else {
        const endpoint = `favorites.json?post_id=${post.id}`;
        const result = await apiRequest(endpoint, credentials, {
          method: "POST",
        });
        if (result && result.success) {
          logMessage(`Favorited post ${post.id}.`);
          successCount++;
          favoritedPosts.push(post);
        } else {
          logMessage(
            `Failed to favorite post ${post.id}. Reason: ${
              result ? result.error : "Unknown"
            }`,
            "error"
          );
          failCount++;
        }
      }
      updateProgress(((index + 1) / fetchedPosts.length) * 100);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    logMessage(
      `Finished. Success: ${successCount}. Skipped: ${skipCount}. Failed: ${failCount}.`
    );
    startFavoriteProcessBtn.disabled = false;
    livePreviewSection.classList.add("hidden");
    if (favoritedPosts.length > 0) {
      historySection.classList.remove("hidden");
      displayHistoryPosts(favoritedPosts, historyContainer);
    }
  }

  function openModal() {
    const postsToFavorite = fetchedPosts.filter((p) => !p.is_favorited).length;
    modalText.textContent = `You are about to favorite ${postsToFavorite} new posts from your search. Are you sure?`;
    modal.classList.remove("pointer-events-none", "opacity-0");
    document.body.classList.add("modal-active");
  }

  function closeModal() {
    modal.classList.add("pointer-events-none", "opacity-0");
    document.body.classList.remove("modal-active");
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

  modalConfirmBtn.addEventListener("click", () => {
    closeModal();
    massFavorite();
  });
  fetchPostsBtn.addEventListener("click", fetchPosts);
  startFavoriteProcessBtn.addEventListener("click", () => {
    if (fetchedPosts.length > 0) {
      openModal();
    } else {
      logMessage("No posts to favorite. Please fetch posts first.", "error");
    }
  });
  loadMoreBtn.addEventListener("click", displayFetchedPosts);
  modalCloseBtn.addEventListener("click", closeModal);
  modalCancelBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
};
