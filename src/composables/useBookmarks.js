import { ref } from "vue";
import { getJson } from "../api";

// Saved posts live in localStorage only. The state is module-level, so the
// feed and the similar page share one Set.
const BOOKMARK_STORAGE_KEY = "bookmarkedArticleIds";
// /api/content/by-ids returns a 400 above this many ids.
const BY_IDS_MAX = 100;

let bookmarkedIds = null;

function loadBookmarksFromLocalStorage() {
  try {
    const storedBookmarks = localStorage.getItem(BOOKMARK_STORAGE_KEY);
    if (storedBookmarks) {
      const parsedIds = JSON.parse(storedBookmarks);
      if (Array.isArray(parsedIds)) return new Set(parsedIds);
      console.warn("Invalid bookmark data found in localStorage.");
      localStorage.removeItem(BOOKMARK_STORAGE_KEY);
    }
  } catch (e) {
    console.error("Failed to load bookmarks from localStorage:", e);
  }
  return new Set();
}

function saveBookmarksToLocalStorage() {
  try {
    const idsToSave = Array.from(bookmarkedIds.value);
    localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(idsToSave));
  } catch (e) {
    console.error("Failed to save bookmarks to localStorage:", e);
  }
}

function toggleBookmark(articleId) {
  const next = new Set(bookmarkedIds.value); // new Set triggers reactivity
  if (next.has(articleId)) next.delete(articleId);
  else next.add(articleId);
  bookmarkedIds.value = next;
  saveBookmarksToLocalStorage();
}

// Fetch the saved posts, newest first, in chunks the endpoint accepts.
async function fetchBookmarkedPosts({ signal } = {}) {
  const ids = Array.from(bookmarkedIds.value);
  const chunks = [];
  for (let i = 0; i < ids.length; i += BY_IDS_MAX) {
    chunks.push(ids.slice(i, i + BY_IDS_MAX));
  }
  const results = await Promise.all(
    chunks.map((chunk) =>
      getJson("/api/content/by-ids", {
        params: { ids: chunk.join(",") },
        signal,
      })
    )
  );
  return results
    .flat()
    .sort(
      (a, b) =>
        new Date(b.published_date || 0) - new Date(a.published_date || 0)
    );
}

export function useBookmarks() {
  if (!bookmarkedIds) bookmarkedIds = ref(loadBookmarksFromLocalStorage());
  return { bookmarkedIds, toggleBookmark, fetchBookmarkedPosts };
}
