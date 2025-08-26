import { apiRequest } from "../lib/api.js";
import { logger, createTagButton } from "../lib/utils.js";
import { Autocomplete } from "../lib/autocomplete.js";

export const render = () => {
  return `
    <div class="page-container anim-fade-in-up">
        <div class="mb-8">
            <a href="#/" data-link class="bg-gray-700 text-cyan-400 font-bold py-2 px-4 rounded-lg inline-flex items-center">&larr; Back to the hub</a>
        </div>

        <div class="content-box">
            <h1 class="text-3xl md:text-4xl font-bold mb-2 text-center text-cyan-400">Image Uploader</h1>
            <p class="text-gray-400 mb-6 text-center">Drag & drop images, then click a thumbnail to edit its tags and details.</p>

            <div id="uploader-main-view">
                <div id="drop-zone" class="flex items-center justify-center w-full mb-6">
                    <label for="file-input" class="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors">
                        <div class="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg class="w-10 h-10 mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h.586a1 1 0 01.707.293l.414.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l.414-.414A1 1 0 0116.414 3H17a4 4 0 014 4v5a4 4 0 01-4 4H7z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <p class="mb-2 text-sm text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                            <p class="text-xs text-gray-500">PNG, JPG, GIF, or WEBM. Drag an image here to remove it from a parent.</p>
                        </div>
                        <input id="file-input" type="file" class="hidden" multiple accept="image/png, image/jpeg, image/gif, video/webm" />
                    </label>
                </div>
                
                <div id="thumbnails-container" class="bg-gray-900/50 p-4 rounded-lg min-h-[170px]">
                    <p id="grid-placeholder" class="text-gray-500 text-center">Your selected images will appear here.</p>
                    <div id="image-preview-grid" class="space-y-4"></div>
                </div>
            </div>

            <div id="editor-view" class="hidden mt-6 editor-grid">
                <div id="editor-image-preview-container" class="p-4 bg-gray-900 rounded-lg flex items-center justify-center">
                    </div>
                <div class="space-y-4 overflow-y-auto pr-2">
                    <div id="editor-metadata-container" class="p-4 bg-gray-800 rounded-lg space-y-4">
                        <h3 class="text-xl font-bold text-cyan-400">Edit Details</h3>
                        <div>
                            <label for="editor-source" class="editor-label">Source</label>
                            <input type="url" id="editor-source" class="editor-input" placeholder="https://example.com/source">
                        </div>
                        <div>
                            <label for="editor-rating" class="editor-label">Rating</label>
                            <select id="editor-rating" class="editor-input">
                                <option value="s">Safe</option>
                                <option value="q">Questionable</option>
                                <option value="e">Explicit</option>
                            </select>
                        </div>
                         <div class="tag-group">
                            <label class="editor-label">Artist Tags</label>
                            <input type="text" id="editor-tags-artist" data-category="1" class="editor-input tag-input" placeholder="e.g. artist_name">
                        </div>
                        <div class="tag-group">
                            <label class="editor-label">Character Tags</label>
                            <input type="text" id="editor-tags-character" data-category="4" class="editor-input tag-input" placeholder="e.g. character_name">
                        </div>
                        <div class="tag-group">
                            <label class="editor-label">Copyright Tags</label>
                            <input type="text" id="editor-tags-copyright" data-category="3" class="editor-input tag-input" placeholder="e.g. series_name">
                        </div>
                        <div class="tag-group">
                            <label class="editor-label">Species Tags</label>
                            <input type="text" id="editor-tags-species" data-category="5" class="editor-input tag-input" placeholder="e.g. canine horse">
                        </div>
                        <div class="tag-group">
                            <label class="editor-label">General Tags</label>
                            <input type="text" id="editor-tags-general" data-category="0" class="editor-input tag-input" placeholder="e.g. solo male">
                        </div>
                        <div class="tag-group">
                            <label class="editor-label">Meta Tags</label>
                            <input type="text" id="editor-tags-meta" class="editor-input tag-input" placeholder="e.g. high-res">
                        </div>
                        <div>
                           <label for="editor-description" class="editor-label">Description (DText supported)</label>
                           <textarea id="editor-description" class="editor-input h-24" placeholder="Add a description..."></textarea>
                        </div>
                        <button id="save-metadata-btn" class="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg">Save Changes for This Image</button>
                    </div>
                     <div id="tag-helpers-container" class="p-4 bg-gray-800 rounded-lg space-y-4">
                        <div>
                            <h3 class="text-xl font-bold text-cyan-500 mb-2">Implied Tags</h3>
                            <div id="implied-tags-container" class="flex flex-wrap gap-2 min-h-[2rem]"></div>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-cyan-500 mb-2">Related Tags</h3>
                            <div id="related-tags-container" class="flex flex-wrap gap-2 min-h-[2rem]"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="upload-button-container" class="mt-8 text-center hidden">
                <button id="upload-btn" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 disabled:opacity-50">
                    Upload All Images
                </button>
            </div>

            <div id="progress-section" class="hidden mt-6">
                <h2 class="text-xl font-semibold mb-2 text-gray-300">Upload Progress</h2>
                <div id="progress-log" class="w-full h-48 bg-gray-900 rounded-lg p-3 overflow-y-auto border border-gray-700"></div>
            </div>
        </div>
    </div>
    `;
};

