<script setup>
defineProps({
  modelValue: String, // For v-model
});

defineEmits(["update:modelValue", "search"]);
</script>

<template>
  <div class="max-w-[980px] mx-auto px-6 mb-6 flex items-center gap-2">
    <input
      type="search"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @keyup.enter="$emit('search')"
      placeholder="Search feed..."
      class="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
      aria-label="Search feed"
    />
    <button
      @click="$emit('search')"
      class="px-4 py-2 bg-white text-blue-500 border border-blue-500 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
    >
      Search
    </button>
  </div>
</template>
