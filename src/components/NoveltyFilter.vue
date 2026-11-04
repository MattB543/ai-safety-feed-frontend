<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { NButton, NPopover, NSlider, NSpace } from "naive-ui";
import { ChevronDown } from "@vicons/tabler";
import IconSparklesCustom from "./icons/IconSparklesCustom.vue";

const props = defineProps({
  modelValue: {
    // The 1-5 value (or null)
    type: Number,
    default: null,
    validator: (v) => v === null || (v >= 1 && v <= 5), // Updated validator
  },
  disabled: {
    type: Boolean,
    default: false,
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

// Re-seed the draft from the committed value every time the popover opens, so
// a slider moved and then abandoned (outside click / Escape) doesn't linger.
// Also give Naive's slider handle (the element with role="slider") an
// accessible name; NSlider has no prop for it.
const sliderWrapRef = ref(null);
const labelId = `novelty-label-${Math.random().toString(36).slice(2, 8)}`;

watch(showPopover, async (open) => {
  if (!open) return;
  sliderValue.value = props.modelValue ?? 1;
  await nextTick();
  requestAnimationFrame(() => {
    const handle = sliderWrapRef.value?.querySelector('[role="slider"]');
    if (handle) {
      handle.setAttribute("aria-labelledby", labelId);
      handle.setAttribute("aria-valuetext", `${sliderValue.value} or higher`);
    }
  });
});

watch(sliderValue, (v) => {
  sliderWrapRef.value
    ?.querySelector('[role="slider"]')
    ?.setAttribute("aria-valuetext", `${v} or higher`);
});

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
    style="padding: 0; width: 280px"
  >
    <!-- Trigger pill -->
    <template #trigger>
      <button
        type="button"
        :disabled="disabled"
        :class="['filter-pill', { 'is-active': isFilterActive }]"
        :aria-expanded="showPopover"
        aria-label="Filter by minimum novelty score"
      >
        <IconSparklesCustom class="h-4 w-4" />
        {{ buttonText }}
        <ChevronDown
          class="h-4 w-4 transition-transform"
          :class="{ 'rotate-180': showPopover }"
          stroke-width="1.5"
          aria-hidden="true"
        />
      </button>
    </template>

    <!-- Popover content -->
    <div class="p-5">
      <NSpace vertical size="large">
        <div ref="sliderWrapRef">
          <p
            :id="labelId"
            class="mb-3 block text-small font-semibold text-white"
          >
            Minimum novelty score
          </p>
          <NSlider
            v-model:value="sliderValue"
            :min="1"
            :max="5"
            :step="1"
            :marks="marks"
            class="mb-4"
          />
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-2">
          <NButton v-if="isFilterActive" size="small" @click="clearFilter"
            >Clear</NButton
          >
          <NButton size="small" @click="cancel">Cancel</NButton>
          <NButton
            size="small"
            type="primary"
            style="flex-grow: 1"
            @click="applyFilter"
          >
            Apply
          </NButton>
        </div>
      </NSpace>
    </div>
  </NPopover>
</template>
