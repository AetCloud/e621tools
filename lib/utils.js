import { apiRequest } from "./api.js";

class Logger {
  constructor() {
    this.isDebug = localStorage.getItem("e621tools-debug") === "true";
    if (this.isDebug) {
      console.log(
        "%c[Logger] Debug mode is enabled.",
        "color: #0891b2; font-weight: bold;"
      );
    }
  }

  setDebug(enabled) {
    this.isDebug = !!enabled;
    localStorage.setItem("e621tools-debug", this.isDebug);
    console.log(
      `%c[Logger] Debug mode has been ${
        this.isDebug ? "ENABLED" : "DISABLED"
      }.`,
      "color: #0891b2; font-weight: bold;"
    );
  }

  log(...args) {
    if (this.isDebug) {
      console.log(...args);
    }
  }

  warn(...args) {
    if (this.isDebug) {
      console.warn(...args);
    }
  }

  error(...args) {
    console.error(...args);
  }
}
export const logger = new Logger();

export function initSimpleFadeButton(options) {
  const { initialBtn, subsequentControls } = options;

  function showInitial() {
    initialBtn.classList.remove("hidden");
    subsequentControls.classList.add("hidden");
  }

  function showSubsequent() {
    initialBtn.classList.add("hidden");
    subsequentControls.classList.remove("hidden");
  }

  return {
    showInitial,
    showSubsequent,
  };
}

export async function managePageTransition(container, callback) {
  container.classList.add("content-exit-active");
  await new Promise((resolve) => setTimeout(resolve, 400));

  container.innerHTML = "";
  container.classList.remove("content-exit-active");

  await callback();
}

export function applyButtonAnimations() {
  document.querySelectorAll("button, a[data-link]").forEach((btn) => {
    if (!btn.classList.contains("btn-press-animation")) {
      btn.classList.add("btn-press-animation");
    }
  });
}

export function staggeredFadeIn(elements, delay = 50) {
  elements.forEach((el, index) => {
    el.style.animationDelay = `${index * delay}ms`;
    el.classList.add("anim-fade-in-up");
  });
}

export async function fadeOutAndIn(container, callback) {
  container.classList.add("content-exit-active");
  await new Promise((resolve) => setTimeout(resolve, 400));

  await callback();

  container.classList.remove("content-exit-active");
  container.classList.add("content-enter-active");
  setTimeout(() => container.classList.remove("content-enter-active"), 400);
}

export async function fadeOutAndHide(element, duration = 400) {
  if (element.classList.contains("hidden")) {
    return;
  }
  element.classList.add("content-exit-active");
  await new Promise((resolve) => setTimeout(resolve, duration));
  element.classList.add("hidden");
  element.classList.remove("content-exit-active");
}

export function initCollapsible(detailsElement) {
  const summary = detailsElement.querySelector("summary");
  if (!summary) return;

  summary.addEventListener("click", (e) => {
    e.preventDefault();
    detailsElement.toggleAttribute("open");
  });
}

export function createPostPreview(post) {
  let imageUrl = post.preview?.url || post.file?.url;
  let isBlacklisted = post.flags?.deleted || (post.tags?.general?.includes("young"));

  if (!imageUrl && post.file?.md5) {
    imageUrl = `https://static1.e621.net/data/sample/${post.file.md5.substring(0, 2)}/${post.file.md5.substring(2, 4)}/${post.file.md5}.jpg`;
  }
  
  if (!imageUrl) {
    return null;
  }

  const link = document.createElement("a");
  link.href = `https://e621.net/posts/${post.id}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.className = "post-preview-link";
  link.dataset.revealed = "false";
  link.dataset.isBlacklisted = isBlacklisted;

  const img = document.createElement("img");
  img.dataset.src = `https://corsproxy.io/?url=${encodeURIComponent(imageUrl)}`;
  img.className = "preview-image";
  link.appendChild(img);
  
  if (isBlacklisted) {
    const censorOverlay = document.createElement("div");
    censorOverlay.className = "censor-overlay";
    censorOverlay.textContent = "Blacklisted";
    link.appendChild(censorOverlay);

    link.addEventListener("click", (e) => {
      if (link.dataset.revealed === "false") {
        e.preventDefault();
        link.classList.add("revealed");
        link.dataset.revealed = "true";
      }
    });
    link.addEventListener("mouseleave", () => {
      link.classList.remove("revealed");
      link.dataset.revealed = "false";
    });
  }

  return link;
}

