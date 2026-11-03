<template>
  <div class="mx-auto max-w-content pt-10 lg:pt-14">
    <!-- Section 1: Original Article -->
    <div class="mb-14">
      <p class="mb-4 text-small text-ink-2">Posts similar to</p>
      <div v-if="isLoadingOriginal" class="py-10 text-center">
        <n-spin size="large" />
        <p class="mt-3 text-small text-ink-2">Loading original article…</p>
      </div>
      <div
        v-else-if="errorOriginal"
        role="alert"
        class="rounded-lg border border-danger/30 bg-danger-soft px-6 py-4 text-small text-danger"
      >
        {{ errorOriginal }}
      </div>
      <ArticleCard
        v-else-if="originalArticle"
        :article="originalArticle"
        :hide-similar-button="true"
        :is-bookmarked="bookmarkedIds.has(originalArticle.id)"
        @toggle-bookmark="toggleBookmark"
      />
    </div>

    <!-- Section 2: Similar Articles -->
    <div>
      <h2 class="type-h2 mb-6 text-ink lg:mb-8">Similar posts</h2>

      <!-- Loading State for Similar Articles -->
      <div v-if="isLoadingSimilar" class="py-10 text-center">
        <n-spin size="large" />
        <p class="mt-3 text-small text-ink-2">Loading similar articles…</p>
      </div>
      <!-- Error State for Similar Articles -->
      <div
        v-else-if="errorSimilar"
        role="alert"
        class="mb-4 rounded-lg border border-danger/30 bg-danger-soft px-6 py-4 text-small text-danger"
      >
        {{ errorSimilar }}
      </div>

      <!-- Display List -->
      <div
        v-else-if="similarArticles.length === 0 && !isLoadingSimilar"
        class="py-6 text-center text-small text-ink-2"
      >
        No similar posts found.
      </div>
      <ul v-else class="flex flex-col gap-6 lg:gap-10">
        <li v-for="similar in similarArticles" :key="similar.id">
          <ArticleCard
            :article="similar"
            :hide-similar-button="true"
            :is-bookmarked="bookmarkedIds.has(similar.id)"
            @toggle-bookmark="toggleBookmark"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onBeforeUnmount } from "vue";
import { useHead } from "@vueuse/head"; // Import useHead
import { useRoute } from "vue-router"; // <-- Import useRoute
import ArticleCard from "../components/ArticleCard.vue";
import { NSpin } from "naive-ui";
import { useBookmarks } from "../composables/useBookmarks";
import { getJson } from "../api";

// Get route object
const route = useRoute();

const { bookmarkedIds, toggleBookmark } = useBookmarks();

// State for Original Article
const originalArticle = ref(null);
const isLoadingOriginal = ref(false);
const errorOriginal = ref(null);

// State for Similar Articles
const similarArticles = ref([]);
const isLoadingSimilar = ref(false);
const errorSimilar = ref(null);

// Aborted when the route moves to another post (or the page unmounts), so a
// slow response for the previous post can't overwrite the current one.
let controller = null;

// --- Fetching Functions ---

async function fetchOriginalArticle(idToFetch, signal) {
  isLoadingOriginal.value = true;
  errorOriginal.value = null;
  originalArticle.value = null;
  try {
    originalArticle.value = await getJson(`/api/v1/posts/${idToFetch}`, {
      signal,
    });
  } catch (e) {
    if (e.name === "AbortError") return;
    console.error("Failed to fetch original article:", e);
    errorOriginal.value = `Failed to load original article (ID: ${idToFetch}). ${e.message}`;
  } finally {
    if (!signal.aborted) isLoadingOriginal.value = false;
  }
}

// Nearest posts by embedding distance (up to 20)
async function fetchSimilarArticles(idToFetch, signal) {
  isLoadingSimilar.value = true;
  errorSimilar.value = null;
  similarArticles.value = []; // Clear previous results
  try {
    similarArticles.value = await getJson(`/api/similar/${idToFetch}`, {
      signal,
    });
  } catch (e) {
    if (e.name === "AbortError") return;
    console.error("Failed to fetch similar articles:", e);
    errorSimilar.value = `Failed to load similar articles. ${e.message}`;
  } finally {
    if (!signal.aborted) isLoadingSimilar.value = false;
  }
}

// The route param is "<slug>-<id>"; the id is everything after the last dash.
function parseId(slugWithId) {
  if (typeof slugWithId !== "string") return null;
  const id = Number(slugWithId.slice(slugWithId.lastIndexOf("-") + 1));
  return Number.isInteger(id) && id > 0 ? id : null;
}

watch(
  () => route.params.slugWithId,
  (slugWithId) => {
    controller?.abort();
    controller = null;
    if (slugWithId === undefined) return; // navigating away from this page
    const id = parseId(slugWithId);
    if (id === null) {
      console.error("No valid article id in slugWithId:", slugWithId);
      originalArticle.value = null;
      similarArticles.value = [];
      errorOriginal.value = "Invalid article ID format in URL.";
      errorSimilar.value = "Invalid article ID format in URL.";
      return;
    }
    controller = new AbortController();
    fetchOriginalArticle(id, controller.signal);
    fetchSimilarArticles(id, controller.signal);
  },
  { immediate: true }
);

onBeforeUnmount(() => controller?.abort());

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
</script>

<style scoped>
/* Add any specific styles if needed */
</style>
