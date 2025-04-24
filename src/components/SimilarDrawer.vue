<script setup>
import { NDrawer, NDrawerContent, NSpin } from "naive-ui";
import { ref, watch, onMounted, onUnmounted } from "vue";
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
const lastFetchedArticleId = ref(null); // Track last fetched ID

// State for staggered loading messages
const showMsg1 = ref(false);
const showMsg2 = ref(false);
const showMsg3 = ref(false);
const showMsg4 = ref(false); // Add state for the fourth message
const msg1Timeout = ref(null); // Refs to hold timeout IDs
const msg2Timeout = ref(null);
const msg3Timeout = ref(null);
const msg4Timeout = ref(null);

// State for drawer width
const drawerWidth = ref(550); // Default width - changed to number

// Update drawer width based on window size
const updateDrawerWidth = () => {
  if (window.innerWidth < 768) {
    // Example breakpoint, adjust as needed
    drawerWidth.value = "100%";
  } else {
    drawerWidth.value = 550; // Changed to number
  }
};

// Add event listener on mount, remove on unmount
onMounted(() => {
  updateDrawerWidth(); // Initial check
  window.addEventListener("resize", updateDrawerWidth);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateDrawerWidth);
});

// Watch for articleId changes to fetch data
watch(
  () => props.articleId,
  async (newArticleId) => {
    // Fetch only if ID is valid and different from the last fetched one
    if (!newArticleId || newArticleId === lastFetchedArticleId.value) {
      return;
    }

    loading.value = true;
    error.value = null;
    similar.value = [];
    // Reset messages immediately when a new fetch starts
    showMsg1.value = false;
    showMsg2.value = false;
    showMsg3.value = false;
    showMsg4.value = false;
    // Clear any pending message timeouts
    clearTimeout(msg1Timeout.value);
    clearTimeout(msg2Timeout.value);
    clearTimeout(msg3Timeout.value);
    clearTimeout(msg4Timeout.value);

    // Trigger message staggering *only if* the drawer is already open
    if (props.show) {
      startMessageStagger();
    }

    try {
      const r = await fetch(`${API_BASE_URL}/api/similar/${newArticleId}?n=5`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      similar.value = await r.json();
      lastFetchedArticleId.value = newArticleId; // Update last fetched ID on success
    } catch (e) {
      error.value = e.message;
      lastFetchedArticleId.value = null; // Reset if fetch failed
    } finally {
      loading.value = false;
      // Clear timeouts again in case loading finished before messages appeared
      clearTimeout(msg1Timeout.value);
      clearTimeout(msg2Timeout.value);
      clearTimeout(msg3Timeout.value);
      clearTimeout(msg4Timeout.value);
      // If drawer is closed, ensure messages are hidden
      if (!props.show) {
        resetMessages();
      }
    }
  },
  { immediate: false } // Don't run on initial mount unless articleId is already set
);

// Helper function to start message staggering
const startMessageStagger = () => {
  showMsg1.value = true; // Show first immediately
  msg2Timeout.value = setTimeout(() => {
    if (loading.value) showMsg2.value = true;
  }, 4000);
  msg3Timeout.value = setTimeout(() => {
    if (loading.value) showMsg3.value = true;
  }, 8000);
  msg4Timeout.value = setTimeout(() => {
    if (loading.value) showMsg4.value = true;
  }, 12000);
};

// Helper function to reset messages and clear timeouts
const resetMessages = () => {
  showMsg1.value = false;
  showMsg2.value = false;
  showMsg3.value = false;
  showMsg4.value = false;
  clearTimeout(msg1Timeout.value);
  clearTimeout(msg2Timeout.value);
  clearTimeout(msg3Timeout.value);
  clearTimeout(msg4Timeout.value);
};

// Watch for drawer visibility changes
watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      // If drawer opens and we are loading new data, start staggering messages
      if (loading.value) {
        startMessageStagger();
      }
    } else {
      // If drawer closes, reset messages and clear any pending timeouts
      resetMessages();
    }
  }
);

const handleScrollRequest = (articleId) => {
  emit("scroll-to-article", articleId);
  // NOTE: We are *not* emitting update:show here,
  // allowing the parent or user interaction to close the drawer.
};
</script>

<template>
  <NDrawer
    :show="show"
    placement="right"
    :width="drawerWidth"
    :show-mask="false"
    :mask-closable="false"
    :close-on-esc="true"
    :block-scroll="false"
    :auto-focus="false"
    @update:show="(v) => emit('update:show', v)"
  >
    <NDrawerContent
      :title="`Similar posts to: ${referenceArticleTitle}`"
      :native-scrollbar="false"
      style="overflow: auto"
      closable
    >
      <div v-if="loading" class="py-10 flex flex-col items-center space-y-4">
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
          <transition name="fade-up">
            <p v-if="showMsg4" class="text-gray-600">
              Reticulating splines... just kidding, still thinking.
            </p>
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
            @scroll-to-article="handleScrollRequest"
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
