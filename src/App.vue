<script setup>
import { watch, computed, ref, nextTick } from "vue";
import { useArticles } from "./composables/useArticles";
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
import ArticleList from "./components/ArticleList.vue";
import SearchBar from "./components/SearchBar.vue";
import SourceFilters from "./components/SourceFilters.vue";
import TagFilters from "./components/TagFilters.vue";
import NoveltyFilter from "./components/NoveltyFilter.vue";
import IntroCard from "./components/IntroCard.vue";
import SimilarDrawer from "./components/SimilarDrawer.vue";
import { ListSearch as IconListSearch, Dice as IconDice } from "@vicons/tabler";
import { NTooltip } from "naive-ui";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const {
  articles,
  isLoading,
  error,
  fetchArticles,
  availableSources,
  activeSources,
  sourceCounts,
  searchTerm,
  queryTerm,
  updateActiveSources,
  availableTags,
  activeTags,
  updateActiveTags,
  allLoaded,
  fetchArticlesUntilAllLoadedInBackground,
  ensureArticleLoaded,
  minNovelty,
  allAvailableSources,
  allSourceCounts,
  fetchRandomOrder,
} = useArticles();

// Fetch initial articles on component mount
fetchArticles();

// Computed property to check if any filter is active
const isFilterActive = computed(() => {
  return (
    searchTerm.value.trim() !== "" ||
    activeSources.value.length !== availableSources.value.length ||
    activeTags.value.length !== availableTags.value.map((t) => t.tag).length ||
    minNovelty.value !== null
  );
});

// Function to trigger search
function handleSearch() {
  queryTerm.value = searchTerm.value.trim();
}

// Function to clear search/filters
function clearFilters() {
  searchTerm.value = "";
  queryTerm.value = "";
  // Reset sources to all available
  updateActiveSources(availableSources.value);
  // Reset tags to all available
  updateActiveTags(availableTags.value.map((t) => t.tag));
  minNovelty.value = null;
}

// --- New function to handle random order ---
function requestRandomOrder() {
  fetchRandomOrder();
}

const drawerOpen = ref(false);
const drawerTarget = ref(null); // id of the reference post
const drawerTargetTitle = ref(""); // title of the reference post
const showReopenBtn = ref(false);
const similarDrawerRef = ref(null);
const isScrollingToArticle = ref(false); // Loading state for scroll-to-article

function openSimilar(payload) {
  drawerTarget.value = payload.id;
  drawerTargetTitle.value = payload.title;
  drawerOpen.value = true;
  // Pre-fetch all articles in the background when opening the drawer
  fetchArticlesUntilAllLoadedInBackground();
}

async function scrollToArticle(id) {
  isScrollingToArticle.value = true; // Start loading indicator
  showReopenBtn.value = drawerTarget.value !== null;

  try {
    // 1. Ensure the article is loaded (fetch if necessary)
    const loaded = await ensureArticleLoaded(id);

    if (!loaded) {
      // Handle case where article couldn't be loaded (e.g., 404)
      // Error state is likely set in useArticles, maybe show a toast?
      console.warn(
        `scrollToArticle: Failed to ensure article ${id} is loaded.`
      );
      // Optionally clear the drawer target if the post vanished?
      // drawerTarget.value = null;
      // showReopenBtn.value = false;
      isScrollingToArticle.value = false;
      return; // Stop if article not found/loaded
    }

    // 2. Wait for DOM update and scroll
    await nextTick();
    const element = document.getElementById(`article-${id}`); // Assuming ArticleCard has id=`article-${id}`
    if (element) {
      const headerH = document.querySelector("header")?.offsetHeight ?? 0;
      const top =
        element.getBoundingClientRect().top + window.pageYOffset - headerH - 16; // Added 16px buffer

      window.scrollTo({ top, behavior: "smooth" });
    } else {
      console.warn(
        `scrollToArticle: Element with ID article-${id} not found after loading.`
      );
    }
  } catch (err) {
    console.error(
      `scrollToArticle: Error during scroll/load for article ${id}:`,
      err
    );
    // Handle unexpected errors, maybe show a toast
  } finally {
    isScrollingToArticle.value = false; // Stop loading indicator
  }
}

