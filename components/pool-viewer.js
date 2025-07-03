import { apiRequest } from "../lib/api.js";

export const render = () => {
  return `
    <div class="container mx-auto p-4 md:p-8">
        <div class="mb-8">
            <a href="#/" data-link class="text-cyan-400 hover:text-cyan-300">&larr; Back to the hub</a>
        </div>

        <div class="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl">
            <h1 class="text-3xl md:text-4xl font-bold mb-2 text-cyan-400">Pool Viewer</h1>
            <p class="text-gray-400 mb-6">Browse and view image pools and comics.</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label for="username" class="block text-sm font-medium text-gray-300 mb-2">Username (for favoriting/voting)</label>
                    <input type="text" id="username" class="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" placeholder="Your e621 username">
                </div>
                <div>
                    <label for="apiKey" class="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                    <input type="password" id="apiKey" class="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" placeholder="Your e621 API key">
                </div>
            </div>

            <div>
                <label for="pool-search" class="block text-sm font-medium text-gray-300 mb-2">Search Pools (by name or ID)</label>
                <input type="text" id="pool-search" class="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" placeholder="e.g., my_little_pony, or id:12345">
            </div>

            <div id="pools-list-container" class="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"></div>
            <div id="pools-pagination" class="flex justify-center items-center gap-4 mt-6"></div>
        </div>
    </div>

    <div id="viewer-modal" class="hidden fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
        <button id="close-viewer-btn" class="absolute top-4 right-4 text-white text-4xl hover:text-cyan-400">&times;</button>
        
        <div id="thumbnail-grid-view" class="w-full h-full p-8 overflow-y-auto">
            <h2 id="thumbnail-grid-title" class="text-2xl text-white text-center mb-4"></h2>
            <div id="thumbnail-grid-content" class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4"></div>
        </div>

        <div id="image-viewer-view" class="hidden w-full h-full flex items-center justify-center relative">
            <button id="prev-image-btn" class="absolute left-4 text-white text-5xl hover:text-cyan-400 hidden md:block">&#x2039;</button>
            <img id="full-image" class="max-w-[90vw] max-h-[85vh] object-contain" src="">
            <button id="next-image-btn" class="absolute right-4 text-white text-5xl hover:text-cyan-400 hidden md:block">&#x203A;</button>

            <div class="absolute bottom-4 bg-black/50 p-2 rounded-lg flex gap-4 text-white md:hidden">
                <button id="mobile-prev-btn" class="p-2">&#x2039; Prev</button>
                <button id="mobile-fav-btn" class="p-2">&#x2661; Fav</button>
                <button id="mobile-up-btn" class="p-2">&uarr; Up</button>
                <button id="mobile-down-btn" class="p-2">&darr; Down</button>
                <button id="mobile-next-btn" class="p-2">Next &#x203A;</button>
            </div>

            <div class="absolute top-4 left-4 bg-black/50 p-2 rounded-lg">
                <label for="scroll-direction" class="text-sm text-white">Scroll Direction:</label>
                <select id="scroll-direction" class="bg-gray-700 text-white rounded p-1 text-sm">
                    <option value="horizontal">Horizontal (A/D, Arrows, Swipe)</option>
                    <option value="vertical">Vertical (W/S, Arrows, Swipe)</option>
                </select>
            </div>
        </div>
    </div>
    `;
};

