<script setup>
import { ref, onMounted } from "vue";

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
async function fetchArticles() {
  isLoading.value = true; // Set loading state
  error.value = null; // Clear previous errors

  try {
    const response = await fetch(`${API_BASE_URL}/api/content`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    articles.value = data.sort(
      (a, b) => new Date(b.published_date) - new Date(a.published_date)
    );
  } catch (err) {
    console.error("Error fetching articles:", err);
    error.value = `Failed to load articles: ${err.message}. Please try again later.`;
    articles.value = []; // Clear articles on error
  } finally {
    isLoading.value = false; // Reset loading state
  }
}

// --- Lifecycle Hooks ---

// Fetch articles when the component is mounted
onMounted(() => {
  fetchArticles();
});

// --- Helper Functions ---
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}

// Helper to join authors array
function formatAuthors(authorsArray) {
  if (!authorsArray || authorsArray.length === 0) {
    return "Unknown Author";
  }
  return authorsArray.join(", ");
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-white shadow-sm py-4 sticky top-0 z-10">
      <div class="w-full px-6 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-800">AI Safety Feed</h1>
        <button
          @click="fetchArticles"
          :disabled="isLoading"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? "Refreshing..." : "Refresh Feed" }}
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow w-full px-6 py-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center text-gray-600 py-10">
        Loading articles...
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong class="font-bold">Error!</strong>
        <span class="block sm:inline"> {{ error }}</span>
      </div>

      <!-- No Articles State -->
      <div
        v-else-if="articles.length === 0"
        class="text-center text-gray-600 py-10"
      >
        No articles available at the moment.
      </div>

      <!-- Articles Feed -->
      <div v-else class="space-y-6 max-w-4xl mx-auto">
        <article
          v-for="article in articles"
          :key="article.id || article.source_url"
          class="bg-white p-6 rounded-lg shadow-md transition-shadow duration-200 hover:shadow-lg flex flex-col md:flex-row gap-4"
        >
          <div v-if="article.image_url" class="md:w-1/4 flex-shrink-0">
            <img
              :src="article.image_url"
              alt=""
              class="w-full h-32 object-cover rounded-md"
            />
          </div>

          <div class="flex-grow text-left">
            <h2 class="text-xl font-bold mb-2 text-gray-900">
              {{ article.title }}
            </h2>
            <p class="text-sm text-gray-600 mb-2">
              <span class="mr-2">{{ formatDate(article.published_date) }}</span>
              <span
                v-if="article.source_type"
                class="mr-2 capitalize bg-gray-100 px-1.5 py-0.5 rounded text-xs"
                >{{ article.source_type }}</span
              >
              <span class="italic"
                >by {{ formatAuthors(article.authors) }}</span
              >
            </p>
            <p class="text-gray-700 mb-4">{{ article.paragraph_summary }}</p>
            <a
              :href="article.source_url"
              class="text-blue-600 hover:text-blue-800 font-semibold inline-block"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read more →
            </a>
            <div v-if="article.topics && article.topics.length" class="mt-4">
              <span
                v-for="topic in article.topics"
                :key="topic"
                class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
              >
                #{{ topic }}
              </span>
            </div>
          </div>
        </article>
      </div>
    </main>

    <!-- Footer -->
    <footer class="py-4 mt-8 border-t border-gray-200">
      <div class="w-full px-6">
        <p class="text-center text-gray-500 text-sm">
          © {{ new Date().getFullYear() }} AI Safety Feed
        </p>
      </div>
    </footer>
  </div>
</template>