// --- Handle Load More Event ---
function handleLoadMore() {
  // console.log("App.vue: Received load-more event");
  fetchArticles({ append: true });
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen flex flex-col">
    <!-- Use AppHeader component, pass API_BASE_URL -->
    <AppHeader :API_BASE_URL="API_BASE_URL" />

    <!-- Main Content -->
    <main
      class="flex-grow w-full py-8 px-4 transition-padding duration-300 ease-in-out"
      :class="{ 'main-padded': drawerOpen }"
    >
      <!-- intro card -->
      <IntroCard class="max-w-[980px] mx-auto mb-8" />

      <!-- Search and Filters Container -->
      <div
        class="max-w-[980px] mx-auto mb-6 flex flex-col md:flex-row md:items-start gap-4 md:gap-6"
      >
        <!-- Search Input -->
        <SearchBar
          v-model="searchTerm"
          @search="handleSearch"
          class="flex-grow max-w-[400px]"
        />

        <div
          class="flex items-center gap-2 md:flex-shrink-0 md:ml-auto flex-wrap justify-start md:justify-end"
        >
          <!-- Clear Filter Button -->
          <button
            v-if="isFilterActive"
            @click="clearFilters"
            class="text-sm text-blue-600 rounded px-2 py-1 transition-colors duration-150 ease-in-out focus:outline-none hover:bg-blue-100 hover:text-blue-700 focus:bg-blue-100 focus:text-blue-700"
            aria-label="Clear all filters"
          >
            Clear filters
          </button>

          <!-- Random Order Button -->
          <NTooltip :delay="0" :duration="0">
            <template #trigger>
              <button
                @click="requestRandomOrder"
                class="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 shadow-xs text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                aria-label="Randomize article order"
              >
                <IconDice stroke-width="3" class="h-4 w-4" />
              </button>
            </template>
            Randomize article order
          </NTooltip>

          <!-- Novelty Filter Component -->
          <NoveltyFilter v-model="minNovelty" />

          <!-- Source Filters -->
          <SourceFilters
            :availableSources="allAvailableSources"
            :activeSources="activeSources"
            :counts="allSourceCounts"
            @update-sources="updateActiveSources"
          />

          <!-- Tag Filters -->
          <TagFilters
            :availableTags="availableTags"
            :activeTags="activeTags"
            @update-tags="updateActiveTags"
          />
        </div>
      </div>

      <!-- Pass allLoaded prop and handle load-more event -->
      <ArticleList
        :articles="articles"
        :isLoading="isLoading"
        :error="error"
        :allLoaded="allLoaded"
        @clear-filters="clearFilters"
        @show-similar="openSimilar"
        @load-more="handleLoadMore"
      />
    </main>

    <!-- Use AppFooter component -->
    <AppFooter />

    <SimilarDrawer
      ref="similarDrawerRef"
      v-model:show="drawerOpen"
      :articleId="drawerTarget"
      :reference-article-title="drawerTargetTitle"
      @scroll-to-article="scrollToArticle"
      :is-scrolling-to-article="isScrollingToArticle"
      :style="{ '--n-mask-color': 'rgba(0, 0, 0, 0.2)' }"
      @update:show="
        (v) => {
          drawerOpen = v;
          showReopenBtn = !v && drawerTarget !== null;
        }
      "
    />

    <!-- Re-open FAB -->
    <button
      v-if="showReopenBtn"
      @click="drawerOpen = true"
      class="fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-gray-500 text-white rounded-full p-2 md:p-3 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
      aria-label="Re-open similar posts drawer"
    >
      <IconListSearch stroke-width="2" class="h-4 w-4 md:h-6 md:w-6" />
    </button>
  </div>
</template>

<style>
/* Add styles for the main content shift */
@media (min-width: 768px) {
  /* Tailwind md breakpoint */
  .main-padded {
    padding-right: 550px; /* Add padding equal to drawer width */
  }
}

/* Optional: Ensure body scrollbar doesn't cause layout shift *if* needed,
   but usually browsers handle this ok when margin changes content width */
/* body {
  overflow-y: scroll;
} */

/* Add transition directly if not handled by utility classes */
main {
  transition-property: padding-right; /* Transition padding */
  transition-timing-function: ease-in-out;
  transition-duration: 300ms;
}
</style>
