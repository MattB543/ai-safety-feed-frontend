import { ref, onMounted, computed, watch } from "vue";

export function useArticles() {
  // --- State ---
  const articles = ref([]); // Reactive array to hold articles
  const isLoading = ref(true); // Loading state indicator
  const error = ref(null); // Error message holder
  const activeSources = ref([]); // Initialized empty, set on first source stats fetch
  const availableSources = ref([]); // Full list of sources from the API
  const sourceCounts = ref({}); // Live counts based on current filters
  const searchTerm = ref(""); // Moved: State for search term
  const queryTerm = ref(""); // term that's been submitted
  // ---- TAG FILTER STATE ----
  const availableTags = ref([]); // [{ tag, post_count }]
  const activeTags = ref([]); // ["Interpretability", …]
  // ---- PAGINATION STATE ----
  const pageSize = 50;
  const offset = ref(0);
  const allLoaded = ref(false); // True if the last fetch returned < pageSize items

  // --- API Configuration ---
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  // --- Methods ---

  // Fetch available sources and their counts based on current filters (search + tags)
  async function fetchSourceStats() {
    // Check if activeSources has been initialized yet. This should only happen once.
    const isInitialSourceLoad = activeSources.value.length === 0;

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

      // Update the list of all possible source types
      const currentAvailableSources = stats.map((s) => s.source_type);
      availableSources.value = currentAvailableSources;

      // Update the counts reflecting current filters
      sourceCounts.value = Object.fromEntries(
        stats.map((s) => [s.source_type, s.count])
      );

      // Initialize activeSources to ALL available sources only on the very first load
      if (isInitialSourceLoad && currentAvailableSources.length > 0) {
        activeSources.value = [...currentAvailableSources];
        // The initial fetchArticles in onMounted will use these defaults.
      }
    } catch (e) {
      console.error("Failed to load source stats", e);
      error.value = "Failed to load source statistics.";
      availableSources.value = []; // Clear on error
      sourceCounts.value = {}; // Clear counts on error
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
  async function fetchArticles({ append = false } = {}) {
    // Don't fetch more if all articles are loaded and we're appending
    if (append && allLoaded.value) {
      console.log("fetchArticles: All articles already loaded.");
      return;
    }

    isLoading.value = true;
    error.value = null;

    if (!append) {
      // Reset pagination state only when not appending (i.e., new filter/search)
      offset.value = 0;
      allLoaded.value = false;
      // Don't clear articles immediately, wait for results or error
      // articles.value = []; // Let the new results replace them
    }

    try {
      let url = `${API_BASE_URL}/api/content`;
      const params = new URLSearchParams();

      if (queryTerm.value) {
        params.append("search", queryTerm.value);
      }

      if (activeSources.value.length > 0) {
        params.append("sources", activeSources.value.join(","));
      }

      if (activeTags.value.length) {
        params.append("tags", activeTags.value.join(","));
      }

      // Add pagination parameters
      params.append("limit", pageSize.toString());
      params.append("offset", offset.value.toString());

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

      if (append) {
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
      if (!append) {
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

  // --- Lifecycle Hooks ---

  // Fetch initial data when the composable is used
  onMounted(() => {
    // Fetch sources and tags in parallel. fetchSourceStats will set the default
    // activeSources if it's the first load. fetchAvailableTags will set default
    // activeTags if needed. Then fetch articles using these defaults.
    Promise.all([fetchSourceStats(), fetchAvailableTags()]).then(() => {
      if (!error.value) {
        fetchArticles();
      }
    });
  });

  // Watch for changes in filters to update source stats and potentially refetch articles.
  watch(
    [queryTerm, activeSources, activeTags],
    (newValue, oldValue) => {
      // Destructure for clarity, comparing old and new query terms
      const [newQuery, newSources, newTags] = newValue;
      const [oldQuery, oldSources, oldTags] = oldValue || [[], [], []];

      // Always update source stats when any filter changes.
      fetchSourceStats();

      // Refetch articles *only* if the query term itself changed,
      // OR if sources/tags changed (indicating a direct filter change, not just stats update).
      // The watcher triggers *after* updateActiveSources/Tags has reset offset/allLoaded.
      // The initial fetchArticles call inside those functions was removed.
      if (
        newQuery !== oldQuery ||
        newSources !== oldSources ||
        newTags !== oldTags
      ) {
        // Reset pagination and fetch first page when filters change
        offset.value = 0;
        allLoaded.value = false;
        // The observer in ArticleList should be disconnected/reconnected by the component
        // when the articles list identity changes (which it will on filter change).
        fetchArticles({ append: false }); // Fetch the first page for the new filters
      }
    },
    { deep: true } // Use deep watch for arrays (activeSources, activeTags)
  );

  // Return the reactive state and any methods needed by the component
  return {
    articles,
    isLoading,
    error,
    fetchArticles,
    availableSources,
    activeSources,
    updateActiveSources,
    searchTerm,
    sourceCounts, // Expose sourceCounts
    // expose tag helpers
    availableTags,
    activeTags,
    updateActiveTags,
    queryTerm, // Export queryTerm
    // --- New Exports ---
    allLoaded,
    fetchArticlesUntilAllLoadedInBackground, // For drawer
    ensureArticleLoaded, // For scrolling to a specific article
  };
}
