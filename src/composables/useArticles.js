import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getJson } from "../api";
import { useBookmarks } from "./useBookmarks";

const PAGE_SIZE = 50;
// Novelty filter bucket (1-5) -> minimum novelty_score. 1 means no minimum.
const NOVELTY_MIN_BY_BUCKET = { 2: 21, 3: 41, 4: 71, 5: 91 };

// Feed filters live in the URL so a filtered view can be shared or linked to
// (the email digest's "see all" link does):
//   /?q=<search>&source=<name>&source=<name>&tag=<tag>&tag=<tag>&novelty=<1-5>
// Every key is optional; a missing source/tag means "all".
const FILTER_KEYS = ["q", "source", "tag", "novelty"];

// A route.query value is a string, an array (repeated key) or null.
function queryList(v) {
  return (Array.isArray(v) ? v : [v]).filter(
    (s) => typeof s === "string" && s !== ""
  );
}

function queryString(v) {
  return queryList(v)[0] ?? "";
}

function queryNovelty(v) {
  const n = Number(queryString(v));
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
}

// [] when the selection covers every option, so "all" is never spelled out in
// the URL or the request (new sources/tags and untagged posts then show up).
function narrowSelection(selected, all) {
  const uniq = [...new Set(selected)];
  return all.length > 0 && all.every((x) => uniq.includes(x)) ? [] : uniq;
}