export function createTagButton(tag, clickHandler) {
  const button = document.createElement("button");
  button.className = "tag-link pagination-btn";
  button.textContent = tag.replace(/_/g, " ");
  button.dataset.tag = tag;
  button.addEventListener("click", () => clickHandler(tag));
  return button;
}

const dtextToHtmlBasic = (dtext, config) => {
  if (!dtext) return "";

  const wikiBaseUrl = config.wiki?.baseUrl || "";
  let html = dtext;

  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  html = html.replace(/(\r\n|\n|\r)/gm, "\n");

  html = html.replace(/h(1|2|3|4|5|6)\. (.*)/g, "<h4>$2</h4>");
  html = html.replace(/\[b\](.*?)\[\/b\]/g, "<strong>$1</strong>");
  html = html.replace(/\[i\](.*?)\[\/i\]/g, "<em>$1</em>");
  html = html.replace(
    /\[quote\]([\s\S]*?)\[\/quote\]/g,
    "<blockquote>$1</blockquote>"
  );

  html = html.replace(
    /\[\[(.*?)\|(.*?)\]\]/g,
    (_, target, linkText) =>
      `<a href="${wikiBaseUrl}${target
        .trim()
        .replace(
          / /g,
          "_"
        )}" target="_blank" rel="noopener noreferrer">${linkText}</a>`
  );
  html = html.replace(
    /\[\[(.*?)\]\]/g,
    (_, target) =>
      `<a href="${wikiBaseUrl}${target
        .trim()
        .replace(
          / /g,
          "_"
        )}" target="_blank" rel="noopener noreferrer">${target.replace(
        /_/g,
        " "
      )}</a>`
  );

  html = html.replace(
    /^"(.+?)":\s*(https?:\/\/[^\s]+)/gm,
    `<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>`
  );
  html = html.replace(
    /^(https?:\/\/[^\s]+)/gm,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  html = html.replace(
    /post #(\d+)/g,
    '<a href="https://e621.net/posts/$1" target="_blank" rel="noopener noreferrer">post #$1</a>'
  );

  let currentListLevel = 0;
  const lines = html.split("\n");
  let processedHtml = "";

  lines.forEach((line) => {
    const listMatch = line.match(/^(\*+)\s(.*)/);
    if (listMatch) {
      const level = listMatch[1].length;
      const content = listMatch[2];

      while (level > currentListLevel) {
        processedHtml += "<ul>";
        currentListLevel++;
      }
      while (level < currentListLevel) {
        processedHtml += "</ul>";
        currentListLevel--;
      }
      processedHtml += `<li>${content}</li>`;
    } else {
      while (currentListLevel > 0) {
        processedHtml += "</ul>";
        currentListLevel--;
      }
      processedHtml += line + "\n";
    }
  });

  while (currentListLevel > 0) {
    processedHtml += "</ul>";
    currentListLevel--;
  }

  html = processedHtml.replace(/\n/g, "<br>");
  html = html.replace(/<br><br>/g, "<p>");

  return html;
};

export async function parseDtext(dtext, config = {}) {
  let html = dtextToHtmlBasic(dtext, config);

  const thumbMatches = [...html.matchAll(/thumb #(\d+)/g)];
  if (thumbMatches.length > 0) {
    const postIds = [...new Set(thumbMatches.map((match) => match[1]))].join(
      ","
    );
    const postData = await apiRequest(`posts.json?tags=id:${postIds}`);
    if (postData?.posts) {
      const postMap = new Map(postData.posts.map((p) => [p.id.toString(), p]));
      thumbMatches.forEach((match) => {
        const postId = match[1];
        const post = postMap.get(postId);
        if (post?.preview?.url) {
          const thumbHtml = `<a href="https://e621.net/posts/${postId}" target="_blank" rel="noopener noreferrer"><img src="${post.preview.url}" style="max-width: 150px; display: inline-block; margin: 0.5rem;" class="pool-thumbnail opacity-100"></a>`;
          html = html.replace(new RegExp(match[0], "g"), thumbHtml);
        }
      });
    }
  }

  return html.replace(/thumb #\d+/g, "");
}

export const renderSharedForm = (config) => {
  return `
    <div class="page-container anim-fade-in-up">
        <div class="mb-8">
            <a href="#/" data-link class="bg-gray-700 text-cyan-400 font-bold py-2 px-4 rounded-lg inline-flex items-center">&larr; Back to the hub</a>
        </div>

        <div class="content-box tool-container relative">
            <h1 class="text-3xl md:text-4xl font-bold mb-2 text-center text-cyan-400">${config.title}</h1>
            <p class="text-gray-400 mb-8 text-center">${config.description}</p>

            <div class="shared-form-grid">
                <div class="form-controls-col space-y-6">
                    <div>
                        <label for="tags" class="block text-sm font-medium text-gray-300 mb-2">Enter Your Search Tags</label>
                        <input type="text" id="tags" class="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none text-lg" placeholder="e.g., canine score:>50 order:score" autocomplete="off">
                    </div>

                    <div>
                      <label for="post-limit" class="block text-sm font-medium text-gray-300 mb-2">Posts to fetch per page (max ${config.maxPostLimit})</label>
                      <div class="flex items-center gap-4">
                          <input type="range" id="post-limit-slider" class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" value="50" min="1" max="${config.maxPostLimit}">
                          <input type="number" id="post-limit-input" class="w-24 bg-gray-700 border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" value="50" min="1" max="${config.maxPostLimit}">
                      </div>
                    </div>

                    <div>
                        <details id="advanced-options-details">
                            <summary class="cursor-pointer hover:text-white select-none list-none group text-sm text-gray-400">
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
                                            <input type="text" id="blacklist-input" class="w-full bg-gray-700 border-gray-600 rounded-l-lg p-3 text-white focus:ring-2 focus:ring-cyan-500" placeholder="Add a tag...">
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
                    
                    <div class="pt-6 border-t border-gray-700/50">
                        <button id="fetchPostsBtn" class="action-button w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg">Fetch Posts</button>
                        <div id="subsequent-controls" class="action-button hidden grid grid-cols-3 gap-4">
                            <button id="fetch-more-btn" class="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg">Fetch More</button>
                            <button id="clear-posts-btn" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg">Clear Posts</button>
                            <div id="action-button-container">
                                <button id="start-action-btn" class="w-full ${config.actionButtonColor} ${config.actionButtonHoverColor} text-white font-bold py-3 px-4 rounded-lg">
                                    ${config.actionButtonText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="form-status-col">
                    <div class="bg-gray-900 p-4 rounded-lg h-full flex flex-col">
                        <h2 class="text-xl font-semibold mb-2 text-gray-300">Status & Actions</h2>
                        <div id="fetched-count-container" class="my-4 hidden">
                             <p id="fetched-count" class="text-gray-300 text-lg"></p>
                        </div>
                        
                        <div id="progress-container" class="w-full bg-gray-700 rounded-full h-4 mt-4 hidden border border-gray-600">
                          <div id="progress-bar" class="bg-cyan-600 h-full rounded-full text-xs text-white flex items-center justify-center" style="width: 0%">0%</div>
                        </div>
                        
                        <div id="log-section" class="flex-grow flex flex-col hidden mt-4">
                            <h3 class="text-lg font-semibold mb-2 text-gray-400">Log</h3>
                            <div id="log" class="w-full h-48 bg-gray-800 rounded-lg p-3 overflow-y-auto border border-gray-700 flex-grow"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="previews-section" class="hidden mt-8">
                <h2 class="text-xl font-semibold mb-4 text-gray-300">Fetched Post Previews</h2>
                <div id="postsContainer" class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4"></div>
                <div id="load-more-previews-container" class="text-center mt-6 hidden">
                    <button id="loadMorePreviewsBtn" class="pagination-btn">Load More Previews</button>
                </div>
            </div>

            <div id="loading-modal" class="loader-overlay bg-gray-800/90">
                <div class="spinner"></div>
                <p class="text-white text-lg">Fetching Posts...</p>
            </div>
        </div>
    </div>
  `;
};