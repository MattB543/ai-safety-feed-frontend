import { ref, onMounted, computed, watch } from "vue";

export function useArticles() {
  // --- State ---
  const articles = ref([]); // Reactive array to hold articles
  const isLoading = ref(false); // Loading state indicator - Start as false
  const error = ref(null); // Error message holder
  const activeSources = ref([]); // Initialized empty, set on first source stats fetch
  const availableSources = ref([]); // Full list of sources from the API, FILTERED by search/tags
  const sourceCounts = ref({}); // Live counts based on current filters (search + tags)
  const allAvailableSources = ref([]); // UNFILTERED list of all possible source types
  const allSourceCounts = ref({}); // UNFILTERED counts for all possible source types
  const searchTerm = ref(""); // Moved: State for search term
  const queryTerm = ref(""); // term that's been submitted
  // ---- TAG FILTER STATE ----
  const availableTags = ref([]); // [{ tag, post_count }]
  const activeTags = ref([]); // ["Interpretability", …]
  // ---- NOVELTY FILTER STATE ----
  const minNovelty = ref(null); // Minimum novelty score (0-100 scale bucket start: 0, 21, 41, 71, 91), null means no filter
  // ---- PAGINATION STATE ----
  const pageSize = 50;
  const offset = ref(0);
  const allLoaded = ref(false); // True if the last fetch returned < pageSize items
  const currentPage = ref(1);
  const abortController = ref(null); // To abort ongoing requests

  // --- API Configuration ---
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  // --- Methods ---

  // Fetch available sources and their counts based on current filters (search + tags)
  async function fetchSourceStats() {
    // Check if activeSources has been initialized yet. This should only happen once.
    // const isInitialSourceLoad = activeSources.value.length === 0; // We use allAvailableSources now for initialization

    try {
      let url = `${API_BASE_URL}/api/source-stats`;
      const params = new URLSearchParams();

      // Add search term if present
      if (queryTerm.value) {
        params.append("search", queryTerm.value);
      }
      // Add tags if any are active
      if (activeTags.value.length) {
        params.append("tags", activeTags.value.join(","));
      }
      // NOTE: We no longer send 'sources' parameter here.

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const stats = await response.json(); // Expecting [{source_type, count}, ...]

      // Update the list of FILTERED available source types based on current search/tags
      const currentFilteredAvailableSources = stats.map((s) => s.source_type);
      availableSources.value = currentFilteredAvailableSources;

      // Update the counts reflecting current filters
      sourceCounts.value = Object.fromEntries(
        stats.map((s) => [s.source_type, s.count])
      );

      // Initialize activeSources to ALL available sources only on the very first load
      // Do this AFTER fetching the unfiltered list in fetchAllSourceStats
      // if (isInitialSourceLoad && currentAvailableSources.length > 0) {
      //   activeSources.value = [...currentAvailableSources];
      //   // The initial fetchArticles in onMounted will use these defaults.
      // }
    } catch (e) {
      console.error("Failed to load source stats", e);
      error.value = "Failed to load source statistics.";
      availableSources.value = []; // Clear on error
      sourceCounts.value = {}; // Clear counts on error
    }
  }

  // NEW: Fetch the complete list of sources and their total counts, unfiltered
  async function fetchAllSourceStats() {
    // Track if this is the first time we successfully load all sources
    const isInitialSourceLoad = allAvailableSources.value.length === 0;
    try {
      // Fetch from the same endpoint but WITHOUT any filter parameters
      let url = `${API_BASE_URL}/api/source-stats`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const allStats = await response.json(); // [{source_type, count}, ...]

      // Update the list of ALL possible source types
      const currentAllSources = allStats.map((s) => s.source_type);
      allAvailableSources.value = currentAllSources;

      // Update the UNFILTERED counts
      allSourceCounts.value = Object.fromEntries(
        allStats.map((s) => [s.source_type, s.count])
      );

      // Initialize activeSources to ALL available sources only on the very first successful load
      if (isInitialSourceLoad && currentAllSources.length > 0) {
        activeSources.value = [...currentAllSources];
        // fetchArticles in onMounted will now use these defaults correctly.
      }
    } catch (e) {
      console.error("Failed to load ALL source stats", e);
      // Don't necessarily set the main error state, maybe just log it?
      // Or set a specific error? For now, just log and clear.
      allAvailableSources.value = []; // Clear on error
      allSourceCounts.value = {}; // Clear counts on error
      // If this fails on initial load, activeSources might remain empty,
      // which should be handled gracefully by the filter logic.
    }
  }

  // ---- fetchAvailableTags -------------------------------------
  async function fetchAvailableTags() {
    try {
      const rows = await fetch(`${API_BASE_URL}/api/tags`).then((r) =>
        r.json()
      );
      availableTags.value = rows; // keep counts for UI
      // Only default to "all on" if activeTags is currently empty.
      if (activeTags.value.length === 0) {
        activeTags.value = rows.map((r) => r.tag);
      }
    } catch (e) {
      console.error("Failed to load tags", e);
      error.value = "Failed to load tags list.";
    }
  }

  // Function to fetch articles from the server
  async function fetchArticles(
    options = {
      append: false,
      page: 1,
      query: queryTerm.value,
      orderBy: "date",
    } // Default orderBy to 'date'
  ) {
    if (isLoading.value) {
      console.log("Fetch already in progress, cancelling previous...");
      return;
    }

    if (allLoaded.value && !options.append) {
      console.log("fetchArticles: All articles already loaded.");
      return;
    }

    isLoading.value = true;
    error.value = null;

    if (!options.append) {
      // Reset pagination state only when not appending (i.e., new filter/search)
      offset.value = 0;
      allLoaded.value = false;
      // Don't clear articles immediately, wait for results or error
      // articles.value = []; // Let the new results replace them
    }

    // Add a log to see the options received by fetchArticles
    console.log("fetchArticles called with options:", options);

    try {
      let url = `${API_BASE_URL}/api/content`;
      const params = new URLSearchParams();

      if (options.query) {
        console.log(`Appending search param with query: '${options.query}'`);
        params.append("search", options.query);
      }

      if (activeSources.value.length > 0) {
        params.append("sources", activeSources.value.join(","));
      }

      if (activeTags.value.length) {
        params.append("tags", activeTags.value.join(","));
      }

      // Add novelty filter if set (minimum score of the bucket: 0, 21, 41, 71, 91)
      if (minNovelty.value !== null && typeof minNovelty.value === "number") {
        // Backend expects the minimum score for the selected bucket range
        // Valid scores: 0, 21, 41, 71, 91
        params.append("novelty_bucket", minNovelty.value.toString());
      }

      // Add pagination parameters
      params.append("limit", pageSize.toString());
      params.append("offset", offset.value.toString());

      // Add orderBy parameter
      if (options.orderBy) {
        params.append("order_by", options.orderBy);
      }

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      console.log("Fetching articles with URL:", url); // Log the URL

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const newArticles = await response.json();

      if (options.append) {
        // Prevent duplicates when appending
        const existingIds = new Set(
          articles.value.map((a) => a.id || a.source_url)
        );
        const uniqueNewArticles = newArticles.filter(
          (a) => !existingIds.has(a.id || a.source_url)
        );

        articles.value.push(...uniqueNewArticles);
        // Keep sorted - Assuming fetch returns date desc
        // No explicit sort needed if API guarantees order and we only append
      } else {
        articles.value = newArticles; // Replace existing articles
      }

      // Update pagination state
      offset.value += newArticles.length;
      if (newArticles.length < pageSize) {
        allLoaded.value = true; // Mark as all loaded if fewer than pageSize items were returned
      }
    } catch (err) {
      console.error("Error fetching articles:", err);
      error.value = `Failed to load articles: ${err.message}. Please try again later.`;
      if (!options.append) {
        articles.value = []; // Clear articles only on initial load error
      }
      allLoaded.value = true; // Stop trying to load more on error
    } finally {
      isLoading.value = false;
    }
  }

  // Helper to load all articles in the background (e.g., for drawer opening)
  async function fetchArticlesUntilAllLoadedInBackground() {
    // Prevent concurrent background loading
    if (isLoading.value || allLoaded.value) return;

    console.log("Starting background fetch until all loaded...");
    while (!allLoaded.value && !error.value) {
      // Use a temporary loading flag for background fetches if needed,
      // or rely on the main isLoading if UI feedback isn't critical here.
      // Setting isLoading = true might show loading indicator briefly.
      // isLoading.value = true; // Optional: Indicate background activity

      await fetchArticles({ append: true });

      // Optional: Add a small delay between requests if needed
      // await new Promise(resolve => setTimeout(resolve, 100));
    }
    console.log(
      "Background fetch finished. All loaded:",
      allLoaded.value,
      "Error:",
      error.value
    );
  }

  // Function to fetch a single article by ID if not present
  async function ensureArticleLoaded(id) {
    if (articles.value.find((a) => a.id === id)) {
      return true; // Already loaded
    }

    // Potentially show a specific loading indicator for this action
    // isLoading.value = true; // Or a dedicated loading flag

    try {
      const response = await fetch(`${API_BASE_URL}/api/content/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Article with ID ${id} not found.`);
          // Optionally: Show a user-facing message (e.g., via toast)
          error.value = `Article ${id} could not be found. It might have been removed.`; // Example error message
          return false;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const article = await response.json();

      // Add to list and maintain sort order (date descending)
      articles.value.push(article);
      articles.value.sort(
        (a, b) => new Date(b.published_date) - new Date(a.published_date)
      );

      // Update `offset`? Maybe not, as this is an out-of-band fetch.
      // Consider if this affects `allLoaded` logic if it happens near the end.
      // For now, we assume it doesn't significantly impact pagination state.

      return true;
    } catch (err) {
      console.error(`Failed to fetch single article ${id}:`, err);
      // Optionally: Show a user-facing error message
      error.value = `Failed to load details for article ${id}.`;
      return false;
    } finally {
      // Reset specific loading indicator if used
      // isLoading.value = false;
    }
  }

  // NEW: Function to update the active sources directly
  function updateActiveSources(newSources) {
    // Make sure we don't have duplicates if 'All' logic sent extra
    const uniqueNewSources = [...new Set(newSources)];
    // Check if the sources actually changed to prevent unnecessary fetches
    if (
      uniqueNewSources.length !== activeSources.value.length ||
      !uniqueNewSources.every((source) => activeSources.value.includes(source))
    ) {
      activeSources.value = uniqueNewSources;
      // fetchArticles(); // Trigger refetch - uses queryTerm now - Handled by watcher
      // Reset pagination state when filters change
      offset.value = 0;
      allLoaded.value = false;
    }
  }

  function updateActiveTags(newTags) {
    const uniq = [...new Set(newTags)];
    if (
      uniq.length !== activeTags.value.length ||
      !uniq.every((t) => activeTags.value.includes(t))
    ) {
      activeTags.value = uniq;
      // fetchArticles(); // Trigger refetch - uses queryTerm now - Handled by watcher
      // Reset pagination state when filters change
      offset.value = 0;
      allLoaded.value = false;
    }
  }

  // --- Watchers ---

  // Combined watcher for all filters that require refetching articles
  watch(
    [queryTerm, activeSources, activeTags, minNovelty],
    (
      [newQueryTerm, newActiveSources, newActiveTags, newMinNovelty],
      [oldQueryTerm, oldActiveSources, oldActiveTags, oldMinNovelty]
    ) => {
      console.log("Filters changed:", {
        newQueryTerm,
        newActiveSources,
        newActiveTags,
        newMinNovelty,
      });

      // Check if it's a filter reset scenario
      const isResetting =
        newQueryTerm === "" &&
        newActiveSources.length === availableSources.value.length && // Check against ALL available
        newActiveTags.length === availableTags.value.map((t) => t.tag).length && // Check against ALL available
        newMinNovelty === null; // Check if novelty is reset

      const wasResetBefore =
        oldQueryTerm === "" &&
        Array.isArray(oldActiveSources) &&
        oldActiveSources.length === availableSources.value.length && // Check against ALL available
        Array.isArray(oldActiveTags) &&
        oldActiveTags.length === availableTags.value.map((t) => t.tag).length && // Check against ALL available
        oldMinNovelty === null; // Check if novelty was reset

      // Avoid fetching if the filters were already in the "reset" state and haven't changed *from* reset
      // Or if the component is initializing (old values might be undefined)
      if (isResetting && wasResetBefore && oldQueryTerm !== undefined) {
        console.log(
          "Filters are in reset state and haven't changed from reset, skipping fetch."
        );
        return;
      }

      // Reset pagination and fetch new articles whenever any filter changes
      offset.value = 0;
      allLoaded.value = false;
      // Pass the new query term explicitly
      fetchArticles({ append: false, query: newQueryTerm }); // Fetch new set, not append

      // Also refetch source stats and tags as counts might change
      fetchSourceStats();
      // Tags don't depend on other filters for *availability*, only counts,
      // so no need to fetchAvailableTags() here unless backend changes.
    },
    { deep: true } // Use deep watch for arrays like activeSources/activeTags
  );

  // Initial data loading on mount
  onMounted(async () => {
    isLoading.value = true;
    // Fetch available tags first
    await fetchAvailableTags();
    // Fetch the UNFILTERED source list + counts first
    await fetchAllSourceStats();
    // Fetch initial FILTERED source stats (this is needed for counts display?)
    // Actually, the watcher will trigger this based on initial activeSources/queryTerm.
    // await fetchSourceStats();
    // Then fetch initial articles (will use default activeSources/Tags if set by fetchAllSourceStats)
    await fetchArticles();
    isLoading.value = false; // Ensure loading is false after all initial fetches
  });

  // --- Fetch Random Order ---
  async function fetchRandomOrder() {
    // Prevent rapid clicks / concurrent fetches
    if (isLoading.value) {
      console.log("Fetch already in progress, ignoring random request.");
      return;
    }

    // Reset current articles and pagination, then fetch with random order
    articles.value = [];
    // currentPage.value = 1; // Not used?
    offset.value = 0; // Reset offset for the new random query
    allLoaded.value = false;

    // Let fetchArticles handle the isLoading state
    await fetchArticles({
      append: false,
      // page: 1, // Not used?
      query: queryTerm.value,
      orderBy: "random",
    });
  }

  // Return the reactive state and any methods needed by the component
  return {
    articles,
    isLoading,
    error,
    fetchArticles,
    availableSources, // Filtered sources (for potential future use?)
    activeSources,
    updateActiveSources,
    searchTerm,
    sourceCounts, // Filtered counts (potentially for display elsewhere?)
    allAvailableSources, // Unfiltered sources (pass to SourceFilters)
    allSourceCounts, // Unfiltered counts (pass to SourceFilters)
    // expose tag helpers
    availableTags,
    activeTags,
    updateActiveTags,
    queryTerm, // Export queryTerm
    // --- New Exports ---
    allLoaded,
    fetchArticlesUntilAllLoadedInBackground, // For drawer
    ensureArticleLoaded, // For scrolling to a specific article
    minNovelty, // Expose novelty state
    fetchRandomOrder, // Expose the new function
  };
}
