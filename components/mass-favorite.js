import { renderSharedForm } from "../lib/utils.js";
import { BaseTool } from "../lib/BaseTool.js";
import { apiRequest } from "../lib/api.js";

class MassFavoriteTool extends BaseTool {
  constructor() {
    const config = {
      title: "Mass Favorite Tool",
      description: "Favorite posts in bulk based on a tag search.",
      actionButtonText: "Favorite All Fetched Posts",
      actionButtonColor: "bg-pink-600",
      actionButtonHoverColor: "hover:bg-pink-700",
      maxPostLimit: 320,
      actionConfirmationText: (posts) => {
        const postsToFavorite = posts.filter((p) => !p.is_favorited).length;
        return `You are about to favorite ${postsToFavorite} new posts. This cannot be undone. Are you sure?`;
      },
    };
    super(config);
    this.config.startAction = this.massFavorite;
  }

  async massFavorite({ posts, credentials, log, updateProgress, button }) {
    log(`Starting to favorite ${posts.length} posts...`);
    button.disabled = true;
    document.getElementById("progress-container").classList.remove("hidden");
    updateProgress(0, "Starting...");

    let successCount = 0,
      failCount = 0,
      skipCount = 0;

    for (const [index, post] of posts.entries()) {
      if (post.is_favorited) {
        log(`Skipping post ${post.id}, already in favorites.`, "warn");
        skipCount++;
      } else {
        const endpoint = `favorites.json?post_id=${post.id}`;
        const result = await apiRequest(endpoint, credentials, {
          method: "POST",
        });
        if (result && result.success) {
          log(`Favorited post ${post.id}.`);
          successCount++;
        } else {
          log(
            `Failed to favorite post ${post.id}. Reason: ${
              result?.error || "Unknown"
            }`,
            "error"
          );
          failCount++;
        }
      }
      updateProgress(((index + 1) / posts.length) * 100);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    log(
      `Finished. Success: ${successCount}. Skipped: ${skipCount}. Failed: ${failCount}.`
    );
    button.disabled = false;
    updateProgress(100, "Done!");
  }
}

export const render = () => {
  return renderSharedForm({
    title: "Mass Favorite Tool",
    description: "Favorite posts in bulk based on a tag search.",
    actionButtonText: "Favorite All Fetched Posts",
    actionButtonColor: "bg-pink-600",
    actionButtonHoverColor: "hover:bg-pink-700",
    maxPostLimit: 320,
  });
};

export const afterRender = () => {
  new MassFavoriteTool();
};