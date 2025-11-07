import { apiRequest } from "../lib/api.js"
import {
  staggeredFadeIn,
  createPostPreview,
  createTagButton,
  logger,
} from "../lib/utils.js"
import { Autocomplete } from "../lib/autocomplete.js"
import { setPosts, setPost, getPost } from "../lib/post-cache.js"

const dtextToHtmlBasic = (dtext, config) => {
  if (!dtext) return ""
  const wikiBaseUrl = config.wiki?.baseUrl || ""
  let html = dtext
  html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  html = html.replace(/(\r\n|\n|\r)/gm, "\n")
  html = html.replace(/h(1|2|3|4|5|6)\. (.*)/g, "<h4>$2</h4>")
  html = html.replace(/\[b\](.*?)\[\/b\]/g, "<strong>$1</strong>")
  html = html.replace(/\[i\](.*?)\[\/i\]/g, "<em>$1</em>")
  html = html.replace(/\[quote\]([\s\S]*?)\[\/quote\]/g, "<blockquote>$1</blockquote>")
  html = html.replace(
    /\[\[(.*?)\|(.*?)\]\]/g,
    (_, target, linkText) =>
      `<a href="${wikiBaseUrl}${target
        .trim()
        .replace(/ /g, "_")}" target="_blank" rel="noopener noreferrer">${linkText}</a>`
  )
  html = html.replace(
    /\[\[(.*?)\]\]/g,
    (_, target) =>
      `<a href="${wikiBaseUrl}${target
        .trim()
        .replace(/ /g, "_")}" target="_blank" rel="noopener noreferrer">${target.replace(/_/g, " ")}</a>`
  )
  html = html.replace(
    /^"(.+?)":\s*(https?:\/\/[^\s]+)/gm,
    `<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>`
  )
  html = html.replace(
    /^(https?:\/\/[^\s]+)/gm,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  )
  html = html.replace(
    /post #(\d+)/g,
    '<a href="https://e621.net/posts/$1" target="_blank" rel="noopener noreferrer">post #$1</a>'
  )
  let currentListLevel = 0
  const lines = html.split("\n")
  let processedHtml = ""
  lines.forEach((line) => {
    const listMatch = line.match(/^(\*+)\s(.*)/)
    if (listMatch) {
      const level = listMatch[1].length
      const content = listMatch[2]
      while (level > currentListLevel) {
        processedHtml += "<ul>"
        currentListLevel++
      }
      while (level < currentListLevel) {
        processedHtml += "</ul>"
        currentListLevel--
      }
      processedHtml += `<li>${content}</li>`
    } else {
      while (currentListLevel > 0) {
        processedHtml += "</ul>"
        currentListLevel--
      }
      processedHtml += line + "\n"
    }
  })
  while (currentListLevel > 0) {
    processedHtml += "</ul>"
    currentListLevel--
  }
  html = processedHtml.replace(/\n/g, "<br>")
  html = html.replace(/<br><br>/g, "<p>")
  return html
}

