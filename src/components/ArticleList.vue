<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
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
  // Non-fatal error raised while appending another page
  loadMoreError: {
    type: String,
    default: null,
  },
  // Need this from the parent component using useArticles
  allLoaded: {
    type: Boolean,
    required: true,
  },
  // Set of bookmarked article IDs
  bookmarkedIds: {
    type: Set,
    required: true,
  },
  isShowingBookmarks: {
    type: Boolean,
    default: false,
  },
  // Random order is a single batch; the end of the list says so.
  isRandomOrder: {
    type: Boolean,
    default: false,
  },
});

// --- Emits ---
const emit = defineEmits([
  "clear-filters",
  "load-more",
  "toggle-bookmark",
  "reset-order",
]); // Removed "show-similar"

// --- Cold-start hint: only mention the sleeping server after a real wait ---
const showColdStartHint = ref(false);
let coldStartTimer = null;

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
      if (
        entry.isIntersecting &&
        !props.isLoading &&
        !props.allLoaded &&
        !props.loadMoreError
      ) {
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

// Show the cold-start hint only once a load from an empty list has been
// running for 4s; clear it whenever that load finishes.
watch(
  () => props.isLoading && props.articles.length === 0,
  (waitingFromEmpty) => {
    clearTimeout(coldStartTimer);
    showColdStartHint.value = false;
    if (waitingFromEmpty) {
      coldStartTimer = setTimeout(() => {
        showColdStartHint.value = true;
      }, 4000);
    }
  },
  { immediate: true }
);

onMounted(() => {
  // Initial setup after component mounts
  // Use nextTick to ensure the trigger element is rendered
  nextTick(() => {
    setupObserver();
  });
});

onBeforeUnmount(() => {
  clearTimeout(coldStartTimer);
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
  <div class="mx-auto min-h-[400px] max-w-content">
    <!-- Initial Loading State -->
    <div
      v-if="isLoading && articles.length === 0"
      class="flex min-h-[400px] flex-col items-center justify-center gap-2 px-4 py-10 text-center"
      role="status"
    >
      <div class="spinner mb-3"></div>
      <p class="text-small text-ink-2">Loading posts…</p>
      <p v-if="showColdStartHint" class="text-xs text-ink-3">
        The server may be waking up, this can take up to a minute.
      </p>
    </div>

    <!-- Error State: only when there is nothing to show -->
    <div
      v-else-if="error && articles.length === 0"
      role="alert"
      class="rounded-lg border border-danger/30 bg-danger-soft px-6 py-4 text-small text-danger"
    >
      {{ error }}
    </div>

    <!-- No Articles/Results State -->
    <div
      v-else-if="articles.length === 0 && !isLoading"
      class="flex min-h-[400px] flex-col items-center justify-center gap-6 px-4 py-10 text-center text-small text-ink-2"
    >
      <p v-if="props.isShowingBookmarks">
        You haven't saved any posts yet, or none match your other active
        filters.
      </p>
      <p v-else>No posts match these filters.</p>
      <button
        v-if="!props.isShowingBookmarks"
        class="btn-secondary"
        @click="emit('clear-filters')"
      >
        Clear filters
      </button>
    </div>

    <!-- Articles Feed -->
    <ul v-else class="flex flex-col gap-6 lg:gap-10">
      <li v-for="article in articles" :key="article.id || article.source_url">
        <ArticleCard
          :article="article"
          :is-bookmarked="props.bookmarkedIds.has(article.id)"
          @toggle-bookmark="emit('toggle-bookmark', article.id)"
        />
      </li>
    </ul>

    <!-- Loading indicator for infinite scroll -->
    <div
      v-if="isLoading && articles.length > 0"
      class="py-8 text-center"
      role="status"
      aria-label="Loading more posts"
    >
      <div class="spinner mx-auto"></div>
    </div>

    <!-- Load-more failure: keep what we have, offer a retry -->
    <div
      v-else-if="
        loadMoreError && articles.length > 0 && !props.isShowingBookmarks
      "
      class="flex flex-col items-center gap-3 py-8 text-small text-ink-2"
    >
      <p>{{ loadMoreError }}</p>
      <button class="btn-secondary" @click="emit('load-more')">Retry</button>
    </div>

    <!-- End of a random batch: no more pages in random order -->
    <div
      v-else-if="
        isRandomOrder &&
        articles.length > 0 &&
        !props.isShowingBookmarks &&
        !isLoading
      "
      class="flex flex-col items-center gap-4 py-10 text-center text-small text-ink-2"
    >
      <p>
        That's a random selection of {{ articles.length }} posts. Shuffle again
        for another, or go back to the latest posts.
      </p>
      <button class="btn-secondary-sm" @click="emit('reset-order')">
        Reset order
      </button>
    </div>

    <!-- End of feed marker -->
    <p
      v-else-if="
        allLoaded &&
        articles.length > 0 &&
        !props.isShowingBookmarks &&
        !isLoading
      "
      class="py-10 text-center text-small text-ink-2"
    >
      You have reached the end.
    </p>

    <!-- Sentinel Element for Intersection Observer -->
    <!-- Only render the trigger if there are articles and not all are loaded -->
    <div
      v-if="articles.length > 0 && !allLoaded && !props.isShowingBookmarks"
      ref="loadMoreTrigger"
      class="h-10"
    ></div>
  </div>
</template>

<style scoped>
/* aisafety.com spinner: a thin translucent white ring with a white head. */
.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgb(255 255 255 / 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
