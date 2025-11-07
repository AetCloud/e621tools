import {
  managePageTransition,
  applyButtonAnimations,
  logger,
} from "./lib/utils.js";
import { initModalSystem } from "./lib/modal.js";
import { apiRequest } from "./lib/api.js";
import { getPost, setPost } from "./lib/post-cache.js";
import { BaseTool } from "./lib/BaseTool.js";
const appContainer = document.getElementById("app-container");

const routes = {
  "/": "./components/hub.js",
  "/tools/mass-favorite": "./components/mass-favorite.js",
  "/tools/mass-downloader": "./components/mass-downloader.js",
  "/tools/image-uploader": "./components/image-uploader.js",
  "/tools/pool-viewer": "./components/pool-viewer.js",
  "/tools/tag-dashboard": "./components/tag-dashboard.js",
  "/settings": "./components/settings.js",
};

async function router() {
  logger.log("[Router] Hash changed, starting router...");
  let path = window.location.hash.substring(1) || "/";
  logger.log(`[Router] Current path resolved to: "${path}"`);

  const componentPath = routes[path];
  logger.log(`[Router] Component file path: "${componentPath}"`);

  const loadContent = async () => {
    if (!componentPath) {
      logger.error(`[Router] 404 - No component found for path: "${path}"`);
      appContainer.innerHTML = `<div class="text-center p-8 text-red-400"><h1>404 Not Found</h1><p>The page you are looking for does not exist.</p><a href="#/" data-link>Go to Hub</a></div>`;
      return;
    }

    try {
      logger.log(`[Router] Dynamically importing module: ${componentPath}`);
      const module = await import(componentPath);
      logger.log(`[Router] Module imported successfully for ${path}.`);

      if (module.render && module.afterRender) {
        logger.log(`[Router] Rendering component from ${componentPath}`);
        appContainer.innerHTML = module.render();
        logger.log(`[Router] Executing afterRender for ${componentPath}`);
        module.afterRender();
        applyButtonAnimations();
        logger.log(`[Router] Component setup complete for ${path}.`);
      } else {
        throw new Error(
          `Component at ${componentPath} is missing render or afterRender function.`
        );
      }
    } catch (error) {
      logger.error(
        `[Router] A critical error occurred while loading component for path "${path}":`,
        error
      );
      appContainer.innerHTML = `<div class="text-center p-8 text-red-400">Error: Could not load component. Check the file path in your router.</div>`;
    }
  };

  logger.log("[Router] Starting page transition...");
  await managePageTransition(appContainer, loadContent);
  logger.log("[Router] Page transition complete.");
}

function initGlobalPreviewer() {
  const popup = document.createElement("div");
  popup.id = "global-preview-popup";
  popup.innerHTML =
    '<div class="spinner"></div><img src="" alt="Preview"><p class="preview-error"></p>';
  document.body.appendChild(popup);

  const img = popup.querySelector("img");
  const spinner = popup.querySelector(".spinner");
  const errorMsg = popup.querySelector(".preview-error");

  let isShiftPressed = false;
  let currentTarget = null;
  let isRequestPending = false;
  let hoverTimeout = null;

  const showPopup = async (target) => {
    const href = target.href;
    if (!href || !href.includes("/posts/")) return;

    const postId = href.split("/posts/")[1];
    if (!postId) return;
    if (isRequestPending) return;

    popup.style.display = "block";
    img.style.display = "none";
    errorMsg.style.display = "none";
    spinner.style.display = "block";

    const displayContent = (post) => {
      spinner.style.display = "none";
      if (post && post.sample && post.sample.url) {
        img.src = `https://corsproxy.io/?url=${encodeURIComponent(
          post.sample.url
        )}`;
        img.style.display = "block";
      } else {
        errorMsg.textContent = "Preview not available.";
        errorMsg.style.display = "block";
      }
    };

    const cachedPost = getPost(postId);
    if (cachedPost) {
      logger.log(`[Previewer] Found post #${postId} in cache.`);
      displayContent(cachedPost);
    } else {
      logger.log(`[Previewer] Post #${postId} not in cache. Fetching...`);
      isRequestPending = true;
      const data = await apiRequest(`posts.json?tags=id:${postId}`);
      isRequestPending = false;

      if (data?.posts?.[0]) {
        const post = data.posts[0];
        setPost(post);
        if (currentTarget === target && isShiftPressed) {
          displayContent(post);
        }
      } else {
        hidePopup();
      }
    }
  };

  const hidePopup = () => {
    popup.style.display = "none";
    img.src = "";
    currentTarget = null;
  };

  const updatePopupPosition = (e) => {
    if (popup.style.display !== "block") return;

    const offset = 20;
    const popupWidth = popup.offsetWidth;
    const popupHeight = popup.offsetHeight;

    let left = e.clientX + offset;
    let top = e.clientY + offset;

    if (e.clientX > window.innerWidth / 2) {
      left = e.clientX - popupWidth - offset;
    }

    if (e.clientY > window.innerHeight - popupHeight - offset) {
      top = e.clientY - popupHeight - offset;
    }

    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
  };

  window.addEventListener("keydown", (e) => {
    if (e.key === "Shift" && !isShiftPressed) {
      isShiftPressed = true;
      if (currentTarget) {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => showPopup(currentTarget), 50);
      }
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.key === "Shift") {
      isShiftPressed = false;
      clearTimeout(hoverTimeout);
      hidePopup();
    }
  });

  document.body.addEventListener("mouseover", (e) => {
    const target = e.target.closest('a[href*="/posts/"]');
    if (target) {
      clearTimeout(hoverTimeout);
      currentTarget = target;
      if (isShiftPressed) {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => showPopup(currentTarget), 50);
      }
    }
  });

  document.body.addEventListener("mouseout", (e) => {
    const target = e.target.closest('a[href*="/posts/"]');
    if (target && target === currentTarget) {
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(hidePopup, 100);
    }
  });

  window.addEventListener("mousemove", updatePopupPosition);
}

window.addEventListener("hashchange", router);

document.addEventListener("DOMContentLoaded", () => {
  logger.log("[App] DOM content loaded. Initializing application.");
  initModalSystem();
  initGlobalPreviewer();

  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-link]");
    if (link) {
      e.preventDefault();
      const href = link.getAttribute("href");
      logger.log(`[App] Intercepted data-link click to: ${href}`);
      window.location.hash = href;
    }
  });

  router();
  applyButtonAnimations();
});
