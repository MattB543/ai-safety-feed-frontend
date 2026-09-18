<template>
  <div
    class="bg-surface border border-line shadow-card rounded-lg p-6 md:p-8 max-w-[980px] mx-auto"
  >
    <!-- Loading/Error state for filter options -->
    <div v-if="isLoadingFilters" class="text-center py-6">
      <n-spin size="medium" />
      <p class="text-sm text-ink-3 mt-2">Loading filter options...</p>
    </div>
    <div
      v-else-if="apiError && !isLoadingFilters"
      class="rounded-md border border-danger/30 bg-danger-soft px-4 py-3 text-center text-sm text-danger"
    >
      Error loading filter options: {{ apiError }}
    </div>

    <!-- Form shown only when filter options are loaded -->
    <NForm v-else @submit.prevent="handleSubscribe" class="space-y-4">
      <!-- Digest Settings Section -->
      <div>
        <h3 class="text-lg font-semibold text-ink mb-8">Digest settings</h3>

        <!-- Frequency Selector (Button + Popover) -->
        <NFormItem label="Frequency" required>
          <NPopover
            trigger="click"
            placement="bottom-start"
            :style="{ width: '150px' }"
          >
            <template #trigger>
              <button type="button" :disabled="isLoading" class="btn-secondary">
                {{ frequency === "daily" ? "Daily" : "Weekly" }}
                <svg
                  class="h-4 w-4 text-ink-3"
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
            <p v-if="!isLoadingFilters" class="text-xs text-ink-3 mt-2">
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
              @update-tags="handleUpdateTags"
              :disabled="isLoading"
            />
            <p v-if="!isLoadingFilters" class="text-xs text-ink-3 mt-2">
              {{ tagSelectionHint }}
            </p>
          </div>
        </NFormItem>
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
  NPopover,
} from "naive-ui";
// Import the filter components
import SourceFilters from "./SourceFilters.vue";
import TagFilters from "./TagFilters.vue";

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

  if (selectedCount === 0) return "No categories selected";
  if (totalAvailable > 0 && selectedCount === totalAvailable)
    return "All categories selected";
  // Show all selected tags
  return `Selected: ${localActiveTags.value.join(", ")}`;
});

// --- Package Filters for API ---
// Reads from the local state refs
const filtersForApi = computed(() => ({
  searchTerm: null, // No search term input in this form
  sources: localActiveSources.value,
  tags: localActiveTags.value,
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
