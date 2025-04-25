<script setup>
import { ref, computed, watch, defineProps, defineEmits } from "vue";
import { NButton, NPopover, NSlider, NIcon, NSpace } from "naive-ui";
import IconSparklesCustom from "./icons/IconSparklesCustom.vue";

const props = defineProps({
  modelValue: {
    // The 1-5 value (or null)
    type: Number,
    default: null,
    validator: (v) => v === null || (v >= 1 && v <= 5), // Updated validator
  },
});

const emit = defineEmits(["update:modelValue"]);

const showPopover = ref(false);

// Internal state for the slider (1-5 scale)
const sliderValue = ref(3); // Default slider position

// MAPPING and REVERSE_MAPPING removed as modelValue is now 1-5

// Initialize slider based on incoming modelValue (which is now 1-5 or null)
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue === null) {
      sliderValue.value = 1; // Default to 1 when cleared externally or initially null
    } else if (newValue >= 1 && newValue <= 5) {
      sliderValue.value = newValue; // Use the 1-5 value directly
    } else {
      // Fallback if prop is somehow out of range, maybe default to 1 or 3?
      sliderValue.value = 1;
    }
  },
  { immediate: true } // Run immediately on component mount
);

// Button text and styling based on whether the filter is active
const isFilterActive = computed(() => props.modelValue !== null);
const buttonText = computed(() => {
  if (!isFilterActive.value) {
    return "Novelty";
  }
  // Display the current 1-5 modelValue
  return `Novelty ${props.modelValue}+`;
});

// Apply the filter change - emit the current slider value (1-5)
function applyFilter() {
  // Ensure we emit a value between 1 and 5
  const valueToEmit = Math.max(1, Math.min(5, sliderValue.value));
  emit("update:modelValue", valueToEmit);
  showPopover.value = false;
}

// Clear the filter - emit null
function clearFilter() {
  emit("update:modelValue", null);
  // Optionally reset slider position when clearing?
  // sliderValue.value = 1; // Keep internal slider where it is until cancel/apply
  showPopover.value = false;
}

// Cancel changes
function cancel() {
  // Reset slider to reflect current prop (1-5 or null) before closing
  if (props.modelValue === null) {
    sliderValue.value = 1; // Reset to default if cleared
  } else {
    sliderValue.value = props.modelValue; // Reset to the active 1-5 value
  }
  showPopover.value = false;
}

const marks = {
  1: "1",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
};
</script>

<template>
  <NPopover
    v-model:show="showPopover"
    trigger="click"
    placement="bottom"
    :show-arrow="false"
    style="padding: 0; width: 240px"
  >
    <!-- Trigger button -->
    <template #trigger>
      <button
        :class="[
          'inline-flex items-center gap-1 px-3 py-2 border border-gray-300 shadow-xs text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50',
          isFilterActive
            ? 'outline outline-2 outline-blue-500'
            : 'outline-none',
        ]"
        aria-label="Filter by minimum novelty score"
      >
        <NIcon
          :component="IconSparklesCustom"
          class="text-lg"
          :class="{ 'text-blue-600': isFilterActive }"
        />
        {{ buttonText }}
      </button>
    </template>

    <!-- Popover content -->
    <div class="p-4">
      <NSpace vertical size="large">
        <div>
          <!-- Optional wrapper for label + slider if NSpace needs direct children -->
          <label
            for="novelty-slider"
            class="block text-sm font-medium text-gray-700 mb-2"
            >Minimum Novelty Score</label
          >
          <NSlider
            id="novelty-slider"
            v-model:value="sliderValue"
            :min="1"
            :max="5"
            :step="1"
            :marks="marks"
            class="mb-4"
          />
        </div>

        <!-- Actions -->
        <div class="flex gap-2 justify-end">
          <!-- Removed mt-8 as NSpace handles spacing -->
          <NButton
            size="small"
            tertiary
            @click="clearFilter"
            v-if="isFilterActive"
            >Clear</NButton
          >
          <NButton size="small" tertiary @click="cancel">Cancel</NButton>
          <NButton
            size="small"
            type="primary"
            @click="applyFilter"
            style="flex-grow: 1"
          >
            Apply
          </NButton>
        </div>
      </NSpace>
    </div>
  </NPopover>
</template>

<style scoped>
/* Add any specific styles if needed */
</style>
