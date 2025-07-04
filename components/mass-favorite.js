import { apiRequest } from "../lib/api.js";
import { initSimpleFadeButton } from "../lib/animations.js";

export const render = () => {
  return `
    <div class="container mx-auto p-4 md:p-8">
        <div class="mb-8">
            <a href="#/" data-link class="bg-gray-700 text-cyan-400 font-bold py-2 px-4 rounded-lg inline-flex items-center">&larr; Back to the hub</a>
        </div>

        <div class="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl relative">
            <h1 class="text-3xl md:text-4xl font-bold mb-2 text-center text-cyan-400">Mass Favorite Tool</h1>
            <p class="text-gray-400 mb-6 text-center">Favorite posts in bulk based on a tag search.</p>

            <div class="w-full max-w-2xl mx-auto mb-4">
                <label for="tags" class="block text-sm font-medium text-gray-300 mb-2 text-center">Enter Your Search Tags</label>
                <input type="text" id="tags" class="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none text-center text-lg" placeholder="e.g., canine score:>50 order:score">
            </div>

            <div class="w-full max-w-3xl mx-auto mt-4">
                <details id="advanced-options-details">
                    <summary class="cursor-pointer hover:text-white select-none list-none group text-center text-sm text-gray-400">
                        <span class="group-open:hidden">Show Advanced Options</span>
                        <span class="hidden group-open:inline">Hide Advanced Options</span>
                    </summary>
                </details>
                <div class="animated-dropdown">
                    <div>
                        <div class="pt-4 mt-4 border-t border-gray-700/50">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-3">Ratings</label>
                                    <div class="flex flex-wrap gap-x-4 gap-y-2">
                                        <label class="flex items-center"><input type="checkbox" data-rating="s" class="rating-cb h-4 w-4 rounded border-gray-500 bg-gray-700 text-cyan-600" checked> <span class="ml-2">Safe</span></label>
                                        <label class="flex items-center"><input type="checkbox" data-rating="q" class="rating-cb h-4 w-4 rounded border-gray-500 bg-gray-700 text-cyan-600" checked> <span class="ml-2">Questionable</span></label>
                                        <label class="flex items-center"><input type="checkbox" data-rating="e" class="rating-cb h-4 w-4 rounded border-gray-500 bg-gray-700 text-cyan-600" checked> <span class="ml-2">Explicit</span></label>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-3">File Types</label>
                                    <div class="flex flex-wrap gap-x-4 gap-y-2">
                                        <label class="flex items-center"><input type="checkbox" data-filetype="png,jpg,gif" class="filetype-cb h-4 w-4 rounded border-gray-500 bg-gray-700 text-cyan-600" checked> <span class="ml-2">Image</span></label>
                                        <label class="flex items-center"><input type="checkbox" data-filetype="webm" class="filetype-cb h-4 w-4 rounded border-gray-500 bg-gray-700 text-cyan-600" checked> <span class="ml-2">Video (WEBM)</span></label>
                                        <label class="flex items-center"><input type="checkbox" data-filetype="swf" class="filetype-cb h-4 w-4 rounded border-gray-500 bg-gray-700 text-cyan-600" checked> <span class="ml-2">Animation (SWF)</span></label>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-6">
                                <label for="blacklist-input" class="block text-sm font-medium text-gray-300 mb-2">Personal Blacklist</label>
                                <div class="flex">
                                    <input type="text" id="blacklist-input" class="w-full bg-gray-700 border-gray-600 rounded-l-lg p-3 text-white focus:ring-2 focus:ring-cyan-500" placeholder="Add a tag to your personal blacklist...">
                                    <button id="add-blacklist-btn" class="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-r-lg">Add</button>
                                </div>
                                <div id="blacklist-tags-container" class="mt-3 flex flex-wrap gap-2"></div>
                                 <div class="flex items-center mt-4">
                                    <input id="useDefaultBlacklist" type="checkbox" checked class="h-4 w-4 rounded border-gray-500 bg-gray-700 text-cyan-600">
                                    <label for="useDefaultBlacklist" class="ml-2 block text-sm text-gray-300">Use default e621 blacklist</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-6">
                <label for="post-limit" class="block text-sm font-medium text-gray-300 mb-2">Number of posts to fetch per page (max 320)</label>
                <div class="flex items-center gap-4">
                    <input type="range" id="post-limit-slider" class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" value="50" min="1" max="320">
                    <input type="number" id="post-limit-input" class="w-24 bg-gray-700 border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" value="50" min="1" max="320">
                </div>
            </div>
            
            <div class="mt-6">
                <button id="fetchPostsBtn" class="action-button w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg">Fetch Posts</button>
                <div id="subsequent-controls" class="action-button hidden flex gap-4">
                    <button id="fetch-more-btn" class="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg">Fetch More</button>
                    <button id="clear-posts-btn" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg">Clear Posts</button>
                </div>
            </div>

            <div id="fetched-count-container" class="text-center mt-4 hidden">
                 <p id="fetched-count" class="text-gray-300"></p>
            </div>

            <div id="action-button-container" class="hidden mt-6">
                <button id="startFavoriteProcess" class="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-lg">
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
            
            <div id="log-section" class="hidden mt-6 animated-dropdown">
                <div>
                    <h2 class="text-xl font-semibold mb-2 text-gray-300">Log</h2>
                    <div id="log" class="w-full h-48 bg-gray-900 rounded-lg p-3 overflow-y-auto border border-gray-700"></div>
                </div>
            </div>

            <div id="previews-section" class="hidden mt-6">
                <h2 class="text-xl font-semibold mb-2 text-gray-300">Fetched Post Previews</h2>
                <div id="postsContainer" class="mt-2 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4"></div>
                <div id="load-more-previews-container" class="text-center mt-6 hidden">
                    <button id="loadMorePreviewsBtn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Load More Previews</button>
                </div>
            </div>
            
            <div id="history-section" class="hidden mt-6">
                <h2 class="text-xl font-semibold mb-2 text-gray-300">Favoriting History</h2>
                <div id="historyContainer" class="mt-2 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4"></div>
            </div>

            <div id="loading-modal" class="loading-modal">
                <div class="spinner"></div>
                <p class="text-white text-lg">Fetching Posts...</p>
            </div>
        </div>
    </div>

    <div id="credentials-modal" class="modal pointer-events-none fixed w-full h-full top-0 left-0 flex items-center justify-center opacity-0">
        <div class="modal-overlay absolute w-full h-full bg-gray-900 opacity-50"></div>
        <div class="modal-container bg-gray-800 w-11/12 md:max-w-md mx-auto rounded-lg shadow-lg z-50 overflow-y-auto">
            <div class="modal-content py-4 text-left px-6">
                <p class="text-2xl font-bold text-white pb-3">Credentials Required</p>
                <p class="text-gray-300 mb-4">You need to set your Username and API Key in the settings before using this tool.</p>
                <div class="flex justify-end pt-2">
                    <button id="modal-cancel-creds" class="px-4 bg-transparent p-3 rounded-lg text-cyan-400 hover:bg-gray-700 mr-2">Cancel</button>
                    <a href="#/settings" data-link id="modal-go-to-settings" class="px-4 bg-cyan-600 p-3 rounded-lg text-white hover:bg-cyan-700">Go to Settings</a>
                </div>
            </div>
        </div>
    </div>

    <div id="confirmation-modal" class="modal pointer-events-none fixed w-full h-full top-0 left-0 flex items-center justify-center opacity-0">
        <div class="modal-overlay absolute w-full h-full bg-gray-900 opacity-50"></div>
        <div class="modal-container bg-gray-800 w-11/12 md:max-w-md mx-auto rounded-lg shadow-lg z-50 overflow-y-auto">
            <div class="modal-content py-4 text-left px-6">
                <p class="text-2xl font-bold text-white">Confirm Action</p>
                <button id="modal-close" class="modal-close cursor-pointer z-50 absolute top-3.5 right-4">
                    <svg class="fill-current text-white" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path></svg>
                </button>
                <p id="modal-text" class="text-gray-300 mb-4">Are you sure?</p>
                <div class="flex justify-end pt-2">
                    <button id="modal-cancel" class="px-4 bg-transparent p-3 rounded-lg text-cyan-400 hover:bg-gray-700 mr-2">Cancel</button>
                    <button id="modal-confirm" class="px-4 bg-pink-600 p-3 rounded-lg text-white hover:bg-pink-700">Confirm</button>
                </div>
            </div>
        </div>
    </div>
    `;
};

