import { ref, onMounted, computed, watch } from "vue";

export function useArticles() {
  // --- State ---
  const articles = ref([]);
  const isLoading = ref(false); // Start as false, let fetchArticles manage it
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
  const allLoaded = ref(false);
  const abortController = ref(null); // To abort ongoing fetch requests
  const isInitializing = ref(true); // Keep the initialization flag

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  // --- Methods ---

  async function fetchSourceStats() {
    // No changes needed here unless you want separate loading/error states
    try {
      let url = `${API_BASE_URL}/api/source-stats`;
      const params = new URLSearchParams();
      if (queryTerm.value) params.append("search", queryTerm.value);
      if (activeTags.value.length)
        params.append("tags", activeTags.value.join(","));
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
      error.value = "Failed to load source statistics."; // Consider if this should overwrite article errors
      availableSources.value = [];
      sourceCounts.value = {};
    }
  }

  async function fetchAllSourceStats() {
    // No changes needed here unless you want separate loading/error states
    const isInitialSourceLoad = allAvailableSources.value.length === 0;
    try {
      let url = `${API_BASE_URL}/api/source-stats`;
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
    // No changes needed here unless you want separate loading/error states
    try {
      const rows = await fetch(`${API_BASE_URL}/api/tags`).then((r) =>
        r.json()
      );
      availableTags.value = rows;
      // Initialize activeTags only if currently empty
      if (activeTags.value.length === 0) {
        activeTags.value = rows.map((r) => r.tag);
      }
    } catch (e) {
      console.error("Failed to load tags", e);
      error.value = "Failed to load tags list."; // Consider if this should overwrite article errors
    }
  }

  // Function to fetch articles from the server
  async function fetchArticles(
    options = {
      append: false,
      query: queryTerm.value,
      orderBy: "date", // Default order
    }
  ) {
    // --- Abort previous fetch if running ---
    if (abortController.value) {
      console.log("Fetch already in progress, cancelling previous...");
      abortController.value.abort(); // Abort the previous fetch
    }
    // Create a new AbortController for this fetch
    const controller = new AbortController();
    abortController.value = controller;
    // --- End Abort Logic ---

    // Set loading state *here*
    isLoading.value = true;
    error.value = null; // Clear previous errors for this specific fetch type

    if (!options.append) {
      // Reset pagination state only when not appending (i.e., new filter/search/order)
      offset.value = 0;
      allLoaded.value = false;
      // Don't clear articles immediately, wait for results or error
    }

    console.log("fetchArticles called with options:", options);

    try {
      let url = `${API_BASE_URL}/api/content`;
      const params = new URLSearchParams();

      // Build query parameters
      if (options.query) params.append("search", options.query);
      if (activeSources.value.length > 0)
        params.append("sources", activeSources.value.join(","));
      if (activeTags.value.length)
        params.append("tags", activeTags.value.join(","));
      if (minNovelty.value !== null && typeof minNovelty.value === "number") {
        // Backend expects the 1-5 bucket number directly now
        params.append("novelty_bucket", minNovelty.value.toString());
      }
      params.append("limit", pageSize.toString());
      params.append("offset", offset.value.toString());
      if (options.orderBy) params.append("order_by", options.orderBy);

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      console.log("Fetching articles with URL:", url); // Log the URL

      // Pass the signal to the fetch call
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const newArticles = await response.json();

      // Process results
      if (options.append) {
        const existingIds = new Set(
          articles.value.map((a) => a.id || a.source_url)
        );
        const uniqueNewArticles = newArticles.filter(
          (a) => !existingIds.has(a.id || a.source_url)
        );
        articles.value.push(...uniqueNewArticles);
      } else {
        articles.value = newArticles; // Replace existing articles
      }

      // Update pagination state
      offset.value += newArticles.length;
      if (newArticles.length < pageSize) {
        allLoaded.value = true;
      }
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("Fetch aborted"); // This is expected if a new fetch starts quickly
      } else {
        console.error("Error fetching articles:", err);
        error.value = `Failed to load articles: ${err.message}. Please try again later.`;
        // Clear articles only if it was an initial load/filter error, not append error
        if (!options.append) {
          articles.value = [];
        }
        allLoaded.value = true; // Stop trying to load more on error
      }
    } finally {
      // Only clear loading state and controller if this fetch wasn't aborted by a newer one
      if (abortController.value === controller) {
        isLoading.value = false;
        abortController.value = null; // Clear the controller ref
      }
    }
  }

  // Helper to load all articles in the background
  async function fetchArticlesUntilAllLoadedInBackground() {
    // Check allLoaded first, as isLoading might be true from a recent fetch that just finished
    if (allLoaded.value || isLoading.value) return;

    console.log("Starting background fetch until all loaded...");
    while (!allLoaded.value && !error.value) {
      // fetchArticles now manages isLoading and cancellation internally
      await fetchArticles({ append: true });
      // Optional small delay if needed, but likely not necessary
      // await new Promise(resolve => setTimeout(resolve, 50));
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

    // Don't use the main isLoading flag for this, maybe a local one if needed
    // let specificLoading = ref(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/content/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Article with ID ${id} not found.`);
          error.value = `Article ${id} could not be found. It might have been removed.`;
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
      return true;
    } catch (err) {
      console.error(`Failed to fetch single article ${id}:`, err);
      error.value = `Failed to load details for article ${id}.`;
      return false;
    } finally {
      // specificLoading.value = false;
    }
  }

  // Function to update the active sources directly
  function updateActiveSources(newSources) {
    const uniqueNewSources = [...new Set(newSources)];
    if (
      uniqueNewSources.length !== activeSources.value.length ||
      !uniqueNewSources.every((source) => activeSources.value.includes(source))
    ) {
      activeSources.value = uniqueNewSources;
      // Watcher will trigger refetch
      // Reset pagination state when filters change (handled by watcher calling fetchArticles)
    }
  }

  // Function to update the active tags directly
  function updateActiveTags(newTags) {
    const uniq = [...new Set(newTags)];
    if (
      uniq.length !== activeTags.value.length ||
      !uniq.every((t) => activeTags.value.includes(t))
    ) {
      activeTags.value = uniq;
      // Watcher will trigger refetch
      // Reset pagination state when filters change (handled by watcher calling fetchArticles)
    }
  }

  // --- Watchers ---
  watch(
    [queryTerm, activeSources, activeTags, minNovelty],
    (
      [newQueryTerm, newActiveSources, newActiveTags, newMinNovelty],
      [oldQueryTerm, oldActiveSources, oldActiveTags, oldMinNovelty]
    ) => {
      // Prevent watcher runs during initial setup
      if (isInitializing.value) {
        console.log("Watcher triggered during initialization, skipping fetch.");
        return;
      }

      console.log("Filters changed:", {
        newQueryTerm,
        newActiveSources,
        newActiveTags,
        newMinNovelty,
      });

      // Reset pagination and fetch new articles whenever any filter changes
      // The fetchArticles call below handles resetting offset/allLoaded via append: false
      // Default to 'date' order when filters change.
      fetchArticles({ append: false, query: newQueryTerm, orderBy: "date" });

      // Also refetch source stats as counts might change based on query/tags
      fetchSourceStats();
      // No need to refetch availableTags unless the backend changes
    },
    { deep: true } // Use deep watch for arrays/objects
  );

  // --- Initial data loading on mount ---
  onMounted(async () => {
    isInitializing.value = true;
    // Don't set global isLoading here. Let fetchArticles handle it.
    try {
      // Fetch metadata first. These usually don't need a global spinner.
      await fetchAvailableTags();
      await fetchAllSourceStats(); // This sets initial activeSources/activeTags

      // Now fetch initial articles. fetchArticles will set isLoading = true.
      // It uses the default orderBy: 'date'
      await fetchArticles();
    } catch (e) {
      // Catch potential errors during the initial metadata fetches as well
      console.error("Error during initial mount:", e);
      error.value = "Failed to load initial data.";
      isLoading.value = false; // Ensure loading is off if initial fetches fail
    } finally {
      isInitializing.value = false; // Set flag to false AFTER all initial setup attempts
      // isLoading is managed by fetchArticles, no need to set it false here unless there was an error above
    }
  });

  // --- Fetch Random Order ---
  async function fetchRandomOrder() {
    // No need to check isLoading here, fetchArticles handles cancellation
    console.log("Requesting random order...");

    // Reset pagination state and trigger fetch with random order
    // fetchArticles with append: false handles resetting offset/allLoaded
    await fetchArticles({
      append: false,
      query: queryTerm.value, // Keep current search term
      orderBy: "random", // Explicitly set random order
    });
  }

  // Return the reactive state and methods
  return {
    articles,
    isLoading, // Expose isLoading for UI spinners
    error,
    fetchArticles, // Might not be needed externally if covered by other functions
    availableSources,
    activeSources,
    updateActiveSources,
    searchTerm, // For the input v-model
    sourceCounts,
    allAvailableSources, // Pass to SourceFilters
    allSourceCounts, // Pass to SourceFilters
    availableTags, // Pass to TagFilters
    activeTags,
    updateActiveTags,
    queryTerm, // Used internally and potentially for display
    allLoaded, // Pass to ArticleList for infinite scroll logic
    fetchArticlesUntilAllLoadedInBackground, // For drawer pre-loading
    ensureArticleLoaded, // For scrolling to specific article
    minNovelty, // For NoveltyFilter v-model
    fetchRandomOrder, // For the dice button
  };
}
