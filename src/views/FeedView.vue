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
import {
  Dice as IconDice,
  Bookmark as IconBookmark,
  X as IconX,
} from "@vicons/tabler";
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
  resetOrder,
  orderBy,
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

// Derived from the composable's single order state.
const isRandomized = computed(() => orderBy.value === "random");

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
  // If nothing above actually changed, no filter watcher fires, so return
  // to date order explicitly.
  if (isRandomized.value) {
    resetOrder();
  }
}

function requestRandomOrder() {
  fetchRandomOrder();
}

function handleLoadMore() {
  loadMore();
}
</script>

<template>
  <div class="mx-auto max-w-content">
    <!-- Page header: big light title, then the (dismissible) intro sentence
         with one highlighted phrase, as on aisafety.com directory pages. -->
    <header class="pt-8 pb-8 lg:pt-14 lg:pb-14">
      <h1 class="type-h1 -ml-1 text-ink">Feed</h1>

      <div v-if="showIntroCard" class="mt-4 max-w-[640px] lg:mt-8">
        <!-- Floated so only the first lines make room for it. -->
        <button
          class="float-right -mt-1 ml-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-surface-2 hover:text-white"
          aria-label="Close introduction card"
          title="Hide introduction"
          @click="dismissIntroCard"
        >
          <IconX class="h-4 w-4" stroke-width="1.5" />
        </button>
        <p class="intro-text text-ink">
          AI safety writing from LessWrong, the EA Forum, blogs and podcasts,
          with AI-written
          <span class="text-accent">summaries, tags and novelty scores</span>.
        </p>
        <p class="mt-3 text-small text-ink-2 lg:mt-4">
          Learn more about our goals and methods on the
          <router-link
            to="/about"
            class="text-white transition-colors hover:text-accent"
            >About page →</router-link
          >
        </p>
      </div>
    </header>

    <!--  Search and Filters Container -->
    <div
      class="mb-8 flex flex-col gap-4 lg:mb-10 lg:flex-row lg:items-start lg:gap-6"
    >
      <!--  Search Input -->
      <SearchBar
        v-model="searchTerm"
        class="lg:min-w-[240px] lg:flex-[0_1_360px]"
        :disabled="showOnlyBookmarks"
        :placeholder="
          showOnlyBookmarks ? 'Search disabled for bookmarks' : 'Search feed...'
        "
        @search="handleSearch"
      />

      <div
        class="flex min-w-0 flex-wrap items-center justify-start gap-2 lg:flex-1 lg:justify-end"
      >
        <!--  Clear Filter Button -->
        <button
          v-if="isFilterActive"
          class="text-action"
          aria-label="Clear all filters"
          @click="clearFilters"
        >
          Clear filters
        </button>

        <!--  Reset Order Button -->
        <button
          v-if="isRandomized && !showOnlyBookmarks"
          class="text-action"
          aria-label="Reset article order to default (date)"
          @click="resetOrder"
        >
          Reset order
        </button>

        <!-- Show Bookmarks Button -->
        <NTooltip :delay="0" :duration="0">
          <template #trigger>
            <button
              :class="['filter-pill-icon', { 'is-active': showOnlyBookmarks }]"
              :aria-pressed="showOnlyBookmarks"
              aria-label="Toggle showing only saved posts"
              @click="showOnlyBookmarks = !showOnlyBookmarks"
            >
              <IconBookmark stroke-width="1.5" class="h-4 w-4" />
            </button>
          </template>
          Show saved posts
        </NTooltip>

        <!--  Random Order Button -->
        <NTooltip :delay="0" :duration="0">
          <template #trigger>
            <button
              :disabled="showOnlyBookmarks"
              :class="['filter-pill-icon', { 'is-active': isRandomized }]"
              aria-label="Shuffle post order"
              @click="requestRandomOrder"
            >
              <IconDice stroke-width="1.5" class="h-4 w-4" />
            </button>
          </template>
          Shuffle order
        </NTooltip>

        <!-- Novelty Filter Component -->
        <NoveltyFilter v-model="minNovelty" :disabled="showOnlyBookmarks" />

        <!--  Source Filters -->
        <SourceFilters
          :available-sources="allAvailableSources"
          :active-sources="activeSources"
          :counts="allSourceCounts"
          :disabled="showOnlyBookmarks"
          @update-sources="updateActiveSources"
        />

        <!--  Tag Filters -->
        <TagFilters
          :available-tags="availableTags"
          :active-tags="activeTags"
          :disabled="showOnlyBookmarks"
          @update-tags="updateActiveTags"
        />
      </div>
    </div>

    <!--  Main Article List -->
    <ArticleList
      :articles="articles"
      :is-loading="isLoading"
      :error="error"
      :load-more-error="loadMoreError"
      :all-loaded="allLoaded"
      :bookmarked-ids="bookmarkedIds"
      :is-showing-bookmarks="showOnlyBookmarks"
      :is-random-order="isRandomized"
      @clear-filters="clearFilters"
      @reset-order="resetOrder"
      @load-more="handleLoadMore"
      @toggle-bookmark="toggleBookmark"
    />
  </div>
</template>

<style scoped>
/* Intro sentence: the brand's 28px/300 on desktop, tightened to 20px on
   phones so the first post title reaches the first screen. */
.intro-text {
  font-size: 20px;
  line-height: 1.3;
  font-weight: 300;
  letter-spacing: -0.035em;
}
@media (min-width: 62rem) {
  .intro-text {
    font-size: 28px;
    line-height: 1.2;
    letter-spacing: -0.05em;
  }
}
</style>
