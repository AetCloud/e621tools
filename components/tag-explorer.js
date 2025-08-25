import { apiRequest } from "../lib/api.js";
import {
  staggeredFadeIn,
  parseDtext,
  createPostPreview,
  createTagButton,
} from "../lib/utils.js";
import { Autocomplete } from "../lib/autocomplete.js";

export const render = () => {
  return `
    <div class="page-container anim-fade-in-up">
        <div class="mb-8">
            <a href="#/" data-link class="bg-gray-700 text-cyan-400 font-bold py-2 px-4 rounded-lg inline-flex items-center">&larr; Back to the hub</a>
        </div>

        <div class="content-box">
            <h1 class="text-3xl md:text-4xl font-bold mb-2 text-center text-cyan-400">Tag Explorer</h1>
            <p class="text-gray-400 mb-6 text-center">Analyze tag relationships and discover related content.</p>

            <div class="w-full max-w-xl mx-auto">
                <div class="relative">
                    <label for="tag-search" class="block text-sm font-medium text-gray-300 mb-2 text-center">Enter a Tag to Explore</label>
                    <div class="flex">
                        <input type="text" id="tag-search" class="w-full bg-gray-700 border-gray-600 rounded-l-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none text-center text-lg" placeholder="e.g., canine_female" autocomplete="off">
                        <button id="search-btn" class="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-r-lg">Search</button>
                    </div>
                </div>
                <div class="text-center mt-4">
                    <button id="random-tag-btn" class="pagination-btn">I'm Feeling Lucky</button>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div class="content-box">
                <h2 class="text-2xl font-bold text-cyan-400 mb-4">Recent Searches</h2>
                <div id="recent-tags-box" class="flex flex-col gap-2"></div>
            </div>
            <div class="md:col-span-2 content-box">
                <h2 class="text-2xl font-bold text-cyan-400 mb-4">Browse by Category</h2>
                <div id="category-tags-box" class="flex flex-wrap gap-2"></div>
            </div>
        </div>

        <div id="results-container" class="mt-8 hidden">
            <div id="tag-info-box" class="content-box mb-8"></div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-1">
                    <div class="content-box h-full">
                        <h2 class="text-2xl font-bold text-cyan-400 mb-4">Tag Relationships</h2>
                        <div id="tag-relationships-box"></div>
                    </div>
                </div>
                <div class="lg:col-span-2">
                     <div class="content-box h-full">
                        <h2 class="text-2xl font-bold text-cyan-400 mb-4">Recent Posts</h2>
                        <div id="posts-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
};

export const afterRender = () => {
  const searchInput = document.getElementById("tag-search");
  const searchBtn = document.getElementById("search-btn");
  const randomTagBtn = document.getElementById("random-tag-btn");
  const resultsContainer = document.getElementById("results-container");
  const tagInfoBox = document.getElementById("tag-info-box");
  const relationshipsBox = document.getElementById("tag-relationships-box");
  const postsGrid = document.getElementById("posts-grid");
  const recentTagsBox = document.getElementById("recent-tags-box");
  const categoryTagsBox = document.getElementById("category-tags-box");

  const tagCategoryColors = {
    0: "#3b82f6",
    1: "#ec4899",
    3: "#a855f7",
    4: "#22c55e",
    5: "#eab308",
  };
  const tagCategoryNames = {
    0: "General",
    1: "Artist",
    3: "Copyright",
    4: "Character",
    5: "Species",
  };
  let recentTags = [];

  const loadRecentTags = () => {
    try {
      recentTags = JSON.parse(localStorage.getItem("e621RecentTags")) || [];
    } catch (e) {
      recentTags = [];
    }
    renderRecentTags();
  };

  const saveRecentTags = () => {
    localStorage.setItem("e621RecentTags", JSON.stringify(recentTags));
  };

  const addRecentTag = (tagName) => {
    recentTags = [tagName, ...recentTags.filter((t) => t !== tagName)].slice(
      0,
      5
    );
    saveRecentTags();
    renderRecentTags();
  };

  const renderRecentTags = () => {
    recentTagsBox.innerHTML = "";
    if (recentTags.length === 0) {
      recentTagsBox.innerHTML = `<p class="text-gray-500">Your recent searches will appear here.</p>`;
      return;
    }
    recentTags.forEach((tag) => {
      recentTagsBox.appendChild(createTagButton(tag, searchTag));
    });
  };

  const renderCategoryButtons = () => {
    for (const [id, name] of Object.entries(tagCategoryNames)) {
      const catBtn = document.createElement("button");
      catBtn.className = "pagination-btn";
      catBtn.textContent = name;
      catBtn.style.backgroundColor = tagCategoryColors[id];
      catBtn.addEventListener("click", () => {
        searchInput.value = `order:updated_at category:${id}`;
        searchBtn.click();
      });
      categoryTagsBox.appendChild(catBtn);
    }
  };

  const searchTag = async (tagName) => {
    if (!tagName) return;
    searchInput.value = tagName;
    addRecentTag(tagName);

    resultsContainer.classList.add("hidden");
    tagInfoBox.innerHTML = `<div class="spinner mx-auto"></div>`;
    relationshipsBox.innerHTML = `<div class="spinner mx-auto"></div>`;
    postsGrid.innerHTML = `<div class="spinner mx-auto col-span-full"></div>`;

    resultsContainer.classList.remove("hidden");
    staggeredFadeIn(
      resultsContainer.querySelectorAll(
        ".content-box, .lg\\:col-span-1, .lg\\:col-span-2"
      )
    );

    const [tagData, wikiData, aliasData, implicationData, postData] =
      await Promise.all([
        apiRequest(`tags.json?search[name]=${tagName}`),
        apiRequest(`wiki_pages.json?search[title]=${tagName}`),
        apiRequest(`tag_aliases.json?search[antecedent_name]=${tagName}`),
        apiRequest(`tag_implications.json?search[antecedent_name]=${tagName}`),
        apiRequest(`posts.json?tags=${tagName}&limit=12`),
      ]);

    if (!Array.isArray(tagData)) {
      tagInfoBox.innerHTML = `<p class="text-red-400 text-center">An error occurred while fetching tag data.</p>`;
      relationshipsBox.innerHTML = "";
      postsGrid.innerHTML = "";
      return;
    }

    const primaryTag = tagData.find((t) => t.name === tagName);

    if (!primaryTag) {
      tagInfoBox.innerHTML = `<p class="text-red-400 text-center">Tag "${tagName}" not found.</p>`;
      relationshipsBox.innerHTML = "";
      postsGrid.innerHTML = "";
      return;
    }

    renderTagInfo(primaryTag, wikiData);
    renderRelationships(aliasData, implicationData);
    renderPosts(postData);
  };

  const renderTagInfo = async (primaryTag, wikiData) => {
    const categoryName = tagCategoryNames[primaryTag.category] || "Unknown";
    const categoryColor = tagCategoryColors[primaryTag.category] || "#9ca3af";

    let wikiHtml = `<p class="text-gray-500">No wiki page found for this tag.</p>`;
    if (wikiData && wikiData.length > 0) {
      const dtextConfig = {
        wiki: { baseUrl: "https://e621.net/wiki_pages/show_or_new?title=" },
      };
      wikiHtml = `<div class="wiki-content">${await parseDtext(
        wikiData[0].body,
        dtextConfig
      )}</div>`;
    }

    tagInfoBox.innerHTML = `
            <div class="text-center">
                <h2 class="text-3xl font-bold" style="color: ${categoryColor};">${primaryTag.name.replace(
      /_/g,
      " "
    )}</h2>
                <p class="text-gray-400">Category: ${categoryName} &bull; Posts: ${primaryTag.post_count.toLocaleString()}</p>
            </div>
            <details class="mt-6 group">
                <summary class="text-xl font-bold text-cyan-400 cursor-pointer list-none">
                    <span class="flex items-center justify-center">
                        View Wiki
                        <svg class="w-6 h-6 ml-2 transform transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </span>
                </summary>
                <div class="animated-dropdown">
                    <div>
                        <div class="wiki-container-box mt-4">
                            ${wikiHtml}
                        </div>
                    </div>
                </div>
            </details>
        `;
  };

  const renderRelationships = (aliasData, implicationData) => {
    relationshipsBox.innerHTML = "";
    if (aliasData?.length) {
      const container = document.createElement("div");
      container.innerHTML = `<h3 class="text-xl font-bold text-cyan-500 mb-2">Aliases</h3>`;
      const buttonContainer = document.createElement("div");
      buttonContainer.className = "flex flex-wrap gap-2 mb-4";
      aliasData.forEach((alias) => {
        buttonContainer.appendChild(
          createTagButton(alias.consequent_name, searchTag)
        );
      });
      container.appendChild(buttonContainer);
      relationshipsBox.appendChild(container);
    }
    if (implicationData?.length) {
      const container = document.createElement("div");
      container.innerHTML = `<h3 class="text-xl font-bold text-cyan-500 mb-2">Implications</h3>`;
      const buttonContainer = document.createElement("div");
      buttonContainer.className = "flex flex-wrap gap-2";
      implicationData.forEach((implication) => {
        buttonContainer.appendChild(
          createTagButton(implication.consequent_name, searchTag)
        );
      });
      container.appendChild(buttonContainer);
      relationshipsBox.appendChild(container);
    }
    if (!aliasData?.length && !implicationData?.length) {
      relationshipsBox.innerHTML = `<p class="text-gray-500">No aliases or implications found.</p>`;
    }
  };

  const renderPosts = (postData) => {
    postsGrid.innerHTML = "";
    if (postData && postData.posts && postData.posts.length > 0) {
      postData.posts.forEach((post) => {
        const postElement = createPostPreview(post);
        if (postElement) {
          postsGrid.appendChild(postElement);
        }
      });
      staggeredFadeIn(postsGrid.querySelectorAll(".post-preview-link"));
    } else {
      postsGrid.innerHTML = `<p class="text-gray-500 col-span-full">No posts found for this tag.</p>`;
    }
  };

  const handleRandomTag = async () => {
    searchInput.value = "Fetching random tag...";
    const randomTags = await apiRequest(
      `tags.json?search[order]=random&limit=1`
    );
    if (randomTags && randomTags.length > 0) {
      searchTag(randomTags[0].name);
    } else {
      searchInput.value = "Failed to fetch tag.";
    }
  };

  new Autocomplete(
    searchInput,
    async (query) =>
      await apiRequest(`tags/autocomplete.json?search[name_matches]=${query}`),
    tagCategoryColors,
    tagCategoryNames
  );

  searchInput.addEventListener("change", () => searchTag(searchInput.value));
  searchBtn.addEventListener("click", () => searchTag(searchInput.value));
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchTag(searchInput.value);
  });
  randomTagBtn.addEventListener("click", handleRandomTag);
  relationshipsBox.addEventListener("click", (e) => {
    const target = e.target.closest(".tag-link");
    if (target && target.dataset.tag) {
      searchTag(target.dataset.tag);
    }
  });
  recentTagsBox.addEventListener("click", (e) => {
    const target = e.target.closest(".tag-link");
    if (target && target.dataset.tag) {
      searchTag(target.dataset.tag);
    }
  });
  categoryTagsBox.addEventListener("click", (e) => {
    const target = e.target.closest("button[data-category]");
    if (target) {
      const categoryId = target.dataset.category;
      searchInput.value = `order:date category:${categoryId}`;
      searchBtn.click();
    }
  });

  loadRecentTags();
  renderCategoryButtons();
};
