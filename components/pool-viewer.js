import { apiRequest } from "../lib/api.js";
import {
  staggeredFadeIn,
  fadeOutAndIn,
  logger,
  initCollapsible,
} from "../lib/utils.js";

export const render = () => {
  return `
    <div class="page-container anim-fade-in-up" id="pool-viewer-main">
        <div class="mb-8">
            <a href="#/" data-link class="bg-gray-700 text-cyan-400 font-bold py-2 px-4 rounded-lg inline-flex items-center">&larr; Back to the hub</a>
        </div>

        <div class="content-box">
            <h1 class="text-3xl md:text-4xl font-bold mb-2 text-cyan-400">Pool Viewer</h1>
            <p class="text-gray-400 mb-6">Browse and view image pools and comics. Shows pools by creation date by default.</p>

            <div>
                <label for="pool-search" class="block text-sm font-medium text-gray-300 mb-2">Search Pools (by name or ID)</label>
                <input type="text" id="pool-search" class="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" placeholder="e.g., my_little_pony, or id:12345">
            </div>

            <div class="mt-4 flex items-center justify-end">
                 <label for="show-blacklisted-toggle" class="font-medium text-gray-300 mr-2">Show Blacklisted</label>
                <label class="toggle-switch">
                    <input type="checkbox" id="show-blacklisted-toggle" checked>
                    <span class="toggle-slider"></span>
                </label>
            </div>

            <div id="pools-list-container" class="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"></div>
            <div id="pools-pagination" class="flex justify-center items-center gap-4 mt-6"></div>
        </div>
    </div>

    <div id="viewer-modal" class="image-viewer-container hidden fixed inset-0 bg-gray-900 z-50">

      <div id="thumbnail-grid-view" class="w-full h-full p-8 overflow-y-auto relative">
          <div id="thumb-loader" class="thumbnail-grid-loader loader-overlay">
              <div class="spinner"></div>
              <p class="text-white text-lg">Loading Pool...</p>
          </div>
          <div class="flex justify-between items-center mb-4">
              <h2 id="thumbnail-grid-title" class="text-2xl text-white"></h2>
              <div class="flex items-center gap-4">
                  <div class="flex items-center">
                    <label for="grid-show-blacklisted-toggle" class="font-medium text-gray-300 mr-2">Show Blacklisted</label>
                    <label class="toggle-switch">
                        <input type="checkbox" id="grid-show-blacklisted-toggle" checked>
                        <span class="toggle-slider"></span>
                    </label>
                  </div>
                  <a id="view-pool-on-site-btn" href="#" target="_blank" class="pagination-btn bg-gray-600 hover:bg-gray-700">View on e621</a>
                  <div class="relative group">
                      <button id="download-all-btn" class="pagination-btn bg-emerald-600 hover:bg-emerald-700">Download All</button>
                      <div class="download-dropdown absolute right-0 mt-2 py-2 w-48 bg-gray-800 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                          <button data-size="full" class="download-option block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700">Full Size</button>
                          <button data-size="sample" class="download-option block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700">Sample Size</button>
                      </div>
                  </div>
                  <button id="close-thumb-view-btn" class="text-white text-5xl hover:text-cyan-400">&times;</button>
              </div>
          </div>
          <div id="thumbnail-grid-content" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-4"></div>
          <div id="thumb-pagination" class="flex justify-center items-center gap-4 mt-6"></div>
      </div>

      <div id="image-viewer-view" class="image-viewer-content hidden">
        <div class="image-viewer-art-container">
          <div id="full-image-loader" class="full-image-loader loader-overlay">
            <div class="spinner"></div>
          </div>
          <img id="image-A" class="image-viewer-art" src="" />
          <img id="image-B" class="image-viewer-art inactive" src="" />
          
          <div id="blacklisted-warning-overlay" class="blacklisted-image-overlay hidden">
            <p class="text-xl font-bold mb-4">This post is blacklisted.</p>
            <button id="view-once-btn" class="pagination-btn bg-cyan-600 hover:bg-cyan-700">View Once</button>
            <div class="flex items-center mt-4">
              <label for="view-all-blacklisted" class="font-medium text-gray-300 mr-2">Disable for this pool</label>
              <label class="toggle-switch">
                  <input type="checkbox" id="view-all-blacklisted">
                  <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          
          <div class="zoom-controls">
              <button id="zoom-in-btn" class="pagination-btn zoom-btn">+</button>
              <button id="zoom-out-btn" class="pagination-btn zoom-btn">-</button>
              <button id="zoom-reset-btn" class="pagination-btn zoom-btn">⟲</button>
          </div>
          <div id="prev-image-btn" class="nav-zone left">&#x2039;</div>
          <div id="next-image-btn" class="nav-zone right">&#x203A;</div>
        </div>

        <div class="image-viewer-bottom-bar">
          <div class="flex justify-between items-center">
            <div>
                <p id="metadata-id" class="text-gray-400 text-sm"></p>
                <p id="metadata-artists" class="text-gray-200"></p>
            </div>
            <div class="flex gap-2">
                <a id="view-on-e621-btn" href="#" target="_blank" class="pagination-btn">View on e621</a>
                <button id="download-btn" class="pagination-btn bg-emerald-600 hover:bg-emerald-700">Download</button>
                <button id="fullscreen-btn" class="pagination-btn">Fullscreen</button>
                <button id="back-to-grid-btn" class="pagination-btn bg-gray-600 hover:bg-gray-700">Back to Grid</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;
};

export const afterRender = () => {
  const mainContainer = document.getElementById("pool-viewer-main");
  const searchInput = document.getElementById("pool-search");
  const poolsContainer = document.getElementById("pools-list-container");
  const paginationContainer = document.getElementById("pools-pagination");
  const viewerModal = document.getElementById("viewer-modal");
  const thumbnailGridView = document.getElementById("thumbnail-grid-view");
  const imageViewer = document.getElementById("image-viewer-view");
  const thumbLoader = document.getElementById("thumb-loader");
  const thumbnailGridTitle = document.getElementById("thumbnail-grid-title");
  const thumbnailGridContent = document.getElementById(
    "thumbnail-grid-content"
  );
  const thumbPaginationContainer = document.getElementById("thumb-pagination");
  const closeThumbViewBtn = document.getElementById("close-thumb-view-btn");
  const artContainer = imageViewer.querySelector(".image-viewer-art-container");
  const fullImageLoader = document.getElementById("full-image-loader");
  const backToGridBtn = document.getElementById("back-to-grid-btn");
  const imageA = document.getElementById("image-A");
  const imageB = document.getElementById("image-B");
  const metadataId = document.getElementById("metadata-id");
  const metadataArtists = document.getElementById("metadata-artists");
  const prevBtn = document.getElementById("prev-image-btn");
  const nextBtn = document.getElementById("next-image-btn");
  const viewOnE621Btn = document.getElementById("view-on-e621-btn");
  const downloadBtn = document.getElementById("download-btn");
  const fullscreenBtn = document.getElementById("fullscreen-btn");
  const zoomInBtn = document.getElementById("zoom-in-btn");
  const zoomOutBtn = document.getElementById("zoom-out-btn");
  const zoomResetBtn = document.getElementById("zoom-reset-btn");
  const showBlacklistedToggle = document.getElementById("show-blacklisted-toggle");
  const blacklistedWarningOverlay = document.getElementById("blacklisted-warning-overlay");
  const viewOnceBtn = document.getElementById("view-once-btn");
  const viewAllBlacklistedToggle = document.getElementById("view-all-blacklisted");
  const viewPoolOnSiteBtn = document.getElementById("view-pool-on-site-btn");
  const downloadAllBtn = document.getElementById("download-all-btn");
  const downloadOptions = document.querySelectorAll('.download-option');
  const gridShowBlacklistedToggle = document.getElementById("grid-show-blacklisted-toggle");
  
  let currentPage = 1,
    currentPool = null,
    currentPostIndex = 0,
    currentThumbPage = 1;
  const THUMBS_PER_PAGE = 10;
  let activeImage = imageA,
    inactiveImage = imageB;
  let isNavigating = false,
    isImageViewActive = false,
    navigationCount = 0,
    currentPoolsFetchId = 0;
  let currentController = new AbortController();
  let zoomState = { scale: 1, x: 0, y: 0 };
  let panState = { isPanning: false, startX: 0, startY: 0, lastX: 0, lastY: 0 };
  let viewAllBlacklisted = false;

  const _preloadImageUrls = (urls) => {
    logger.log(`[Pool Viewer] Preloading ${urls.length} images.`);
    return Promise.all(
      urls.map(
        (url) =>
          new Promise((resolve) => {
            const img = new Image();
            img.src = url;
            img.onload = () => {
              logger.log(`[Pool Viewer] Preloaded: ${url}`);
              resolve();
            };
            img.onerror = () => {
              logger.warn(`[Pool Viewer] Failed to preload: ${url}`);
              resolve();
            };
          })
      )
    );
  };

  const updatePagination = (page, hasNextPage) => {
    const prevDisabled = page === 1;
    const nextDisabled = hasNextPage === null ? true : !hasNextPage;
    paginationContainer.innerHTML = `
            <button id="prev-page-btn" class="pagination-btn" ${
              prevDisabled ? "disabled" : ""
            }>&larr; Prev</button>
            <span class="text-white font-semibold px-4">Page ${page}</span>
            <button id="next-page-btn" class="pagination-btn" ${
              nextDisabled ? "disabled" : ""
            }>Next &rarr;</button>
        `;
  };

  const fetchPools = async (page = 1, query = "") => {
    if (currentController) currentController.abort();
    currentController = new AbortController();
    const fetchId = ++currentPoolsFetchId;
    logger.log(
      `[Pool Viewer] Starting to fetch pools list. Page: ${page}, Query: "${query}", Fetch ID: ${fetchId}`
    );

    poolsContainer.innerHTML =
      '<div class-="col-span-full text-center"><div class="spinner mx-auto"></div></div>';
    const searchQuery = query ? `search[name_matches]=*${query}*` : "";
    const poolListData = await apiRequest(
      `pools.json?${searchQuery}&page=${page}&limit=12`, null, { signal: currentController.signal }
    );

    if (poolListData?.aborted || fetchId !== currentPoolsFetchId) {
      logger.log(
        `[Pool Viewer] Aborting pools list render. Fetch ID ${fetchId} is stale or aborted.`
      );
      return;
    }

    poolsContainer.innerHTML = "";
    if (poolListData && poolListData.length > 0) {
      logger.log(
        `[Pool Viewer] Found ${poolListData.length} pools. Rendering cards.`
      );
      
      for (const pool of poolListData) {
        const card = document.createElement("div");
        card.className = "pool-card content-box";
        card.dataset.poolId = pool.id;
        card.dataset.poolName = pool.name;
        card.innerHTML = `
          <div class="w-full h-40 bg-gray-900 rounded mb-3 flex items-center justify-center thumb-container">
              <div class="spinner"></div>
          </div>
          <div>
              <h3 class="font-bold truncate">${pool.name.replace(
                /_/g,
                " "
              )}</h3>
              <p class="text-sm text-gray-400">ID: ${
                pool.id
              } &bull; ${pool.post_count} posts</p>
          </div>
        `;
        poolsContainer.appendChild(card);
        loadPoolThumbnail(
          pool.id,
          card.querySelector(".thumb-container"),
          fetchId,
          currentController.signal
        );
      }
      
      staggeredFadeIn(poolsContainer.querySelectorAll(".pool-card"));
      
    } else {
      logger.warn("[Pool Viewer] No pools found for this query.");
      poolsContainer.innerHTML =
        '<p class="col-span-full text-center text-gray-400">No pools found.</p>';
    }
    updatePagination(page, poolListData?.length === 12);
  };

  const loadPoolThumbnail = async (poolId, thumbContainer, fetchId, signal) => {
    logger.log(
      `[Pool Viewer] Loading thumbnail for Pool ID: ${poolId}, Fetch ID: ${fetchId}`
    );
    const postData = await apiRequest(
      `posts.json?tags=pool:${poolId} order:id limit:1`, null, { signal }
    );
    if (postData?.aborted || fetchId !== currentPoolsFetchId) {
      logger.log(
        `[Pool Viewer] Aborting thumbnail load for Pool ID: ${poolId}. Fetch ID ${fetchId} is stale or aborted.`
      );
      return;
    }

    if (postData?.posts?.length > 0) {
      const post = postData.posts[0];
      let thumbnailUrl = (post.sample && post.sample.has && post.sample.url)
        ? post.sample.url
        : post.preview.url;
      let isBlacklisted = post.flags.deleted || (post.tags.general && post.tags.general.includes("young"));

      if (!thumbnailUrl && post.file?.md5) {
        thumbnailUrl = `https://static1.e621.net/data/sample/${post.file.md5.substring(0, 2)}/${post.file.md5.substring(2, 4)}/${post.file.md5}.jpg`;
        logger.warn(`[Pool Viewer] No usable URL found for pool ${poolId}. Constructing from MD5: ${thumbnailUrl}`);
      } else if (!thumbnailUrl && post.file && post.file.url) {
        thumbnailUrl = post.file.url;
        logger.warn(`[Pool Viewer] No usable URL found for pool ${poolId}. Using file URL: ${thumbnailUrl}`);
      }
      
      if (thumbnailUrl) {
        const img = document.createElement("img");
        img.src = `https://corsproxy.io/?url=${encodeURIComponent(thumbnailUrl)}`;
        img.className = "w-full h-full object-cover rounded opacity-0 transition-opacity duration-500";
        img.onload = () => {
          if (fetchId === currentPoolsFetchId) {
            thumbContainer.innerHTML = "";
            thumbContainer.appendChild(img);
            setTimeout(() => img.classList.remove("opacity-0"), 20);
          }
        };
        img.onerror = () => {
          logger.error(`[Pool Viewer] Failed to load thumbnail from URL: ${thumbnailUrl}.`);
          if (fetchId === currentPoolsFetchId) {
            thumbContainer.innerHTML = `<span class="text-gray-500 text-sm">No Preview</span>`;
          }
        };

        if (isBlacklisted) {
           const thumbWrapper = document.createElement("div");
           thumbWrapper.className = "relative w-full h-full blacklisted-thumb";
           thumbWrapper.appendChild(img);
           thumbWrapper.innerHTML += `<div class="censor-overlay">Blacklisted</div>`;
           thumbContainer.innerHTML = "";
           thumbContainer.appendChild(thumbWrapper);
        } else {
           thumbContainer.innerHTML = "";
           thumbContainer.appendChild(img);
        }
      } else {
        logger.warn(`[Pool Viewer] No usable URL found for pool ${poolId}.`);
        thumbContainer.innerHTML = `<span class="text-gray-500 text-sm">No Preview</span>`;
      }
    } else {
      logger.warn(`[Pool Viewer] No posts found for pool ${poolId}.`);
      thumbContainer.innerHTML = `<span class="text-gray-500 text-sm">Could not load preview.</span>`;
    }
  };


  const openViewer = async (poolId, poolName) => {
    if (currentController) currentController.abort();
    currentController = new AbortController();
    const fetchId = ++currentPoolsFetchId;
    logger.log(`[Pool Viewer] Opening viewer for Pool ID: ${poolId}, Name: "${poolName}". New Fetch ID: ${fetchId}`);

    await fadeOutAndIn(mainContainer, async () => {
      viewerModal.classList.remove("hidden");
    });

    imageViewer.classList.add("hidden");
    thumbnailGridView.classList.remove("hidden");
    thumbLoader.classList.add("visible");
    thumbnailGridContent.innerHTML = "";
    thumbPaginationContainer.innerHTML = "";
    thumbnailGridTitle.textContent = `Select an image from "${poolName.replace(
      /_/g,
      " "
    )}"`;
    
    // Check if JSZip library is loaded
    if (typeof JSZip === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        script.onload = () => logger.log('JSZip library loaded successfully.');
        document.head.appendChild(script);
    }
    
    viewPoolOnSiteBtn.href = `https://e621.net/pools/${poolId}`;

    logger.log(`[Pool Viewer] Fetching post details for pool ID: ${poolId}.`);
    const poolData = await apiRequest(`pools/${poolId}.json`, null, { signal: currentController.signal });
    if (poolData?.aborted || fetchId !== currentPoolsFetchId) {
        logger.log(`[Pool Viewer] Aborting pool viewer open. Fetch ID ${fetchId} is stale or aborted.`);
        return;
    }

    if (!poolData?.post_ids?.length) {
      logger.error(
        "[Pool Viewer] Failed to load pool data or pool is empty.",
        poolData
      );
      thumbnailGridContent.innerHTML =
        "<p class='text-red-400 col-span-full text-center'>Could not load this pool.</p>";
      thumbLoader.classList.remove("visible");
      return;
    }

    logger.log(`[Pool Viewer] Fetching post details for ${poolData.post_ids.length} posts.`);
    const postsData = await apiRequest(
      `posts.json?tags=id:${poolData.post_ids.join(",")}&limit=${
        poolData.post_ids.length
      }`, null, { signal: currentController.signal }
    );
    if (postsData?.aborted || fetchId !== currentPoolsFetchId) {
        logger.log(`[Pool Viewer] Aborting post details fetch. Fetch ID ${fetchId} is stale or aborted.`);
        return;
    }

    if (postsData?.posts && postsData.posts.length > 0) {
      const postsById = postsData.posts.reduce(
        (acc, post) => ({ ...acc, [post.id]: post }),
        {}
      );
      currentPool = {
        ...poolData,
        posts: poolData.post_ids.map((id) => postsById[id]).filter(Boolean),
      };
      
      currentThumbPage = 1;
      displayThumbnailPage(currentThumbPage);
      document.addEventListener("keydown", handleKeyDown);
    } else {
      logger.error(
        "[Pool Viewer] Failed to fetch post details for the pool.",
        postsData
      );
      thumbnailGridContent.innerHTML =
        "<p class='text-red-400 col-span-full text-center'>Could not load post details.</p>";
      thumbLoader.classList.remove("visible");
    }
  };

  const displayThumbnailPage = async (page) => {
    thumbLoader.classList.add("visible");
    const showBlacklisted = gridShowBlacklistedToggle.checked;
    const updateContent = async () => {
      thumbnailGridContent.innerHTML = "";
      if (!currentPool) {
        logger.error("[Pool Viewer] currentPool is null. Cannot display thumbnails.");
        thumbLoader.classList.remove("visible");
        return;
      }
      const postsToRender = currentPool.posts.filter(p => showBlacklisted || !p.flags.deleted);
      const start = (page - 1) * THUMBS_PER_PAGE;
      const postsForPage = postsToRender.slice(
        start,
        start + THUMBS_PER_PAGE
      );
      logger.log(`[Pool Viewer] Displaying posts on page ${page}:`, postsForPage.map(p => p.id));

      for (const [index, post] of postsForPage.entries()) {
        const thumbContainer = document.createElement("div");
        thumbContainer.className = "relative w-full aspect-square";
        
        let postToRender = post;
        let imageUrl = postToRender.preview.url || postToRender.file.url;
        let isBlacklisted = postToRender.flags.deleted || (postToRender.tags.general && postToRender.tags.general.includes("young"));

        if (!imageUrl) {
          if (postToRender.file?.md5) {
            imageUrl = `https://static1.e621.net/data/sample/${postToRender.file.md5.substring(0, 2)}/${postToRender.file.md5.substring(2, 4)}/${postToRender.file.md5}.jpg`;
            logger.warn(`[Pool Viewer] Post ID ${postToRender.id}: No usable URL found, constructing from MD5. Constructed URL: ${imageUrl}`);
          } else {
            logger.warn(`[Pool Viewer] Post ID ${postToRender.id}: No MD5 hash found. Making separate API call.`);
            const credentials = JSON.parse(localStorage.getItem('e621credentials') || '{}');
            try {
              const postDetails = await apiRequest(`posts/${postToRender.id}.json`, credentials);
              const postData = postDetails?.post || postDetails; // Handle both response formats
              if (postData?.file?.md5) {
                imageUrl = `https://static1.e621.net/data/sample/${postData.file.md5.substring(0, 2)}/${postData.file.md5.substring(2, 4)}/${postData.file.md5}.jpg`;
                isBlacklisted = postData.flags.deleted || (postData.tags.general && postData.tags.general.includes("young"));
                logger.log(`[Pool Viewer] Post ID ${postToRender.id}: Retrieved MD5 hash from secondary API call. Constructed URL: ${imageUrl}`);
              }
            } catch(e) {
              logger.error(`[Pool Viewer] Post ID ${postToRender.id}: Failed to retrieve post details.`, e);
            }
          }
        }
        
        logger.log(`[Pool Viewer] Post ID ${postToRender.id}: Blacklisted status: ${isBlacklisted}. URL: ${imageUrl}. Should be censored: ${isBlacklisted && !showBlacklisted}`);
        
        if (imageUrl) {
          const thumb = document.createElement("img");
          thumb.src = `https://corsproxy.io/?url=${encodeURIComponent(imageUrl)}`;
          thumb.className = "pool-thumbnail w-full h-full object-cover";
          thumb.dataset.index = start + index;
          thumbContainer.appendChild(thumb);
          if (isBlacklisted && !showBlacklisted) {
            thumbContainer.classList.add("blacklisted-thumb");
            thumbContainer.innerHTML += `<div class="censor-overlay">Blacklisted</div>`;
          }
          thumbContainer.addEventListener('click', () => {
            showImageViewer(start + index);
          });
        } else {
          logger.warn(`[Pool Viewer] Post ID ${postToRender.id}: No usable URL or MD5 hash found.`);
          thumbContainer.className += " flex items-center justify-center";
          thumbContainer.innerHTML = `<span class="text-gray-500 text-sm text-center">No Preview</span>`;
        }
        thumbnailGridContent.appendChild(thumbContainer);
      }
      staggeredFadeIn(thumbnailGridContent.querySelectorAll("img.pool-thumbnail"));
    };

    await fadeOutAndIn(thumbnailGridContent, updateContent);
    renderThumbPagination();
    thumbLoader.classList.remove("visible");
  };

  const renderThumbPagination = () => {
    const postsToShow = currentPool.posts.filter(p => !p.flags.deleted || gridShowBlacklistedToggle.checked);
    const totalPages = Math.ceil(postsToShow.length / THUMBS_PER_PAGE);
    if (totalPages <= 1) {
      thumbPaginationContainer.innerHTML = "";
      return;
    }
    thumbPaginationContainer.innerHTML = `
            <button data-page="${
              currentThumbPage - 1
            }" class="pagination-btn" ${
      currentThumbPage === 1 ? "disabled" : ""
    }>&larr; Prev</button>
            <span class="text-white font-semibold px-4">Page ${currentThumbPage} of ${totalPages}</span>
            <button data-page="${
              currentThumbPage + 1
            }" class="pagination-btn" ${
      currentThumbPage === totalPages ? "disabled" : ""
    }>Next &rarr;</button>
        `;
  };

  const applyTransform = () => {
    const transform = `scale(${zoomState.scale}) translate(${zoomState.x}px, ${zoomState.y}px)`;
    [imageA, imageB].forEach((img) => (img.style.transform = transform));
  };

  const resetZoom = () => {
    zoomState = { scale: 1, x: 0, y: 0 };
    artContainer.classList.remove("zoomed");
    [imageA, imageB].forEach((img) => {
      img.style.transition =
        "opacity 0.4s ease-in-out, transform 0.3s ease-out";
    });
    applyTransform();
  };

  const showImageViewer = async (startIndex) => {
    fadeOutAndIn(thumbnailGridView, () => {
      imageViewer.classList.remove("hidden");
      thumbnailGridView.classList.add("hidden");
      isImageViewActive = true;
      currentPostIndex = startIndex;
      navigationCount = 0;
      switchImage();
      preloadSampleImages(startIndex, 2);
    });
  };

  const hideImageViewer = () => {
    fadeOutAndIn(imageViewer, () => {
      imageViewer.classList.add("hidden");
      thumbnailGridView.classList.remove("hidden");
      isImageViewActive = false;
    });
  };

  const closeViewer = () => {
    fadeOutAndIn(viewerModal, () => {
      viewerModal.classList.add("hidden");
      mainContainer.style.display = "block";
      isImageViewActive = false;
      document.removeEventListener("keydown", handleKeyDown);
      currentPool = null;
      imageA.src = "";
      imageB.src = "";
    });
  };

  const switchImage = async () => {
    if (!currentPool) return;
    isNavigating = true;
    fullImageLoader.classList.add("visible");
    resetZoom();

    let post = currentPool.posts[currentPostIndex];

    if (!post || !post.file?.md5) {
        const credentials = JSON.parse(localStorage.getItem('e621credentials') || '{}');
        try {
            const postDetails = await apiRequest(`posts/${post.id}.json`, credentials);
            post = postDetails?.post || postDetails;
        } catch(e) {
            logger.error(`[Pool Viewer] Failed to retrieve full post data for post ${post.id}.`, e);
            fullImageLoader.classList.remove("visible");
            return;
        }
    }
    
    if (!post || !post.file) {
      logger.error("[Pool Viewer] Missing post data or file URL.");
      fullImageLoader.classList.remove("visible");
      return;
    }

    let initialUrl = (post.sample && post.sample.has && post.sample.url)
      ? post.sample.url
      : post.preview?.url;
    let finalUrl = post.file?.url;

    if (!initialUrl && post.file?.md5) {
      initialUrl = `https://static1.e621.net/data/sample/${post.file.md5.substring(0, 2)}/${post.file.md5.substring(2, 4)}/${post.file.md5}.jpg`;
      finalUrl = `https://static1.e621.net/data/${post.file.md5.substring(0, 2)}/${post.file.md5.substring(2, 4)}/${post.file.md5}.${post.file.ext}`;
      logger.warn(`[Pool Viewer] Post ID ${post.id}: Using constructed URLs from MD5 hash.`);
    }
    
    if (!initialUrl) {
      logger.error(`[Pool Viewer] Failed to find any usable URL for post ${post.id}.`);
      fullImageLoader.classList.remove("visible");
      return;
    }

    inactiveImage.src = `https://corsproxy.io/?url=${encodeURIComponent(
      initialUrl
    )}`;
    inactiveImage.onload = () => {
      activeImage.classList.add("inactive");
      inactiveImage.classList.remove("inactive");
      [activeImage, inactiveImage] = [inactiveImage, activeImage];
      isNavigating = false;
      fullImageLoader.classList.remove("visible");

      if (initialUrl !== finalUrl) {
        const fullResImage = new Image();
        fullResImage.src = `https://corsproxy.io/?url=${encodeURIComponent(
          finalUrl
        )}`;
        fullResImage.onload = () => {
          if (currentPool?.posts[currentPostIndex]?.id === post.id) {
            activeImage.src = fullResImage.src;
          }
        };
      }
    };
    inactiveImage.onerror = () => {
      logger.error(`[Pool Viewer] Failed to load main image for post ${post.id}. URL: ${inactiveImage.src}`);
      fullImageLoader.classList.remove("visible");
    };

    const isBlacklisted = post.flags.deleted || (post.tags.general && post.tags.general.includes("young"));
    
    logger.log(`[Pool Viewer] Post ID ${post.id}: Blacklisted status: ${isBlacklisted}. Viewer toggle state: ${viewAllBlacklistedToggle.checked}`);
    if (isBlacklisted && !viewAllBlacklistedToggle.checked) {
      blacklistedWarningOverlay.classList.remove("hidden");
    } else {
      blacklistedWarningOverlay.classList.add("hidden");
    }

    updateMetadata();
  };

  const navigateImage = (direction) => {
    if (!currentPool || isNavigating) return;
    navigationCount++;
    currentPostIndex =
      (currentPostIndex + direction + currentPool.posts.length) %
      currentPool.posts.length;
    switchImage();
    if (navigationCount % 2 === 0) {
      preloadSampleImages(currentPostIndex, 2, direction);
    }
  };

  const preloadSampleImages = (startIndex, count, direction = 1) => {
    if (!currentPool) return;
    const urlsToPreload = new Set();
    for (let i = 1; i <= count; i++) {
      const nextIndex =
        (startIndex + i * direction + currentPool.posts.length) %
        currentPool.posts.length;
      const nextPost = currentPool.posts[nextIndex];
      const url = nextPost?.sample.has
        ? nextPost.sample.url
        : nextPost?.file.url;
      if (url)
        urlsToPreload.add(
          `https://corsproxy.io/?url=${encodeURIComponent(url)}`
        );
    }
    if (urlsToPreload.size > 0) _preloadImageUrls(Array.from(urlsToPreload));
  };

  const updateMetadata = () => {
    const post = currentPool.posts[currentPostIndex];
    const artists = post.tags.artist.join(", ").replace(/_/g, " ");
    viewOnE621Btn.href = `https://e621.net/posts/${post.id}`;
    metadataId.textContent = `Post ID: ${post.id} (${currentPostIndex + 1} / ${
      currentPool.posts.length
    })`;
    metadataArtists.textContent = `by ${artists || "Unknown Artist"}`;
  };

  const handleDownload = async (size) => {
    if (typeof JSZip === "undefined") {
      logger.error("JSZip library is not loaded. Please wait or refresh.");
      return;
    }
    if (!currentPool) return;
    
    const postsToDownload = currentPool.posts;
    const downloadUrls = postsToDownload.map(post => {
      let url;
      if (size === 'sample' && post.sample?.url) {
        url = post.sample.url;
      } else if (size === 'full' && post.file?.url) {
        url = post.file.url;
      } else if (post.file?.md5) {
         const extension = size === 'sample' ? 'jpg' : post.file.ext;
         url = `https://static1.e621.net/data/${post.file.md5.substring(0, 2)}/${post.file.md5.substring(2, 4)}/${post.file.md5}.${extension}`;
      }
      return url;
    }).filter(Boolean);

    if (downloadUrls.length === 0) {
      logger.warn("No posts to download.");
      return;
    }
    
    logger.log(`Starting download for ${downloadUrls.length} posts...`);
    
    const zip = new JSZip();
    for (const url of downloadUrls) {
      const filename = url.split('/').pop();
      try {
        const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const blob = await response.blob();
        zip.file(filename, blob);
      } catch (error) {
        logger.error(`Failed to download ${filename}: ${error.message}`);
      }
    }

    const zipFilename = `${currentPool.name}_${size}.zip`;
    zip.generateAsync({ type: "blob" }).then(function(blob) {
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = window.URL.createObjectURL(blob);
        a.download = zipFilename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(a.href);
        a.remove();
        logger.log(`Zip file '${zipFilename}' created successfully.`);
    });
  };

  const toggleFullscreen = () => {
    imageViewer.classList.toggle("fullscreen");
  };

  const handleZoomButton = (direction) => {
    const newScale = Math.max(
      1,
      Math.min(10, zoomState.scale + direction * 0.5)
    );
    zoomState.scale = newScale;
    if (newScale === 1) {
      resetZoom();
    } else {
      artContainer.classList.add("zoomed");
    }
    applyTransform();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      if (imageViewer.classList.contains("fullscreen")) {
        toggleFullscreen();
      } else if (isImageViewActive) {
        hideImageViewer();
      } else {
        closeViewer();
      }
    }
    if (isImageViewActive) {
      if (e.key === "ArrowLeft" || e.key === "a") navigateImage(-1);
      if (e.key === "ArrowRight" || e.key === "d") navigateImage(1);
    }
  };

  [imageA, imageB].forEach((img) => {
    img.addEventListener("dragstart", (e) => e.preventDefault());
  });

  closeThumbViewBtn.addEventListener("click", closeViewer);
  backToGridBtn.addEventListener("click", hideImageViewer);
  fullscreenBtn.addEventListener("click", toggleFullscreen);
  prevBtn.addEventListener("click", () => navigateImage(-1));
  nextBtn.addEventListener("click", () => navigateImage(1));
  downloadBtn.addEventListener("click", () => handleDownload('full'));
  zoomInBtn.addEventListener("click", () => handleZoomButton(1));
  zoomOutBtn.addEventListener("click", () => handleZoomButton(-1));
  zoomResetBtn.addEventListener("click", resetZoom);
  showBlacklistedToggle.addEventListener("change", () => displayThumbnailPage(currentThumbPage));
  viewOnceBtn.addEventListener("click", () => blacklistedWarningOverlay.classList.add("hidden"));
  viewAllBlacklistedToggle.addEventListener("change", (e) => {
      viewAllBlacklisted = e.target.checked;
      blacklistedWarningOverlay.classList.add("hidden");
  });
  downloadOptions.forEach(btn => {
      btn.addEventListener('click', (e) => {
          handleDownload(e.target.dataset.size);
      });
  });

  artContainer.addEventListener("mousedown", (e) => {
    if (zoomState.scale <= 1) return;
    panState.isPanning = true;
    panState.startX = e.clientX - zoomState.x;
    panState.startY = e.clientY - zoomState.y;
    artContainer.classList.add("panning");
    [imageA, imageB].forEach((img) => (img.style.transition = "none"));
  });

  artContainer.addEventListener("mouseup", () => {
    panState.isPanning = false;
    artContainer.classList.remove("panning");
    [imageA, imageB].forEach(
      (img) =>
        (img.style.transition =
          "opacity 0.4s ease-in-out, transform 0.3s ease-out")
    );
  });

  artContainer.addEventListener("mouseleave", () => {
    panState.isPanning = false;
    artContainer.classList.remove("panning");
  });

  artContainer.addEventListener("mousemove", (e) => {
    if (!panState.isPanning) return;
    e.preventDefault();
    zoomState.x = e.clientX - panState.startX;
    zoomState.y = e.clientY - panState.startY;
    applyTransform();
  });

  artContainer.addEventListener("wheel", (e) => {
    if (zoomState.scale <= 1) return;
    e.preventDefault();
    zoomState.y -= e.deltaY;
    applyTransform();
  });

  poolsContainer.addEventListener("click", (e) => {
    const card = e.target.closest("[data-pool-id]");
    if (card) {
      logger.log(`[Pool Viewer] Clicked on pool card for ID: ${card.dataset.poolId}. Aborting main page thumbnail loading and opening viewer.`);
      openViewer(card.dataset.poolId, card.dataset.poolName);
    }
  });
  thumbnailGridContent.addEventListener('click', (e) => {
    const thumbContainer = e.target.closest('div.relative.w-full.aspect-square');
    if (thumbContainer) {
      const index = parseInt(thumbContainer.querySelector('img')?.dataset?.index);
      if (!isNaN(index)) {
        showImageViewer(index);
      }
    }
  });
  gridShowBlacklistedToggle.addEventListener("change", () => {
    displayThumbnailPage(currentThumbPage);
  });
  thumbPaginationContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-page]");
    if (btn && !btn.disabled) {
      const newPage = parseInt(btn.dataset.page);
      thumbnailGridView.scrollTo({ top: 0, behavior: "smooth" });
      currentThumbPage = newPage;
      displayThumbnailPage(newPage);
    }
  });
  paginationContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn || btn.disabled) return;
    const pageDelta = btn.id === "prev-page-btn" ? -1 : 1;
    currentPage += pageDelta;
    mainContainer
      .querySelector(".content-box")
      .scrollIntoView({ behavior: "smooth", block: "start" });
    fadeOutAndIn(poolsContainer, () =>
      fetchPools(currentPage, searchInput.value)
    );
  });
  let searchTimeout;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentPage = 1;
      fadeOutAndIn(poolsContainer, () =>
        fetchPools(currentPage, searchInput.value)
      );
    }, 500);
  });

  fetchPools();
};