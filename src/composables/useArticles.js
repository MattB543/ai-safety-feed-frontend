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
  async function fetchArticles() {
    isLoading.value = true;
    error.value = null;
    // Don't clear articles immediately, wait for results or error
    // articles.value = [];

    try {
      let url = `${API_BASE_URL}/api/content`;
      const params = new URLSearchParams();

      if (queryTerm.value) {
        // Encode the search term for the URL
        params.append("search", queryTerm.value);
      }

      // Added: Append sources if any are active
      if (activeSources.value.length > 0) {
        params.append("sources", activeSources.value.join(","));
      }

      // ---- NEW: TAGS param ------------------------------------
      if (activeTags.value.length) {
        params.append("tags", activeTags.value.join(","));
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

      const data = await response.json();

      articles.value = data;
    } catch (err) {
      console.error("Error fetching articles:", err);
      error.value = `Failed to load articles: ${err.message}. Please try again later.`;
      articles.value = []; // Clear articles on error
    } finally {
      isLoading.value = false;
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
      fetchArticles(); // Trigger refetch - uses queryTerm now
    }
  }

  function updateActiveTags(newTags) {
    const uniq = [...new Set(newTags)];
    if (
      uniq.length !== activeTags.value.length ||
      !uniq.every((t) => activeTags.value.includes(t))
    ) {
      activeTags.value = uniq;
      fetchArticles(); // Trigger refetch - uses queryTerm now
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
      const [newQuery /*, newSources, newTags */] = newValue;
      const [oldQuery /*, oldSources, oldTags */] = oldValue || []; // Handle initial call

      // Always update source stats when any filter changes.
      // The stats endpoint now depends on queryTerm and activeTags.
      // It also needs to run if activeSources changes so the UI driving this watch gets updated counts.
      fetchSourceStats();

      // Refetch articles *only* if the query term itself changed.
      // Changes initiated by updateActiveSources or updateActiveTags already trigger fetchArticles internally.
      // This check prevents double-fetching when sources/tags are changed via their respective update functions.
      if (newQuery !== oldQuery) {
        fetchArticles();
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
  };
}
