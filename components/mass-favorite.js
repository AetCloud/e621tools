import { renderSharedForm } from "../lib/utils.js";
import { BaseTool } from "../lib/BaseTool.js";
import { apiRequest } from "../lib/api.js";

/**
 * Helper: check if a post matches blacklist
 */
function matchesBlacklist(post, blacklist) {
  const tags = new Set([
    ...(post.tags?.general || []),
    ...(post.tags?.species || []),
    ...(post.tags?.character || []),
    ...(post.tags?.copyright || []),
  ]);

  return blacklist.some((tag) => tags.has(tag));
}

class MassFavoriteTool extends BaseTool {
  constructor() {
    const config = {
      title: "Mass Favorite Tool",
      description:
        "Favorite posts in bulk or remove favorites that match your blacklist.",
      actionButtonText: "Run Mass Favorite",
      actionButtonColor: "bg-pink-600",
      actionButtonHoverColor: "hover:bg-pink-700",
      maxPostLimit: 320,
      actionConfirmationText: (posts) =>
        `Process ${posts.length} fetched posts?`,
    };

    super(config);
    this.config.startAction = this.run;
  }

  async run({ posts, credentials, log, updateProgress, button }) {
    const mode = document.getElementById("favorite-mode")?.value || "favorite";

    button.disabled = true;
    document.getElementById("progress-container").classList.remove("hidden");

    updateProgress(0, "Starting...");

    let success = 0;
    let fail = 0;
    let skipped = 0;

    // Decide which posts to act on
    const targets =
      mode === "favorite"
        ? posts.filter((p) => !p.is_favorited)
        : posts.filter(
            (p) => p.is_favorited && matchesBlacklist(p, this.personalBlacklist)
          );

    log(`Mode: ${mode}. Processing ${targets.length} posts...`);

    for (let i = 0; i < targets.length; i++) {
      const post = targets[i];

      const endpoint =
        mode === "favorite"
          ? `favorites.json?post_id=${post.id}`
          : `favorites/${post.id}.json`;

      const method = mode === "favorite" ? "POST" : "DELETE";

      const result = await apiRequest(endpoint, credentials, { method });

      if (result?.success) {
        success++;
        log(
          `${mode === "favorite" ? "Favorited" : "Unfavorited"} post ${
            post.id
          }.`
        );
      } else if (result?.error && result.error.toLowerCase().includes("rate")) {
        log("Rate limited. Backing off 5 seconds...", "warn");
        await new Promise((r) => setTimeout(r, 5000));
        i--; // retry same post
        continue;
      } else {
        fail++;
        log(
          `Failed on post ${post.id}: ${result?.error || "Unknown error"}`,
          "error"
        );
      }

      updateProgress(((i + 1) / targets.length) * 100);

      // Safe delay to avoid burst limits
      await new Promise((r) => setTimeout(900 + Math.random() * 400));
    }

    log(`Done. Success: ${success}, Failed: ${fail}, Skipped: ${skipped}`);
    updateProgress(100, "Done");
    button.disabled = false;
  }
}

/* =========================
   Router-required exports
   ========================= */

export const render = () => {
  return renderSharedForm({
    title: "Mass Favorite Tool",
    description: "Favorite posts in bulk or remove blacklisted favorites.",
    actionButtonText: "Run Mass Favorite",
    actionButtonColor: "bg-pink-600",
    actionButtonHoverColor: "hover:bg-pink-700",
    maxPostLimit: 320,
  });
};

export const afterRender = () => {
  new MassFavoriteTool();
};
