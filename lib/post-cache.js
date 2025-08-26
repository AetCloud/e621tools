import { logger } from "./utils.js";

const postCache = new Map();

export const getPost = (postId) => {
    return postCache.get(parseInt(postId, 10));
};

export const setPost = (post) => {
    if (post && post.id) {
        postCache.set(post.id, post);
    }
};

export const setPosts = (posts) => {
    if (!Array.isArray(posts)) return;
    posts.forEach(post => {
        if (post && post.id) {
            postCache.set(post.id, post);
        }
    });
    logger.log(`[PostCache] Cached ${posts.length} posts.`);
};