import {
  managePageTransition,
  applyButtonAnimations,
  logger,
} from "./lib/utils.js";
import { initModalSystem } from "./lib/modal.js";

const appContainer = document.getElementById("app-container");

const routes = {
  "/": "./components/hub.js",
  "/tools/mass-favorite": "./components/mass-favorite.js",
  "/tools/mass-downloader": "./components/mass-downloader.js",
  "/tools/pool-viewer": "./components/pool-viewer.js",
  "/tools/tag-explorer": "./components/tag-explorer.js",
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

window.addEventListener("hashchange", router);

document.addEventListener("DOMContentLoaded", () => {
  logger.log("[App] DOM content loaded. Initializing application.");
  initModalSystem();

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