export function useArticles() {
  const route = useRoute();
  const router = useRouter();
  const {
    bookmarkedIds,
    toggleBookmark: toggleSaved,
    fetchBookmarkedPosts,
  } = useBookmarks();

  // --- State ---
  const articles = ref([]); // Holds the *currently displayed* articles (either normal feed or bookmarks)
  const isLoading = ref(true);
  const error = ref(null);
  const loadMoreError = ref(null);
  const allAvailableSources = ref([]);
  const allSourceCounts = ref({});
  const availableTags = ref([]); // Array<{ tag, post_count }>
  const offset = ref(0);
  const allLoaded = ref(false); // Tracks pagination for the *normal* feed
  let abortController = null;
  // Feed order: "date" (paginated) or "random" (one random batch, no paging,
  // because appending another RANDOM() page would repeat and mix posts).
  const orderBy = ref("date");
  const showOnlyBookmarks = ref(false); // The toggle state

  // --- Filters: read from and written to route.query ---
  const queryTerm = computed({
    get: () => queryString(route.query.q),
    set: (v) => writeFilters({ q: v.trim() }),
  });
  const selectedSources = computed(() => queryList(route.query.source)); // [] = all
  const selectedTags = computed(() => queryList(route.query.tag)); // [] = all
  const minNovelty = computed({
    get: () => queryNovelty(route.query.novelty),
    set: (v) => writeFilters({ novelty: v }),
  });

  // What the filter popovers show as checked: everything when unfiltered.
  const activeSources = computed(() =>
    selectedSources.value.length
      ? selectedSources.value
      : allAvailableSources.value
  );
  const activeTags = computed(() =>
    selectedTags.value.length
      ? selectedTags.value
      : availableTags.value.map((t) => t.tag)
  );
  const hasFilters = computed(
    () =>
      queryTerm.value !== "" ||
      selectedSources.value.length > 0 ||
      selectedTags.value.length > 0 ||
      minNovelty.value !== null
  );

  // The search box text; committed to queryTerm on submit.
  const searchTerm = ref(queryTerm.value);
  watch(queryTerm, (v) => {
    searchTerm.value = v;
  });

  // router.replace lands asynchronously, so a second write in the same tick
  // (e.g. "Clear filters" also emptying the search box, which re-submits the
  // search) must build on the first one, not on the stale route.query.
  let pendingQuery = null;

  function writeFilters(patch) {
    const base = pendingQuery ?? route.query;
    const f = {
      q: queryString(base.q),
      source: queryList(base.source),
      tag: queryList(base.tag),
      novelty: queryNovelty(base.novelty),
      ...patch,
    };
    // Keep any unrelated params (e.g. utm_*) untouched.
    const query = Object.fromEntries(
      Object.entries(base).filter(([k]) => !FILTER_KEYS.includes(k))
    );
    if (f.q) query.q = f.q;
    if (f.source.length) query.source = f.source;
    if (f.tag.length) query.tag = f.tag;
    if (f.novelty !== null) query.novelty = String(f.novelty);
    pendingQuery = query;
    router.replace({ query }).finally(() => {
      if (pendingQuery === query) pendingQuery = null;
    });
  }

  function updateActiveSources(newSources) {
    writeFilters({
      source: narrowSelection(newSources, allAvailableSources.value),
    });
  }

  function updateActiveTags(newTags) {
    writeFilters({
      tag: narrowSelection(
        newTags,
        availableTags.value.map((t) => t.tag)
      ),
    });
  }

  function clearFilters() {
    const filtersChange = hasFilters.value;
    showOnlyBookmarks.value = false;
    searchTerm.value = "";
    if (filtersChange) {
      writeFilters({ q: "", source: [], tag: [], novelty: null });
    } else if (orderBy.value === "random") {
      // No filter watcher fires, so return to date order explicitly.
      resetOrder();
    }
  }

  // --- Toggle Bookmark ---
  function toggleBookmark(articleId) {
    toggleSaved(articleId);
    // If currently showing bookmarks, refetch the list to reflect the change
    if (showOnlyBookmarks.value) {
      fetchBookmarkedArticles();
    }
  }

  // --- Metadata Fetching (unfiltered counts for the filter popovers) ---
  async function fetchAllSourceStats() {
    try {
      const stats = await getJson("/api/source-stats");
      allAvailableSources.value = stats.map((s) => s.source_type);
      allSourceCounts.value = Object.fromEntries(
        stats.map((s) => [s.source_type, s.count])
      );
    } catch (e) {
      console.error("Failed to load ALL source stats", e);
      allAvailableSources.value = [];
      allSourceCounts.value = {};
    }
  }

  async function fetchAvailableTags() {
    try {
      availableTags.value = await getJson("/api/tags");
    } catch (e) {
      console.error("Failed to load tags", e);
    }
  }

  // GET /api/v1/posts params for the current filters, order and offset.
  function feedParams() {
    const params = new URLSearchParams();
    if (queryTerm.value) params.append("search", queryTerm.value);
    // Repeated keys, never comma-joined: "80,000 Hours Podcast" is one source.
    selectedSources.value.forEach((s) => params.append("source_type", s));
    selectedTags.value.forEach((t) => params.append("tags", t));
    const noveltyMin = NOVELTY_MIN_BY_BUCKET[minNovelty.value];
    if (noveltyMin) params.append("novelty_min", String(noveltyMin));
    params.append("sort", orderBy.value === "random" ? "random" : "newest");
    params.append("limit", String(PAGE_SIZE));
    params.append("offset", String(offset.value));
    return params;
  }

  // --- Fetch Normal Articles (Paginated/Filtered) ---
  async function fetchArticles({ append = false } = {}) {
    loadMoreError.value = null;

    // If showing bookmarks, do nothing here
    if (showOnlyBookmarks.value) {
      return;
    }

    abortController?.abort();
    const controller = new AbortController();
    abortController = controller;

    isLoading.value = true;
    // Don't clear error immediately if appending, only on new load
    if (!append) {
      error.value = null;
      offset.value = 0;
      allLoaded.value = false;
    }

    try {
      const { data, pagination } = await getJson("/api/v1/posts", {
        params: feedParams(),
        signal: controller.signal,
      });

      if (append) {
        const existingIds = new Set(articles.value.map((a) => a.id));
        articles.value.push(...data.filter((a) => !existingIds.has(a.id)));
      } else {
        articles.value = data; // Replace
      }

      offset.value += data.length;
      allLoaded.value = !pagination.hasMore || orderBy.value === "random";
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Error fetching articles:", err);
        if (append) {
          // Keep the articles already on screen; surface a retryable message.
          loadMoreError.value = "Could not load more posts.";
        } else {
          error.value = `Failed to load articles: ${err.message}. Please try again later.`;
          articles.value = [];
        }
      }
    } finally {
      if (abortController === controller) {
        isLoading.value = false;
        abortController = null;
      }
    }
  }

  // --- Fetch Bookmarked Articles (Specific IDs) ---
  async function fetchBookmarkedArticles() {
    loadMoreError.value = null; // a failed append belongs to the normal feed
    abortController?.abort();
    abortController = null;

    if (bookmarkedIds.value.size === 0) {
      articles.value = [];
      allLoaded.value = true; // Nothing to load
      isLoading.value = false;
      error.value = null;
      return;
    }

    const controller = new AbortController();
    abortController = controller;

    isLoading.value = true;
    error.value = null;

    try {
      articles.value = await fetchBookmarkedPosts({
        signal: controller.signal,
      });
      allLoaded.value = true; // We fetched all requested bookmarks, no more pages
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Error fetching bookmarked articles:", err);
        error.value = `Failed to load bookmarked articles: ${err.message}.`;
        articles.value = []; // Clear articles on error
        allLoaded.value = true; // Prevent further loading attempts
      }
    } finally {
      if (abortController === controller) {
        isLoading.value = false;
        abortController = null;
      }
    }
  }

  // --- Watchers ---

  // Filters changed in the URL (popovers, search, a pasted link, the header
  // logo). Ignored once the route leaves the feed.
  const filterKey = computed(() =>
    route.name === "Feed"
      ? JSON.stringify([
          queryTerm.value,
          selectedSources.value,
          selectedTags.value,
          minNovelty.value,
        ])
      : null
  );
  watch(filterKey, (key) => {
    if (key === null) return;
    // Changing filters or search always returns to date order.
    orderBy.value = "date";
    // Filters don't apply to the bookmark list; fetchArticles skips then.
    fetchArticles();
  });

  // Watcher for the bookmark toggle
  watch(showOnlyBookmarks, (isShowing) => {
    orderBy.value = "date";
    if (isShowing) {
      fetchBookmarkedArticles();
    } else {
      fetchArticles();
    }
  });

  // --- Initial data loading on mount ---
  // Tags, source counts and the first page don't depend on each other (the
  // filters come from the URL), so they load in parallel. The popovers show
  // everything as selected once their lists arrive.
  onMounted(() => {
    fetchAvailableTags();
    fetchAllSourceStats();
    fetchArticles();
  });

  // --- Other Methods ---

  // Fetch Random Order - Should only apply to the normal feed
  async function fetchRandomOrder() {
    if (showOnlyBookmarks.value) return;
    orderBy.value = "random";
    await fetchArticles();
  }

  // Back to the default date order with the current filters.
  async function resetOrder() {
    orderBy.value = "date";
    if (showOnlyBookmarks.value) return;
    await fetchArticles();
  }

  // Load More Articles - Only for the normal, date-ordered feed. Random order
  // is a single batch (allLoaded is set), so this never appends to it.
  function loadMore() {
    if (
      !isLoading.value &&
      !allLoaded.value &&
      !showOnlyBookmarks.value &&
      orderBy.value === "date"
    ) {
      fetchArticles({ append: true });
    }
  }

  return {
    articles,
    isLoading,
    error,
    loadMoreError,
    // Filter options and the current selection
    allAvailableSources,
    allSourceCounts,
    availableTags,
    activeSources,
    activeTags,
    updateActiveSources,
    updateActiveTags,
    searchTerm,
    queryTerm,
    minNovelty,
    hasFilters,
    clearFilters,
    allLoaded, // Reflects pagination state *only for the normal feed*
    fetchRandomOrder,
    resetOrder,
    orderBy, // "date" | "random": the single source of truth for feed order
    // Bookmark related
    bookmarkedIds,
    showOnlyBookmarks,
    toggleBookmark,
    loadMore,
  };
}
