<script setup>
import { ref, computed, watch, defineProps, defineEmits } from "vue";
import { NButton, NPopover, NCheckbox, NCheckboxGroup, NIcon } from "naive-ui";
import { Filter } from "@vicons/tabler";
import { formatTagForDisplay } from "../utils/formatters";

const ALL_TAGS_VALUE = "__ALL__";

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
  // counts prop removed as counts are now included in availableTags
});

const emit = defineEmits(["update-tags"]);

const showPopover = ref(false);
// local copy edited inside the popover; we commit on "Apply"
const localSelection = ref([...props.activeTags]);

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
  // If "All" is checked or nothing is checked, treat as all tags active
  let nextActive;
  const allTagValues = props.availableTags.map((t) => t.tag);

  if (
    localSelection.value.includes(ALL_TAGS_VALUE) ||
    localSelection.value.length === 0
  ) {
    nextActive = [...allTagValues];
  } else {
    nextActive = localSelection.value.filter((v) => v !== ALL_TAGS_VALUE);
  }

  emit("update-tags", nextActive);
  showPopover.value = false;
}

watch(
  [() => props.activeTags, () => props.availableTags],
  ([newActiveTags, newAvailableTags], [oldActiveTags, oldAvailableTags]) => {
    const allAvailableTagValues = newAvailableTags.map((t) => t.tag);
    const allAreActive =
      newActiveTags.length === allAvailableTagValues.length &&
      allAvailableTagValues.length > 0;

    let targetLocalSelection;
    if (allAreActive) {
      targetLocalSelection = [ALL_TAGS_VALUE, ...allAvailableTagValues];
    } else {
      targetLocalSelection = newActiveTags.filter(
        (tag) => tag !== ALL_TAGS_VALUE
      );
    }

    const currentLocalRepresentsAll =
      localSelection.value.includes(ALL_TAGS_VALUE);
    const localTags = localSelection.value.filter(
      (tag) => tag !== ALL_TAGS_VALUE
    );

    const targetRepresentsAll = targetLocalSelection.includes(ALL_TAGS_VALUE);
    const targetTags = targetLocalSelection.filter(
      (tag) => tag !== ALL_TAGS_VALUE
    );

    const localTagsSet = new Set(localTags);
    const targetTagsSet = new Set(targetTags);

    const tagsMatch =
      localTagsSet.size === targetTagsSet.size &&
      [...localTagsSet].every((tag) => targetTagsSet.has(tag));
    const allStateMatches = currentLocalRepresentsAll === targetRepresentsAll;

    if (!tagsMatch || !allStateMatches) {
      localSelection.value = [...targetLocalSelection];
    }
  },
  { deep: true, immediate: true }
);

watch(localSelection, (newSelection, oldSelection) => {
  if (newSelection === oldSelection) return;

  const allTagsValueIncluded = newSelection.includes(ALL_TAGS_VALUE);
  const allTagsValueWasIncluded = oldSelection
    ? oldSelection.includes(ALL_TAGS_VALUE)
    : false;
  const allTagValues = props.availableTags.map((t) => t.tag);

  if (allTagsValueIncluded && !allTagsValueWasIncluded) {
    localSelection.value = [ALL_TAGS_VALUE, ...allTagValues];
  } else if (!allTagsValueIncluded && allTagsValueWasIncluded) {
    localSelection.value = [];
  } else if (
    allTagsValueIncluded &&
    oldSelection &&
    newSelection.length < oldSelection.length &&
    newSelection.length < allTagValues.length + 1
  ) {
    localSelection.value = newSelection.filter((v) => v !== ALL_TAGS_VALUE);
  } else if (
    !allTagsValueIncluded &&
    newSelection.length === allTagValues.length &&
    allTagValues.length > 0 &&
    !allTagsValueWasIncluded
  ) {
    localSelection.value = [ALL_TAGS_VALUE, ...newSelection];
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
        class="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 shadow-xs text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        :class="{
          'ring-2 ring-offset-2 ring-indigo-500': isFilterActive,
        }"
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
        <!-- Updated Checkbox for All Tags -->
        <NCheckbox :value="ALL_TAGS_VALUE"
          >All Tags ({{ totalCount }})</NCheckbox
        >
        <!-- Updated loop for availableTags to use sorted list -->
        <NCheckbox v-for="t in sortedAvailableTags" :key="t.tag" :value="t.tag">
          {{ formatTagForDisplay(t.tag) }} ({{ t.post_count ?? 0 }})
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
