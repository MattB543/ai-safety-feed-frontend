<script setup>
import { ref, computed, watch, defineProps, defineEmits } from "vue";
import { NButton, NPopover, NCheckbox, NCheckboxGroup, NIcon } from "naive-ui";
import { Filter } from "@vicons/tabler";

// Remove the special value, we'll handle 'All' logic separately
// const ALL_SOURCES_VALUE = "__ALL__";

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
const isFilterActive = computed(() => {
  const allCount = props.availableSources.length;
  return allCount > 0 && localSelection.value.length !== allCount;
});

const totalCount = computed(() => {
  return Object.values(props.counts).reduce(
    (sum, count) => sum + (count || 0),
    0
  );
});

function commit() {
  // Emit the current local selection directly
  // If localSelection is empty, it means none are selected.
  // If localSelection has all available sources, it means all are selected.
  emit("update-sources", [...localSelection.value]);
  showPopover.value = false;
}

// Watch for external changes to activeSources (e.g., parent component reset)
watch(
  () => props.activeSources,
  (newActiveSources) => {
    // Ensure localSelection reflects the actual state from the parent
    if (
      JSON.stringify(newActiveSources.slice().sort()) !==
      JSON.stringify(localSelection.value.slice().sort())
    ) {
      localSelection.value = [...newActiveSources];
    }
  },
  { deep: true } // Use deep watch if activeSources might be mutated elsewhere, though ideally it's replaced
);

// No complex watch needed anymore for localSelection interaction with "All" checkbox,
// as the computed property `isAllSelected` handles the logic via its getter and setter.
// watch(localSelection, (newSelection, oldSelection) => { ... removed ... });
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
          'inline-flex items-center gap-1 px-3 py-2 border border-gray-300 shadow-xs text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50',
          isFilterActive
            ? 'outline outline-2 outline-blue-500'
            : 'outline-none',
        ]"
      >
        <Filter class="h-4 w-4" :stroke-width="isFilterActive ? 2 : 1" />
        Sources
      </button>
    </template>

    <!-- Popover content -->
    <div class="p-3 min-w-[150px]">
      <!-- All Sources Checkbox -->
      <NCheckbox
        :checked="isAllSelected"
        @update:checked="isAllSelected = $event"
        :disabled="props.availableSources.length === 0"
        class="mb-2"
      >
        All Sources ({{ totalCount }})
      </NCheckbox>

      <!-- Individual Source Checkboxes -->
      <NCheckboxGroup
        v-model:value="localSelection"
        class="flex flex-col gap-2 max-h-60 overflow-y-auto"
      >
        <NCheckbox v-for="s in sortedAvailableSources" :key="s" :value="s">
          {{ s }} ({{ props.counts[s] ?? 0 }})
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

<style scoped>
/* Optional: Add some padding to the scrollable area if needed */
.max-h-60 {
  padding-right: 4px; /* Add padding for scrollbar */
}
</style>
