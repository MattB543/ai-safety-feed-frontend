<script setup>
import {
  defineEmits,
  defineProps,
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
} from "vue";
import ArticleCard from "./ArticleCard.vue";

// --- Props --- Get access to props for observer callback and template
const props = defineProps({
  articles: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    required: true,
  },
  error: {
    type: String,
    default: null,
  },
  // Need this from the parent component using useArticles
  allLoaded: {
    type: Boolean,
    required: true,
  },
});

// --- Emits ---
const emit = defineEmits(["clear-filters", "show-similar", "load-more"]); // Added "load-more"

// --- Infinite Scroll Logic ---
const loadMoreTrigger = ref(null); // Template ref for the sentinel div
let observer = null;

const setupObserver = () => {
  // Ensure previous observer is disconnected before creating a new one
  if (observer) {
    observer.disconnect();
  }

  // Only setup observer if the trigger element exists in the DOM
  if (!loadMoreTrigger.value) {
    // console.log("setupObserver: loadMoreTrigger ref not found, skipping setup.");
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      // Use props directly inside the callback
      if (entry.isIntersecting && !props.isLoading && !props.allLoaded) {
        // console.log("Load more trigger intersecting, emitting load-more");
        emit("load-more"); // Emit event to parent to fetch more
      }
    },
    {
      root: null, // Use the viewport as the root
      rootMargin: "600px", // Load significantly before it's fully visible
      threshold: 0.1, // Trigger when 10% of the element is visible
    }
  );

  observer.observe(loadMoreTrigger.value);
};

onMounted(() => {
  // Initial setup after component mounts
  // Use nextTick to ensure the trigger element is rendered
  nextTick(() => {
    setupObserver();
  });
});

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
    observer = null; // Clean up observer reference
  }
});

// Watch for changes that would require resetting the observer
watch(
  // Watch multiple sources: articles array identity and allLoaded status
  [() => props.articles, () => props.allLoaded],
  ([newArticles, newAllLoaded], [oldArticles, oldAllLoaded]) => {
    // We need to re-setup the observer if:
    // 1. The articles array identity changes (e.g., filters applied, list replaced)
    // 2. All items were loaded, but now they are not (e.g., filters cleared)
    // 3. The list was empty and now has items (initial load or after clearing filters)
    const listIdentityChanged = newArticles !== oldArticles;
    const becameNonEmpty =
      newArticles.length > 0 && oldArticles && oldArticles.length === 0;
    const becameLoadable = oldAllLoaded && !newAllLoaded;

    if (listIdentityChanged || becameNonEmpty || becameLoadable) {
      // console.log("Observer reset condition met. List changed:", listIdentityChanged, "Became non-empty:", becameNonEmpty, "Became loadable:", becameLoadable);
      // Use nextTick to ensure the DOM (including the loadMoreTrigger div)
      // has been updated before trying to observe it.
      nextTick(() => {
        setupObserver();
      });
    }
  },
  { deep: false } // No need for deep watch here
);
</script>

<template>
  <ul
    class="bg-white max-w-[980px] mx-auto rounded-lg shadow-md pt-6 sm:p-6 divide-y divide-gray-200 min-h-[400px] flex flex-col"
  >
    <!-- Loading State -->
    <div
      v-if="isLoading && articles.length === 0"
      class="text-center text-gray-600 py-10 flex-grow flex flex-col items-center justify-center"
    >
      <!-- Simple CSS Spinner -->
      <div class="spinner mb-4"></div>
      <p class="text-base">Loading articles...</p>
      <p class="text-xs text-gray-500">
        (refresh after 1 minute, the free tier server is starting up)
      </p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4 flex-grow flex flex-col items-center justify-center"
      role="alert"
    >
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline"> {{ error }}</span>
    </div>

    <!-- No Articles/Results State -->
    <div
      v-else-if="articles.length === 0 && !isLoading"
      class="text-center text-gray-600 py-10 space-y-4 flex-grow flex flex-col items-center justify-center"
    >
      <p>No articles found. Try adjusting your search or filters.</p>
      <button
        @click="emit('clear-filters')"
        class="text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-100 py-1 px-3 rounded cursor-pointer"
      >
        Clear Filters
      </button>
    </div>

    <!-- Articles Feed: Wrapped ArticleCard in li and added padding -->
    <template v-else>
      <li
        v-for="article in articles"
        :key="article.id || article.source_url"
        class="pt-14 pb-6 first:pt-6"
      >
        <ArticleCard
          :article="article"
          @show-similar="emit('show-similar', $event)"
        />
      </li>
    </template>

    <!-- Loading indicator for infinite scroll -->
    <div v-if="isLoading && articles.length > 0" class="text-center py-4">
      <!-- Simple CSS Spinner for load more -->
      <div class="spinner mx-auto"></div>
      <!-- <p class="text-gray-600">Loading more articles...</p> -->
    </div>

    <!-- Sentinel Element for Intersection Observer -->
    <!-- Only render the trigger if there are articles and not all are loaded -->
    <div
      v-if="articles.length > 0 && !allLoaded"
      ref="loadMoreTrigger"
      class="h-10"
    ></div>
  </ul>
</template>

<style scoped>
.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #09f; /* Customize color if needed */
  animation: spin 1s ease infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Ensure the list itself grows if content overflows the min-height */
ul {
  /* min-height is already applied via tailwind */
  /* display: flex; */ /* Already applied via tailwind */
  /* flex-direction: column; */ /* Already applied via tailwind */
}
</style>
