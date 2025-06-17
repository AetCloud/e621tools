const appContainer = document.getElementById("app-container");

const routes = {
  "/": "./components/hub.js",
  "/tools/mass-favorite": "./components/mass-favorite.js",
};

const basePath = "/e621tools";

/**
 * Handles navigation to a new path.
 * @param {string} path - The path to navigate to (e.g., '/tools/mass-favorite').
 */
const navigateTo = (path) => {
  history.pushState(null, null, basePath + path);
  router();
};

/**
 * The main router function that loads and renders the correct view.
 */
const router = async () => {
  const path = location.pathname.startsWith(basePath)
    ? location.pathname.substring(basePath.length)
    : location.pathname;

  const finalPath = path === "" ? "/" : path;

  const componentPath = routes[finalPath];
  if (!componentPath) {
    appContainer.innerHTML = `<div class="text-center p-8 text-red-400"><h1>404 Not Found</h1><p>The page you are looking for does not exist.</p><a href="/" data-link class="text-cyan-400 mt-4 inline-block">Go to Hub</a></div>`;
    return;
  }

  appContainer.classList.add("content-exit-active");

  await new Promise((resolve) => setTimeout(resolve, 400));

  try {
    const module = await import(componentPath);

    if (module.render && module.afterRender) {
      appContainer.classList.remove("content-exit-active");
      appContainer.innerHTML = module.render();

      module.afterRender();

      appContainer.classList.add("content-enter-active");
    } else {
      throw new Error(
        `Component at ${componentPath} is missing render or afterRender function.`
      );
    }
  } catch (error) {
    console.error("Error loading component:", error);
    appContainer.innerHTML = `<div class="text-center p-8 text-red-400">Error: Could not load page.</div>`;
  } finally {
    setTimeout(
      () => appContainer.classList.remove("content-enter-active"),
      400
    );
  }
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (e) => {
    if (e.target.matches("[data-link]")) {
      e.preventDefault();
      navigateTo(e.target.getAttribute("href"));
    }
  });

  router();
});
