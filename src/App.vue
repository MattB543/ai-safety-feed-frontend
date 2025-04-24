<script setup>
import { watch, computed, ref, nextTick } from "vue";
import { useArticles } from "./composables/useArticles";
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
import ArticleList from "./components/ArticleList.vue";
import SearchBar from "./components/SearchBar.vue";
import SourceFilters from "./components/SourceFilters.vue";
import TagFilters from "./components/TagFilters.vue";
import IntroCard from "./components/IntroCard.vue";
import SimilarDrawer from "./components/SimilarDrawer.vue";
import { ListSearch as IconListSearch } from "@vicons/tabler";

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
} = useArticles();

// Computed property to check if any filter is active
const isFilterActive = computed(() => {
  return (
    searchTerm.value.trim() !== "" ||
    activeSources.value.length !== availableSources.value.length ||
    activeTags.value.length !== availableTags.value.map((t) => t.tag).length
  );
});

// Function to trigger search
function handleSearch() {
  queryTerm.value = searchTerm.value.trim();
  fetchArticles();
}

// Function to clear search/filters
function clearFilters() {
  searchTerm.value = "";
  // Reset sources to all available
  updateActiveSources(availableSources.value);
  // Reset tags to all available
  updateActiveTags(availableTags.value.map((t) => t.tag));
  // No need to call handleSearch here as updateActiveSources/Tags trigger fetchArticles
}

// Watch for changes in activeSources, activeTags, and searchTerm to refetch articles
watch([activeSources, activeTags], () => {
  // TODO: Consider adding debouncing for searchTerm
  fetchArticles();
});

const drawerOpen = ref(false);
const drawerTarget = ref(null); // id of the reference post
const drawerTargetTitle = ref(""); // title of the reference post
const showReopenBtn = ref(false); // ★ new
const similarDrawerRef = ref(null); // ref for the drawer component

// Watch for drawer state changes to adjust body padding
watch(drawerOpen, (isOpen) => {
  nextTick(() => {
    // Wait for DOM update
    if (isOpen) {
      const drawerElement = similarDrawerRef.value?.$el; // Access drawer's root element
      if (drawerElement) {
        const drawerWidth = drawerElement.offsetWidth;
        const scrollbarWidth =
          window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = `${drawerWidth + scrollbarWidth}px`;
      } else {
        // Fallback or initial state (optional)
        const scrollbarWidth =
          window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = `${420 + scrollbarWidth}px`; // Keep fallback just in case?
      }
      // document.body.style.overflow = "hidden";
    } else {
      document.body.style.paddingRight = "";
      // document.body.style.overflow = "";
    }
  });
});

function openSimilar(payload) {
  drawerTarget.value = payload.id;
  drawerTargetTitle.value = payload.title;
  drawerOpen.value = true;
}

function scrollToArticle(id) {
  // 1. close first
  drawerOpen.value = false;
  // Set the reopen button flag if a target exists
  if (drawerTarget.value !== null) {
    showReopenBtn.value = true;
  }

  // 2. after the DOM re-renders, do the scroll
  nextTick(() => {
    const element = document.getElementById(`article-${id}`);
    if (element) {
      // offset so the fixed header doesn't cover the title
      const headerH = document.querySelector("header")?.offsetHeight ?? 0;
      const top =
        element.getBoundingClientRect().top + window.pageYOffset - headerH - 8; // Added 8px buffer

      window.scrollTo({ top, behavior: "smooth" });

      // Original mobile-only close logic removed as drawer is closed first now
      // if (window.innerWidth < 768 && drawerOpen.value) {
      //   setTimeout(() => {
      //     drawerOpen.value = false;
      //   }, 100); // 100ms delay
      // }
    }
  });
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen flex flex-col">
    <!-- Use AppHeader component, pass API_BASE_URL -->
    <AppHeader :API_BASE_URL="API_BASE_URL" />

    <!-- Main Content -->
    <main class="flex-grow w-full py-8 px-4">
      <!-- intro card -->
      <IntroCard class="max-w-[980px] mx-auto mb-8" />

      <!-- Search and Filters Container -->
      <div
        class="max-w-[980px] mx-auto mb-6 flex flex-col md:flex-row md:items-start gap-4 md:gap-6"
      >
        <!-- Search Input - listen for the 'search' event -->
        <SearchBar
          v-model="searchTerm"
          @search="handleSearch"
          class="flex-grow max-w-[400px]"
        />

        <div class="flex items-center gap-2 md:flex-shrink-0 md:ml-auto">
          <!-- Clear Filter Button -->
          <button
            v-if="isFilterActive"
            @click="clearFilters"
            class="text-sm text-blue-600 rounded px-2 py-1 transition-colors duration-150 ease-in-out focus:outline-none hover:bg-blue-100 hover:text-blue-700 focus:bg-blue-100 focus:text-blue-700"
            aria-label="Clear all filters"
          >
            Clear filter
          </button>

          <!-- Source Filters - updated props and event -->
          <SourceFilters
            :availableSources="availableSources"
            :activeSources="activeSources"
            :counts="sourceCounts"
            @update-sources="updateActiveSources"
          />

          <!-- Tag Filters - Added -->
          <TagFilters
            :availableTags="availableTags"
            :activeTags="activeTags"
            @update-tags="updateActiveTags"
          />
        </div>
      </div>

      <!-- Use ArticleList component, passing necessary props and listening for clear-filters -->
      <ArticleList
        :articles="articles"
        :isLoading="isLoading"
        :error="error"
        @clear-filters="clearFilters"
        @show-similar="openSimilar"
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
      :style="{ '--n-mask-color': 'rgba(0, 0, 0, 0.2)' }"
      @update:show="
        (v) => {
          drawerOpen = v;
          showReopenBtn = !v && drawerTarget !== null; // show button when closed if target exists
        }
      "
    />

    <!-- Re-open FAB -->
    <button
      v-if="showReopenBtn"
      @click="drawerOpen = true"
      class="fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-gray-500 text-white rounded-full p-2 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
      aria-label="Re-open similar posts drawer"
    >
      <IconListSearch stroke-width="2" class="h-4 w-4" />
    </button>
  </div>
</template>