async function parseDtext(dtext, config = {}) {
  let html = dtextToHtmlBasic(dtext, config)
  const thumbMatches = [...html.matchAll(/thumb #(\d+)/g)]
  if (thumbMatches.length > 0) {
    const postIds = [...new Set(thumbMatches.map((m) => m[1]))].join(",")
    const postData = await apiRequest(`posts.json?tags=id:${postIds}`)
    if (postData?.posts) {
      const postMap = new Map(postData.posts.map((p) => [p.id.toString(), p]))
      thumbMatches.forEach((match) => {
        const postId = match[1]
        const post = postMap.get(postId)
        if (post?.preview?.url) {
          const thumbHtml = `<a href="https://e621.net/posts/${postId}" target="_blank" rel="noopener noreferrer"><img src="${post.preview.url}" style="max-width:150px;display:inline-block;margin:0.5rem;" class="pool-thumbnail"></a>`
          html = html.replace(new RegExp(match[0], "g"), thumbHtml)
        }
      })
    }
  }
  return html.replace(/thumb #\d+/g, "")
}

export const render = () => {
  return `
    <div class="page-container anim-fade-in-up">
      <div class="mb-8">
        <a href="#/" data-link class="bg-gray-700 text-cyan-400 font-bold py-2 px-4 rounded-lg inline-flex items-center">&larr; Back to the hub</a>
      </div>

      <div class="content-box bg-gray-800">
        <h1 class="text-3xl md:text-4xl font-bold mb-2 text-center text-cyan-400">Tag Dashboard</h1>
        <p class="text-gray-400 mb-6 text-center">A centralized dashboard to manage tags, wikis, and posts.</p>

        <div class="w-full max-w-2xl mx-auto">
          <div>
            <label for="tag-search-input" class="block text-sm font-medium text-gray-300 mb-2 text-center">Search for a Tag to Manage</label>
            <div class="flex">
              <input type="text" id="tag-search-input" class="w-full bg-gray-700 border-gray-600 rounded-l-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none text-center text-lg" placeholder="e.g., canine_female" autocomplete="off">
              <button id="tag-search-btn" class="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-r-lg">Search</button>
            </div>
          </div>

          <div class="relative flex items-center justify-center my-6">
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="w-full border-t border-gray-700"></div>
            </div>
            <div class="relative flex justify-center">
              <span class="px-2 bg-gray-800 text-sm text-gray-400">or</span>
            </div>
          </div>

          <div class="text-center">
            <button id="create-new-tag-btn" class="pagination-btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg">Create a New Tag</button>
          </div>
        </div>
      </div>

      <div id="dashboard-main" class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 hidden">
        <div class="lg:col-span-1 space-y-8">
          <div id="tag-info-box" class="content-box">
            <div class="spinner-small mx-auto"></div>
          </div>
          <div id="wiki-box" class="content-box">
            <div class="spinner-small mx-auto"></div>
          </div>
          <div id="tag-relationships-box" class="content-box">
            <div class="spinner-small mx-auto"></div>
          </div>
        </div>

        <div class="lg:col-span-2 space-y-8">
          <div id="post-tools-box" class="content-box">
            <h2 class="text-2xl font-bold text-cyan-400 mb-4">Post Tools</h2>
            <div id="post-tools-controls" class="hidden space-y-4">
              <p id="post-count-display" class="text-gray-400"></p>
              <div class="grid grid-cols-2 gap-4">
                <button id="mass-tag-edit-btn" class="pagination-btn bg-purple-600 hover:bg-purple-700">Mass Tag Edit</button>
                <button id="create-pool-btn" class="pagination-btn bg-emerald-600 hover:bg-emerald-700">Create Pool from Posts</button>
              </div>
            </div>
          </div>

          <div class="content-box h-full">
            <h2 class="text-2xl font-bold text-cyan-400 mb-4">Fetched Posts</h2>
            <div id="posts-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 min-h-[200px]">
              <div class="spinner-small mx-auto col-span-full"></div>
            </div>
            <div id="load-more-posts-container" class="text-center mt-6 hidden">
              <button id="load-more-posts-btn" class="pagination-btn">Load More Posts</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

export const afterRender = () => {
  const input = document.getElementById("tag-search-input")
  const searchBtn = document.getElementById("tag-search-btn")
  const createNewTagBtn = document.getElementById("create-new-tag-btn")
  const dashboardMain = document.getElementById("dashboard-main")
  const tagInfoBox = document.getElementById("tag-info-box")
  const wikiBox = document.getElementById("wiki-box")
  const relationshipsBox = document.getElementById("tag-relationships-box")
  const postsGrid = document.getElementById("posts-grid")
  const postToolsControls = document.getElementById("post-tools-controls")
  const postCountDisplay = document.getElementById("post-count-display")
  const loadMoreBtn = document.getElementById("load-more-posts-btn")

  const massTagEditBtn = document.getElementById("mass-tag-edit-btn")
  const createPoolBtn = document.getElementById("create-pool-btn")

  const tagCategoryColors = {
    0: "#3b82f6",
    1: "#ec4899",
    3: "#a855f7",
    4: "#22c55e",
    5: "#eab308",
  }
  const tagCategoryNames = {
    0: "General",
    1: "Artist",
    3: "Copyright",
    4: "Character",
    5: "Species",
  }

  let currentTag = null
  let currentWiki = null
  let fetchedPosts = []
  let currentPostPage = 1
  let lazyLoadObserver = null
  let massEditTags = []

  const initializeLazyLoader = () => {
    lazyLoadObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.src = img.dataset.src
          img.classList.add("loaded")
          observer.unobserve(img)
        }
      })
    })
  }

  new Autocomplete(
    input,
    async (q) => await apiRequest(`tags/autocomplete.json?search[name_matches]=${encodeURIComponent(q)}`),
    tagCategoryColors,
    tagCategoryNames
  )

  const searchTag = async (tagName) => {
    const trimmed = (tagName || "").trim()
    if (!trimmed) return
    currentTag = trimmed
    currentPostPage = 1
    fetchedPosts = []
    dashboardMain.classList.remove("hidden")
    tagInfoBox.innerHTML = `<div class="spinner-small mx-auto"></div>`
    wikiBox.innerHTML = `<div class="spinner-small mx-auto"></div>`
    relationshipsBox.innerHTML = `<div class="spinner-small mx-auto"></div>`
    postsGrid.innerHTML = `<div class="spinner-small mx-auto col-span-full"></div>`
    postToolsControls.classList.add("hidden")
    staggeredFadeIn(dashboardMain.querySelectorAll(".content-box"))

    const [tagDataRaw, wikiDataRaw, aliasDataRaw, implicationDataRaw] = await Promise.all([
      apiRequest(`tags.json?search[name]=${encodeURIComponent(trimmed)}`),
      apiRequest(`wiki_pages.json?search[title]=${encodeURIComponent(trimmed)}`),
      apiRequest(`tag_aliases.json?search[antecedent_name]=${encodeURIComponent(trimmed)}`),
      apiRequest(`tag_implications.json?search[antecedent_name]=${encodeURIComponent(trimmed)}`),
    ].map(p => p.catch((e) => { logger.error(e); return null })))

    if (tagDataRaw == null) {
      tagInfoBox.innerHTML = `<p class="text-red-400 text-center">An error occurred while fetching tag data.</p>`
      wikiBox.innerHTML = ``
      relationshipsBox.innerHTML = ``
      postsGrid.innerHTML = ``
      return
    }

    const tagArray = Array.isArray(tagDataRaw) ? tagDataRaw : []
    const wikiArray = Array.isArray(wikiDataRaw) ? wikiDataRaw : []
    const aliases = aliasDataRaw?.tag_aliases ?? (Array.isArray(aliasDataRaw) ? aliasDataRaw : [])
    const implications = implicationDataRaw?.tag_implications ?? (Array.isArray(implicationDataRaw) ? implicationDataRaw : [])

    const primaryTag = tagArray.find((t) => t.name === trimmed) ?? tagArray[0] ?? null
    currentWiki = wikiArray.length > 0 ? wikiArray[0] : null

    if (!primaryTag) {
      tagInfoBox.innerHTML = `
        <h2 class="text-2xl font-bold text-cyan-400 mb-4">Tag Info</h2>
        <p class="text-red-400 text-center">Tag "${trimmed}" not found.</p>
        <button id="create-searched-tag-btn" class="pagination-btn w-full mt-4 bg-emerald-600 hover:bg-emerald-700">Create Tag: ${trimmed}</button>
      `
      const createBtn = tagInfoBox.querySelector("#create-searched-tag-btn")
      if (createBtn) {
        createBtn.addEventListener("click", () => {
          window.dispatchEvent(new CustomEvent("show-modal", { detail: { modalId: "edit-wiki-modal" } }))
          setTimeout(() => populateNewTagEditor(trimmed), 0)
        })
      }
      wikiBox.innerHTML = `<h2 class="text-2xl font-bold text-cyan-400 mb-4">Wiki</h2><p class="text-gray-500">No wiki page found.</p>`
      relationshipsBox.innerHTML = `<h2 class="text-2xl font-bold text-cyan-400 mb-4">Relationships</h2><p class="text-gray-500">No relationships found.</p>`
      postsGrid.innerHTML = `<p class="text-gray-500 col-span-full">No posts found.</p>`
      return
    }

    renderTagInfo(primaryTag)
    renderWiki(currentWiki)
    renderRelationships(aliases, implications)
    fetchPosts()
  }

  const renderTagInfo = (primaryTag) => {
    const categoryName = tagCategoryNames[primaryTag.category] || "Unknown"
    const categoryColor = tagCategoryColors[primaryTag.category] || "#9ca3af"
    tagInfoBox.innerHTML = `
      <h2 class="text-2xl font-bold text-cyan-400 mb-4">Tag Info</h2>
      <div class="text-center">
        <h3 class="text-3xl font-bold" style="color: ${categoryColor};">${primaryTag.name.replace(/_/g, " ")}</h3>
        <p class="text-gray-400">Category: ${categoryName}</p>
        <p class="text-gray-400">Posts: ${Number(primaryTag.post_count || 0).toLocaleString()}</p>
      </div>
      <button id="edit-tag-btn" class="pagination-btn w-full mt-4 bg-gray-600 hover:bg-gray-700">Edit Tag / Wiki</button>
    `
    const editBtn = document.getElementById("edit-tag-btn")
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        window.dispatchEvent(new CustomEvent("show-modal", { detail: { modalId: "edit-wiki-modal" } }))
        setTimeout(() => populateWikiEditor(), 0)
      })
    }
  }

  const renderWiki = async (wiki) => {
    wikiBox.innerHTML = `<h2 class="text-2xl font-bold text-cyan-400 mb-4">Wiki</h2>`
    if (wiki) {
      const dtextConfig = { wiki: { baseUrl: "https://e621.net/wiki_pages/show_or_new?title=" } }
      const wikiHtml = `<div class="wiki-content">${await parseDtext(wiki.body, dtextConfig)}</div>`
      wikiBox.innerHTML += `<div class="wiki-container-box mt-4">${wikiHtml}</div>`
    } else {
      wikiBox.innerHTML += `<p class="text-gray-500">No wiki page found for this tag.</p>`
    }
  }

  const renderRelationships = (aliasData, implicationData) => {
    relationshipsBox.innerHTML = `<h2 class="text-2xl font-bold text-cyan-400 mb-4">Relationships</h2>`
    let content = ""
    if (aliasData?.length > 0) {
      content += `<h3 class="text-xl font-bold text-cyan-500 mb-2">Aliases</h3>`
      const bc = document.createElement("div")
      bc.className = "flex flex-wrap gap-2 mb-4"
      aliasData.forEach((a) => bc.appendChild(createTagButton(a.consequent_name, searchTag)))
      content += bc.outerHTML
    }
    if (implicationData?.length > 0) {
      content += `<h3 class="text-xl font-bold text-cyan-500 mb-2">Implications</h3>`
      const bc = document.createElement("div")
      bc.className = "flex flex-wrap gap-2"
      implicationData.forEach((imp) => bc.appendChild(createTagButton(imp.consequent_name, searchTag)))
      content += bc.outerHTML
    }
    if (!content) content = `<p class="text-gray-500">No aliases or implications found.</p>`
    relationshipsBox.innerHTML += content
  }

  const fetchPosts = async () => {
    loadMoreBtn.disabled = true
    const postData = await apiRequest(`posts.json?tags=${encodeURIComponent(currentTag)}&limit=24&page=${currentPostPage}`)
    if (currentPostPage === 1) postsGrid.innerHTML = ""
    if (postData?.posts && postData.posts.length > 0) {
      setPosts(postData.posts)
      postData.posts.forEach((post) => {
        const el = createPostPreview(post)
        if (!el) return
        postsGrid.appendChild(el)
        el.addEventListener("click", (e) => {
          e.preventDefault()
          window.dispatchEvent(new CustomEvent("show-modal", { detail: { modalId: "edit-post-modal" } }))
          setTimeout(() => populatePostEditor(post.id), 0)
        })
        const img = el.querySelector(".preview-image")
        if (img && lazyLoadObserver) lazyLoadObserver.observe(img)
      })
      staggeredFadeIn(postsGrid.querySelectorAll(".post-preview-link:not(.anim-fade-in-up)"))
      fetchedPosts.push(...postData.posts)
      postToolsControls.classList.remove("hidden")
      postCountDisplay.textContent = `Showing ${fetchedPosts.length} posts.`
      loadMoreBtn.disabled = false
      loadMoreBtn.parentElement.classList.remove("hidden")
    } else {
      if (currentPostPage === 1) {
        postsGrid.innerHTML = `<p class="text-gray-500 col-span-full">No posts found for this tag.</p>`
      }
      loadMoreBtn.parentElement.classList.add("hidden")
    }
  }

  const populateWikiEditor = () => {
    const titleInput = document.getElementById("wiki-editor-title")
    const bodyInput = document.getElementById("wiki-editor-body")
    const categorySelect = document.getElementById("wiki-editor-category")
    if (!titleInput || !bodyInput || !categorySelect) return
    titleInput.value = currentTag || ""
    let body = currentWiki?.body || ""
    const categoryMatch = body.match(/^category:(\w+)\s*\n*/m)
    if (categoryMatch) {
      const category = categoryMatch[1]
      categorySelect.value = Object.keys(tagCategoryNames).find((k) => tagCategoryNames[k].toLowerCase() === category) || "0"
      body = body.replace(categoryMatch[0], "")
    } else {
      categorySelect.value = "0"
    }
    bodyInput.value = body
    const saveBtn = document.getElementById("wiki-editor-save")
    if (saveBtn) saveBtn.dataset.wikiId = currentWiki?.id || ""
  }

  const populateNewTagEditor = (tagName = "") => {
    const titleInput = document.getElementById("wiki-editor-title")
    const bodyInput = document.getElementById("wiki-editor-body")
    const categorySelect = document.getElementById("wiki-editor-category")
    if (titleInput) titleInput.value = tagName
    if (bodyInput) bodyInput.value = ""
    if (categorySelect) categorySelect.value = "0"
    const saveBtn = document.getElementById("wiki-editor-save")
    if (saveBtn) saveBtn.dataset.wikiId = ""
  }

  const populatePostEditor = (postId) => {
    const post = getPost(postId)
    if (!post) return
    const preview = document.getElementById("post-editor-preview")
    if (preview && post.preview?.url) preview.src = post.preview.url
    const setIf = (id, value) => {
      const el = document.getElementById(id)
      if (el) el.value = value
    }
    setIf("post-editor-tags-general", (post.tags?.general || []).join(" "))
    setIf("post-editor-tags-artist", (post.tags?.artist || []).join(" "))
    setIf("post-editor-tags-character", (post.tags?.character || []).join(" "))
    setIf("post-editor-tags-copyright", (post.tags?.copyright || []).join(" "))
    setIf("post-editor-tags-species", (post.tags?.species || []).join(" "))
    setIf("post-editor-parent", post.parent_id || "")
    const saveBtn = document.getElementById("post-editor-save")
    if (saveBtn) saveBtn.dataset.postId = postId
  }

  const checkCredentials = () => {
    const username = localStorage.getItem("e621Username")
    const apiKey = localStorage.getItem("e621ApiKey")
    if (!username || !apiKey) {
      window.dispatchEvent(new CustomEvent("show-modal", { detail: { modalId: "credentials-modal" } }))
      return false
    }
    return { username, apiKey }
  }

  const savePost = async () => {
    const credentials = checkCredentials()
    if (!credentials) return
    const saveBtn = document.getElementById("post-editor-save")
    if (!saveBtn) return
    const postId = saveBtn.dataset.postId
    const post = getPost(postId)
    if (!post) return
    const logEl = document.getElementById("post-editor-log")
    const tagString = [
      document.getElementById("post-editor-tags-general")?.value,
      document.getElementById("post-editor-tags-artist")?.value,
      document.getElementById("post-editor-tags-character")?.value,
      document.getElementById("post-editor-tags-copyright")?.value,
      document.getElementById("post-editor-tags-species")?.value,
    ].join(" ").trim()
    const parentId = document.getElementById("post-editor-parent")?.value || ""
    const oldTagString = Object.values(post.tags || {}).flat().join(" ")
    const bodyParams = new URLSearchParams()
    bodyParams.append("_method", "patch")
    bodyParams.append("post[tag_string]", tagString)
    bodyParams.append("post[old_tag_string]", oldTagString)
    if (parentId) bodyParams.append("post[parent_id]", parentId)
    if (logEl) logEl.textContent = "Saving..."
    const result = await apiRequest(`posts/${postId}.json`, credentials, { method: "POST", body: bodyParams })
    if (result && (result.success || result.post?.id || result.id)) {
      if (logEl) logEl.textContent = "Save successful!"
      const newPostData = await apiRequest(`posts.json?tags=id:${postId}`)
      if (newPostData?.posts?.[0]) setPost(newPostData.posts[0])
    } else {
      if (logEl) logEl.textContent = `Error: ${result?.error || "Unknown"}`
    }
  }

  const saveWiki = async () => {
    const credentials = checkCredentials()
    if (!credentials) return
    const logEl = document.getElementById("wiki-editor-log")
    const title = document.getElementById("wiki-editor-title")?.value || ""
    let body = document.getElementById("wiki-editor-body")?.value || ""
    const categorySelect = document.getElementById("wiki-editor-category")
    const category = tagCategoryNames[categorySelect?.value] ? tagCategoryNames[categorySelect.value].toLowerCase() : "general"
    const wikiId = document.getElementById("wiki-editor-save")?.dataset.wikiId || ""
    const categoryString = `category:${category}`
    const categoryRegex = /^category:(\w+)\s*\n*/m
    if (categoryRegex.test(body)) body = body.replace(categoryRegex, `${categoryString}\n\n`)
    else body = `${categoryString}\n\n${body}`
    const endpoint = wikiId ? `wiki_pages/${wikiId}.json` : "wiki_pages.json"
    const method = wikiId ? "PUT" : "POST"
    const bodyParams = new URLSearchParams()
    bodyParams.append("wiki_page[title]", title)
    bodyParams.append("wiki_page[body]", body)
    if (logEl) logEl.textContent = "Saving..."
    const result = await apiRequest(endpoint, credentials, { method, body: bodyParams })
    if (result && (result.success || result.id)) {
      if (logEl) logEl.textContent = "Save successful!"
      if (!wikiId && result.title) searchTag(result.title)
      else currentWiki = result.success ? currentWiki : result
    } else {
      if (logEl) logEl.textContent = `Error: ${result?.error || "Unknown"}`
    }
  }

  massTagEditBtn.addEventListener("click", () => {
    massEditTags = []
    renderMassEditTags()
    window.dispatchEvent(new CustomEvent("show-modal", { detail: { modalId: "mass-edit-modal" } }))
  })

  createPoolBtn.addEventListener("click", () => {
    window.dispatchEvent(new CustomEvent("show-modal", { detail: { modalId: "create-pool-modal" } }))
  })

  const renderMassEditTags = () => {
    const container = document.getElementById("mass-edit-tag-list")
    if (!container) return
    container.innerHTML = ""
    if (massEditTags.length === 0) {
      container.innerHTML = `<p class="text-sm text-gray-500 text-center">No tag changes pending.</p>`
      return
    }
    massEditTags.forEach((t) => {
      const isAdd = t.action === "add"
      const pill = document.createElement("button")
      pill.className = `mass-edit-pill ${isAdd ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`
      pill.innerHTML = `<span class="font-bold">${isAdd ? "+" : "−"}</span><span class="mx-1">${t.name}</span><span class="remove-pill-btn" data-tag-name="${t.name}">&times;</span>`
      pill.addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-pill-btn")) return
        t.action = isAdd ? "remove" : "add"
        renderMassEditTags()
      })
      pill.querySelector(".remove-pill-btn").addEventListener("click", (e) => {
        e.stopPropagation()
        massEditTags = massEditTags.filter((x) => x.name !== t.name)
        renderMassEditTags()
      })
      container.appendChild(pill)
    })
  }

  const addTagsToMassEditList = (tagsString) => {
    const tags = (tagsString || "").trim().split(/\s+/).filter(Boolean)
    tags.forEach((name) => {
      if (!massEditTags.some((t) => t.name === name)) massEditTags.push({ name, action: "add" })
    })
    renderMassEditTags()
  }

  const performMassTagEdit = async () => {
    const credentials = checkCredentials()
    if (!credentials) return
    const logEl = document.getElementById("mass-edit-log")
    const tagsToAdd = massEditTags.filter((t) => t.action === "add").map((t) => t.name).join(" ")
    const tagsToRemove = massEditTags.filter((t) => t.action === "remove").map((t) => `-${t.name}`).join(" ")
    const tagDiffString = `${tagsToAdd} ${tagsToRemove}`.trim()
    if (!tagDiffString) {
      if (logEl) logEl.textContent = "No tags specified."
      return
    }
    if (logEl) logEl.textContent = "Starting..."
    let successCount = 0
    let failCount = 0
    for (const [i, post] of fetchedPosts.entries()) {
      if (logEl) logEl.textContent = `Processing post ${i + 1} of ${fetchedPosts.length}...`
      const endpoint = `posts/${post.id}.json`
      const postData = getPost(post.id) || post
      const oldTagString = Object.values(postData.tags || {}).flat().join(" ")
      const bodyParams = new URLSearchParams()
      bodyParams.append("_method", "patch")
      bodyParams.append("post[tag_string_diff]", tagDiffString)
      bodyParams.append("post[old_tag_string]", oldTagString)
      const result = await apiRequest(endpoint, credentials, { method: "POST", body: bodyParams })
      if (result && (result.success || result.post?.id || result.id)) {
        successCount++
        const newPostData = await apiRequest(`posts.json?tags=id:${post.id}`)
        if (newPostData?.posts?.[0]) setPost(newPostData.posts[0])
      } else {
        failCount++
        logger.error(`Failed to update post ${post.id}`, result)
      }
      await new Promise((r) => setTimeout(r, 500))
    }
    if (logEl) logEl.textContent = `Done. ${successCount} posts updated, ${failCount} failed.`
  }

  const performCreatePool = async () => {
    const credentials = checkCredentials()
    if (!credentials) return
    const logEl = document.getElementById("create-pool-log")
    const name = document.getElementById("create-pool-name")?.value.trim() || ""
    const description = document.getElementById("create-pool-description")?.value.trim() || ""
    if (!name) {
      if (logEl) logEl.textContent = "Pool name is required."
      return
    }
    const postIds = fetchedPosts.map((p) => p.id).join(" ")
    const bodyParams = new URLSearchParams()
    bodyParams.append("pool[name]", name)
    bodyParams.append("pool[description]", description)
    bodyParams.append("pool[post_ids]", postIds)
    if (logEl) logEl.textContent = "Creating pool..."
    const result = await apiRequest("pools.json", credentials, { method: "POST", body: bodyParams })
    if (result && (result.success || result.id)) {
      if (logEl) logEl.textContent = `Pool "${result.name || name}" created successfully!`
    } else {
      if (logEl) logEl.textContent = `Error: ${result?.error || "Unknown"}`
    }
  }

  searchBtn.addEventListener("click", () => searchTag(input.value))
  createNewTagBtn.addEventListener("click", () => {
    window.dispatchEvent(new CustomEvent("show-modal", { detail: { modalId: "edit-wiki-modal" } }))
    setTimeout(() => populateNewTagEditor(input.value), 0)
  })
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") searchTag(input.value) })
  loadMoreBtn.addEventListener("click", () => { currentPostPage++; fetchPosts() })

  addModals(tagCategoryColors, tagCategoryNames, {
    performMassTagEdit,
    performCreatePool,
    savePost,
    saveWiki,
    addTagsToMassEditList,
  })

  initializeLazyLoader()
}

const addModals = (tagCategoryColors, tagCategoryNames, eventHandlers) => {
  const categoryOptions = Object.entries(tagCategoryNames).map(([id, name]) => `<option value="${id}">${name}</option>`).join("")
  const modalContainer = document.createElement("div")
  modalContainer.innerHTML = `
    <div id="mass-edit-modal" class="modal pointer-events-none fixed w-full h-full top-0 left-0 flex items-center justify-center opacity-0">
      <div class="modal-overlay absolute w-full h-full bg-gray-900 opacity-50"></div>
      <div class="modal-container bg-gray-800 w-11/12 md:max-w-xl mx-auto rounded-lg shadow-lg z-50 overflow-y-auto">
        <div class="modal-content py-4 text-left px-6">
          <p class="text-2xl font-bold text-white pb-3">Mass Tag Edit</p>
          <p class="text-gray-300 mb-4">Apply tag changes to all fetched posts.</p>
          <div class="space-y-4">
            <div>
              <label for="mass-edit-tag-input" class="editor-label">Tags to Add/Remove</label>
              <div class="flex">
                <input type="text" id="mass-edit-tag-input" class="editor-input rounded-r-none" placeholder="Type tags, press Enter or Add...">
                <button id="mass-edit-add-btn" class="pagination-btn rounded-l-none bg-cyan-600 hover:bg-cyan-700">Add</button>
              </div>
            </div>
            <div id="mass-edit-tag-list" class="flex flex-wrap gap-2 p-2 bg-gray-900 rounded-lg min-h-[100px] max-h-[300px] overflow-y-auto">
              <p class="text-sm text-gray-500 text-center">No tag changes pending.</p>
            </div>
            <p class="text-sm text-gray-400">Click a tag pill to toggle between Add (green) and Remove (red).</p>
            <p id="mass-edit-log" class="text-gray-400 h-4"></p>
          </div>
          <div class="flex justify-end pt-2">
            <button class="modal-cancel px-4 bg-transparent p-3 rounded-lg text-cyan-400 hover:bg-gray-700 mr-2">Cancel</button>
            <button id="mass-edit-save" class="px-4 bg-purple-600 p-3 rounded-lg text-white hover:bg-purple-700">Apply Changes</button>
          </div>
        </div>
      </div>
    </div>

    <div id="create-pool-modal" class="modal pointer-events-none fixed w-full h-full top-0 left-0 flex items-center justify-center opacity-0">
      <div class="modal-overlay absolute w-full h-full bg-gray-900 opacity-50"></div>
      <div class="modal-container bg-gray-800 w-11/12 md:max-w-md mx-auto rounded-lg shadow-lg z-50 overflow-y-auto">
        <div class="modal-content py-4 text-left px-6">
          <p class="text-2xl font-bold text-white pb-3">Create New Pool</p>
          <p class="text-gray-300 mb-4">Create a new pool containing all fetched posts.</p>
          <div class="space-y-4">
            <div>
              <label for="create-pool-name" class="editor-label">Pool Name (must be unique)</label>
              <input type="text" id="create-pool-name" class="editor-input" placeholder="e.g., my_awesome_collection">
            </div>
            <div>
              <label for="create-pool-description" class="editor-label">Description</label>
              <textarea id="create-pool-description" class="editor-input h-24" placeholder="Optional description..."></textarea>
            </div>
            <p id="create-pool-log" class="text-gray-400 h-4"></p>
          </div>
          <div class="flex justify-end pt-2">
            <button class="modal-cancel px-4 bg-transparent p-3 rounded-lg text-cyan-400 hover:bg-gray-700 mr-2">Cancel</button>
            <button id="create-pool-save" class="px-4 bg-emerald-600 p-3 rounded-lg text-white hover:bg-emerald-700">Create</button>
          </div>
        </div>
      </div>
    </div>

    <div id="edit-post-modal" class="modal pointer-events-none fixed w-full h-full top-0 left-0 flex items-center justify-center opacity-0">
      <div class="modal-overlay absolute w-full h-full bg-gray-900 opacity-50"></div>
      <div class="modal-container bg-gray-800 w-11/12 md:max-w-3xl mx-auto rounded-lg shadow-lg z-50 overflow-y-auto">
        <div class="modal-content py-4 text-left px-6">
          <p class="text-2xl font-bold text-white pb-3">Edit Post</p>
          <div class="grid grid-cols-2 gap-4 max-h-[70vh]">
            <img id="post-editor-preview" src="" class="w-full h-full object-contain rounded-lg bg-gray-900">
            <div class="space-y-2 overflow-y-auto">
              <div class="tag-group"><label class="editor-label">Artist Tags</label><input type="text" id="post-editor-tags-artist" data-category="1" class="editor-input tag-input" placeholder="e.g. artist_name"></div>
              <div class="tag-group"><label class="editor-label">Character Tags</label><input type="text" id="post-editor-tags-character" data-category="4" class="editor-input tag-input" placeholder="e.g. character_name"></div>
              <div class="tag-group"><label class="editor-label">Copyright Tags</label><input type="text" id="post-editor-tags-copyright" data-category="3" class="editor-input tag-input" placeholder="e.g. series_name"></div>
              <div class="tag-group"><label class="editor-label">Species Tags</label><input type="text" id="post-editor-tags-species" data-category="5" class="editor-input tag-input" placeholder="e.g. canine horse"></div>
              <div class="tag-group"><label class="editor-label">General Tags</label><input type="text" id="post-editor-tags-general" data-category="0" class="editor-input tag-input" placeholder="e.g. solo male"></div>
              <div><label for="post-editor-parent" class="editor-label">Parent Post ID</label><input type="number" id="post-editor-parent" class="editor-input" placeholder="e.g., 12345"></div>
              <p id="post-editor-log" class="text-gray-400 h-4"></p>
            </div>
          </div>
          <div class="flex justify-end pt-2">
            <button class="modal-cancel px-4 bg-transparent p-3 rounded-lg text-cyan-400 hover:bg-gray-700 mr-2">Cancel</button>
            <button id="post-editor-save" data-post-id="" class="px-4 bg-cyan-600 p-3 rounded-lg text-white hover:bg-cyan-700">Save Changes</button>
          </div>
        </div>
      </div>
    </div>

    <div id="edit-wiki-modal" class="modal pointer-events-none fixed w-full h-full top-0 left-0 flex items-center justify-center opacity-0">
      <div class="modal-overlay absolute w-full h-full bg-gray-900 opacity-50"></div>
      <div class="modal-container bg-gray-800 w-11/12 md:max-w-2xl mx-auto rounded-lg shadow-lg z-50 overflow-y-auto">
        <div class="modal-content py-4 text-left px-6">
          <p class="text-2xl font-bold text-white pb-3">Edit Tag Wiki</p>
          <div class="space-y-4 max-h-[70vh] overflow-y-auto">
            <div><label for="wiki-editor-title" class="editor-label">Tag Name (Title)</label><input type="text" id="wiki-editor-title" class="editor-input" placeholder="tag_name"></div>
            <div><label for="wiki-editor-category" class="editor-label">Category</label><select id="wiki-editor-category" class="editor-input">${categoryOptions}</select></div>
            <div><label for="wiki-editor-body" class="editor-label">Wiki Body (DText)</label><textarea id="wiki-editor-body" class="editor-input h-64 font-mono" placeholder="Add wiki content here..."></textarea></div>
            <p id="wiki-editor-log" class="text-gray-400 h-4"></p>
          </div>
          <div class="flex justify-end pt-2">
            <button class="modal-cancel px-4 bg-transparent p-3 rounded-lg text-cyan-400 hover:bg-gray-700 mr-2">Cancel</button>
            <button id="wiki-editor-save" data-wiki-id="" class="px-4 bg-cyan-600 p-3 rounded-lg text-white hover:bg-cyan-700">Save Changes</button>
          </div>
        </div>
      </div>
    </div>

    <style>
      .mass-edit-pill { display:inline-flex; align-items:center; padding:0.25rem 0.75rem; border-radius:9999px; font-size:0.875rem; color:white; cursor:pointer; transition:background-color 0.2s; }
      .remove-pill-btn { margin-left:0.5rem; font-size:1.25rem; line-height:1; cursor:pointer; opacity:0.7; }
      .remove-pill-btn:hover { opacity:1; }
    </style>
  `
  document.body.appendChild(modalContainer)

  document.querySelectorAll("#edit-post-modal .tag-input, #mass-edit-tag-input").forEach((el) => {
    new Autocomplete(el, async (q) => apiRequest(`tags/autocomplete.json?search[name_matches]=${encodeURIComponent(q)}`), tagCategoryColors, tagCategoryNames)
  })

  const massEditInput = document.getElementById("mass-edit-tag-input")
  const massEditAddBtn = document.getElementById("mass-edit-add-btn")
  const addTagsHandler = () => {
    eventHandlers?.addTagsToMassEditList?.(massEditInput.value)
    massEditInput.value = ""
  }

  massEditAddBtn.addEventListener("click", addTagsHandler)
  massEditInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); addTagsHandler() } })

  document.getElementById("mass-edit-save").addEventListener("click", eventHandlers.performMassTagEdit)
  document.getElementById("create-pool-save").addEventListener("click", eventHandlers.performCreatePool)
  document.getElementById("post-editor-save").addEventListener("click", eventHandlers.savePost)
  document.getElementById("wiki-editor-save").addEventListener("click", eventHandlers.saveWiki)

  document.querySelectorAll(".modal-overlay, .modal-cancel").forEach((el) => {
    el.addEventListener("click", () => el.closest(".modal").classList.add("pointer-events-none", "opacity-0"))
  })
}
