import { renderSharedForm } from "../lib/utils.js";
import { BaseTool } from "../lib/BaseTool.js";
import { apiRequest } from "../lib/api.js";

class MassFavoriteTool extends BaseTool {
  constructor() {
    const config = {
      title: "Mass Favorite Tool",
      description:
        "Favorite posts in bulk or remove fetched posts from your favorites.",
      actionButtonText: "Start",
      actionButtonColor: "bg-pink-600",
      actionButtonHoverColor: "hover:bg-pink-700",
      maxPostLimit: 320,
      actionConfirmationText: (posts, mode) => {
        const newFavorites = posts.filter((p) => !p.is_favorited).length;
        const favoritesToRemove = posts.filter((p) => p.is_favorited).length;

        return mode === "favorite"
          ? `You are about to favorite ${newFavorites} posts. This cannot be undone. Proceed?`
          : `You are about to remove ${favoritesToRemove} posts from your favorites. Proceed?`;
      },
    };
    super(config);
    this.config.startAction = (opts) => this.runAction(opts);
  }

  async runAction({ posts, credentials, log, updateProgress, button }) {
    const modeSelect = document.getElementById("favorite-mode");
    const mode = modeSelect?.value || "favorite";

    const newFavorites = posts.filter((p) => !p.is_favorited).length;
    const favoritesToRemove = posts.filter((p) => p.is_favorited).length;

    log(`Starting "${mode}" action for ${posts.length} fetched posts...`);
    button.disabled = true;
    this.progressContainer.classList.remove("hidden");
    updateProgress(0, "Starting...");

    let success = 0,
      fail = 0,
      skipped = 0;

    for (const [index, post] of posts.entries()) {
      if (mode === "favorite") {
        if (post.is_favorited) {
          log(`Skipping ${post.id}, already favorited.`, "warn");
          skipped++;
          continue;
        }

        const result = await apiRequest(
          `favorites.json?post_id=${post.id}`,
          credentials,
          { method: "POST" }
        );

        if (result.success) {
          log(`Favorited post ${post.id}.`);
          success++;
        } else {
          log(`Failed to favorite post ${post.id}: ${result.error}`, "error");
          fail++;
        }
      } else if (mode === "remove") {
        if (!post.is_favorited) {
          log(`Skipping ${post.id}, not in favorites.`, "warn");
          skipped++;
          continue;
        }

        const result = await apiRequest(
          `favorites.json?post_id=${post.id}`,
          credentials,
          { method: "DELETE" }
        );

        if (result.success) {
          log(`Removed post ${post.id} from favorites.`);
          success++;
        } else {
          log(`Failed to remove post ${post.id}: ${result.error}`, "error");
          fail++;
        }
      }

      updateProgress(((index + 1) / posts.length) * 100);
      await new Promise((r) => setTimeout(r, 500));
    }

    log(`Done! Success: ${success}, Skipped: ${skipped}, Failed: ${fail}`);
    button.disabled = false;
    updateProgress(100, "Completed!");
  }
}

export const render = () =>
  renderSharedForm({
    title: "Mass Favorite Tool",
    description:
      "Favorite posts in bulk or remove fetched posts from your favorites.",
    actionButtonText: "Start",
    actionButtonColor: "bg-pink-600",
    actionButtonHoverColor: "hover:bg-pink-700",
    maxPostLimit: 320,
    extraUI: `<select id="favorite-mode" class="editor-input mb-3">
                <option value="favorite">Mass Favorite (filtered)</option>
                <option value="remove">Remove from Favorites</option>
              </select>`,
  });

export const afterRender = () => {
  new MassFavoriteTool();
};
