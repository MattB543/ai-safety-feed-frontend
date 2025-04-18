<script setup>
import { ref, computed, watch, defineProps, defineEmits } from "vue";
import { NButton, NPopover, NCheckbox, NCheckboxGroup, NIcon } from "naive-ui";
import { Filter } from "@vicons/tabler";

const ALL_SOURCES_VALUE = "__ALL__";

const props = defineProps({
  availableSources: {
    type: Array,
    required: true,
    default: () => [],
  },
  activeSources: {
    type: Array,
    required: true,
    default: () => [],
  },
  counts: {
    type: Object, // { [source]: number }
    required: true,
    default: () => ({}),
  },
});

const emit = defineEmits(["update-sources"]);

const showPopover = ref(false);
// local copy edited inside the popover; we commit on "Apply"
const localSelection = ref([...props.activeSources]);

// Add computed property for sorted sources
const sortedAvailableSources = computed(() => {
  return [...props.availableSources].sort((a, b) => {
    return a.localeCompare(b);
  });
});

// is *any* filter active (not all OR none)
const isFilterActive = computed(() => {
  const all = props.availableSources;
  return !(
    props.activeSources.length === 0 ||
    (all.length > 0 && props.activeSources.length === all.length)
  );
});

const totalCount = computed(() => {
  return Object.values(props.counts).reduce(
    (sum, count) => sum + (count || 0),
    0
  );
});

function commit() {
  // If "All" is checked or nothing is checked, treat as all sources active
  let nextActive;

  if (
    localSelection.value.includes(ALL_SOURCES_VALUE) ||
    localSelection.value.length === 0
  ) {
    nextActive = [...props.availableSources];
  } else {
    nextActive = localSelection.value.filter((v) => v !== ALL_SOURCES_VALUE);
  }

  emit("update-sources", nextActive);
  showPopover.value = false;
}

watch(
  () => props.activeSources,
  (val) => {
    // keep localSelection in sync when parent updates (e.g. external clear)
    localSelection.value = [...val];
  }
);

watch(localSelection, (newSelection, oldSelection) => {
  const allSourcesValueIncluded = newSelection.includes(ALL_SOURCES_VALUE);
  const allSourcesValueWasIncluded = oldSelection.includes(ALL_SOURCES_VALUE);

  if (allSourcesValueIncluded && !allSourcesValueWasIncluded) {
    // "All Sources" was just checked
    localSelection.value = [ALL_SOURCES_VALUE, ...props.availableSources];
  } else if (!allSourcesValueIncluded && allSourcesValueWasIncluded) {
    // "All Sources" was just unchecked
    localSelection.value = [];
  } else if (
    allSourcesValueIncluded &&
    newSelection.length < oldSelection.length &&
    newSelection.length < props.availableSources.length + 1
  ) {
    // One of the other sources was unchecked while "All Sources" is checked
    localSelection.value = newSelection.filter((v) => v !== ALL_SOURCES_VALUE);
  } else if (
    !allSourcesValueIncluded &&
    newSelection.length === props.availableSources.length
  ) {
    // All other sources were checked manually
    localSelection.value = [ALL_SOURCES_VALUE, ...newSelection];
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
        class="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 shadow-xs text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        <Filter class="h-4 w-4" :stroke-width="isFilterActive ? 2 : 1" />
        Sources
      </button>
    </template>

    <!-- Popover content -->
    <div class="p-3 min-w-[150px]">
      <NCheckboxGroup
        v-model:value="localSelection"
        class="flex flex-col gap-2"
      >
        <NCheckbox :value="ALL_SOURCES_VALUE"
          >All Sources ({{ totalCount }})</NCheckbox
        >
        <NCheckbox v-for="s in sortedAvailableSources" :key="s" :value="s">
          {{ s }} ({{ props.counts[s] ?? 0 }})
        </NCheckbox>
      </NCheckboxGroup>

      <!-- actions -->
      <div class="flex gap-2 mt-4">
        <NButton size="tiny" tertiary @click="showPopover = false"
          >Cancel</NButton
        >
        <NButton
          size="tiny"
          type="primary"
          @click="commit"
          style="flex-grow: 1"
        >
          Apply
        </NButton>
      </div>
    </div>
  </NPopover>
</template>

<style scoped></style>
