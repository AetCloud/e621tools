import { apiRequest } from "./api.js";
import { Autocomplete } from "./autocomplete.js";
import {
  initSimpleFadeButton,
  fadeOutAndHide,
  logger,
  createPostPreview,
  initCollapsible,
} from "./utils.js";
import { setPosts } from "./post-cache.js";

export class BaseTool {
  constructor(config) {
    this.config = config;
    this.fetchedPosts = [];
    this.personalBlacklist = [];
    this.lastFetchedTags = "";
    this.currentPage = 1;
    this.displayedPostCount = 0;
    this.lazyLoadObserver = null;
    this.autocomplete = null;
    this.DEFAULT_BLACKLIST = [
      "guro",
      "scat",
      "vore",
      "watersports",
      "loli",
      "shota",
      "cub",
      "young",
    ];
    this.tagCategoryColors = {
      0: "#3b82f6",
      1: "#ec4899",
      3: "#a855f7",
      4: "#22c55e",
      5: "#eab308",
    };
    this.tagCategoryNames = {
      0: "General",
      1: "Artist",
      3: "Copyright",
      4: "Character",
      5: "Species",
    };

    this.getElements();
    this.init();
  }

  getElements() {
    this.tagsInput = document.getElementById("tags");
    this.postLimitInput = document.getElementById("post-limit-input");
    this.postLimitSlider = document.getElementById("post-limit-slider");
    this.blacklistInput = document.getElementById("blacklist-input");
    this.addBlacklistBtn = document.getElementById("add-blacklist-btn");
    this.blacklistTagsContainer = document.getElementById(
      "blacklist-tags-container"
    );
    this.useDefaultBlacklistCheckbox = document.getElementById(
      "useDefaultBlacklist"
    );
    this.initialFetchBtn = document.getElementById("fetchPostsBtn");
    this.subsequentControls = document.getElementById("subsequent-controls");
    this.fetchMoreBtn = document.getElementById("fetch-more-btn");
    this.clearPostsBtn = document.getElementById("clear-posts-btn");
    this.fetchedCountContainer = document.getElementById(
      "fetched-count-container"
    );
    this.fetchedCountEl = document.getElementById("fetched-count");
    this.actionButtonContainer = document.getElementById(
      "action-button-container"
    );
    this.startActionBtn = document.getElementById("start-action-btn");
    this.logSection = document.getElementById("log-section");
    this.logDiv = document.getElementById("log");
    this.postsContainer = document.getElementById("postsContainer");
    this.previewsSection = document.getElementById("previews-section");
    this.progressContainer = document.getElementById("progress-container");
    this.progressBar = document.getElementById("progress-bar");
    this.loadMorePreviewsContainer = document.getElementById(
      "load-more-previews-container"
    );
    this.loadMorePreviewsBtn = document.getElementById("loadMorePreviewsBtn");
    this.loadingModal = document.getElementById("loading-modal");
    this.advancedOptionsDetails = document.getElementById("advanced-options-details");
  }

  init() {
    this.loadBlacklist();
    this.initializeLazyLoader();
    this.attachEventListeners();
  }

  logMessage(message, level = "info") {
    const p = document.createElement("p");
    p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    const colorClasses = {
      error: "text-red-400",
      warn: "text-yellow-400",
      info: "text-gray-300",
    };
    p.className = colorClasses[level] || colorClasses.info;
    this.logDiv.appendChild(p);
    this.logDiv.scrollTop = this.logDiv.scrollHeight;
  }

  updateProgress(percentage, text = null) {
    const pct = Math.round(percentage);
    this.progressBar.style.width = `${pct}%`;
    this.progressBar.textContent = text ? text : `${pct}%`;
  }

  checkCredentials() {
    const username = localStorage.getItem("e621Username");
    const apiKey = localStorage.getItem("e621ApiKey");
    if (!username || !apiKey) {
      window.dispatchEvent(
        new CustomEvent("show-modal", {
          detail: { modalId: "credentials-modal" },
        })
      );
      return false;
    }
    return { username, apiKey };
  }

  loadBlacklist() {
    const savedBlacklist = localStorage.getItem("e621PersonalBlacklist");
    if (savedBlacklist) {
      this.personalBlacklist = JSON.parse(savedBlacklist);
      this.renderBlacklistTags();
    }
  }

  saveBlacklist() {
    localStorage.setItem(
      "e621PersonalBlacklist",
      JSON.stringify(this.personalBlacklist)
    );
  }

