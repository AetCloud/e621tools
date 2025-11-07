import { logger } from "./utils.js";

const cache = new Map();

export const getPost = (id) => cache.get(Number(id));
export const setPost = (post) => {
  if (post?.id) cache.set(post.id, post);
};
export const setPosts = (posts = []) => {
  posts.forEach((p) => p?.id && cache.set(p.id, p));
  logger.log(`[PostCache] Cached ${posts.length} posts`);
};
export const clearPosts = () => {
  cache.clear();
  logger.log("[PostCache] Cleared cache");
};
