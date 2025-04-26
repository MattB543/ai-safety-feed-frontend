<script setup>
import { computed, watch } from "vue";
import { NInput, NButton, NIcon } from "naive-ui";
import { Search as SearchIcon } from "@vicons/tabler";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(["update:modelValue", "search"]);

// two‑way binding helper so we can use v‑model:value cleanly
const value = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

watch(value, (newValue, oldValue) => {
  // Trigger search when the input is cleared
  if (oldValue && !newValue) {
    handleSearch();
  }
});

// Theme overrides for the input component
const inputThemeOverrides = {
  borderHover: "1px solid #2080f0", // Naive UI primary blue
  borderFocus: "1px solid #2080f0", // Naive UI primary blue
  boxShadowFocus: "0 0 0 2px rgba(32, 128, 240, 0.2)", // Blue focus ring
  borderRadius: "0.375rem", // Match button's rounded-md
};

function handleSearch() {
  emit("search");
}
</script>

<template>
  <div class="flex gap-2 w-full">
    <!-- Input with search icon prefix -->
    <NInput
      v-model:value="value"
      placeholder="Search feed..."
      size="medium"
      clearable
      @keyup.enter="handleSearch"
      class="flex-grow"
      :theme-overrides="inputThemeOverrides"
    >
      <template #prefix>
        <NIcon>
          <SearchIcon />
        </NIcon>
      </template>
    </NInput>

    <!-- Search button -->
    <button
      @click="handleSearch"
      class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-xs text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none flex-shrink-0"
    >
      Search
    </button>
  </div>
</template>

<style scoped></style>