  renderBlacklistTags() {
    this.blacklistTagsContainer.innerHTML = "";
    this.personalBlacklist.forEach((tag) => {
      const tagPill = document.createElement("span");
      tagPill.className =
        "inline-flex items-center px-2 py-1 bg-gray-600 text-sm font-medium text-gray-100 rounded-full";
      tagPill.innerHTML = `${tag} <button data-tag-to-remove="${tag}" class="remove-blacklist-tag ml-1.5 inline-flex-shrink-0 h-4 w-4 rounded-full items-center justify-center text-gray-400 hover:bg-gray-500 hover:text-gray-200 focus:outline-none"><svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8"><path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" /></svg></button>`;
      this.blacklistTagsContainer.appendChild(tagPill);
    });
  }

  addBlacklistTag() {
    const tagToAdd = this.blacklistInput.value.trim();
    if (tagToAdd && !this.personalBlacklist.includes(tagToAdd)) {
      this.personalBlacklist.push(tagToAdd);
      this.blacklistInput.value = "";
      this.saveBlacklist();
      this.renderBlacklistTags();
    }
  }

  removeBlacklistTag(tagToRemove) {
    this.personalBlacklist = this.personalBlacklist.filter(
      (tag) => tag !== tagToRemove
    );
    this.saveBlacklist();
    this.renderBlacklistTags();
  }

  buildTagString() {
    let finalTags = this.tagsInput.value.trim();
    const activeBlacklist = this.useDefaultBlacklistCheckbox.checked
      ? [...new Set([...this.DEFAULT_BLACKLIST, ...this.personalBlacklist])]
      : this.personalBlacklist;
    document
      .querySelectorAll(".rating-cb:not(:checked)")
      .forEach((cb) => (finalTags += ` -rating:${cb.dataset.rating}`));
    document
      .querySelectorAll(".filetype-cb:not(:checked)")
      .forEach((cb) =>
        cb.dataset.filetype
          .split(",")
          .forEach((ext) => (finalTags += ` -filetype:${ext}`))
      );
    activeBlacklist.forEach(
      (tag) =>
        (finalTags +=
          tag.includes(" ") || tag.startsWith("-") ? ` ${tag}` : ` -${tag}`)
    );
    return finalTags.trim();
  }

  updateFetchedCount() {
    this.fetchedCountEl.textContent = `Fetched ${this.fetchedPosts.length} posts.`;
    this.fetchedCountContainer.classList.toggle(
      "hidden",
      this.fetchedPosts.length === 0
    );
  }

  displayPostPreviews() {
    const postsToRender = this.fetchedPosts.slice(
      this.displayedPostCount,
      this.displayedPostCount + 24
    );
    postsToRender.forEach((post) => {
      const postElement = createPostPreview(post);
      if (postElement) {
        this.postsContainer.appendChild(postElement);
        this.lazyLoadObserver.observe(
          postElement.querySelector(".preview-image")
        );
      }
    });
    this.displayedPostCount += postsToRender.length;
    this.loadMorePreviewsContainer.classList.toggle(
      "hidden",
      this.displayedPostCount >= this.fetchedPosts.length
    );
  }

