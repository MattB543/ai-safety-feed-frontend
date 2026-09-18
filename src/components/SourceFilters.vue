<script setup>
import { ref, computed, watch } from "vue";
import { NButton, NPopover, NCheckbox, NCheckboxGroup } from "naive-ui";
import { Filter } from "@vicons/tabler";

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
// Derived from the COMMITTED state (props.activeSources), never from the
// in-popover draft, so an abandoned draft cannot leave the trigger lit up.
const isFilterActive = computed(() => {
  const allCount = props.availableSources.length;
  return allCount > 0 && props.activeSources.length !== allCount;
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
        Sources
      </button>
    </template>

    <!-- Popover content -->
    <div class="p-3 min-w-[200px]">
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

<style scoped>
/* Optional: Add some padding to the scrollable area if needed */
.max-h-60 {
  padding-right: 4px; /* Add padding for scrollbar */
}
</style>