export const afterRender = () => {
  console.log("Pool Viewer: afterRender started.");
  const usernameInput = document.getElementById("username");
  const apiKeyInput = document.getElementById("apiKey");
  const searchInput = document.getElementById("pool-search");
  const poolsContainer = document.getElementById("pools-list-container");
  const paginationContainer = document.getElementById("pools-pagination");
  const viewerModal = document.getElementById("viewer-modal");
  const closeViewerBtn = document.getElementById("close-viewer-btn");
  const thumbnailGridView = document.getElementById("thumbnail-grid-view");
  const thumbnailGridContent = document.getElementById(
    "thumbnail-grid-content"
  );
  const thumbnailGridTitle = document.getElementById("thumbnail-grid-title");
  const imageViewer = document.getElementById("image-viewer-view");
  const fullImage = document.getElementById("full-image");
  const prevBtn = document.getElementById("prev-image-btn");
  const nextBtn = document.getElementById("next-image-btn");
  const mobilePrevBtn = document.getElementById("mobile-prev-btn");
  const mobileNextBtn = document.getElementById("mobile-next-btn");
  const mobileFavBtn = document.getElementById("mobile-fav-btn");
  const mobileUpBtn = document.getElementById("mobile-up-btn");
  const mobileDownBtn = document.getElementById("mobile-down-btn");
  const scrollDirectionSelect = document.getElementById("scroll-direction");

  let currentPage = 1;
  let currentPool = null;
  let currentPostIndex = 0;
  let touchStartX = 0;
  let touchStartY = 0;

  function loadCredentials() {
    const savedUsername = localStorage.getItem("e621Username");
    const savedApiKey = localStorage.getItem("e621ApiKey");
    if (savedUsername) usernameInput.value = savedUsername;
    if (savedApiKey) apiKeyInput.value = savedApiKey;
  }

  async function fetchPools(page = 1, query = "") {
    console.log(
      `Pool Viewer: Fetching pools. Page: ${page}, Query: "${query}"`
    );
    poolsContainer.innerHTML =
      '<p class="text-center col-span-full">Loading pools...</p>';
    const credentials = {
      username: usernameInput.value,
      apiKey: apiKeyInput.value,
    };
    const searchQuery = query ? `search[name_matches]=*${query}*` : "";
    const poolListData = await apiRequest(
      `pools.json?${searchQuery}&page=${page}&limit=12`,
      credentials
    );

    console.log("Pool Viewer: Received pool list data:", poolListData);
    poolsContainer.innerHTML = "";
    if (poolListData && poolListData.length > 0) {
      for (const pool of poolListData) {
        const card = document.createElement("div");
        card.className =
          "bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 flex flex-col";
        card.dataset.poolId = pool.id;

        const thumbContainer = document.createElement("div");
        thumbContainer.className =
          "w-full h-40 bg-gray-800 rounded mb-3 flex items-center justify-center";
        thumbContainer.innerHTML = `<span class="text-gray-500 text-sm">Loading...</span>`;

        const textContainer = document.createElement("div");
        textContainer.innerHTML = `
                    <h3 class="font-bold truncate">${pool.name.replace(
                      /_/g,
                      " "
                    )}</h3>
                    <p class="text-sm text-gray-400">ID: ${pool.id} &bull; ${
          pool.post_count
        } posts</p>
                    <p class="text-sm text-gray-400 truncate artists-placeholder">Fetching artists...</p>
                `;

        card.appendChild(thumbContainer);
        card.appendChild(textContainer);
        poolsContainer.appendChild(card);

        loadPoolDetails(pool.id, card);
      }
    } else {
      console.warn("Pool Viewer: No pools found for the current query.");
      poolsContainer.innerHTML =
        '<p class="text-center col-span-full">No pools found.</p>';
    }
    updatePagination(page, poolListData ? poolListData.length === 12 : false);
  }

  async function loadPoolDetails(poolId, cardElement) {
    console.log(`Pool Viewer: Loading details for pool ID: ${poolId}`);
    const credentials = {
      username: usernameInput.value,
      apiKey: apiKeyInput.value,
    };
    const poolData = await apiRequest(`pools/${poolId}.json`, credentials);

    if (poolData && poolData.posts && poolData.posts.length > 0) {
      const firstPost = poolData.posts[0];
      const thumbContainer = cardElement.querySelector(".w-full.h-40");
      const artistsPlaceholder = cardElement.querySelector(
        ".artists-placeholder"
      );

      const artists = [
        ...new Set(poolData.posts.flatMap((p) => p.tags.artist)),
      ];
      let artistText = "Various Artists";
      if (artists.length > 0 && artists.length <= 3)
        artistText = artists.join(", ");
      else if (artists.length > 3)
        artistText = `${artists.slice(0, 3).join(", ")}, etc.`;
      artistsPlaceholder.textContent = artistText;

      if (firstPost.preview.url) {
        const img = document.createElement("img");
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(
          firstPost.preview.url
        )}`;
        img.src = proxyUrl;
        img.className =
          "w-full h-full object-cover rounded opacity-0 transition-opacity duration-500";
        img.onload = () => {
          img.classList.remove("opacity-0");
        };
        thumbContainer.innerHTML = "";
        thumbContainer.appendChild(img);
      } else {
        thumbContainer.innerHTML = `<span class="text-gray-500 text-sm">No Preview</span>`;
      }
    } else {
      console.error(`Failed to load details for pool ${poolId}`, poolData);
      const artistsPlaceholder = cardElement.querySelector(
        ".artists-placeholder"
      );
      artistsPlaceholder.textContent = "Failed to load details.";
    }
  }

  function updatePagination(page, hasNextPage) {
    paginationContainer.innerHTML = `
            <button id="prev-page-btn" class="p-2 ${
              page === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-600"
            }" ${page === 1 ? "disabled" : ""}>&larr; Prev</button>
            <span class="text-white">Page ${page}</span>
            <button id="next-page-btn" class="p-2 ${
              !hasNextPage
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-600"
            }" ${!hasNextPage ? "disabled" : ""}>Next &rarr;</button>
        `;
  }

  async function openPoolViewer(poolId) {
    console.log(`Pool Viewer: Opening viewer for pool ID: ${poolId}`);
    thumbnailGridContent.innerHTML =
      '<p class="text-center col-span-full text-white">Loading pool images...</p>';
    viewerModal.classList.remove("hidden");
    imageViewer.classList.add("hidden");
    thumbnailGridView.classList.remove("hidden");

    const credentials = {
      username: usernameInput.value,
      apiKey: apiKeyInput.value,
    };
    const data = await apiRequest(`pools/${poolId}.json`, credentials);
    if (data && data.posts) {
      currentPool = data;
      console.log("Pool Viewer: Loaded current pool data:", currentPool);
      thumbnailGridTitle.textContent = `Select an image from "${currentPool.name.replace(
        /_/g,
        " "
      )}"`;
      thumbnailGridContent.innerHTML = "";
      currentPool.posts.forEach((post, index) => {
        const thumb = document.createElement("img");
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(
          post.preview.url
        )}`;
        thumb.src = proxyUrl;
        thumb.className =
          "w-full h-auto object-cover rounded cursor-pointer hover:opacity-75";
        thumb.dataset.index = index;
        thumbnailGridContent.appendChild(thumb);
      });
    }
  }

  function showImageViewer(startIndex) {
    console.log(
      `Pool Viewer: Showing image viewer starting at index: ${startIndex}`
    );
    currentPostIndex = startIndex;
    thumbnailGridView.classList.add("hidden");
    imageViewer.classList.remove("hidden");
    updateImageView();
    addViewerEventListeners();
  }

  function updateImageView() {
    if (!currentPool) return;
    const post = currentPool.posts[currentPostIndex];
    console.log(
      `Pool Viewer: Displaying image index ${currentPostIndex}, post ID ${post.id}`
    );
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(
      post.file.url
    )}`;
    fullImage.src = proxyUrl;
  }

  function navigateImage(direction) {
    if (!currentPool) return;
    const newIndex = currentPostIndex + direction;
    console.log(
      `Pool Viewer: Navigating image by ${direction}. Old index: ${currentPostIndex}, New index: ${newIndex}`
    );
    currentPostIndex += direction;
    if (currentPostIndex < 0) currentPostIndex = currentPool.posts.length - 1;
    if (currentPostIndex >= currentPool.posts.length) currentPostIndex = 0;
    updateImageView();
  }

  async function voteOnPost(score) {
    if (!currentPool || !usernameInput.value || !apiKeyInput.value) return;
    const post = currentPool.posts[currentPostIndex];
    console.log(`Pool Viewer: Voting on post ${post.id} with score ${score}`);
    const credentials = {
      username: usernameInput.value,
      apiKey: apiKeyInput.value,
    };
    await apiRequest(`posts/${post.id}/votes.json`, credentials, {
      method: "POST",
      body: JSON.stringify({ score: score }),
    });
  }

  async function favoritePost() {
    if (!currentPool || !usernameInput.value || !apiKeyInput.value) return;
    const post = currentPool.posts[currentPostIndex];
    console.log(`Pool Viewer: Favoriting post ${post.id}`);
    const credentials = {
      username: usernameInput.value,
      apiKey: apiKeyInput.value,
    };
    await apiRequest(`favorites.json?post_id=${post.id}`, credentials, {
      method: "POST",
    });
  }

  const handleKeyDown = (e) => {
    const scrollDir = scrollDirectionSelect.value;
    switch (e.key) {
      case "ArrowLeft":
      case "a":
        if (scrollDir === "horizontal") navigateImage(-1);
        break;
      case "ArrowRight":
      case "d":
        if (scrollDir === "horizontal") navigateImage(1);
        break;
      case "ArrowUp":
      case "w":
        scrollDir === "vertical" ? navigateImage(-1) : voteOnPost(1);
        break;
      case "ArrowDown":
      case "s":
        scrollDir === "vertical" ? navigateImage(1) : voteOnPost(-1);
        break;
      case "f":
        favoritePost();
        break;
    }
  };

  const handleTouchStart = (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const scrollDir = scrollDirectionSelect.value;

    if (scrollDir === "horizontal" && Math.abs(deltaX) > 50) {
      navigateImage(deltaX > 0 ? -1 : 1);
    } else if (scrollDir === "vertical" && Math.abs(deltaY) > 50) {
      navigateImage(deltaY > 0 ? -1 : 1);
    }
  };

  function addViewerEventListeners() {
    console.log("Pool Viewer: Adding keydown and touch event listeners.");
    document.addEventListener("keydown", handleKeyDown);
    imageViewer.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    imageViewer.addEventListener("touchend", handleTouchEnd, { passive: true });
  }

  function removeViewerEventListeners() {
    console.log("Pool Viewer: Removing keydown and touch event listeners.");
    document.removeEventListener("keydown", handleKeyDown);
    imageViewer.removeEventListener("touchstart", handleTouchStart);
    imageViewer.removeEventListener("touchend", handleTouchEnd);
  }

  closeViewerBtn.addEventListener("click", () => {
    console.log("Pool Viewer: Closing viewer modal.");
    viewerModal.classList.add("hidden");
    removeViewerEventListeners();
    currentPool = null;
  });

  poolsContainer.addEventListener("click", (e) => {
    const card = e.target.closest("[data-pool-id]");
    if (card) openPoolViewer(card.dataset.poolId);
  });

  thumbnailGridContent.addEventListener("click", (e) => {
    if (e.target.tagName === "IMG") {
      showImageViewer(parseInt(e.target.dataset.index, 10));
    }
  });

  paginationContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn || btn.disabled) return;
    if (btn.id === "prev-page-btn") {
      currentPage--;
      fetchPools(currentPage, searchInput.value);
    } else if (btn.id === "next-page-btn") {
      currentPage++;
      fetchPools(currentPage, searchInput.value);
    }
  });

  let searchTimeout;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentPage = 1;
      fetchPools(currentPage, searchInput.value);
    }, 500);
  });

  prevBtn.addEventListener("click", () => navigateImage(-1));
  nextBtn.addEventListener("click", () => navigateImage(1));
  mobilePrevBtn.addEventListener("click", () => navigateImage(-1));
  mobileNextBtn.addEventListener("click", () => navigateImage(1));
  mobileFavBtn.addEventListener("click", favoritePost);
  mobileUpBtn.addEventListener("click", () => voteOnPost(1));
  mobileDownBtn.addEventListener("click", () => voteOnPost(-1));

  loadCredentials();
  fetchPools();
};
