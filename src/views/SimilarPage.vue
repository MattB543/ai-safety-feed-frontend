<template>
  <div class="max-w-[980px] mx-auto">
    <!-- Section 1: Original Article -->
    <div class="mb-12">
      <div v-if="isLoadingOriginal" class="text-center py-10">
        <n-spin size="large" />
        <p class="text-gray-600 mt-2">Loading Original Article...</p>
      </div>
      <div
        v-else-if="errorOriginal"
        class="text-red-600 bg-red-100 p-4 rounded"
      >
        {{ errorOriginal }}
      </div>
      <!-- Wrap original card for consistent styling -->
      <div v-else-if="originalArticle" class="bg-white rounded-lg shadow-md">
        <ArticleCard
          :article="originalArticle"
          :hide-similar-button="true"
          class="p-6"
        />
      </div>
    </div>

    <!-- Section 2: Similar Articles -->
    <div>
      <div class="mb-6 border-b pb-2 border-gray-300">
        <h2 class="text-2xl font-semibold text-gray-700">Similar Posts</h2>
      </div>

      <!-- Loading State for Similar Articles -->
      <div v-if="isLoadingSimilar" class="text-center py-10">
        <n-spin size="large" />
        <p class="text-gray-600 mt-2">Loading Similar Articles...</p>
      </div>
      <!-- Error State for Similar Articles -->
      <div
        v-else-if="errorSimilar"
        class="text-red-600 bg-red-100 p-4 rounded mb-4"
      >
        {{ errorSimilar }}
      </div>

      <!-- Display List -->
      <div
        v-else-if="similarArticles.length === 0 && !isLoadingSimilar"
        class="text-gray-600 text-center py-6"
      >
        No similar posts found.
      </div>
      <ul v-else class="bg-white rounded-lg shadow-md divide-y divide-gray-200">
        <li v-for="similar in similarArticles" :key="similar.id" class="p-6">
          <ArticleCard
            :article="similar"
            :hide-similar-button="true"
            :is-bookmarked="bookmarkedIds.has(similar.id)"
            @toggle-bookmark="() => toggleBookmark(similar.id)"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useHead } from "@vueuse/head"; // Import useHead
import { useRoute } from "vue-router"; // <-- Import useRoute
import ArticleCard from "../components/ArticleCard.vue";
import { NSpin } from "naive-ui";
import { useArticles } from "../composables/useArticles"; // Import useArticles

// Define API_BASE_URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Get route object
const route = useRoute();

// State for the parsed ID
const articleId = ref(null);

// --- Get bookmark state from useArticles ---
const { bookmarkedIds, toggleBookmark } = useArticles();

// State for Original Article
const originalArticle = ref(null);
const isLoadingOriginal = ref(false);
const errorOriginal = ref(null);

// State for Similar Articles
const similarArticles = ref([]);
const isLoadingSimilar = ref(false);
const errorSimilar = ref(null);

// --- Fetching Functions ---

async function fetchOriginalArticle(idToFetch) {
  // <-- Use passed ID
  isLoadingOriginal.value = true;
  errorOriginal.value = null;
  originalArticle.value = null;
  if (!idToFetch) {
    errorOriginal.value = "Article ID is missing.";
    isLoadingOriginal.value = false;
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/api/content/${idToFetch}`); // <-- Use passed ID
    if (!response.ok) {
      throw new Error(
        `HTTP error! Status: ${response.status} ${response.statusText}`
      );
    }
    originalArticle.value = await response.json();
  } catch (e) {
    console.error("Failed to fetch original article:", e);
    errorOriginal.value = `Failed to load original article (ID: ${idToFetch}). ${e.message}`; // <-- Use passed ID
  } finally {
    isLoadingOriginal.value = false;
  }
}

// Fetch AI-ranked similar articles
async function fetchSimilarArticles(idToFetch) {
  // <-- Use passed ID
  isLoadingSimilar.value = true;
  errorSimilar.value = null;
  similarArticles.value = []; // Clear previous results
  if (!idToFetch) {
    errorSimilar.value = "Article ID is missing for similar search.";
    isLoadingSimilar.value = false;
    return;
  }
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/similar/${idToFetch}/ai?n=10` // <-- Use passed ID
    ); // Fetch 10 AI results
    if (!response.ok) {
      const errorData = await response.text(); // Try to get error body
      throw new Error(
        `HTTP error! Status: ${response.status} ${response.statusText}. ${errorData}`
      );
    }
    similarArticles.value = await response.json();
  } catch (e) {
    console.error("Failed to fetch similar articles:", e);
    errorSimilar.value = `Failed to load similar articles. ${e.message}`;
  } finally {
    isLoadingSimilar.value = false;
  }
}

