const appContainer = document.getElementById("app-container");

const routes = {
  "/": "./components/hub.js",
  "/tools/mass-favorite": "./components/mass-favorite.js",
  "/tools/mass-downloader": "./components/mass-downloader.js",
};

const isGitHubPages = location.hostname.endsWith("github.io");
const basePath = isGitHubPages ? "/e621tools" : "";

const navigateTo = (path) => {
  history.pushState(null, null, basePath + path);
  router();
};

const router = async () => {
  let path = location.pathname;
  if (isGitHubPages && path.startsWith(basePath)) {
    path = path.substring(basePath.length);
  }

  if (path === "") {
    path = "/";
  }

  const componentPath = routes[path];

  if (!componentPath) {
    const redirectPath = sessionStorage.getItem("redirectPath");
    if (redirectPath && redirectPath !== path) {
      sessionStorage.removeItem("redirectPath");
      navigateTo(redirectPath);
    } else {
      appContainer.innerHTML = `<div class="text-center p-8 text-red-400"><h1>404 Not Found</h1><p>The page you are looking for does not exist.</p><a href="/" data-link class="text-cyan-400 mt-4 inline-block">Go to Hub</a></div>`;
    }
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
    const link = e.target.closest("[data-link]");
    if (link) {
      e.preventDefault();
      navigateTo(link.getAttribute("href"));
    }
  });

  const redirectPath = sessionStorage.getItem("redirectPath");
  if (redirectPath) {
    sessionStorage.removeItem("redirectPath");
    navigateTo(redirectPath);
  } else {
    router();
  }
});
