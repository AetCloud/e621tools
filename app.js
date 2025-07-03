const appContainer = document.getElementById("app-container");

const routes = {
  "/": "./components/hub.js",
  "/tools/mass-favorite": "./components/mass-favorite.js",
  "/tools/mass-downloader": "./components/mass-downloader.js",
  "/tools/pool-viewer": "./components/pool-viewer.js",
  "/settings": "./components/settings.js",
};

async function router() {
  let path = window.location.hash.substring(1);
  if (path === "") {
    path = "/";
  }

  const componentPath = routes[path];

  if (!componentPath) {
    appContainer.innerHTML = `<div class="text-center p-8 text-red-400"><h1>404 Not Found</h1><p>The page you are looking for does not exist.</p><a href="#/" data-link>Go to Hub</a></div>`;
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
    appContainer.innerHTML = `<div class="text-center p-8 text-red-400">Error: Could not load component. Check the file path in your router.</div>`;
  } finally {
    setTimeout(
      () => appContainer.classList.remove("content-enter-active"),
      400
    );
  }
}

window.addEventListener("hashchange", router);

document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-link]");
    if (link) {
      e.preventDefault();
      window.location.hash = link.getAttribute("href");
    }
  });

  if (!window.location.hash) {
    window.location.hash = "#/";
  } else {
    router();
  }
});
