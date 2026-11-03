<script setup>
import { ref, computed, watch } from "vue";
import { NButton, NPopover, NCheckbox, NCheckboxGroup } from "naive-ui";
import { Tags, ChevronDown } from "@vicons/tabler";
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

// Trigger label: "Categories", or the committed selection once a filter is
// applied ("Category: Technical ML Safety", "Categories: 3").
const triggerLabel = computed(() => {
  if (!isFilterActive.value) return "Categories";
  const n = props.activeTags.length;
  if (n === 1) return `Category: ${formatTagForDisplay(props.activeTags[0])}`;
  return `Categories: ${n}`;
});

const totalCount = computed(() => {
  // Sum post_count from availableTags
  return props.availableTags.reduce(
    (sum, tagData) => sum + (tagData.post_count || 0),
    0
  );
});

// The API treats an empty list as "no filter", so nothing checked must not be
// applied (it would show everything while the trigger said "…: 0").
const isSelectionEmpty = computed(() => localSelection.value.length === 0);
const hintId = `empty-hint-${Math.random().toString(36).slice(2, 8)}`;

function commit() {
  if (isSelectionEmpty.value) return;
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
    <!-- Trigger pill -->
    <template #trigger>
      <button
        type="button"
        :disabled="disabled"
        :class="['filter-pill', { 'is-active': isFilterActive }]"
        :aria-expanded="showPopover"
      >
        <Tags class="h-4 w-4" stroke-width="1.5" aria-hidden="true" />
        <span class="max-w-[24ch] truncate">{{ triggerLabel }}</span>
        <ChevronDown
          class="h-4 w-4 transition-transform"
          :class="{ 'rotate-180': showPopover }"
          stroke-width="1.5"
          aria-hidden="true"
        />
      </button>
    </template>

    <!-- Popover content -->
    <div class="min-w-[240px] p-5">
      <!-- "All" checkbox sits outside the scroll area, like SourceFilters -->
      <NCheckbox v-model:checked="isAllTagsSelected" class="mb-3">
        All categories
        <span class="text-xs text-ink-2">({{ totalCount }})</span>
      </NCheckbox>
      <NCheckboxGroup
        v-model:value="localSelection"
        class="flex max-h-72 flex-col pr-1 gap-3 overflow-y-auto"
      >
        <NCheckbox v-for="t in sortedAvailableTags" :key="t.tag" :value="t.tag">
          {{ formatTagForDisplay(t.tag) }}
          <span class="text-xs text-ink-2">({{ t.post_count ?? 0 }})</span>
        </NCheckbox>
      </NCheckboxGroup>

      <!-- An empty selection would silently mean "all" to the API, so it
           can't be applied. -->
      <p
        v-if="isSelectionEmpty"
        :id="hintId"
        class="mt-4 text-xs text-ink-2"
        role="status"
      >
        Select at least one category.
      </p>

      <!-- actions -->
      <div class="mt-5 flex gap-2">
        <NButton size="small" style="flex: 1" @click="cancel">Cancel</NButton>
        <NButton
          size="small"
          type="primary"
          style="flex: 1"
          :disabled="isSelectionEmpty"
          :aria-describedby="isSelectionEmpty ? hintId : undefined"
          @click="commit"
        >
          Apply
        </NButton>
      </div>
    </div>
  </NPopover>
</template>
