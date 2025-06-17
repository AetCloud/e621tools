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

  function loadCredentials() {
    const savedUsername = localStorage.getItem("e621Username");
    const savedApiKey = localStorage.getItem("e621ApiKey");

    if (savedUsername) {
      usernameInput.value = savedUsername;
    }
    if (savedApiKey) {
      apiKeyInput.value = savedApiKey;
    }
  }

  function saveCredentials() {
    localStorage.setItem("e621Username", usernameInput.value);
    localStorage.setItem("e621ApiKey", apiKeyInput.value);
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

  async function apiRequest(endpoint, options = {}) {
    const username = usernameInput.value;
    const apiKey = apiKeyInput.value;

    if (!username || !apiKey) {
      logMessage("Username and API Key are required.", "error");
      return null;
    }

    const headers = {
      "User-Agent": `Napps-e621-Tools/1.0 (by ${username} on e621)`,
      Authorization: "Basic " + btoa(`${username}:${apiKey}`),
    };

    const url = `https://e621.net/${endpoint}`;

    try {
      const { body, ...fetchOptions } = options;
      const response = await fetch(url, { ...fetchOptions, headers });

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
      if (
        response.status === 204 ||
        response.headers.get("content-length") === "0"
      ) {
        return { success: true };
      }
      return await response.json();
    } catch (error) {
      logMessage(`API Request Failed: ${error.message}`, "error");
      console.error("API Request Error:", error);
      return null;
    }
  }

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

  async function fetchPosts() {
    const tags = tagsInput.value.trim();
    if (!tags) {
      logMessage("Please enter tags to search for.", "error");
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
    logMessage(`Requesting with tags: ${fullTagString}`);

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
        "error"
      );
    }

    fetchPostsBtn.disabled = false;
    fetchPostsBtn.textContent = "Fetch Posts";
  }

  function displayPosts(posts, container) {
    container.innerHTML = "";
    posts.forEach((post) => {
      const imageUrl = post.sample.has ? post.sample.url : post.preview.url;
      if (!imageUrl) return;

      const itemDiv = document.createElement("div");
      itemDiv.className = "flex flex-col items-center";

      const img = document.createElement("img");
      img.src = imageUrl;
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

  async function massFavorite() {
    logMessage(`Starting to favorite ${fetchedPosts.length} posts...`);
    startFavoriteProcessBtn.disabled = true;
    progressContainer.classList.remove("hidden");

    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;
    let favoritedPosts = [];

    for (const [index, post] of fetchedPosts.entries()) {
      if (post.is_favorited) {
        logMessage(`Skipping post ${post.id}, already in favorites.`, "warn");
        skipCount++;
      } else {
        const endpoint = `favorites.json?post_id=${post.id}`;
        const result = await apiRequest(endpoint, {
          method: "POST",
        });

        if (result && (result.success || result.post_id)) {
          logMessage(`Favorited post ${post.id}.`);
          successCount++;
          favoritedPosts.push(post);
        } else {
          logMessage(`Failed to favorite post ${post.id}.`, "error");
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

    if (favoritedPosts.length > 0) {
      historySection.classList.remove("hidden");
      displayPosts(favoritedPosts, historyContainer);
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
  usernameInput.addEventListener("input", saveCredentials);
  apiKeyInput.addEventListener("input", saveCredentials);

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

  modalCloseBtn.addEventListener("click", closeModal);
  modalCancelBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
});
