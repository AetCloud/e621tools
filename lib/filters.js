export function matchesBlacklist(post, blacklist) {
  // Combine all tag categories into a set
  const tags = new Set([
    ...post.tags.general,
    ...post.tags.species,
    ...post.tags.character,
    ...post.tags.copyright,
  ]);
  return blacklist.some((tag) => tags.has(tag));
}

export function shouldFavorite(post, opts = {}) {
  if (post.is_favorited) return false;
  if (opts.minScore && post.score.total < opts.minScore) return false;
  if (opts.excludeVideos && post.file.ext === "webm") return false;
  return true;
}
