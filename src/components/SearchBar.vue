<script setup>
import { computed, watch } from "vue";
import { NInput, NIcon } from "naive-ui";
import { Search as SearchIcon } from "@vicons/tabler";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: "Search feed...",
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

function handleSearch() {
  emit("search");
}
</script>

<template>
  <div class="flex gap-2 w-full">
    <!-- Input with search icon prefix -->
    <NInput
      v-model:value="value"
      :placeholder="placeholder"
      size="medium"
      clearable
      :disabled="disabled"
      :input-props="{ 'aria-label': 'Search feed' }"
      @keyup.enter="handleSearch"
      class="flex-grow"
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
      class="btn-secondary flex-shrink-0"
    >
      Search
    </button>
  </div>
</template>

<style scoped></style>
