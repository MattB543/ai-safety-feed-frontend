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
      <div class="flex justify-between items-center mb-6 border-b pb-2">
        <h2 class="text-2xl font-semibold text-gray-700">Similar Posts</h2>

        <!-- Right-aligned section: Helper text + Button -->
        <div class="flex items-center gap-3">
          <!-- Helper text during AI ranking -->
          <span
            v-if="
              !isLoadingInitialSimilar && isLoadingAiRanked && !showingAiResults
            "
            class="text-sm text-gray-500 italic"
          >
            Showing quick results (vector-based), having AI refine the list...
          </span>

          <!-- Toggle Results Button -->
          <n-button
            v-if="!isLoadingInitialSimilar"
            @click="toggleResultsView"
            :type="showingAiResults ? 'default' : 'primary'"
            size="small"
            :loading="isLoadingAiRanked"
            :disabled="isToggleButtonDisabled"
            :title="toggleButtonTitle"
          >
            <template #icon>
              <n-icon
                :component="
                  showingAiResults ? IconArrowBack : IconSparklesCustom
                "
              />
            </template>
            {{ toggleButtonText }}
          </n-button>
        </div>
      </div>

      <!-- Loading State for Initial Vector Results -->
      <div v-if="isLoadingInitialSimilar" class="text-center py-10">
        <n-spin size="large" />
        <p class="text-gray-600 mt-2">Loading Similar Articles...</p>
      </div>
      <!-- Error State for Initial Vector Results -->
      <div
        v-else-if="errorInitialSimilar"
        class="text-red-600 bg-red-100 p-4 rounded mb-4"
      >
        {{ errorInitialSimilar }}
      </div>
      <!-- Error State for AI Ranking (shown below initial results if they loaded) -->
      <div
        v-if="errorAiRanked && !isLoadingInitialSimilar"
        class="text-orange-600 bg-orange-100 p-3 rounded mb-4 text-sm"
      >
        Could not load AI-ranked results: {{ errorAiRanked }}
      </div>

      <!-- Display List -->
      <div
        v-else-if="displayedArticles.length === 0 && !isLoadingInitialSimilar"
        class="text-gray-600 text-center py-6"
      >
        No similar posts found.
      </div>
      <ul v-else class="bg-white rounded-lg shadow-md divide-y divide-gray-200">
        <li v-for="similar in displayedArticles" :key="similar.id" class="p-6">
          <ArticleCard :article="similar" :hide-similar-button="true" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import ArticleCard from "../components/ArticleCard.vue";
import { NSpin, NButton, NIcon } from "naive-ui";
import IconSparklesCustom from "../components/icons/IconSparklesCustom.vue"; // Import the sparkles icon
import IconArrowBack from "../components/icons/IconArrowBack.vue"; // Import an arrow icon

const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
});

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// State for Original Article
const originalArticle = ref(null);
const isLoadingOriginal = ref(false);
const errorOriginal = ref(null);

// State for Initial (Vector) Similar Articles
const initialSimilarArticles = ref([]);
const isLoadingInitialSimilar = ref(false);
const errorInitialSimilar = ref(null);

// State for AI-Ranked Similar Articles
const aiRankedSimilarArticles = ref([]);
const isLoadingAiRanked = ref(false);
const errorAiRanked = ref(null);
const aiResultsAvailable = ref(false); // Flag to indicate AI results are fetched (successfully or with error)

// State for UI Control
const showingAiResults = ref(false); // Are we currently displaying AI results?

// --- Computed Properties ---

// Determine which list to display
const displayedArticles = computed(() => {
  return showingAiResults.value
    ? aiRankedSimilarArticles.value
    : initialSimilarArticles.value;
});

// Computed property for the toggle button text
const toggleButtonText = computed(() => {
  return showingAiResults.value ? "View Vector Ranking" : "View AI Ranking";
});

// Computed property for the toggle button title attribute
const toggleButtonTitle = computed(() => {
  if (isLoadingAiRanked.value) {
    return "AI ranking in progress...";
  }
  if (!showingAiResults.value && errorAiRanked.value) {
    return "Cannot view AI ranking due to an error.";
  }
  return showingAiResults.value
    ? "Switch back to initial vector-based results"
    : "Switch to AI-ranked results";
});