export const afterRender = () => {
    const dropZone = document.getElementById("drop-zone");
    const fileInput = document.getElementById("file-input");
    const grid = document.getElementById("image-preview-grid");
    const placeholder = document.getElementById("grid-placeholder");
    const uploadBtn = document.getElementById("upload-btn");
    const uploadButtonContainer = document.getElementById("upload-button-container");
    const editorView = document.getElementById("editor-view");
    const saveMetadataBtn = document.getElementById("save-metadata-btn");
    const progressSection = document.getElementById("progress-section");
    const progressLog = document.getElementById("progress-log");
    const tagInputs = document.querySelectorAll(".tag-input");
    const impliedTagsContainer = document.getElementById("implied-tags-container");
    const relatedTagsContainer = document.getElementById("related-tags-container");

    let files = [];
    let activeFileId = null;
    let draggedItem = null;
    let tagHelperTimeout = null;

    const tagCategoryColors = { 0: "#3b82f6", 1: "#ec4899", 3: "#a855f7", 4: "#22c55e", 5: "#eab308" };
    const tagCategoryNames = { 0: "General", 1: "Artist", 3: "Copyright", 4: "Character", 5: "Species" };

    tagInputs.forEach(input => {
        new Autocomplete(input, async (query) => apiRequest(`tags/autocomplete.json?search[name_matches]=${query}`), tagCategoryColors, tagCategoryNames);
    });

    const checkCredentials = () => {
        const username = localStorage.getItem("e621Username");
        const apiKey = localStorage.getItem("e621ApiKey");
        if (!username || !apiKey) {
            window.dispatchEvent(new CustomEvent("show-modal", { detail: { modalId: "credentials-modal" } }));
            return null;
        }
        return { username, apiKey };
    };

    const handleFiles = (fileList) => {
        for (const file of fileList) {
            if (!file.type.startsWith("image/") && file.type !== 'video/webm') continue;
            const reader = new FileReader();
            reader.onload = (e) => {
                files.push({
                    id: `file-${Date.now()}-${Math.random()}`,
                    file: file,
                    previewUrl: e.target.result,
                    parentId: null,
                    postId: null,
                    metadata: {
                        source: '', rating: 'e', description: '',
                        tags: { artist: '', character: '', copyright: '', species: '', general: '', meta: '' }
                    }
                });
                renderThumbnails();
            };
            reader.readAsDataURL(file);
        }
    };

    const renderThumbnails = () => {
        placeholder.classList.toggle("hidden", files.length > 0);
        uploadButtonContainer.classList.toggle("hidden", files.length === 0);
        grid.innerHTML = "";

        const fileMap = new Map(files.map(f => [f.id, f]));
        const childrenMap = new Map();
        files.forEach(f => {
            if (f.parentId) {
                if (!childrenMap.has(f.parentId)) childrenMap.set(f.parentId, []);
                childrenMap.get(f.parentId).push(f.id);
            }
        });

        const renderNode = (fileId, level) => {
            const file = fileMap.get(fileId);
            if (!file) return;

            const wrapper = document.createElement("div");
            wrapper.id = file.id;
            wrapper.className = `thumbnail-wrapper ${activeFileId === file.id ? 'active' : ''}`;
            wrapper.draggable = true;
            wrapper.style.paddingLeft = `${level * 40}px`;
            
            wrapper.innerHTML = `
                <div class="thumbnail-content">
                    ${level > 0 ? '<div class="hierarchy-line"></div>' : ''}
                    <img src="${file.previewUrl}" class="thumbnail-image">
                    <span class="thumbnail-name">${file.file.name}</span>
                    <button data-id="${file.id}" class="remove-btn">&times;</button>
                </div>
                <div class="drop-zone-between" data-parent-id="${file.parentId || 'root'}" data-after-id="${file.id}"></div>
            `;
            grid.appendChild(wrapper);

            const children = childrenMap.get(fileId) || [];
            children.forEach(childId => renderNode(childId, level + 1));
        };
        
        const roots = files.filter(f => !f.parentId);
        roots.forEach(root => renderNode(root.id, 0));
        
        const finalDropZone = document.createElement('div');
        finalDropZone.className = 'drop-zone-between';
        finalDropZone.dataset.parentId = 'root';
        finalDropZone.dataset.afterId = 'last';
        grid.appendChild(finalDropZone);

        uploadBtn.disabled = files.length === 0;
    };
    
    const openEditor = (fileId) => {
        if(activeFileId) saveMetadata();

        activeFileId = fileId;
        const file = files.find(f => f.id === fileId);
        if (!file) return;

        editorView.classList.remove("hidden");
        document.getElementById("editor-image-preview-container").innerHTML = `<img src="${file.previewUrl}" class="max-h-full max-w-full object-contain">`;
        
        document.getElementById('editor-source').value = file.metadata.source;
        document.getElementById('editor-rating').value = file.metadata.rating;
        document.getElementById('editor-description').value = file.metadata.description;
        for (const category in file.metadata.tags) {
            document.getElementById(`editor-tags-${category}`).value = file.metadata.tags[category];
        }
        renderThumbnails();
        updateTagHelpers();
    };

    const saveMetadata = () => {
        if (!activeFileId) return;
        const file = files.find(f => f.id === activeFileId);
        if (!file) return;

        file.metadata.source = document.getElementById('editor-source').value;
        file.metadata.rating = document.getElementById('editor-rating').value;
        file.metadata.description = document.getElementById('editor-description').value;
        for (const category in file.metadata.tags) {
            file.metadata.tags[category] = document.getElementById(`editor-tags-${category}`).value;
        }
        logger.log(`[Uploader] Saved metadata for ${file.file.name}`);
    };
    
    const updateTagHelpers = async () => {
        const allTags = Array.from(tagInputs).flatMap(input => input.value.trim().split(/\s+/)).filter(Boolean);
        const uniqueTags = [...new Set(allTags)];
        
        impliedTagsContainer.innerHTML = '<div class="spinner-small"></div>';
        relatedTagsContainer.innerHTML = '<div class="spinner-small"></div>';

        if(uniqueTags.length === 0) {
            impliedTagsContainer.innerHTML = '';
            relatedTagsContainer.innerHTML = '';
            return;
        }

        const implicationPromises = uniqueTags.map(tag => apiRequest(`tag_implications.json?search[antecedent_name]=${tag}`));
        const implications = (await Promise.all(implicationPromises)).flat().map(imp => imp.consequent_name);
        
        const lastTag = uniqueTags[uniqueTags.length - 1];
        const tagData = await apiRequest(`tags.json?search[name]=${lastTag}`);
        const related = tagData?.[0]?.related_tags?.split(' ') || [];
        
        const renderTags = (container, tags, currentTags) => {
            container.innerHTML = "";
            const tagsToShow = [...new Set(tags)].filter(t => !currentTags.includes(t));
            if(tagsToShow.length === 0) {
                container.innerHTML = `<p class="text-sm text-gray-500">None found.</p>`;
                return;
            }
            tagsToShow.forEach(tag => {
                const button = createTagButton(tag, (clickedTag) => {
                    const generalInput = document.getElementById('editor-tags-general');
                    generalInput.value = `${generalInput.value} ${clickedTag}`.trim();
                    updateTagHelpers();
                });
                container.appendChild(button);
            });
        };

        renderTags(impliedTagsContainer, implications, uniqueTags);
        renderTags(relatedTagsContainer, related, uniqueTags);
    };

    tagInputs.forEach(input => {
        input.addEventListener('input', () => {
            clearTimeout(tagHelperTimeout);
            tagHelperTimeout = setTimeout(updateTagHelpers, 500);
        });
    });

    const logProgress = (message, level = 'info') => {
        const p = document.createElement('p');
        p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        const colors = { error: 'text-red-400', warn: 'text-yellow-400', success: 'text-green-400', info: 'text-gray-300' };
        p.className = colors[level] || colors.info;
        progressLog.appendChild(p);
        progressLog.scrollTop = progressLog.scrollHeight;
    };

    const handleUpload = async () => {
        const credentials = checkCredentials();
        if (!credentials) return;
        if (activeFileId) saveMetadata();

        uploadBtn.disabled = true;
        progressSection.classList.remove("hidden");
        progressLog.innerHTML = "";

        const uploadOrder = [];
        const roots = files.filter(f => f.parentId === null);
        const fileMap = new Map(files.map(f => [f.id, f]));
        
        const childrenMap = new Map();
        files.forEach(f => {
            if (f.parentId) {
                if (!childrenMap.has(f.parentId)) childrenMap.set(f.parentId, []);
                childrenMap.get(f.parentId).push(f.id);
            }
        });

        const buildUploadOrder = (fileId) => {
            const file = fileMap.get(fileId);
            if(file) uploadOrder.push(file);
            const children = childrenMap.get(fileId) || [];
            children.forEach(buildUploadOrder);
        }
        roots.forEach(root => buildUploadOrder(root.id));

        for (const file of uploadOrder) {
            logProgress(`Uploading ${file.file.name}...`);
            const parent = file.parentId ? fileMap.get(file.parentId) : null;
            if (parent && !parent.postId) {
                logProgress(`Skipping ${file.file.name} because its parent failed to upload.`, 'warn');
                continue;
            }

            const formData = new FormData();
            formData.append('upload[file]', file.file);
            const allTags = Object.values(file.metadata.tags).join(' ').trim();
            formData.append('upload[tag_string]', allTags);
            formData.append('upload[rating]', file.metadata.rating);
            formData.append('upload[source]', file.metadata.source);
            formData.append('upload[description]', file.metadata.description);
            if (parent?.postId) {
                formData.append('upload[parent_id]', parent.postId);
            }
            
            const result = await apiUploadRequest('uploads.json', credentials, formData);

            if (result.success && result.post_id) {
                file.postId = result.post_id;
                logProgress(`Successfully uploaded ${file.file.name} -> Post #${result.post_id}`, 'success');
            } else {
                logProgress(`Failed to upload ${file.file.name}. Reason: ${result.error || 'Unknown error'}`, 'error');
            }
        }
        logProgress('All uploads processed.');
        uploadBtn.disabled = false;
    };

    dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("bg-gray-700"); });
    dropZone.addEventListener("dragleave", () => dropZone.classList.remove("bg-gray-700"));
    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("bg-gray-700");
        if (draggedItem) {
            const file = files.find(f => f.id === draggedItem.id);
            if (file) file.parentId = null;
            renderThumbnails();
        } else {
            handleFiles(e.dataTransfer.files);
        }
    });
    fileInput.addEventListener("change", (e) => handleFiles(e.target.files));
    
    grid.addEventListener('click', (e) => {
        const wrapper = e.target.closest('.thumbnail-wrapper');
        if (e.target.closest('.remove-btn')) {
            const fileId = e.target.closest('.remove-btn').dataset.id;
            files = files.filter(f => f.id !== fileId);
            if (activeFileId === fileId) {
                activeFileId = null;
                editorView.classList.add('hidden');
            }
            renderThumbnails();
            return;
        }
        if (wrapper) {
            openEditor(wrapper.id);
        }
    });

    saveMetadataBtn.addEventListener('click', saveMetadata);
    uploadBtn.addEventListener('click', handleUpload);

    grid.addEventListener('dragstart', (e) => {
        draggedItem = e.target.closest('.thumbnail-wrapper');
        if (draggedItem) {
            setTimeout(() => draggedItem.classList.add('opacity-50'), 0);
            grid.classList.add('dragging');
        }
    });
    grid.addEventListener('dragend', () => {
        if (draggedItem) draggedItem.classList.remove('opacity-50');
        draggedItem = null;
        grid.classList.remove('dragging');
    });
    grid.addEventListener('dragover', (e) => e.preventDefault());
    grid.addEventListener('drop', (e) => {
        e.preventDefault();
        const dropTarget = e.target.closest('.thumbnail-wrapper');
        const dropZoneBetween = e.target.closest('.drop-zone-between');

        if (dropTarget && draggedItem && dropTarget.id !== draggedItem.id) {
            const child = files.find(f => f.id === draggedItem.id);
            if (child) child.parentId = dropTarget.id;
            renderThumbnails();
        } else if (dropZoneBetween && draggedItem) {
            const afterId = dropZoneBetween.dataset.afterId;
            const draggedFile = files.find(f => f.id === draggedItem.id);
            
            const reorderedFiles = files.filter(f => f.id !== draggedItem.id);
            
            if (afterId === 'last') {
                reorderedFiles.push(draggedFile);
            } else {
                const insertIndex = reorderedFiles.findIndex(f => f.id === afterId) + 1;
                reorderedFiles.splice(insertIndex, 0, draggedFile);
            }
            files = reorderedFiles;
            renderThumbnails();
        }
    });
};