// --- SEO Head Management ---
useHead(
  computed(() => {
    if (isLoadingOriginal.value) {
      return {
        title: "Loading Similar Posts...",
        meta: [],
      };
    }
    if (errorOriginal.value || !originalArticle.value) {
      return {
        title: "Error Loading Article - Similar Posts",
        meta: [],
      };
    }

    const article = originalArticle.value;
    const title = `Similar Posts to: ${article.title}`;
    const description =
      article.sentence_summary ||
      article.paragraph_summary ||
      "Find AI Safety posts similar to this one.";
    const authors = article.authors ? article.authors.join(", ") : "Unknown";

    return {
      title: title,
      meta: [
        { name: "description", content: description },
        { name: "author", content: authors },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        // Add image if available
        ...(article.image_url
          ? [{ property: "og:image", content: article.image_url }]
          : []),
        // Add published time if available
        ...(article.published_date
          ? [
              {
                property: "article:published_time",
                content: new Date(article.published_date).toISOString(),
              },
            ]
          : []),
        // Add authors if available
        ...(article.authors
          ? [{ property: "article:author", content: authors }]
          : []),
        // Twitter card
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        ...(article.image_url
          ? [{ name: "twitter:image", content: article.image_url }]
          : []),
      ],
    };
  })
);

onMounted(() => {
  const slugWithId = route.params.slugWithId;
  if (typeof slugWithId === "string") {
    const lastDashIndex = slugWithId.lastIndexOf("-");
    if (lastDashIndex > -1) {
      const idStr = slugWithId.substring(lastDashIndex + 1);
      const potentialId = parseInt(idStr, 10);
      if (!isNaN(potentialId)) {
        articleId.value = potentialId;

        // Fetch data using the parsed ID
        fetchOriginalArticle(articleId.value);
        fetchSimilarArticles(articleId.value);
      } else {
        console.error("Parsed ID is not a valid number:", idStr);
        errorOriginal.value = "Invalid article ID format in URL.";
        errorSimilar.value = "Invalid article ID format in URL.";
      }
    } else {
      console.error("Could not find '-' separator in slugWithId:", slugWithId);
      errorOriginal.value = "Invalid URL format for similar posts.";
      errorSimilar.value = "Invalid URL format for similar posts.";
    }
  } else {
    console.error("slugWithId param is missing or not a string:", slugWithId);
    errorOriginal.value = "Missing article identifier in URL.";
    errorSimilar.value = "Missing article identifier in URL.";
  }
});

watch(
  () => route.params.slugWithId,
  (newSlugWithId) => {
    if (newSlugWithId && typeof newSlugWithId === "string") {
      // Re-parse and fetch if the parameter changes
      const lastDashIndex = newSlugWithId.lastIndexOf("-");
      if (lastDashIndex > -1) {
        const idStr = newSlugWithId.substring(lastDashIndex + 1);
        const potentialId = parseInt(idStr, 10);
        if (!isNaN(potentialId)) {
          articleId.value = potentialId;
          fetchOriginalArticle(articleId.value);
          fetchSimilarArticles(articleId.value);
        } else {
          console.error("Parsed ID is not a valid number:", idStr);
          errorOriginal.value = "Invalid article ID format in URL.";
          errorSimilar.value = "Invalid article ID format in URL.";
        }
      } else {
        console.error(
          "Could not find '-' separator in slugWithId:",
          newSlugWithId
        );
        errorOriginal.value = "Invalid URL format for similar posts.";
        errorSimilar.value = "Invalid URL format for similar posts.";
      }
    } else {
      console.error(
        "slugWithId param is missing or not a string:",
        newSlugWithId
      );
      errorOriginal.value = "Missing article identifier in URL.";
      errorSimilar.value = "Missing article identifier in URL.";
    }
  }
);
</script>

<style scoped>
/* Add any specific styles if needed */
</style>
