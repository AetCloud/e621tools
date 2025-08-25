import { renderSharedForm } from "../lib/utils.js";
import { BaseTool } from "../lib/BaseTool.js";

class MassDownloaderTool extends BaseTool {
  constructor() {
    const config = {
      title: "Mass Downloader",
      description: "Download posts in bulk as a .zip file from a tag search.",
      actionButtonText: "Download All Fetched Posts",
      actionButtonColor: "bg-emerald-600",
      actionButtonHoverColor: "hover:bg-emerald-700",
      maxPostLimit: 320,
      actionConfirmationText: (posts) =>
        `You are about to download all ${posts.length} fetched posts as a .zip file. This may take some time. Are you sure?`,
    };
    super(config);
    this.config.startAction = this.startDownload;
  }

  async startDownload({ posts, log, updateProgress, button }) {
    if (typeof JSZip === "undefined") {
      log("JSZip library is not loaded. Please wait or refresh.", "error");
      return;
    }

    log(`Starting download for ${posts.length} posts...`);
    button.disabled = true;
    updateProgress(0, "Preparing to download...");
    document.getElementById("progress-container").classList.remove("hidden");

    const zip = new JSZip();
    for (const [index, post] of posts.entries()) {
      const progress = ((index + 1) / posts.length) * 100;
      updateProgress(
        progress,
        `Downloading image ${index + 1} of ${posts.length}...`
      );
      log(`Downloading ${post.file.url}`);

      try {
        const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(
          post.file.url
        )}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const blob = await response.blob();
        const filename = `${post.id}.${post.file.ext}`;
        zip.file(filename, blob);
      } catch (error) {
        log(`Failed to download post ${post.id}: ${error.message}`, "error");
      }
    }

    log("All files downloaded. Creating zip file...");
    updateProgress(100, "Creating zip file...");

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const tagsValue = document
      .getElementById("tags")
      .value.trim()
      .replace(/[:*?"<>|]/g, "_")
      .substring(0, 50);
    const zipFilename = (tagsValue || "e621-download") + ".zip";

    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = zipFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    log(`Zip file '${zipFilename}' created successfully.`);
    button.disabled = false;
    updateProgress(100, "Done!");
  }
}

export const render = () => {
  return (
    `<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>` +
    renderSharedForm({
      title: "Mass Downloader",
      description: "Download posts in bulk as a .zip file from a tag search.",
      actionButtonText: "Download All Fetched Posts",
      actionButtonColor: "bg-emerald-600",
      actionButtonHoverColor: "hover:bg-emerald-700",
      maxPostLimit: 320,
    })
  );
};

export const afterRender = () => {
  new MassDownloaderTool();
};
