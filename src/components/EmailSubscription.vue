<template>
  <div class="bg-white shadow-md rounded-lg p-6 md:p-8 max-w-[980px] mx-auto">
    <!-- Loading/Error state for filter options -->
    <div v-if="isLoadingFilters" class="text-center py-6">
      <n-spin size="medium" />
      <p class="text-sm text-gray-500 mt-2">Loading filter options...</p>
    </div>
    <div
      v-else-if="apiError && !isLoadingFilters"
      class="text-center py-6 text-red-600"
    >
      Error loading filter options: {{ apiError }}
    </div>

    <!-- Form shown only when filter options are loaded -->
    <NForm v-else @submit.prevent="handleSubscribe" class="space-y-4">
      <!-- Digest Settings Section -->
      <div>
        <h3 class="text-lg font-medium text-gray-700 mb-8">Digest settings</h3>

        <!-- Frequency Selector (Button + Popover) -->
        <NFormItem label="Frequency" required>
          <NPopover
            trigger="click"
            placement="bottom-start"
            :style="{ width: '150px' }"
          >
            <template #trigger>
              <button
                type="button"
                :disabled="isLoading"
                :class="[
                  'inline-flex items-center gap-1 px-3 py-2 border border-gray-300 shadow-xs text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50',
                ]"
              >
                {{ frequency === "daily" ? "Daily" : "Weekly" }}
                <svg
                  class="h-4 w-4 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="m19.5 8.25l-7.5 7.5l-7.5-7.5"
                  />
                </svg>
              </button>
            </template>
            <div class="p-2">
              <NRadioGroup v-model:value="frequency" name="frequency-group">
                <NSpace vertical>
                  <NRadio
                    v-for="option in frequencyOptions"
                    :key="option.value"
                    :value="option.value"
                    :label="option.label"
                  />
                </NSpace>
              </NRadioGroup>
            </div>
          </NPopover>
        </NFormItem>

        <!-- Source Filters Button -->
        <NFormItem label="Sources">
          <div class="flex flex-col items-start">
            <SourceFilters
              :available-sources="availableSourcesData"
              :active-sources="localActiveSources"
              :counts="sourceCountsData"
              @update-sources="handleUpdateSources"
              :disabled="isLoading"
            />
            <p v-if="!isLoadingFilters" class="text-xs text-gray-500 mt-2">
              {{ sourceSelectionHint }}
            </p>
          </div>
        </NFormItem>

        <!-- Tag Filters Button -->
        <NFormItem label="Tags">
          <div class="flex flex-col items-start">
            <TagFilters
              :available-tags="availableTagsData"
              :active-tags="localActiveTags"
              @update-tags="handleUpdateTags"
              :disabled="isLoading"
            />
            <p v-if="!isLoadingFilters" class="text-xs text-gray-500 mt-2">
              {{ tagSelectionHint }}
            </p>
          </div>
        </NFormItem>

        <!-- Novelty Filter Button -->
        <!--
        <NFormItem label="Minimum Novelty">
          <NoveltyFilter v-model="localMinNovelty" :disabled="isLoading" />
        </NFormItem>
         -->
      </div>

      <!-- Email Input & Subscribe Button Row -->
      <div class="flex items-end space-x-2 mt-4">
        <NFormItem
          path="email"
          label="Email Address"
          required
          class="flex-grow mb-0"
        >
          <NInput
            v-model:value="email"
            placeholder="Enter your email"
            size="large"
            :disabled="isLoading"
          />
        </NFormItem>
        <NFormItem class="mb-0">
          <NButton
            type="primary"
            attr-type="submit"
            :loading="isLoading"
            :disabled="isLoading"
            size="large"
          >
            Subscribe
          </NButton>
        </NFormItem>
      </div>
    </NForm>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  NForm,
  NFormItem,
  NInput,
  NRadioGroup,
  NRadio,
  NButton,
  NSpace,
  useMessage,
  NSpin,
  NSelect,
  NPopover,
} from "naive-ui";
// Import the filter components
import SourceFilters from "./SourceFilters.vue";
import TagFilters from "./TagFilters.vue";
// import NoveltyFilter from "./NoveltyFilter.vue";

const message = useMessage();
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// --- Local State for this Form ---
const email = ref<string | null>(null);
const frequency = ref<"daily" | "weekly">("weekly"); // Default remains weekly
const isLoading = ref(false);
const isLoadingFilters = ref(true);
const apiError = ref<string | null>(null);

// Options for Frequency dropdown
const frequencyOptions = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
];

// --- Local State for Selected Filters ---
const localActiveSources = ref<string[]>([]);
const localActiveTags = ref<string[]>([]);
const localMinNovelty = ref<number | null>(null);

// --- State for Available Filter Options ---
const availableSourcesData = ref<string[]>([]);
const sourceCountsData = ref<{ [key: string]: number }>({});
const availableTagsData = ref<Array<{ tag: string; post_count: number }>>([]);

