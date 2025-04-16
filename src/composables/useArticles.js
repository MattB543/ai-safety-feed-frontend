import { ref, onMounted } from "vue";

export function useArticles() {
  // --- State ---
  const articles = ref([]); // Reactive array to hold articles
  const isLoading = ref(true); // Loading state indicator
  const error = ref(null); // Error message holder

  // --- API Configuration ---
  const isProd = import.meta.env.PROD;
  const API_BASE_URL = isProd
    ? "https://ai-safety-feed-backend.onrender.com"
    : "http://localhost:3000";

  // --- Methods ---

  // Function to fetch articles from the server
  async function fetchArticles(searchTerm = "") {
    isLoading.value = true;
    error.value = null;
    // Don't clear articles immediately, wait for results or error
    // articles.value = [];

    try {
      let url = `${API_BASE_URL}/api/content`;
      if (searchTerm) {
        // Encode the search term for the URL
        url += `?search=${encodeURIComponent(searchTerm)}`;
      }

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

  // --- Lifecycle Hooks ---

  // Fetch articles when the composable is used in a component
  onMounted(() => {
    fetchArticles();
  });

  // Return the reactive state and any methods needed by the component
  return {
    articles,
    isLoading,
    error,
    fetchArticles, // Make fetchArticles available to the component
  };
}
