<script setup>
import { computed, ref } from "vue";
import { useArticles } from "../composables/useArticles";
// Keep relevant component imports
import ArticleList from "../components/ArticleList.vue";
import SearchBar from "../components/SearchBar.vue";
import SourceFilters from "../components/SourceFilters.vue";
import TagFilters from "../components/TagFilters.vue";
import NoveltyFilter from "../components/NoveltyFilter.vue";
// Remove SimilarDrawer import
import { Dice as IconDice, Bookmark as IconBookmark } from "@vicons/tabler";
import { NTooltip } from "naive-ui";

// --- Intro banner dismissal (persisted) ---
const INTRO_DISMISSED_KEY = "introDismissed";

function isIntroDismissed() {
  try {
    return localStorage.getItem(INTRO_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

const showIntroCard = ref(!isIntroDismissed());

function dismissIntroCard() {
  showIntroCard.value = false;
  try {
    localStorage.setItem(INTRO_DISMISSED_KEY, "1");
  } catch {
    // Storage unavailable (private mode / quota) - dismissal is session-only.
  }
}

// Keep useArticles logic
const {
  articles,
  isLoading,
  error,
  loadMoreError,
  fetchArticles,
  activeSources,
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
    class="relative mx-auto mb-8 max-w-[980px] rounded-lg border border-line bg-surface p-4 pr-10 text-sm text-ink-2 shadow-card"
  >
    <p>
      Cut through the noise with AI Safety Feed. We curate content from key
      sources (LessWrong, EA Forum, blogs, etc), using AI to add summaries,
      tags, and novelty scores. Quickly find the research and discussions that
      matter most to you. Learn more about our goals and methods
      <router-link
        to="/about"
        class="font-medium text-accent hover:text-accent-hover"
        >on the about page</router-link
      >.
    </p>

    <button
      @click="dismissIntroCard"
      class="absolute top-2 right-2 rounded-full p-1 text-ink-3 transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
        class="rounded-md px-2 py-1 text-sm font-medium text-accent transition-colors hover:bg-accent-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Clear all filters"
      >
        Clear filters
      </button>

      <!--  Reset Order Button -->
      <button
        v-if="isRandomized && !showOnlyBookmarks"
        @click="resetOrder"
        class="rounded-md px-2 py-1 text-sm font-medium text-accent transition-colors hover:bg-accent-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
              'btn-secondary',
              showOnlyBookmarks
                ? 'ring-2 ring-accent border-transparent bg-accent-soft text-accent-ink'
                : '',
            ]"
            :aria-pressed="showOnlyBookmarks"
            aria-label="Toggle showing only saved posts"
          >
            <IconBookmark stroke-width="2" class="h-4 w-4" />
          </button>
        </template>
        Show saved posts
      </NTooltip>

      <!--  Random Order Button -->
      <NTooltip :delay="0" :duration="0">
        <template #trigger>
          <button
            @click="requestRandomOrder"
            :disabled="showOnlyBookmarks"
            class="btn-secondary"
            aria-label="Shuffle post order"
          >
            <IconDice stroke-width="2" class="h-4 w-4" />
          </button>
        </template>
        Shuffle order
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
  <ArticleList
    :articles="articles"
    :isLoading="isLoading"
    :error="error"
    :load-more-error="loadMoreError"
    :allLoaded="allLoaded"
    :bookmarkedIds="bookmarkedIds"
    :isShowingBookmarks="showOnlyBookmarks"
    @clear-filters="clearFilters"
    @load-more="handleLoadMore"
    @toggle-bookmark="toggleBookmark"
  />
</template>

<style scoped>
/* Add any component-specific styles if needed */
</style>