// --- Fetch Available Filter Options ---
async function fetchFilterOptions() {
  isLoadingFilters.value = true;
  apiError.value = null;
  try {
    // Fetch sources and counts (unfiltered)
    const sourcesResponse = await fetch(`${API_BASE_URL}/api/source-stats`);
    if (!sourcesResponse.ok) throw new Error("Failed to load sources");
    const sourcesStats = await sourcesResponse.json();
    availableSourcesData.value = sourcesStats.map((s: any) => s.source_type);
    sourceCountsData.value = Object.fromEntries(
      sourcesStats.map((s: any) => [s.source_type, s.count])
    );
    // Initialize local sources to "all" after fetching
    localActiveSources.value = [...availableSourcesData.value];

    // Fetch tags and counts
    const tagsResponse = await fetch(`${API_BASE_URL}/api/tags`);
    if (!tagsResponse.ok) throw new Error("Failed to load tags");
    availableTagsData.value = await tagsResponse.json();
    // Initialize local tags to "all" after fetching
    localActiveTags.value = availableTagsData.value.map((t: any) => t.tag);
  } catch (error: any) {
    console.error("Failed to fetch filter options:", error);
    apiError.value = error.message || "Could not load filter options.";
    message.error(apiError.value);
    // Reset filters if loading failed
    availableSourcesData.value = [];
    sourceCountsData.value = {};
    availableTagsData.value = [];
    localActiveSources.value = [];
    localActiveTags.value = [];
  } finally {
    isLoadingFilters.value = false;
  }
}

onMounted(() => {
  fetchFilterOptions();
});

// --- Event Handlers for Filter Components ---
// These update the *local* state refs
const handleUpdateSources = (newSources: string[]) => {
  localActiveSources.value = newSources;
};

const handleUpdateTags = (newTags: string[]) => {
  localActiveTags.value = newTags;
};

// --- Computed Properties for Selection Hints ---
const sourceSelectionHint = computed(() => {
  if (isLoadingFilters.value) return ""; // Don't show hint while loading options
  const totalAvailable = availableSourcesData.value.length;
  const selectedCount = localActiveSources.value.length;

  if (selectedCount === 0) return "No sources selected";
  if (totalAvailable > 0 && selectedCount === totalAvailable)
    return "All sources selected";
  // Show all selected sources
  return `Selected: ${localActiveSources.value.join(", ")}`;
});

const tagSelectionHint = computed(() => {
  if (isLoadingFilters.value) return ""; // Don't show hint while loading options
  const totalAvailable = availableTagsData.value.length;
  const selectedCount = localActiveTags.value.length;

  if (selectedCount === 0) return "No tags selected";
  if (totalAvailable > 0 && selectedCount === totalAvailable)
    return "All tags selected";
  // Show all selected tags
  return `Selected: ${localActiveTags.value.join(", ")}`;
});

const noveltySelectionHint = computed(() => {
  if (isLoadingFilters.value) return ""; // Don't show hint while loading options
  if (localMinNovelty.value === null) {
    return "Any novelty accepted";
  }
  return `Minimum novelty: ${localMinNovelty.value}`;
});

// --- Package Filters for API ---
// Reads from the local state refs
const filtersForApi = computed(() => ({
  searchTerm: null, // No search term input in this form
  sources: localActiveSources.value,
  tags: localActiveTags.value,
  // novelty: localMinNovelty.value, // Directly use the 1-5 value (or null)
}));

// --- Implement handleSubscribe ---
const handleSubscribe = async () => {
  // Basic validation
  if (!email.value || !email.value.includes("@")) {
    message.error("Please enter a valid email address.");
    return;
  }

  isLoading.value = true;
  console.log("Subscribing with filters:", filtersForApi.value); // Debug log

  try {
    const response = await fetch(`${API_BASE_URL}/api/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.value,
        frequency: frequency.value,
        filters: filtersForApi.value, // Send the locally configured filters
      }),
    });

    const responseData = await response.json(); // Try parsing JSON regardless of status

    if (!response.ok) {
      // Use error message from backend if available, otherwise use status
      throw new Error(
        responseData?.error ||
          responseData?.message ||
          `Subscription failed with status ${response.status}`
      );
    }

    message.success(responseData.message || "Subscription successful!");
    email.value = null; // Clear email on success
    // Reset local filters to default "all" state? Optional, depends on desired UX.
    // fetchFilterOptions(); // Or refetch to reset filters to default 'all'
  } catch (error: any) {
    message.error(
      error.message || "An unexpected error occurred during subscription."
    );
    console.error("Subscription error:", error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Align items in the filter row baseline */
.filter-form-item {
  margin-bottom: 0; /* Remove default bottom margin if needed */
}

/* Make select stretch */
.filter-form-item.flex-grow :deep(.n-base-selection) {
  width: 100%;
}

/* Optional: Adjust alignment if needed */
/* .filter-form-item :deep(.n-form-item-blank) {
  display: flex;
  align-items: center; /* Vertically align label with button */
/* } */

/* Specific alignment for NoveltyFilter if needed */
.filter-form-item:has(> .n-popover) {
  /* Target form item containing NoveltyFilter */
  /* Add specific styles if default alignment isn't right */
}
</style>
