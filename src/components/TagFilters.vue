<script setup>
import { ref, computed, watch, defineProps, defineEmits } from "vue";
import { NButton, NPopover, NCheckbox, NCheckboxGroup, NIcon } from "naive-ui";
import { Filter } from "@vicons/tabler";
import { formatTagForDisplay } from "../utils/formatters";

const props = defineProps({
  availableTags: {
    type: Array, // Array<{tag: string, post_count: number}>
    required: true,
    default: () => [],
  },
  activeTags: {
    type: Array, // Array<string>
    required: true,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  // counts prop removed as counts are now included in availableTags
});

const emit = defineEmits(["update-tags"]);

const showPopover = ref(false);
// local copy edited inside the popover; we commit on "Apply"
// Initialized as empty, will be populated by the watcher immediately
const localSelection = ref([]);

// New computed property for "All Tags" checkbox state
const isAllTagsSelected = computed({
  get() {
    const allAvailableTagValues = props.availableTags.map((t) => t.tag);
    if (allAvailableTagValues.length === 0) {
      return false; // No tags to select, so "All" is not selected.
    }
    // Check if localSelection contains all available tags
    const localSelectionSet = new Set(localSelection.value);
    return (
      allAvailableTagValues.every((tag) => localSelectionSet.has(tag)) &&
      localSelectionSet.size === allAvailableTagValues.length
    );
  },
  set(newValue) {
    const allAvailableTagValues = props.availableTags.map((t) => t.tag);
    if (newValue) {
      localSelection.value = [...allAvailableTagValues];
    } else {
      localSelection.value = [];
    }
  },
});

// Add computed property for sorted tags
const sortedAvailableTags = computed(() => {
  return [...props.availableTags].sort((a, b) => {
    const tagA = a.tag.toLowerCase();
    const tagB = b.tag.toLowerCase();
    if (tagA < tagB) return -1;
    if (tagA > tagB) return 1;
    return 0;
  });
});

// is *any* filter active (not all OR none)
const isFilterActive = computed(() => {
  const all = props.availableTags.map((t) => t.tag);
  return !(
    props.activeTags.length === 0 ||
    (all.length > 0 && props.activeTags.length === all.length)
  );
});

const totalCount = computed(() => {
  // Sum post_count from availableTags
  return props.availableTags.reduce(
    (sum, tagData) => sum + (tagData.post_count || 0),
    0
  );
});

function commit() {
  // If all available tags are in localSelection, emit all available tags.
  // Otherwise, emit the contents of localSelection.
  const allAvailableTagValues = props.availableTags.map((t) => t.tag);

  const currentLocalSet = new Set(localSelection.value);
  const allSelectedInPopover =
    allAvailableTagValues.length > 0 &&
    allAvailableTagValues.every((tag) => currentLocalSet.has(tag)) &&
    currentLocalSet.size === allAvailableTagValues.length;

  if (allSelectedInPopover) {
    emit("update-tags", [...allAvailableTagValues]);
  } else {
    emit("update-tags", [...localSelection.value]);
  }
  showPopover.value = false;
}

watch(
  [() => props.activeTags, () => props.availableTags],
  ([newActiveTags, newAvailableTags]) => {
    // localSelection should directly reflect props.activeTags.
    // isAllTagsSelected will derive its state from this.
    const targetSelection = [...newActiveTags];

    const currentLocalSet = new Set(localSelection.value);
    const targetSet = new Set(targetSelection);

    // Only update if different to prevent watcher loops and unnecessary changes
    if (
      currentLocalSet.size !== targetSet.size ||
      ![...currentLocalSet].every((tag) => targetSet.has(tag))
    ) {
      localSelection.value = targetSelection;
    }
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <NPopover
    v-model:show="showPopover"
    trigger="click"
    placement="bottom-start"
    :show-arrow="false"
    style="padding: 0"
  >
    <!-- Trigger button -->
    <template #trigger>
      <button
        type="button"
        :disabled="disabled"
        :class="[
          'inline-flex items-center gap-1 px-3 py-2 border border-gray-300 shadow-xs text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none',
          isFilterActive
            ? 'outline outline-2 outline-blue-500'
            : 'outline-none',
        ]"
      >
        <Filter class="h-4 w-4" :stroke-width="isFilterActive ? 2 : 1" />
        Tags
      </button>
    </template>

    <!-- Popover content -->
    <div class="p-3 min-w-[150px]">
      <NCheckboxGroup
        v-model:value="localSelection"
        class="flex flex-col gap-2"
      >
        <!-- Updated Checkbox for All Tags - now separate and uses isAllTagsSelected -->
        <NCheckbox v-model:checked="isAllTagsSelected"
          >All Tags ({{ totalCount }})</NCheckbox
        >
        <hr class="my-1" />
        <!-- Optional: adds a visual separator -->
        <!-- Updated loop for availableTags to use sorted list -->
        <NCheckbox v-for="t in sortedAvailableTags" :key="t.tag" :value="t.tag">
          {{ formatTagForDisplay(t.tag) }} ({{ t.post_count ?? 0 }})
        </NCheckbox>
      </NCheckboxGroup>

      <!-- actions -->
      <div class="flex gap-2 mt-4">
        <NButton
          size="small"
          tertiary
          @click="showPopover = false"
          style="flex: 1"
          >Cancel</NButton
        >
        <NButton size="small" type="primary" @click="commit" style="flex: 1">
          Apply
        </NButton>
      </div>
    </div>
  </NPopover>
</template>

<style scoped></style>
