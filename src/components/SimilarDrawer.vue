<script setup>
import { NDrawer, NDrawerContent, NSpin } from "naive-ui";
import { ref, watch } from "vue";
// import ArticleCard from "./ArticleCard.vue"; // reuse full card; swap for a tiny-card later
import TinyArticleCard from "./TinyArticleCard.vue"; // Import the new component

const props = defineProps({
  show: Boolean, // controls open / close
  articleId: Number, // reference article
  referenceArticleTitle: String, // title of the reference article
});
const emit = defineEmits(["update:show", "scroll-to-article"]);

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const loading = ref(false);
const error = ref(null);
const similar = ref([]); // [{…}, …]

// State for staggered loading messages
const showMsg1 = ref(false);
const showMsg2 = ref(false);
const showMsg3 = ref(false);

watch(
  [() => props.show, () => props.articleId],
  async ([isOpen, articleId], [prevIsOpen, prevArticleId]) => {
    if (!isOpen || !articleId) return;
    if ((isOpen && !prevIsOpen) || (isOpen && articleId !== prevArticleId)) {
      loading.value = true;
      error.value = null;
      similar.value = [];
      showMsg1.value = false;
      showMsg2.value = false;
      showMsg3.value = false;

      // Stagger messages
      showMsg1.value = true; // Show first immediately
      setTimeout(() => {
        showMsg2.value = true;
      }, 4000);
      setTimeout(() => {
        showMsg3.value = true;
      }, 8000);

      try {
        const r = await fetch(`${API_BASE_URL}/api/similar/${articleId}?n=5`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        similar.value = await r.json();
      } catch (e) {
        error.value = e.message;
      } finally {
        loading.value = false;
      }
    }
  },
  { immediate: false }
);
</script>

<template>
  <NDrawer
    :show="show"
    placement="right"
    width="550"
    :mask-style="{ backgroundColor: 'rgba(0, 0, 0, 0)' }"
    @update:show="(v) => emit('update:show', v)"
  >
    <NDrawerContent
      :title="`Similar posts to: ${referenceArticleTitle}`"
      :native-scrollbar="false"
      style="overflow: auto"
    >
      <div v-if="loading" class="py-10 flex flex-col items-center space-y-4">
        <NSpin size="medium" />
        <div class="w-full max-w-sm px-4 text-left space-y-2 mt-4">
          <transition name="fade-up">
            <p v-if="showMsg1" class="text-gray-600">Comparing all posts...</p>
          </transition>
          <transition name="fade-up">
            <p v-if="showMsg2" class="text-gray-600">
              Found 30 top candidates...
            </p>
          </transition>
          <transition name="fade-up">
            <p v-if="showMsg3" class="text-gray-600">Asking AI to re-rank...</p>
          </transition>
        </div>
      </div>

      <p v-else-if="error" class="text-red-600 text-center">{{ error }}</p>

      <div
        v-else-if="!error && similar.length === 0"
        class="text-gray-600 text-center"
      >
        No similar posts found.
      </div>

      <ul v-else>
        <li
          v-for="a in similar"
          :key="a.id"
          class="border-b border-gray-200 pb-10 mb-10 last:border-b-0 last:mb-0"
        >
          <TinyArticleCard
            :article="a"
            @scroll-to-article="emit('scroll-to-article', $event)"
          />
        </li>
      </ul>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped>
.fade-up-enter-active,
.fade-up-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
