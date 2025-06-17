document.addEventListener("DOMContentLoaded", () => {
  const usernameInput = document.getElementById("username");
  const apiKeyInput = document.getElementById("apiKey");
  const tagsInput = document.getElementById("tags");
  const blacklistInput = document.getElementById("blacklist");
  const useDefaultBlacklistCheckbox = document.getElementById(
    "useDefaultBlacklist"
  );

  const fetchPostsBtn = document.getElementById("fetchPosts");
  const startFavoriteProcessBtn = document.getElementById(
    "startFavoriteProcess"
  );

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

  const modal = document.getElementById("confirmation-modal");
  const modalText = document.getElementById("modal-text");
  const modalCloseBtn = document.getElementById("modal-close");
  const modalCancelBtn = document.getElementById("modal-cancel");
  const modalConfirmBtn = document.getElementById("modal-confirm");

  let fetchedPosts = [];
  const DEFAULT_BLACKLIST = ["loli", "shota", "cub"];

  /**
   * Appends a message to the log container.
   * @param {string} message - The message to log.
   * @param {boolean} [isError=false] - If true, the message will be styled as an error.
   */
  function logMessage(message, isError = false) {
    const p = document.createElement("p");
    p.textContent = message;
    p.className = isError ? "text-red-400" : "text-gray-300";
    logDiv.appendChild(p);
    logDiv.scrollTop = logDiv.scrollHeight;
  }

  /**
   * Updates the progress bar's width.
   * @param {number} percentage - The percentage to set the progress bar to (0-100).
   */
  function updateProgress(percentage) {
    progressBar.style.width = `${percentage}%`;
  }

  /**
   * Performs a request to the e621 API.
   * @param {string} endpoint - The API endpoint to hit (e.g., 'posts.json').
   * @param {object} [options={}] - The options for the fetch request.
   * @returns {Promise<object|null>} - The JSON response from the API, or null if an error occurred.
   */
  async function apiRequest(endpoint, options = {}) {
    const username = usernameInput.value;
    const apiKey = apiKeyInput.value;

    if (!username || !apiKey) {
      logMessage("Username and API Key are required.", true);
      return null;
    }

    const headers = {
      "User-Agent": `Napps-e621-Tools/1.0 (by ${username} on e621)`,
      Authorization: "Basic " + btoa(`${username}:${apiKey}`),
    };

    if (options.method === "POST") {
      headers["Content-Type"] = "application/json";
    }

    const url = `https://e621.net/${endpoint}`;

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Could not parse error response." }));
        throw new Error(
          `HTTP error! Status: ${response.status}, Message: ${
            errorData.message || "Unknown error."
          }`
        );
      }
      if (response.status === 204) return { success: true };
      return await response.json();
    } catch (error) {
      logMessage(`API Request Failed: ${error.message}`, true);
      return null;
    }
  }

  /**
   * Builds the final tag string including blacklisted tags.
   * @returns {string} The complete tag string for the API request.
   */
  function buildTagString() {
    let finalTags = tagsInput.value.trim();

    const personalBlacklist = blacklistInput.value
      .trim()
      .split(" ")
      .filter((tag) => tag);
    const activeBlacklist = useDefaultBlacklistCheckbox.checked
      ? [...new Set([...DEFAULT_BLACKLIST, ...personalBlacklist])]
      : personalBlacklist;

    activeBlacklist.forEach((tag) => {
      finalTags += ` -${tag}`;
    });

    return finalTags;
  }

  /**
   * Fetches posts from the API based on the user's tags and blacklists.
   */
  async function fetchPosts() {
    const tags = tagsInput.value.trim();
    if (!tags) {
      logMessage("Please enter tags to search for.", true);
      return;
    }

    logMessage("Fetching posts...");
    fetchPostsBtn.disabled = true;
    fetchPostsBtn.textContent = "Fetching...";
    postsContainer.innerHTML = "";
    fetchedPosts = [];
    actionButtonContainer.classList.add("hidden");
    previewsSection.classList.add("hidden");
    progressContainer.classList.add("hidden");
    updateProgress(0);

    const fullTagString = buildTagString();
    logMessage(`Requesting with tags: ${fullTagString}`, false);

    const data = await apiRequest(
      `posts.json?tags=${encodeURIComponent(fullTagString)}&limit=320`
    );

    if (data && data.posts && data.posts.length > 0) {
      fetchedPosts = data.posts;
      logMessage(`Successfully fetched ${fetchedPosts.length} posts.`);
      actionButtonContainer.classList.remove("hidden");
      previewsSection.classList.remove("hidden");
      displayPosts(fetchedPosts, postsContainer);
    } else {
      logMessage(
        "Failed to fetch posts or no posts were found for those tags and blacklists.",
        true
      );
    }

    fetchPostsBtn.disabled = false;
    fetchPostsBtn.textContent = "Fetch Posts";
  }

  /**
   * Displays thumbnails for a list of posts in a given container.
   * @param {Array} posts - The array of post objects to display.
   * @param {HTMLElement} container - The container element to append the images to.
   */
  function displayPosts(posts, container) {
    container.innerHTML = "";
    posts.forEach((post) => {
      if (!post.preview.url) return;

      const itemDiv = document.createElement("div");
      itemDiv.className = "flex flex-col items-center";

      const img = document.createElement("img");
      img.src = post.preview.url;
      img.alt = `Post ${post.id}`;
      img.title = `Post ID: ${post.id}\nTags: ${post.tags.general.join(" ")}`;
      img.className =
        "w-full h-auto object-cover bg-gray-700 rounded-lg shadow-lg";
      img.onerror = () => {
        img.src = "https://placehold.co/150x150/000000/FFFFFF?text=Error";
      };

      const idText = document.createElement("p");
      idText.className = "text-xs text-gray-400 mt-1";
      idText.textContent = `ID: ${post.id}`;

      itemDiv.appendChild(img);
      itemDiv.appendChild(idText);
      container.appendChild(itemDiv);
    });
  }

  /**
   * Iterates through the fetched posts and favorites each one.
   */
  async function massFavorite() {
    logMessage(`Starting to favorite ${fetchedPosts.length} posts...`);
    startFavoriteProcessBtn.disabled = true;
    progressContainer.classList.remove("hidden");

    let successCount = 0;
    let failCount = 0;
    let favoritedPosts = [];

    for (const [index, post] of fetchedPosts.entries()) {
      const result = await apiRequest("favorites.json", {
        method: "POST",
        body: JSON.stringify({ post_id: post.id }),
      });

      if (result && (result.success || result.post_id)) {
        logMessage(
          `Favorited post ${post.id}. (${index + 1}/${fetchedPosts.length})`
        );
        successCount++;
        favoritedPosts.push(post);
      } else {
        logMessage(
          `Failed to favorite post ${post.id}. It might already be in your favorites.`,
          true
        );
        failCount++;
      }

      updateProgress(((index + 1) / fetchedPosts.length) * 100);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    logMessage(
      `Finished. Successfully favorited: ${successCount}. Failed: ${failCount}.`
    );
    startFavoriteProcessBtn.disabled = false;

    if (favoritedPosts.length > 0) {
      historySection.classList.remove("hidden");
      displayPosts(favoritedPosts, historyContainer);
    }
  }

  function openModal() {
    modalText.textContent = `You are about to favorite ${fetchedPosts.length} posts with the tags "${tagsInput.value}". Are you sure?`;
    modal.classList.remove("pointer-events-none", "opacity-0");
    document.body.classList.add("modal-active");
  }

  function closeModal() {
    modal.classList.add("pointer-events-none", "opacity-0");
    document.body.classList.remove("modal-active");
  }

  modalConfirmBtn.addEventListener("click", () => {
    closeModal();
    massFavorite();
  });

  fetchPostsBtn.addEventListener("click", fetchPosts);
  startFavoriteProcessBtn.addEventListener("click", () => {
    if (fetchedPosts.length > 0) {
      openModal();
    } else {
      logMessage("No posts to favorite. Please fetch posts first.", true);
    }
  });

  modalCloseBtn.addEventListener("click", closeModal);
  modalCancelBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
});