// Computed property for the toggle button disabled state
const isToggleButtonDisabled = computed(() => {
  // Disable while AI is loading
  if (isLoadingAiRanked.value) {
    return true;
  }
  // Disable switching TO AI results if there was an error
  if (!showingAiResults.value && errorAiRanked.value) {
    return true;
  }
  // Disable switching TO AI results if they are available but empty (optional, depends on desired UX)
  // if (!showingAiResults.value && aiResultsAvailable.value && aiRankedSimilarArticles.value.length === 0) {
  //   return true;
  // }
  return false;
});

// --- Fetching Functions ---

async function fetchOriginalArticle(articleId) {
  isLoadingOriginal.value = true;
  errorOriginal.value = null;
  originalArticle.value = null;
  try {
    const response = await fetch(`${API_BASE_URL}/api/content/${articleId}`);
    if (!response.ok) {
      throw new Error(
        `HTTP error! Status: ${response.status} ${response.statusText}`
      );
    }
    originalArticle.value = await response.json();
  } catch (e) {
    console.error("Failed to fetch original article:", e);
    errorOriginal.value = `Failed to load original article (ID: ${articleId}). ${e.message}`;
  } finally {
    isLoadingOriginal.value = false;
  }
}

// Fetch initial vector-based similar articles
async function fetchVectorSimilar(articleId) {
  isLoadingInitialSimilar.value = true;
  errorInitialSimilar.value = null;
  initialSimilarArticles.value = []; // Clear previous results
  showingAiResults.value = false; // Reset view state
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/similar/${articleId}/vector?n=10`
    ); // Fetch 10 vector results
    if (!response.ok) {
      throw new Error(
        `HTTP error! Status: ${response.status} ${response.statusText}`
      );
    }
    initialSimilarArticles.value = await response.json();
  } catch (e) {
    console.error("Failed to fetch vector similar articles:", e);
    errorInitialSimilar.value = `Failed to load initial similar articles. ${e.message}`;
  } finally {
    isLoadingInitialSimilar.value = false;
  }
}

// Fetch AI-ranked similar articles (runs in background)
async function fetchAiRankedSimilar(articleId) {
  isLoadingAiRanked.value = true;
  errorAiRanked.value = null;
  aiRankedSimilarArticles.value = []; // Clear previous results
  aiResultsAvailable.value = false; // Reset availability
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/similar/${articleId}/ai?n=10`
    ); // Fetch 10 AI results
    if (!response.ok) {
      const errorData = await response.text(); // Try to get error body
      throw new Error(
        `HTTP error! Status: ${response.status} ${response.statusText}. ${errorData}`
      );
    }
    aiRankedSimilarArticles.value = await response.json();
    aiResultsAvailable.value = true; // Mark AI results as available (even if empty)
  } catch (e) {
    console.error("Failed to fetch AI-ranked similar articles:", e);
    errorAiRanked.value = `AI ranking failed. ${e.message}`;
    aiResultsAvailable.value = true; // Mark as "available" but with an error
  } finally {
    isLoadingAiRanked.value = false;
  }
}

// --- Lifecycle and Watchers ---

function loadAllData(articleId) {
  fetchOriginalArticle(articleId);
  fetchVectorSimilar(articleId); // Fetch vector results immediately
  fetchAiRankedSimilar(articleId); // Start fetching AI results in parallel
}

onMounted(() => {
  loadAllData(props.id);
});

watch(
  () => props.id,
  (newId, oldId) => {
    if (newId !== oldId) {
      loadAllData(newId);
    }
  }
);

// --- UI Actions ---

function toggleResultsView() {
  // Prevent toggling if button is disabled (redundant check, but safe)
  if (isToggleButtonDisabled.value) {
    return;
  }
  showingAiResults.value = !showingAiResults.value;
}
</script>

<style scoped>
/* Add any specific styles if needed */
</style>
