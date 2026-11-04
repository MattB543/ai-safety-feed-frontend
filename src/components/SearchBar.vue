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
  <div class="flex w-full gap-2">
    <!-- Pill input with search icon prefix (aqua-tinted fill, as on aisafety.com) -->
    <NInput
      v-model:value="value"
      :placeholder="placeholder"
      size="medium"
      clearable
      :disabled="disabled"
      :input-props="{ 'aria-label': 'Search feed' }"
      class="flex-grow"
      @keyup.enter="handleSearch"
    >
      <template #prefix>
        <NIcon class="mr-1 text-ink-3">
          <SearchIcon stroke-width="1.5" />
        </NIcon>
      </template>
    </NInput>

    <!-- Search button -->
    <button
      type="button"
      class="btn-secondary-sm flex-shrink-0"
      @click="handleSearch"
    >
      Search
    </button>
  </div>
</template>
