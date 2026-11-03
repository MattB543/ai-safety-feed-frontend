<script setup>
import { ref, computed, watch } from "vue";
import { NButton, NPopover, NCheckbox, NCheckboxGroup } from "naive-ui";
import { Rss, ChevronDown } from "@vicons/tabler";

const props = defineProps({
  availableSources: {
    type: Array,
    default: () => [],
  },
  activeSources: {
    type: Array,
    default: () => [],
  },
  counts: {
    type: Object, // { [source]: number }
    default: () => ({}),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update-sources"]);

const showPopover = ref(false);
// Local copy edited inside the popover; we commit on "Apply"
const localSelection = ref([...props.activeSources]);

// Computed property to determine if the "All Sources" checkbox should be checked
const isAllSelected = computed({
  get: () =>
    props.availableSources.length > 0 &&
    localSelection.value.length === props.availableSources.length,
  set: (value) => {
    if (value) {
      // Check all sources
      localSelection.value = [...props.availableSources];
    } else {
      // Uncheck all sources
      localSelection.value = [];
    }
  },
});

// Computed property for sorted sources
const sortedAvailableSources = computed(() => {
  return [...props.availableSources].sort((a, b) => {
    return a.localeCompare(b);
  });
});

// is *any* filter active (not all selected)
// Derived from the COMMITTED state (props.activeSources), never from the
// in-popover draft, so an abandoned draft cannot leave the trigger lit up.
const isFilterActive = computed(() => {
  const allCount = props.availableSources.length;
  return allCount > 0 && props.activeSources.length !== allCount;
});

// Trigger label: "Sources", or the committed selection once a filter is
// applied ("Source: Less Wrong", "Sources: 3"), as on aisafety.com.
const triggerLabel = computed(() => {
  if (!isFilterActive.value) return "Sources";
  const n = props.activeSources.length;
  if (n === 1) return `Source: ${props.activeSources[0]}`;
  return `Sources: ${n}`;
});

const totalCount = computed(() => {
  return Object.values(props.counts).reduce(
    (sum, count) => sum + (count || 0),
    0
  );
});

// The API treats an empty list as "no filter", so nothing checked must not be
// applied (it would show everything while the trigger said "…: 0").
const isSelectionEmpty = computed(() => localSelection.value.length === 0);
const hintId = `empty-hint-${Math.random().toString(36).slice(2, 8)}`;

function commit() {
  if (isSelectionEmpty.value) return;
  // Emit the current local selection directly
  // If localSelection is empty, it means none are selected.
  // If localSelection has all available sources, it means all are selected.
  emit("update-sources", [...localSelection.value]);
  showPopover.value = false;
}

// Reset the draft from the committed props.
function resetDraft() {
  localSelection.value = [...props.activeSources];
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
        <Rss class="h-4 w-4" stroke-width="1.5" aria-hidden="true" />
        <span class="max-w-[18ch] truncate">{{ triggerLabel }}</span>
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
      <!-- All Sources Checkbox -->
      <NCheckbox
        :checked="isAllSelected"
        :disabled="props.availableSources.length === 0"
        class="mb-3"
        @update:checked="isAllSelected = $event"
      >
        All sources
        <span class="text-xs text-ink-2">({{ totalCount }})</span>
      </NCheckbox>

      <!-- Individual Source Checkboxes -->
      <NCheckboxGroup
        v-model:value="localSelection"
        class="flex max-h-72 flex-col pr-1 gap-3 overflow-y-auto"
      >
        <NCheckbox v-for="s in sortedAvailableSources" :key="s" :value="s">
          {{ s }}
          <span class="text-xs text-ink-2">({{ props.counts[s] ?? 0 }})</span>
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
        Select at least one source.
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
