<script setup>
import { watch, computed, ref, onMounted, onUnmounted } from "vue";
import { useArticles } from "../composables/useArticles";
// Keep relevant component imports
import ArticleList from "../components/ArticleList.vue";
import SearchBar from "../components/SearchBar.vue";
import SourceFilters from "../components/SourceFilters.vue";
import TagFilters from "../components/TagFilters.vue";
import NoveltyFilter from "../components/NoveltyFilter.vue";
import EmailSubscription from "../components/EmailSubscription.vue";
// Remove SimilarDrawer import
import { Dice as IconDice, Bookmark as IconBookmark } from "@vicons/tabler";
import { NTooltip, NMessageProvider } from "naive-ui";

const showIntroCard = ref(true);

// Keep useArticles logic
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
  minNovelty,
  allAvailableSources,
  allSourceCounts,
  fetchRandomOrder,
  showOnlyBookmarks,
  toggleBookmark,
  bookmarkedIds,
  loadMore,
} = useArticles();

const isFilterActive = computed(() => {
  const allSourceNames = allAvailableSources.value;
  const allTagNames = availableTags.value.map((t) => t.tag);
  const sourcesAreDefault =
    activeSources.value.length === allSourceNames.length &&
    allSourceNames.length > 0;
  const tagsAreDefault =
    activeTags.value.length === allTagNames.length && allTagNames.length > 0;

  return (
    queryTerm.value.trim() !== "" ||
    !sourcesAreDefault ||
    !tagsAreDefault ||
    minNovelty.value !== null ||
    showOnlyBookmarks.value
  );
});

const isRandomized = ref(false);

function handleSearch() {
  queryTerm.value = searchTerm.value.trim();
}

function clearFilters() {
  searchTerm.value = "";
  queryTerm.value = "";
  updateActiveSources(allAvailableSources.value);
  updateActiveTags(availableTags.value.map((t) => t.tag));
  minNovelty.value = null;
  showOnlyBookmarks.value = false;
  if (isRandomized.value) {
    isRandomized.value = false;
  }
}

function requestRandomOrder() {
  fetchRandomOrder();
  isRandomized.value = true;
}

function resetOrder() {
  if (!showOnlyBookmarks.value) {
    fetchArticles({
      append: false,
      query: queryTerm.value,
      orderBy: "date",
      sources: activeSources.value,
      tags: activeTags.value,
      novelty: minNovelty.value,
    });
  }
  isRandomized.value = false;
}

function handleLoadMore() {
  loadMore();
}
</script>

<template>
  <!-- Introductory Card -->
  <div
    v-if="showIntroCard"
    class="relative max-w-[980px] mx-auto mb-8 p-4 pr-8 bg-white text-gray-700 rounded-md shadow-sm"
  >
    <p class="text-sm">
      Cut through the noise with AI Safety Feed. We curate content from key
      sources (LessWrong, EA Forum, blogs, etc), using AI to add summaries,
      tags, and novelty scores. Quickly find the research and discussions that
      matter most to you. Learn more about our goals and methods
      <router-link to="/about" class="font-medium underline hover:text-gray-900"
        >on the about page</router-link
      >.
    </p>

    <button
      @click="showIntroCard = false"
      class="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full"
      aria-label="Close introduction card"
    >
      <svg
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>

  <!--  Search and Filters Container -->
  <div
    class="max-w-[980px] mx-auto mb-4 flex flex-col md:flex-row md:items-start gap-4 md:gap-6"
  >
    <!--  Search Input -->
    <SearchBar
      v-model="searchTerm"
      @search="handleSearch"
      class="flex-grow max-w-[400px]"
      :disabled="showOnlyBookmarks"
      :placeholder="
        showOnlyBookmarks ? 'Search disabled for bookmarks' : 'Search feed...'
      "
    />

    <div
      class="flex items-center gap-2 md:flex-shrink-0 md:ml-auto flex-wrap justify-start md:justify-end"
    >
      <!--  Clear Filter Button -->
      <button
        v-if="isFilterActive"
        @click="clearFilters"
        class="text-sm text-blue-600 rounded px-2 py-1 transition-colors duration-150 ease-in-out focus:outline-none hover:bg-blue-100 hover:text-blue-700 focus:bg-blue-100 focus:text-blue-700"
        aria-label="Clear all filters"
      >
        Clear filters
      </button>

      <!--  Reset Order Button -->
      <button
        v-if="isRandomized && !showOnlyBookmarks"
        @click="resetOrder"
        class="text-sm text-blue-600 rounded px-2 py-1 transition-colors duration-150 ease-in-out focus:outline-none hover:bg-blue-100 hover:text-blue-700 focus:bg-blue-100 focus:text-blue-700"
        aria-label="Reset article order to default (date)"
      >
        Reset order
      </button>

      <!-- Show Bookmarks Button -->
      <NTooltip :delay="0" :duration="0">
        <template #trigger>
          <button
            @click="showOnlyBookmarks = !showOnlyBookmarks"
            :class="[
              'inline-flex items-center gap-1 px-3 py-2 border border-gray-300 shadow-xs text-sm leading-4 font-medium rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400',
              showOnlyBookmarks
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-white hover:bg-gray-50',
            ]"
            aria-label="Toggle showing only bookmarked articles"
          >
            <IconBookmark stroke-width="3" class="h-4 w-4" />
          </button>
        </template>
        Show bookmarked posts
      </NTooltip>

      <!--  Random Order Button -->
      <NTooltip :delay="0" :duration="0">
        <template #trigger>
          <button
            @click="requestRandomOrder"
            :disabled="showOnlyBookmarks"
            class="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 shadow-xs text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Randomize article order"
          >
            <IconDice stroke-width="3" class="h-4 w-4" />
          </button>
        </template>
        Randomize article order
      </NTooltip>

      <!-- Novelty Filter Component -->
      <NoveltyFilter v-model="minNovelty" :disabled="showOnlyBookmarks" />

      <!--  Source Filters -->
      <SourceFilters
        :availableSources="allAvailableSources"
        :activeSources="activeSources"
        :counts="allSourceCounts"
        @update-sources="updateActiveSources"
        :disabled="showOnlyBookmarks"
      />

      <!--  Tag Filters -->
      <TagFilters
        :availableTags="availableTags"
        :activeTags="activeTags"
        @update-tags="updateActiveTags"
        :disabled="showOnlyBookmarks"
      />
    </div>
  </div>

  <!--  Main Article List -->
  <div class="max-w-[980px] mx-auto">
    <!-- Display Loading/Error/Content -->
    <div v-if="error" class="text-center py-10 text-red-500">
      Error: {{ error }}
    </div>
    <div v-else>
      <ArticleList
        :articles="articles"
        :isLoading="isLoading"
        :error="error"
        :allLoaded="allLoaded"
        :bookmarkedIds="bookmarkedIds"
        :isShowingBookmarks="showOnlyBookmarks"
        @clear-filters="clearFilters"
        @load-more="handleLoadMore"
        @toggle-bookmark="toggleBookmark"
      />
    </div>
  </div>
</template>

<style scoped>
/* Add any component-specific styles if needed */
</style>
