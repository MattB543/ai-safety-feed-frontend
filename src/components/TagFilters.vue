<script setup>
import { ref, computed, watch } from "vue";
import { NButton, NPopover, NCheckbox, NCheckboxGroup } from "naive-ui";
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
// Draft edited inside the popover; re-seeded from props on open, committed on Apply.
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
  emit("update-tags", [...localSelection.value]);
  showPopover.value = false;
}

// Reset the draft from the committed props.
function resetDraft() {
  localSelection.value = [...props.activeTags];
}

// Cancel: throw the draft away, then close.
function cancel() {
  resetDraft();
  showPopover.value = false;
}

// Re-seed the draft from committed state every time the popover OPENS, so an
// abandoned draft (outside click / Escape / Cancel) never leaks into the next
// session of the popover.
watch(showPopover, (isShown) => {
  if (isShown) {
    resetDraft();
  }
});
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
          'btn-secondary',
          isFilterActive
            ? 'ring-2 ring-accent border-transparent bg-accent-soft text-accent-ink'
            : '',
        ]"
      >
        <Filter class="h-4 w-4" :stroke-width="1.75" />
        Categories
      </button>
    </template>

    <!-- Popover content -->
    <div class="p-3 min-w-[200px]">
      <!-- "All" checkbox sits outside the scroll area, like SourceFilters -->
      <NCheckbox v-model:checked="isAllTagsSelected" class="mb-2"
        >All categories ({{ totalCount }})</NCheckbox
      >
      <NCheckboxGroup
        v-model:value="localSelection"
        class="flex flex-col gap-2 max-h-60 overflow-y-auto"
      >
        <NCheckbox v-for="t in sortedAvailableTags" :key="t.tag" :value="t.tag">
          {{ formatTagForDisplay(t.tag) }} ({{ t.post_count ?? 0 }})
        </NCheckbox>
      </NCheckboxGroup>

      <!-- actions -->
      <div class="flex gap-2 mt-4">
        <NButton size="small" tertiary @click="cancel" style="flex: 1"
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