export const afterRender = () => {
  const tagsInput = document.getElementById("tags");
  const postLimitInput = document.getElementById("post-limit-input");
  const postLimitSlider = document.getElementById("post-limit-slider");
  const blacklistInput = document.getElementById("blacklist-input");
  const addBlacklistBtn = document.getElementById("add-blacklist-btn");
  const blacklistTagsContainer = document.getElementById(
    "blacklist-tags-container"
  );
  const useDefaultBlacklistCheckbox = document.getElementById(
    "useDefaultBlacklist"
  );
  const initialFetchBtn = document.getElementById("fetchPostsBtn");
  const subsequentControls = document.getElementById("subsequent-controls");
  const fetchMoreBtn = document.getElementById("fetch-more-btn");
  const clearPostsBtn = document.getElementById("clear-posts-btn");
  const fetchedCountContainer = document.getElementById(
    "fetched-count-container"
  );
  const fetchedCountEl = document.getElementById("fetched-count");
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
  const loadMorePreviewsContainer = document.getElementById(
    "load-more-previews-container"
  );
  const loadMorePreviewsBtn = document.getElementById("loadMorePreviewsBtn");
  const credsModal = document.getElementById("credentials-modal");
  const cancelCredsBtn = document.getElementById("modal-cancel-creds");
  const favConfirmModal = document.getElementById("confirmation-modal");
  const favModalText = document.getElementById("modal-text");
  const favModalCloseBtn = favConfirmModal.querySelector("#modal-close");
  const favModalCancelBtn = favConfirmModal.querySelector("#modal-cancel");
  const favModalConfirmBtn = favConfirmModal.querySelector("#modal-confirm");
  const loadingModal = document.getElementById("loading-modal");

  let fetchedPosts = [];
  let personalBlacklist = [];
  let lastFetchedTags = "";
  let currentPage = 1;
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
  const POSTS_PER_PREVIEW_PAGE = 24;
  let lazyLoadObserver;
  let confirmActionCallback = null;
  let animationController;

  function checkCredentials() {
    const username = localStorage.getItem("e621Username");
    const apiKey = localStorage.getItem("e621ApiKey");
    if (!username || !apiKey) {
      credsModal.classList.remove("pointer-events-none", "opacity-0");
      return false;
    }
    return { username, apiKey };
  }

  function hideCredentialsModal() {
    credsModal.classList.add("pointer-events-none", "opacity-0");
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

  function updateProgress(percentage) {
    progressBar.style.width = `${percentage}%`;
  }

  function buildTagString() {
    let finalTags = tagsInput.value.trim();
    const activeBlacklist = useDefaultBlacklistCheckbox.checked
      ? [...new Set([...DEFAULT_BLACKLIST, ...personalBlacklist])]
      : personalBlacklist;

    document.querySelectorAll(".rating-cb:not(:checked)").forEach((cb) => {
      finalTags += ` -rating:${cb.dataset.rating}`;
    });
    document.querySelectorAll(".filetype-cb:not(:checked)").forEach((cb) => {
      cb.dataset.filetype.split(",").forEach((ext) => {
        finalTags += ` -filetype:${ext}`;
      });
    });

    activeBlacklist.forEach((tag) => {
      if (tag.includes(" ") || tag.startsWith("-")) finalTags += ` ${tag}`;
      else finalTags += ` -${tag}`;
    });

    return finalTags.trim();
  }

  function updateFetchedCount() {
    fetchedCountEl.textContent = `Fetched ${fetchedPosts.length} posts.`;
    if (fetchedPosts.length > 0) {
      fetchedCountContainer.classList.remove("hidden");
      actionButtonContainer.classList.remove("hidden");
    } else {
      fetchedCountContainer.classList.add("hidden");
      actionButtonContainer.classList.add("hidden");
    }
  }

  function clearFetchedPosts() {
    fetchedPosts = [];
    postsContainer.innerHTML = "";
    historyContainer.innerHTML = "";
    displayedPostCount = 0;
    currentPage = 1;
    lastFetchedTags = "";
    updateFetchedCount();
    logDiv.innerHTML = "";
    previewsSection.classList.add("hidden");
    historySection.classList.add("hidden");
    loadMorePreviewsContainer.classList.add("hidden");
    if (animationController) animationController.showInitial();
    logSection.classList.add("is-open");
    logMessage("Cleared all fetched posts.");
  }

  async function fetchPosts(isFetchingMore = false) {
    const credentials = checkCredentials();
    if (!credentials) return;

    const currentTags = buildTagString();
    if (!currentTags) {
      logMessage("Please enter tags to search for.", "error");
      return;
    }

    loadingModal.classList.add("visible");

    if (lastFetchedTags !== currentTags && isFetchingMore) {
      logMessage("Tags have changed. Please start a new fetch.", "warn");
      loadingModal.classList.remove("visible");
      return;
    }

    if (!isFetchingMore) {
      fetchedPosts = [];
      postsContainer.innerHTML = "";
      displayedPostCount = 0;
      currentPage = 1;
    }

    lastFetchedTags = currentTags;
    const postLimit = parseInt(postLimitInput.value, 10) || 50;

    const buttonToUpdate = isFetchingMore ? fetchMoreBtn : initialFetchBtn;
    buttonToUpdate.disabled = true;

    if (!isFetchingMore) {
      logDiv.innerHTML = "";
      logSection.classList.add("is-open");
    }
    logMessage(`Fetching page ${currentPage}...`);

    const data = await apiRequest(
      `posts.json?tags=${encodeURIComponent(
        currentTags
      )}&limit=${postLimit}&page=${currentPage}`,
      credentials
    );

    if (data && data.posts && data.posts.length > 0) {
      const newPosts = data.posts.filter(
        (p) => !fetchedPosts.some((fp) => fp.id === p.id)
      );
      fetchedPosts.push(...newPosts);
      logMessage(
        `Fetched ${newPosts.length} new posts. Total: ${fetchedPosts.length}.`
      );
      currentPage++;
      displayPostPreviews();
      previewsSection.classList.remove("hidden");
      updateFetchedCount();
      if (!isFetchingMore) animationController.showSubsequent();
    } else {
      logMessage("No more posts found for the given criteria.", "warn");
    }

    buttonToUpdate.disabled = false;
    loadingModal.classList.remove("visible");
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
    img.dataset.src = `https://corsproxy.io/?url=${encodeURIComponent(
      imageUrl
    )}`;
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

  function displayPostPreviews() {
    const postsToRender = fetchedPosts.slice(
      displayedPostCount,
      displayedPostCount + POSTS_PER_PREVIEW_PAGE
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
      loadMorePreviewsContainer.classList.remove("hidden");
    } else {
      loadMorePreviewsContainer.classList.add("hidden");
    }
  }

  function displayHistoryPosts(posts, container) {
    container.innerHTML = "";
    posts.forEach((post) => {
      const postElement = createPostPreviewElement(post);
      if (postElement) {
        container.appendChild(postElement);
        lazyLoadObserver.observe(postElement.querySelector(".lazy-load"));
      }
    });
  }

  function updateLivePreview(post) {
    const imageUrl = post.sample.has ? post.sample.url : post.preview.url;
    currentPreviewImage.classList.add("opacity-0");
    setTimeout(() => {
      currentPreviewImage.src = `https://corsproxy.io/?url=${encodeURIComponent(
        imageUrl
      )}`;
      currentPreviewId.textContent = `ID: ${post.id}`;
      currentPreviewImage.classList.remove("opacity-0");
    }, 100);
  }

  async function massFavorite() {
    const credentials = checkCredentials();
    if (!credentials) return;

    logDiv.innerHTML = "";
    logSection.classList.add("is-open");
    logMessage(`Starting to favorite ${fetchedPosts.length} posts...`);
    startFavoriteProcessBtn.disabled = true;
    progressContainer.classList.remove("hidden");
    livePreviewSection.classList.remove("hidden");
    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;
    let favoritedPosts = [];

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
      await new Promise((resolve) => setTimeout(resolve, 500)); // Rate limit
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

  function openFavModal() {
    if (typeof confirmActionCallback === "function") {
      confirmActionCallback();
    }
    const postsToFavorite = fetchedPosts.filter((p) => !p.is_favorited).length;
    favModalText.textContent = `You are about to favorite ${postsToFavorite} new posts from your search. This cannot be undone. Are you sure?`;
    favConfirmModal.classList.remove("pointer-events-none", "opacity-0");
    document.body.classList.add("modal-active");
  }

  function closeFavModal() {
    favConfirmModal.classList.add("pointer-events-none", "opacity-0");
    document.body.classList.remove("modal-active");
    confirmActionCallback = null;
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

  function openModal(title, text, onConfirm) {
    const modal = document.getElementById("confirmation-modal");
    modal.querySelector("#modal-text").textContent = text;
    confirmActionCallback = onConfirm;
    modal.classList.remove("pointer-events-none", "opacity-0");
    document.body.classList.add("modal-active");
  }

  loadBlacklist();
  initializeLazyLoader();

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

  postLimitSlider.addEventListener("input", (e) => {
    postLimitInput.value = e.target.value;
  });
  postLimitInput.addEventListener("input", (e) => {
    postLimitSlider.value = e.target.value;
  });

  animationController = initSimpleFadeButton({
    initialBtn: initialFetchBtn,
    subsequentControls: subsequentControls,
    fetchMoreBtn: fetchMoreBtn,
    clearPostsBtn: clearPostsBtn,
    onInitialFetch: () => fetchPosts(false),
    onFetchMore: () => fetchPosts(true),
    onClear: () => {
      openModal(
        "Clear Posts",
        "Are you sure you want to clear all fetched posts? This cannot be undone.",
        clearFetchedPosts
      );
    },
  });

  startFavoriteProcessBtn.addEventListener("click", () => {
    if (!checkCredentials()) return;
    if (fetchedPosts.length > 0) {
      openModal(
        "Confirm Mass Favorite",
        `You are about to favorite all ${fetchedPosts.length} fetched posts. This may take some time and cannot be undone.`,
        massFavorite
      );
    } else {
      logMessage("No posts to favorite. Please fetch posts first.", "error");
    }
  });

  loadMorePreviewsBtn.addEventListener("click", displayPostPreviews);

  favModalConfirmBtn.addEventListener("click", () => {
    if (typeof confirmActionCallback === "function") {
      confirmActionCallback();
    }
    closeFavModal();
  });
  favModalCloseBtn.addEventListener("click", closeFavModal);
  favModalCancelBtn.addEventListener("click", closeFavModal);
  favConfirmModal.addEventListener("click", (e) => {
    if (e.target === favConfirmModal) closeFavModal();
  });
  cancelCredsBtn.addEventListener("click", hideCredentialsModal);
};
