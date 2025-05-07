import { ref, onMounted, computed, watch } from "vue";

export function useArticles() {
  // --- State ---
  const articles = ref([]); // Holds the *currently displayed* articles (either normal feed or bookmarks)
  const isLoading = ref(true);
  const error = ref(null);
  const activeSources = ref([]);
  const availableSources = ref([]);
  const sourceCounts = ref({});
  const allAvailableSources = ref([]);
  const allSourceCounts = ref({});
  const searchTerm = ref("");
  const queryTerm = ref("");
  const availableTags = ref([]);
  const activeTags = ref([]);
  const minNovelty = ref(null);
  const pageSize = 50;
  const offset = ref(0);
  const allLoaded = ref(false); // Tracks pagination for the *normal* feed
  const abortController = ref(null);
  const isInitializing = ref(true);

  // --- Bookmark State ---
  const bookmarkedIds = ref(new Set());
  const showOnlyBookmarks = ref(false); // The toggle state
  const BOOKMARK_STORAGE_KEY = "bookmarkedArticleIds";

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  // --- Bookmark Persistence ---
  function loadBookmarksFromLocalStorage() {
    try {
      const storedBookmarks = localStorage.getItem(BOOKMARK_STORAGE_KEY);
      if (storedBookmarks) {
        const parsedIds = JSON.parse(storedBookmarks);
        if (Array.isArray(parsedIds)) {
          bookmarkedIds.value = new Set(parsedIds);
          console.log("Loaded bookmarks:", bookmarkedIds.value); // Debug log
        } else {
          console.warn("Invalid bookmark data found in localStorage.");
          localStorage.removeItem(BOOKMARK_STORAGE_KEY);
        }
      } else {
        console.log("No bookmarks found in localStorage."); // Debug log
      }
    } catch (e) {
      console.error("Failed to load bookmarks from localStorage:", e);
    }
  }

  function saveBookmarksToLocalStorage() {
    try {
      const idsToSave = Array.from(bookmarkedIds.value);
      localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(idsToSave));
      console.log("Saved bookmarks:", idsToSave); // Debug log
    } catch (e) {
      console.error("Failed to save bookmarks to localStorage:", e);
    }
  }

  // --- Toggle Bookmark ---
  function toggleBookmark(articleId) {
    const currentBookmarks = bookmarkedIds.value;
    if (currentBookmarks.has(articleId)) {
      currentBookmarks.delete(articleId);
    } else {
      currentBookmarks.add(articleId);
    }
    bookmarkedIds.value = new Set(currentBookmarks); // Trigger reactivity
    saveBookmarksToLocalStorage(); // Save immediately

    // *** If currently showing bookmarks, refetch the list to reflect the change ***
    if (showOnlyBookmarks.value) {
      fetchBookmarkedArticles(); // Call the dedicated fetch function
    }
  }

  // --- Metadata Fetching (Unchanged) ---
  async function fetchSourceStats() {
    // ... (keep existing implementation)
    try {
      let url = `${API_BASE_URL}/api/source-stats`;
      const params = new URLSearchParams();
      // Only apply filters if *not* showing bookmarks
      if (!showOnlyBookmarks.value) {
        if (queryTerm.value) params.append("search", queryTerm.value);
        if (activeTags.value.length)
          params.append("tags", activeTags.value.join(","));
      }
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const stats = await response.json();
      availableSources.value = stats.map((s) => s.source_type);
      sourceCounts.value = Object.fromEntries(
        stats.map((s) => [s.source_type, s.count])
      );
    } catch (e) {
      console.error("Failed to load source stats", e);
      // Avoid overwriting main error if possible, or use a separate error state
      // error.value = "Failed to load source statistics.";
      availableSources.value = [];
      sourceCounts.value = {};
    }
  }

  async function fetchAllSourceStats() {
    // ... (keep existing implementation)
    const isInitialSourceLoad = allAvailableSources.value.length === 0;
    try {
      let url = `${API_BASE_URL}/api/source-stats`; // Fetch unfiltered stats always
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const allStats = await response.json();
      const currentAllSources = allStats.map((s) => s.source_type);
      allAvailableSources.value = currentAllSources;
      allSourceCounts.value = Object.fromEntries(
        allStats.map((s) => [s.source_type, s.count])
      );
      // Initialize activeSources only on the very first successful load
      if (isInitialSourceLoad && currentAllSources.length > 0) {
        activeSources.value = [...currentAllSources];
      }
    } catch (e) {
      console.error("Failed to load ALL source stats", e);
      allAvailableSources.value = [];
      allSourceCounts.value = {};
    }
  }

  async function fetchAvailableTags() {
    // ... (keep existing implementation)
    try {
      const rows = await fetch(`${API_BASE_URL}/api/tags`).then((r) =>
        r.json()
      );
      availableTags.value = rows;
      // Initialize activeTags only if currently empty and not showing bookmarks
      if (activeTags.value.length === 0 && !showOnlyBookmarks.value) {
        activeTags.value = rows.map((r) => r.tag);
      }
    } catch (e) {
      console.error("Failed to load tags", e);
      // error.value = "Failed to load tags list.";
    }
  }

  // --- Fetch Normal Articles (Paginated/Filtered) ---
  async function fetchArticles(options) {
    // If showing bookmarks, do nothing here
    if (showOnlyBookmarks.value) {
      console.log("fetchArticles skipped: showing bookmarks.");
      return;
    }

    if (abortController.value) {
      abortController.value.abort();
    }
    const controller = new AbortController();
    abortController.value = controller;

    isLoading.value = true;
    // Don't clear error immediately if appending, only on new load
    if (!options.append) {
      error.value = null;
      offset.value = 0;
      allLoaded.value = false;
    }

    console.log("Fetching NORMAL articles with options:", options);

    try {
      let url = `${API_BASE_URL}/api/content`;
      const params = new URLSearchParams();

      // Build query parameters from options
      if (options.query) params.append("search", options.query);
      if (options.sources?.length > 0)
        params.append("sources", options.sources.join(","));
      if (options.tags?.length) params.append("tags", options.tags.join(","));
      if (options.novelty !== null && typeof options.novelty === "number") {
        params.append("novelty_bucket", options.novelty.toString());
      }
      params.append("limit", pageSize.toString());
      params.append("offset", offset.value.toString());
      if (options.orderBy) params.append("order_by", options.orderBy);

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      console.log("Fetching articles with URL:", url);

      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const newArticles = await response.json();

      if (options.append) {
        const existingIds = new Set(articles.value.map((a) => a.id));
        const uniqueNewArticles = newArticles.filter(
          (a) => !existingIds.has(a.id)
        );
        articles.value.push(...uniqueNewArticles);
      } else {
        articles.value = newArticles; // Replace
      }

      offset.value += newArticles.length;
      if (newArticles.length < pageSize) {
        allLoaded.value = true;
      }
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("Fetch aborted");
      } else {
        console.error("Error fetching articles:", err);
        error.value = `Failed to load articles: ${err.message}. Please try again later.`;
        if (!options.append) {
          articles.value = [];
        }
        allLoaded.value = true; // Stop infinite scroll on error
      }
    } finally {
      if (abortController.value === controller) {
        isLoading.value = false;
        abortController.value = null;
      }
    }
  }

  // --- Fetch Bookmarked Articles (Specific IDs) ---
  async function fetchBookmarkedArticles() {
    const idsToFetch = Array.from(bookmarkedIds.value);
    console.log("Fetching bookmarked articles for IDs:", idsToFetch);

    if (idsToFetch.length === 0) {
      articles.value = [];
      allLoaded.value = true; // Nothing to load
      isLoading.value = false;
      error.value = null;
      console.log("No bookmarked IDs to fetch.");
      return;
    }

    if (abortController.value) {
      abortController.value.abort();
    }
    const controller = new AbortController();
    abortController.value = controller;

    isLoading.value = true;
    error.value = null;

    try {
      // *** Use the new backend endpoint ***
      // Adjust URL and parameter name ('ids') as needed based on your backend implementation
      const params = new URLSearchParams();
      params.append("ids", idsToFetch.join(","));
      const url = `${API_BASE_URL}/api/content/by-ids?${params.toString()}`;
      // OR if modifying existing endpoint:
      // const url = `${API_BASE_URL}/api/content?${params.toString()}`;

      console.log("Fetching bookmarked articles with URL:", url);

      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const bookmarkedArticles = await response.json();
      articles.value = bookmarkedArticles; // Replace current articles
      allLoaded.value = true; // We fetched all requested bookmarks, no more pages
      offset.value = bookmarkedArticles.length; // Update offset just in case
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("Bookmark fetch aborted");
      } else {
        console.error("Error fetching bookmarked articles:", err);
        error.value = `Failed to load bookmarked articles: ${err.message}.`;
        articles.value = []; // Clear articles on error
        allLoaded.value = true; // Prevent further loading attempts
      }
    } finally {
      if (abortController.value === controller) {
        isLoading.value = false;
        abortController.value = null;
      }
    }
  }

  // --- Update Filters ---
  function updateActiveSources(newSources) {
    const uniqueNewSources = [...new Set(newSources)];
    // Check if changed only if not showing bookmarks (filter doesn't apply then)
    if (!showOnlyBookmarks.value) {
      if (
        uniqueNewSources.length !== activeSources.value.length ||
        !uniqueNewSources.every((source) =>
          activeSources.value.includes(source)
        )
      ) {
        activeSources.value = uniqueNewSources;
        // Watcher will trigger refetch
      }
    } else {
      // Store the selection even if not active, so it's remembered
      // when the user toggles bookmarks off.
      activeSources.value = uniqueNewSources;
    }
  }

  function updateActiveTags(newTags) {
    const uniq = [...new Set(newTags)];
    if (!showOnlyBookmarks.value) {
      if (
        uniq.length !== activeTags.value.length ||
        !uniq.every((t) => activeTags.value.includes(t))
      ) {
        activeTags.value = uniq;
        // Watcher will trigger refetch
      }
    } else {
      activeTags.value = uniq;
    }
  }

  // --- Watchers ---

  // Watcher for standard filters (query, sources, tags, novelty)
  watch(
    [queryTerm, activeSources, activeTags, minNovelty],
    () => {
      if (isInitializing.value) return;
      // *** IMPORTANT: Only trigger fetch if NOT showing bookmarks ***
      if (!showOnlyBookmarks.value) {
        console.log("Standard filters changed, fetching normal articles.");
        fetchArticles({
          append: false, // Reset list
          query: queryTerm.value,
          orderBy: "date", // Reset to default order on filter change
          sources: activeSources.value,
          tags: activeTags.value,
          novelty: minNovelty.value,
        });
        fetchSourceStats(); // Update source counts based on new filters
      } else {
        console.log(
          "Standard filters changed, but skipping fetch because bookmarks are shown."
        );
      }
    },
    { deep: true }
  );

  // Watcher for the bookmark toggle
  watch(showOnlyBookmarks, (isShowing) => {
    if (isInitializing.value) return;
    console.log("Bookmark toggle changed to:", isShowing);
    if (isShowing) {
      // Fetch only bookmarked articles
      fetchBookmarkedArticles();
      // Optionally clear other filters visually or disable them? For now, just fetch.
    } else {
      // Fetch normal articles with current filters
      fetchArticles({
        append: false, // Reset list
        query: queryTerm.value,
        orderBy: "date", // Or current order
        sources: activeSources.value,
        tags: activeTags.value,
        novelty: minNovelty.value,
      });
    }
    // Refetch stats when toggling bookmarks on/off as filters apply differently
    fetchSourceStats();
    fetchAvailableTags(); // Re-evaluate active tags initialization
  });

  // Watch bookmarks set itself (only for saving, fetch is handled by toggleBookmark/showOnlyBookmarks watcher)
  // watch(bookmarkedIds, saveBookmarksToLocalStorage, { deep: true }); // Already handled in toggleBookmark

  // --- Initial data loading on mount ---
  onMounted(async () => {
    isInitializing.value = true;
    loadBookmarksFromLocalStorage();
    try {
      // Fetch metadata first
      await fetchAvailableTags();
      await fetchAllSourceStats(); // Sets initial activeSources

      // Fetch initial articles (normal feed)
      await fetchArticles({
        append: false,
        query: queryTerm.value,
        orderBy: "date",
        sources: activeSources.value,
        tags: activeTags.value,
        novelty: minNovelty.value,
      });
    } catch (e) {
      console.error("Error during initial mount:", e);
      error.value = "Failed to load initial data.";
    } finally {
      isInitializing.value = false;
    }
  });

  // --- Other Methods ---

  // Fetch Random Order - Should only apply to the normal feed
  async function fetchRandomOrder() {
    if (showOnlyBookmarks.value) {
      console.log("Random order skipped: showing bookmarks.");
      // Maybe show a notification to the user?
      return;
    }
    console.log("Requesting random order...");
    await fetchArticles({
      append: false,
      query: queryTerm.value,
      orderBy: "random",
      sources: activeSources.value,
      tags: activeTags.value,
      novelty: minNovelty.value,
    });
  }

  // Load More Articles - Only for the normal feed
  function loadMore() {
    if (!isLoading.value && !allLoaded.value && !showOnlyBookmarks.value) {
      console.log("Loading more articles...");
      fetchArticles({
        append: true, // Append results
        query: queryTerm.value,
        orderBy: "date", // Or current order
        sources: activeSources.value,
        tags: activeTags.value,
        novelty: minNovelty.value,
      });
    } else {
      console.log("Load more skipped. Conditions:", {
        isLoading: isLoading.value,
        allLoaded: allLoaded.value,
        showOnlyBookmarks: showOnlyBookmarks.value,
      });
    }
  }

  // --- REMOVED ---
  // const filteredArticles = computed(...)
  // fetchArticlesUntilAllLoadedInBackground()
  // ensureArticleLoaded() - Could be adapted for bookmarks if needed, but likely not necessary

  // Return the reactive state and methods
  return {
    articles, // Directly use this ref now
    isLoading,
    error,
    fetchArticles, // Expose if needed for manual refresh?
    availableSources, // Still needed for filter component display
    activeSources,
    updateActiveSources,
    searchTerm,
    sourceCounts, // Still needed for filter component display
    allAvailableSources,
    allSourceCounts,
    availableTags,
    activeTags,
    updateActiveTags,
    queryTerm,
    allLoaded, // Reflects pagination state *only for the normal feed*
    minNovelty,
    fetchRandomOrder,
    // Bookmark related
    bookmarkedIds,
    showOnlyBookmarks,
    toggleBookmark,
    // resetBookmarkFilter, // Not strictly needed if clearFilters handles it
    loadMore,
  };
}
