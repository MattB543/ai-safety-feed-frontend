<script setup>
import { ref, computed, watch, nextTick } from "vue";
import {
  World as IconWorld,
  Scale as IconScale,
  ShieldLock as IconShieldLock,
  Cpu as IconCpu,
  Heart as IconHeart,
  Tag as IconTag,
  ListDetails as IconListDetails,
  Key as IconKey,
  BuildingBank as IconBuildingBank,
  ListSearch as IconListSearch,
  Bookmark as IconBookmark,
} from "@vicons/tabler";
import IconBookmarkFilled from "./icons/IconBookmarkFilled.vue";
import { NTooltip, NButton } from "naive-ui";
import { formatDate, formatTagForDisplay } from "../utils/formatters";
import MarkdownIt from "markdown-it";
import IconSparklesCustom from "./icons/IconSparklesCustom.vue";
import DOMPurify from "dompurify";

// --- Props ---
const props = defineProps({
  article: {
    type: Object,
    required: true,
  },
  hideSimilarButton: {
    type: Boolean,
    default: false,
  },
  isBookmarked: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["toggle-bookmark"]);

// --- State ---
const isParagraphSummaryExpanded = ref(false);
const isKeyImplicationExpanded = ref(false);
const isNoveltyExpanded = ref(false);
const md = new MarkdownIt(); // Initialize markdown-it

const titleLinkRef = ref(null);
const dynamicTooltipStyle = ref({});

// --- Mappings ---
const clusterIconMap = {
  "Forecasting & World Modeling": IconWorld,
  "AI Governance & Policy": IconScale,
  "Core AI Safety & Alignment": IconShieldLock,
  "Technical ML Safety": IconCpu,
  "Philosophy & Foundations": IconBuildingBank,
  "Effective Altruism & Meta": IconHeart,
};

// --- Computed ---
const shouldUseCleanedTitle = computed(() => {
  return (
    props.article.cleaned_title &&
    props.article.cleaned_title !== props.article.title
  );
});

const displayTitle = computed(() => {
  if (!props.article) return "";
  if (shouldUseCleanedTitle.value) {
    return props.article.cleaned_title;
  }
  return props.article.title || "";
});

const originalTitleTooltipContent = computed(() => {
  if (!props.article || !shouldUseCleanedTitle.value) return "";
  let titleToDisplay = props.article.title;
  if (props.article.source_type) {
    titleToDisplay += ` - ${props.article.source_type}`;
  }
  return titleToDisplay;
});

const formattedParagraphSummary = computed(() => {
  if (!props.article.paragraph_summary) {
    return "";
  }
  // Render the paragraph_summary (assumed to be Markdown) to HTML
  const rawHtml = md.render(props.article.paragraph_summary);
  return DOMPurify.sanitize(rawHtml);
});

const formattedNoveltyNote = computed(() => {
  if (!props.article.novelty_note) {
    return "";
  }
  // Replace "ID <number>" with a link to the article
  const linkedHtml = props.article.novelty_note.replace(
    /ID (\d+)/g,
    (match, id) =>
      `<a href="#post-${id}" class="text-blue-600 hover:underline">ID ${id}</a>` // Keep ID for clarity
  );
  return DOMPurify.sanitize(linkedHtml);
});

const ClusterIcon = computed(
  () => clusterIconMap[props.article.cluster_tag] || IconTag // fallback
);

// Computed property for the 1-5 novelty rating
const noveltyRating = computed(() => {
  const score = props.article.novelty_score;
  if (score == null || score < 0) return 0; // Handle null/negative scores
  if (score >= 91) return 5; // Bucket 5: 91-100
  if (score >= 71) return 4; // Bucket 4: 71-90
  if (score >= 41) return 3; // Bucket 3: 41-70
  if (score >= 21) return 2; // Bucket 2: 21-40
  return 1; // Bucket 1: 0-20
});

// Computed property for the full author list tooltip content
const fullAuthorList = computed(() => {
  return props.article.authors?.join(", ") || "";
});

// --- Computed: Filtered Topics ---
const filteredTopics = computed(() => {
  if (!props.article.topics) {
    return [];
  }
  const cluster = props.article.cluster_tag;
  const topics = props.article.topics;

  if (cluster === "AI Governance & Policy") {
    return topics.filter(
      (topic) => topic !== "AI governance" && topic !== "Policy"
    );
  }
  if (cluster === "Forecasting & World Modeling") {
    return topics.filter(
      (topic) => topic !== "Forecasting" && topic !== "World modeling"
    );
  }
  if (cluster === "Biorisk & Other GCRs") {
    return topics.filter(
      (topic) => topic !== "Biorisk" && topic !== "Global catastrophic risk"
    );
  }
  if (cluster === "Core AI Safety & Alignment") {
    return topics.filter((topic) => topic !== "AI alignment");
  }

  // Default: return all topics if no specific cluster filter applies
  return topics;
});

// --- Methods ---
function toggleParagraphSummary() {
  isParagraphSummaryExpanded.value = !isParagraphSummaryExpanded.value;
}

function toggleKeyImplication() {
  isKeyImplicationExpanded.value = !isKeyImplicationExpanded.value;
}

function toggleNovelty() {
  isNoveltyExpanded.value = !isNoveltyExpanded.value;
}

// --- Utility Functions ---
function slugify(text) {
  if (!text) return "no-title";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

const updateTooltipStyle = () => {
  nextTick(() => {
    // Ensure DOM has been updated for width calculation
    if (titleLinkRef.value) {
      const maxWidth = titleLinkRef.value.offsetWidth;
      dynamicTooltipStyle.value = {
        maxWidth: maxWidth + "px",
        textAlign: "left",
      };
    } else {
      // Default or reset if the ref is not available
      dynamicTooltipStyle.value = { textAlign: "left" };
    }
  });
};

// Watch for changes that might affect the title link's width or if the article itself changes
watch([() => displayTitle.value, () => props.article.id], updateTooltipStyle, {
  immediate: true,
});
</script>

<template>
  <article class="bg-white px-6" :id="`post-${article.id}`">
    <!-- Mobile-Only Image (Above Title) -->
    <div
      v-if="article.cleaned_image || article.image_url"
      class="md:hidden mb-4 flex justify-start"
    >
      <a
        :href="article.source_url"
        target="_blank"
        rel="noopener noreferrer"
        :title="'Open ' + (article.source_type || 'link') + ' in new tab'"
        class="cursor-pointer"
      >
        <img
          :src="article.cleaned_image || article.image_url"
          alt=""
          class="w-[130px] object-cover rounded-md h-[130px]"
        />
      </a>
    </div>
    <!-- Top Section: Info on Left, Image on Right -->
    <div class="flex flex-col md:flex-row md:items-start gap-4 mb-4">
      <!-- Text Content Div (Now first for layout) -->
      <div class="flex-grow text-left">
        <div class="flex justify-between items-start mb-2">
          <h2 class="text-2xl font-bold text-gray-900 mr-4">
            <n-tooltip
              trigger="hover"
              :disabled="!shouldUseCleanedTitle"
              placement="top-start"
              :show-delay="0"
              :style="dynamicTooltipStyle"
            >
              <template #trigger>
                <a
                  ref="titleLinkRef"
                  :href="article.source_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  :title="
                    !shouldUseCleanedTitle
                      ? 'Open ' +
                        (article.source_type || 'link') +
                        ' in new tab'
                      : null
                  "
                  class="cursor-pointer hover:underline"
                >
                  {{ displayTitle }}
                </a>
              </template>
              {{ originalTitleTooltipContent }}
            </n-tooltip>
          </h2>
        </div>

        <!-- Metadata: Cluster Tag & Topics -->
        <ul
          class="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-gray-500 mb-2 mt-4"
        >
          <!-- Cluster Tag -->
          <li v-if="article.cluster_tag" class="inline-flex items-center">
            <span
              class="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-md ring-1 ring-inset ring-blue-200"
            >
              <component
                :is="ClusterIcon"
                class="w-4 h-4 mr-1"
                stroke-width="1"
              />
              {{ formatTagForDisplay(article.cluster_tag) }}
            </span>
          </li>
          <!-- Topic Chips -->
          <li
            v-for="topic in filteredTopics.slice(0, 3)"
            :key="topic"
            class="inline-flex items-center"
          >
            <span
              class="inline-block bg-gray-100 rounded-full px-2.5 py-1 text-xs text-gray-600 leading-tight ring-1 ring-inset ring-gray-200"
            >
              {{ formatTagForDisplay(topic) }}
            </span>
          </li>
        </ul>

        <!-- Sentence Summary -->
        <p
          v-if="article.sentence_summary"
          class="text-gray-700 mt-4 bg-gray-100 px-3 py-2 rounded-md"
        >
          {{ article.sentence_summary }}
        </p>

        <!-- Row 2 – topics -->
        <!-- Removed the separate div for topics -->
      </div>

      <!-- Image Div (Desktop Only - Right of Text) -->
      <div
        v-if="article.cleaned_image || article.image_url"
        class="hidden md:block flex-shrink-0 max-w-sm"
      >
        <a
          :href="article.source_url"
          target="_blank"
          rel="noopener noreferrer"
          :title="'Open ' + (article.source_type || 'link') + ' in new tab'"
          class="cursor-pointer"
        >
          <img
            :src="article.cleaned_image || article.image_url"
            alt=""
            class="w-[202px] object-cover rounded-md h-[202px]"
          />
        </a>
      </div>
    </div>

    <!-- Bottom Section: Summary and Actions -->
    <div class="text-left">
      <!-- Sentence Summary -->
      <!-- MOVED UP -->

      <!-- Why it Matters (Conditional) - Will be moved below -->
      <!-- Unique Aspects -->
      <div v-if="article.unique_aspects" class="mb-4">
        <span class="block text-sm text-gray-500">How it's Unique</span>
        <div class="text-base text-gray-600">
          {{ article.unique_aspects }}
        </div>
      </div>
      <!-- Author Credentials -->
      <div v-if="article.author_credentials" class="mb-4">
        <span class="block text-sm text-gray-500">About the Authors</span>
        <div class="text-base text-gray-600">
          {{ article.author_credentials }}
        </div>
      </div>

      <!-- Actions and Author/Date -->
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 mt-4"
      >
        <!-- Action Buttons (Left Side) -->
        <div class="flex items-center flex-wrap gap-2">
          <n-button
            v-if="article.paragraph_summary || article.key_implication"
            @click="toggleParagraphSummary"
            size="small"
            :type="isParagraphSummaryExpanded ? 'info' : 'tertiary'"
            :title="
              isParagraphSummaryExpanded
                ? 'Hide Main Points'
                : 'Show Main Points'
            "
          >
            <template #icon>
              <IconListDetails stroke-width="2" class="w-4 h-4" />
            </template>
            {{ isParagraphSummaryExpanded ? "Main Points" : "Main Points" }}
          </n-button>
          <!-- New Novelty Display -->
          <n-button
            v-if="article.novelty_score !== null && article.novelty_note"
            @click="toggleNovelty"
            size="small"
            :type="isNoveltyExpanded ? 'info' : 'tertiary'"
            :title="
              isNoveltyExpanded ? 'Hide Novelty Note' : 'Show Novelty Note'
            "
          >
            <template #icon>
              <IconSparklesCustom class="w-4 h-4" />
            </template>
            Novelty: {{ noveltyRating }}/5
          </n-button>
          <router-link
            v-if="!hideSimilarButton"
            :to="`/similar/${slugify(article.title)}-${article.id}`"
            target="_blank"
            rel="noopener noreferrer"
            class="no-underline"
            title="View similar posts"
          >
            <n-button size="small" type="tertiary">
              <template #icon>
                <IconListSearch stroke-width="2" class="w-4 h-4" />
              </template>
              Similar Posts
            </n-button>
          </router-link>
          <!-- Bookmark Button -->
          <n-button
            @click="emit('toggle-bookmark', article.id)"
            size="small"
            type="tertiary"
            :title="isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'"
          >
            <template #icon>
              <component
                :is="isBookmarked ? IconBookmarkFilled : IconBookmark"
                stroke-width="2"
                class="w-4 h-4"
                :class="{ 'text-blue-600 fill-current': isBookmarked }"
              />
            </template>
          </n-button>
        </div>

        <ul
          class="flex justify-start sm:justify-end flex-wrap items-center gap-x-1.5 text-sm text-gray-500 mt-2 sm:mt-0"
        >
          <!-- Authors -->
          <li
            v-if="!article.authors || article.authors.length === 0"
            class="inline-flex items-center"
          >
            <span class="text-sm text-gray-500">Unknown Author</span>
          </li>
          <template v-else>
            <!-- Wrap truncated authors in NTooltip -->
            <n-tooltip trigger="hover" v-if="article.authors.length > 3">
              <template #trigger>
                <span class="inline-flex items-center flex-wrap gap-x-1.5">
                  <!-- Wrapper span for trigger area -->
                  <li
                    v-for="(author, index) in article.authors.slice(0, 3)"
                    :key="author"
                    class="inline-flex items-center"
                  >
                    <span class="text-sm text-gray-500">{{ author }}</span>
                    <span
                      v-if="
                        index < 2 || (index === 2 && article.authors.length > 3)
                      "
                      class="mx-0.5"
                      >,</span
                    >
                  </li>
                  <li
                    v-if="article.authors.length > 3"
                    class="inline-flex items-center ml-1"
                  >
                    <span class="text-sm text-gray-500">Et al.</span>
                  </li>
                </span>
              </template>
              {{ fullAuthorList }}
            </n-tooltip>
            <!-- Show full list directly if not truncated -->
            <template v-else>
              <li
                v-for="(author, index) in article.authors"
                :key="author"
                class="inline-flex items-center"
              >
                <span class="text-sm text-gray-500">{{ author }}</span>
                <span v-if="index < article.authors.length - 1" class="mx-0.5"
                  >,</span
                >
              </li>
            </template>
          </template>

          <!-- Separator -->
          <li
            v-if="
              article.authors &&
              article.authors.length > 0 &&
              article.published_date
            "
            class="text-gray-400"
          >
            •
          </li>

          <!-- Date -->
          <li v-if="article.published_date" class="whitespace-nowrap">
            {{ formatDate(article.published_date) }}
          </li>
        </ul>
      </div>

      <!-- Novelty note (Conditional) -->
      <div
        v-if="isNoveltyExpanded && article.novelty_note"
        class="text-gray-700 mt-4 bg-gray-100 px-3 py-2 rounded-md mb-4"
      >
        <span class="block text-sm text-gray-500 font-medium mb-1">
          Novelty ({{ noveltyRating }}/5 Score)
        </span>
        <div class="text-gray-700" v-html="formattedNoveltyNote"></div>
      </div>

      <!-- Paragraph Summary (Conditional) -->
      <div
        v-if="isParagraphSummaryExpanded"
        class="text-gray-700 mt-4 bg-gray-100 px-3 py-2 rounded-md prose max-w-none mb-4"
      >
        <!-- Main Points Content -->
        <div v-if="article.paragraph_summary" class="mb-3">
          <span class="block text-sm text-gray-500 font-medium mb-1"
            >Main Points</span
          >
          <div class="text-gray-700" v-html="formattedParagraphSummary"></div>
        </div>

        <!-- Divider and Implication Content -->
        <div
          v-if="article.paragraph_summary && article.key_implication"
          class="my-3"
        >
          <hr class="border-gray-200" />
        </div>
        <div v-if="article.key_implication">
          <span class="block text-sm text-gray-500 font-medium mb-1"
            >Implication</span
          >
          <div class="text-gray-700">
            {{ article.key_implication }}
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<style>
/* Add global styles here, potentially namespaced if needed */
@keyframes highlight-fade {
  0% {
    color: #b8860b;
  } /* Start Gold */
  80% {
    color: #b8860b;
  } /* Hold Gold for 2 seconds (approx 66.67% of 3s) */
  100% {
    color: inherit;
  } /* Fade back to original over the last 1 second */
}

/* Target the title link within the article when it's the URL hash target */
article[id^="post-"]:target h2 a {
  animation: highlight-fade 2s ease-out forwards; /* Apply the animation (3s total) and keep its end state */
}

/* Keep scroll margin on the article itself */
article[id^="post-"]:target {
  /* Add scroll margin to create space below fixed headers */
  scroll-margin-top: 100px; /* Adjust value based on your header's height */
}
</style>
