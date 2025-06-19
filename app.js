const appContainer = document.getElementById("app-container");

const routes = {
  "/": "./components/hub.js",
  "/tools/mass-favorite": "./components/mass-favorite.js",
  "/tools/mass-downloader": "./components/mass-downloader.js",
  "/tools/pool-viewer": "./components/pool-viewer.js",
  "/settings": "./components/settings.js",
};

const basePath = location.pathname.startsWith("/e621tools") ? "/e621tools" : "";

function navigateTo(path) {
  history.pushState(null, null, basePath + path);
  router();
}

function resolveRoute() {
  let path = location.pathname;
  if (path.startsWith(basePath)) {
    path = path.substring(basePath.length);
  }
  return path === "" ? "/" : path;
}

async function router() {
  let path = resolveRoute();
  let componentPath = routes[path];

  if (!componentPath) {
    const redirectPath = sessionStorage.getItem("redirectPath");
    sessionStorage.removeItem("redirectPath");
    if (redirectPath && redirectPath !== path) {
      path = redirectPath;
      componentPath = routes[path];
      history.replaceState(null, null, basePath + path);
    }
  }

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
    appContainer.innerHTML = `<div class="text-center p-8 text-red-400">Error: Could not load component.</div>`;
  } finally {
    setTimeout(
      () => appContainer.classList.remove("content-enter-active"),
      400
    );
  }
}

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("[data-link]");
    if (link) {
      e.preventDefault();
      navigateTo(link.getAttribute("href"));
    }
  });

  router();
});
