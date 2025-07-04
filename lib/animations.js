export function initSimpleFadeButton(options) {
  const { initialBtn, subsequentControls, fetchMoreBtn, clearPostsBtn } =
    options;

  function showInitial() {
    initialBtn.classList.remove("hidden");
    subsequentControls.classList.add("hidden");
  }

  function showSubsequent() {
    initialBtn.classList.add("hidden");
    subsequentControls.classList.remove("hidden");
  }

  initialBtn.addEventListener("click", () => options.onInitialFetch());
  fetchMoreBtn.addEventListener("click", () => options.onFetchMore());
  clearPostsBtn.addEventListener("click", () => options.onClear());

  return {
    showInitial,
    showSubsequent,
  };
}

export async function managePageTransition(container, callback) {
  container.classList.add("content-exit-active");
  await new Promise((resolve) => setTimeout(resolve, 500));

  await callback();

  container.classList.remove("content-exit-active");
  container.classList.add("content-enter-active");

  setTimeout(() => {
    container.classList.remove("content-enter-active");
  }, 500);
}

export function applyButtonAnimations() {
  document.querySelectorAll("button, a[data-link]").forEach((btn) => {
    if (!btn.classList.contains("btn-press-animation")) {
      btn.classList.add("btn-press-animation");
    }
  });
}
