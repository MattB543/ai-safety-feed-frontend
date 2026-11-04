<template>
  <div class="card max-w-[680px] p-6 lg:p-10">
    <!-- Loading/Error state for filter options -->
    <div v-if="isLoadingFilters" class="text-center py-6">
      <n-spin size="medium" />
      <p class="mt-3 text-small text-ink-2">Loading filter options…</p>
    </div>
    <div
      v-else-if="apiError && !isLoadingFilters"
      role="alert"
      class="rounded-lg border border-danger/30 bg-danger-soft px-6 py-4 text-center text-small text-danger"
    >
      Error loading filter options: {{ apiError }}
    </div>

    <!-- Form shown only when filter options are loaded -->
    <NForm v-else class="space-y-4" @submit.prevent="handleSubscribe">
      <!-- Digest Settings Section -->
      <div>
        <h2 class="type-h3 mb-8 text-ink">Digest settings</h2>

        <!-- Frequency Selector (Button + Popover) -->
        <NFormItem label="Frequency" required>
          <NPopover
            trigger="click"
            placement="bottom-start"
            :style="{ width: '150px' }"
          >
            <template #trigger>
              <button type="button" :disabled="isLoading" class="filter-pill">
                {{ frequency === "daily" ? "Daily" : "Weekly" }}
                <svg
                  class="h-4 w-4"
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
            <div class="p-4">
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
              :disabled="isLoading"
              @update-sources="handleUpdateSources"
            />
            <p v-if="!isLoadingFilters" class="mt-2 text-xs text-ink-3">
              {{ sourceSelectionHint }}
            </p>
          </div>
        </NFormItem>

        <!-- Tag Filters Button -->
        <NFormItem label="Categories">
          <div class="flex flex-col items-start">
            <TagFilters
              :available-tags="availableTagsData"
              :active-tags="localActiveTags"
              :disabled="isLoading"
              @update-tags="handleUpdateTags"
            />
            <p v-if="!isLoadingFilters" class="mt-2 text-xs text-ink-3">
              {{ tagSelectionHint }}
            </p>
          </div>
        </NFormItem>
      </div>

      <!-- Email Input & Subscribe Button Row -->
      <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
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

<script setup>
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
  NPopover,
} from "naive-ui";
// Import the filter components
import SourceFilters from "./SourceFilters.vue";
import TagFilters from "./TagFilters.vue";
import { getJson, postJson } from "../api";

const message = useMessage();

// --- Local State for this Form ---
const email = ref(null);
const frequency = ref("weekly"); // "daily" | "weekly"
const isLoading = ref(false);
const isLoadingFilters = ref(true);
const apiError = ref(null);

// Options for Frequency dropdown
const frequencyOptions = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
];

// --- Local State for Selected Filters ---
const localActiveSources = ref([]);
const localActiveTags = ref([]);

// --- State for Available Filter Options ---
const availableSourcesData = ref([]); // string[]
const sourceCountsData = ref({}); // { [source]: count }
const availableTagsData = ref([]); // Array<{ tag, post_count }>

// --- Fetch Available Filter Options ---
async function fetchFilterOptions() {
  isLoadingFilters.value = true;
  apiError.value = null;
  try {
    // Sources (unfiltered counts) and tags, in parallel
    const [sourcesStats, tags] = await Promise.all([
      getJson("/api/source-stats"),
      getJson("/api/tags"),
    ]);
    availableSourcesData.value = sourcesStats.map((s) => s.source_type);
    sourceCountsData.value = Object.fromEntries(
      sourcesStats.map((s) => [s.source_type, s.count])
    );
    availableTagsData.value = tags;
    // Initialize local selections to "all" after fetching
    localActiveSources.value = [...availableSourcesData.value];
    localActiveTags.value = tags.map((t) => t.tag);
  } catch (error) {
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
const handleUpdateSources = (newSources) => {
  localActiveSources.value = newSources;
};

const handleUpdateTags = (newTags) => {
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

  if (selectedCount === 0) return "No categories selected";
  if (totalAvailable > 0 && selectedCount === totalAvailable)
    return "All categories selected";
  // Show all selected tags
  return `Selected: ${localActiveTags.value.join(", ")}`;
});

// --- Package Filters for API ---
// An empty list means "no filter" to the digest, so "everything selected" is
// sent as [] and sources/tags added later still reach the subscriber.
const selectedOrAll = (selected, all) =>
  all.length > 0 && all.every((x) => selected.includes(x)) ? [] : selected;

const filtersForApi = computed(() => ({
  searchTerm: null, // No search term input in this form
  sources: selectedOrAll(localActiveSources.value, availableSourcesData.value),
  tags: selectedOrAll(
    localActiveTags.value,
    availableTagsData.value.map((t) => t.tag)
  ),
}));

// --- Implement handleSubscribe ---
const handleSubscribe = async () => {
  // Basic validation
  if (!email.value || !email.value.includes("@")) {
    message.error("Please enter a valid email address.");
    return;
  }

  isLoading.value = true;

  try {
    // postJson throws with the backend's error message on a non-2xx status
    const responseData = await postJson("/api/subscribe", {
      email: email.value,
      frequency: frequency.value,
      filters: filtersForApi.value, // Send the locally configured filters
    });

    message.success(responseData?.message || "Subscription successful!");
    email.value = null; // Clear email on success
    // Reset local filters to default "all" state? Optional, depends on desired UX.
    // fetchFilterOptions(); // Or refetch to reset filters to default 'all'
  } catch (error) {
    message.error(
      error.message || "An unexpected error occurred during subscription."
    );
    console.error("Subscription error:", error);
  } finally {
    isLoading.value = false;
  }
};
</script>