  initializeLazyLoader() {
    this.lazyLoadObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add("loaded");
          observer.unobserve(img);
        }
      });
    });
  }

  async clearFetchedPosts() {
    await fadeOutAndHide(this.previewsSection);
    this.fetchedPosts = [];
    this.postsContainer.innerHTML = "";
    this.displayedPostCount = 0;
    this.currentPage = 1;
    this.lastFetchedTags = "";
    this.updateFetchedCount();
    this.logDiv.innerHTML = "";
    this.loadMorePreviewsContainer.classList.add("hidden");
    this.logSection.classList.add("is-open");
    this.logMessage("Cleared all fetched posts.");
    this.animationController.showInitial();
  }

  async fetchPosts(isFetchingMore = false) {
    if (this.autocomplete) this.autocomplete.cancel();

    const credentials = this.checkCredentials();
    if (!credentials) return;

    const currentTags = this.buildTagString();
    if (!currentTags) {
      this.logMessage("Please enter tags to search for.", "error");
      return;
    }

    this.loadingModal.classList.add("visible");
    if (this.lastFetchedTags !== currentTags && isFetchingMore) {
      this.logMessage("Tags have changed. Please start a new fetch.", "warn");
      this.loadingModal.classList.remove("visible");
      return;
    }

    if (!isFetchingMore) {
      this.fetchedPosts = [];
      this.postsContainer.innerHTML = "";
      this.displayedPostCount = 0;
      this.currentPage = 1;
    }

    this.lastFetchedTags = currentTags;
    const postLimit = parseInt(this.postLimitInput.value, 10) || 50;

    const buttonToUpdate = isFetchingMore
      ? this.fetchMoreBtn
      : this.initialFetchBtn;
    buttonToUpdate.disabled = true;

    if (!isFetchingMore) {
      this.logDiv.innerHTML = "";
      this.logSection.classList.add("is-open");
    }
    this.logMessage(`Fetching page ${this.currentPage}...`);

    const data = await apiRequest(
      `posts.json?tags=${encodeURIComponent(currentTags)}&limit=${postLimit}`,
      credentials
    );

    if (data.success === false) {
      this.logMessage(data.error, "error");
    } else if (data && data.posts && data.posts.length > 0) {
      const newPosts = data.posts.filter(
        (p) => !this.fetchedPosts.some((fp) => fp.id === p.id)
      );
      this.fetchedPosts.push(...newPosts);
      
      logger.log("[BaseTool] Caching newly fetched posts:", newPosts);
      setPosts(newPosts);

      this.logMessage(
        `Fetched ${newPosts.length} new posts. Total: ${this.fetchedPosts.length}.`
      );
      this.currentPage++;
      this.previewsSection.classList.remove("hidden");
      this.displayPostPreviews();
      this.updateFetchedCount();
      if (!isFetchingMore) this.animationController.showSubsequent();
    } else {
      this.logMessage("No more posts found for the given criteria.", "warn");
    }

    buttonToUpdate.disabled = false;
    this.loadingModal.classList.remove("visible");
  }

  attachEventListeners() {
    this.animationController = initSimpleFadeButton({
      initialBtn: this.initialFetchBtn,
      subsequentControls: this.subsequentControls,
    });
    
    if (this.advancedOptionsDetails) {
        initCollapsible(this.advancedOptionsDetails);
    }

    this.initialFetchBtn.addEventListener("click", () =>
      this.fetchPosts(false)
    );
    this.fetchMoreBtn.addEventListener("click", () => this.fetchPosts(true));
    this.clearPostsBtn.addEventListener("click", () => {
      window.dispatchEvent(
        new CustomEvent("show-modal", {
          detail: {
            modalId: "confirmation-modal",
            text: "Are you sure you want to clear all fetched posts? This cannot be undone.",
            onConfirm: () => this.clearFetchedPosts(),
          },
        })
      );
    });

    this.startActionBtn.addEventListener("click", () => {
      if (!this.checkCredentials()) return;
      if (this.fetchedPosts.length > 0) {
        window.dispatchEvent(
          new CustomEvent("show-modal", {
            detail: {
              modalId: "confirmation-modal",
              text: this.config.actionConfirmationText(this.fetchedPosts),
              onConfirm: () =>
                this.config.startAction({
                  posts: this.fetchedPosts,
                  credentials: this.checkCredentials(),
                  log: (msg, lvl) => this.logMessage(msg, lvl),
                  updateProgress: (pct, txt) => this.updateProgress(pct, txt),
                  button: this.startActionBtn,
                }),
            },
          })
        );
      } else {
        this.logMessage(
          "No posts to process. Please fetch posts first.",
          "error"
        );
      }
    });

    this.autocomplete = new Autocomplete(
      this.tagsInput,
      async (query) => {
        const currentTags = query.split(" ");
        const lastTag = currentTags[currentTags.length - 1];
        if (!lastTag || lastTag.startsWith("-") || lastTag.includes(":"))
          return [];

        const data = await apiRequest(
          `tags/autocomplete.json?search[name_matches]=${lastTag}`
        );
        return data.map((suggestion) => ({
          ...suggestion,
          name: [...currentTags.slice(0, -1), suggestion.name].join(" "),
        }));
      },
      this.tagCategoryColors,
      this.tagCategoryNames
    );

    this.addBlacklistBtn.addEventListener("click", () =>
      this.addBlacklistTag()
    );
    this.blacklistInput.addEventListener(
      "keydown",
      (e) => e.key === "Enter" && (e.preventDefault(), this.addBlacklistTag())
    );
    this.tagsInput.addEventListener(
      "keydown",
      (e) => e.key === "Enter" && (e.preventDefault(), this.fetchPosts(false))
    );
    this.blacklistTagsContainer.addEventListener("click", (e) => {
      const removeButton = e.target.closest(".remove-blacklist-tag");
      if (removeButton)
        this.removeBlacklistTag(removeButton.dataset.tagToRemove);
    });

    this.postLimitSlider.addEventListener(
      "input",
      (e) => (this.postLimitInput.value = e.target.value)
    );
    this.postLimitInput.addEventListener(
      "input",
      (e) => (this.postLimitSlider.value = e.target.value)
    );
    this.loadMorePreviewsBtn.addEventListener("click", () =>
      this.displayPostPreviews()
    );
  }
}