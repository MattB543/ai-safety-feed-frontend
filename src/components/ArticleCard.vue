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
  BuildingBank as IconBuildingBank,
  ListSearch as IconListSearch,
  Bookmark as IconBookmark,
} from "@vicons/tabler";
import IconBookmarkFilled from "./icons/IconBookmarkFilled.vue";
import { NTooltip, NButton } from "naive-ui";
import {
  formatDate,
  formatRelativeDate,
  formatTagForDisplay,
  sourceHost,
} from "../utils/formatters";
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
  priorityLoad: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["toggle-bookmark"]);

// --- State ---
const isParagraphSummaryExpanded = ref(false);
const isNoveltyExpanded = ref(false);
const md = new MarkdownIt(); // Initialize markdown-it

const titleLinkRef = ref(null);
const dynamicTooltipStyle = ref({});

// --- Mappings ---
// Less Wrong, EA Forum and Alignment Forum store a real per-post username in
// 'authors'. Every other source repeats the source name or its domain there,
// so the name is only worth surfacing for the forums.
const FORUM_SOURCES = new Set(["Less Wrong", "EA Forum", "Alignment Forum"]);

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

const isForumSource = computed(() =>
  FORUM_SOURCES.has(props.article.source_type)
);

const host = computed(() => sourceHost(props.article.source_url));

const faviconUrl = computed(() =>
  host.value
    ? `https://www.google.com/s2/favicons?domain=${host.value}&sz=32`
    : ""
);

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
      `<a href="#post-${id}" class="text-accent hover:underline">ID ${id}</a>` // Keep ID for clarity
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
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

// --- Image prompt ---
// `image_prompt` is the exact text sent to the image model: an instruction
// line, the metaphor, then boilerplate that is identical for every article
// ("Composition rules" now, "Required Style" on rows generated before that).
// Only the metaphor is worth showing on hover, so strip the rest.
const imageMetaphor = computed(() => {
  const text = (props.article.image_prompt || "").trim();
  if (!text) return "";
  const lines = text
    .split(/\n\s*(?:Composition rules|Required Style)/i)[0]
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  // Older rows spell the two steps out as "Concept: ... / Metaphor: ...";
  // only the metaphor is worth showing.
  const labelled = lines.find((line) => /^metaphor\s*:/i.test(line));
  if (labelled) return labelled.replace(/^metaphor\s*:\s*/i, "");
  // Otherwise the first line is the instruction and the rest is the metaphor.
  return lines.slice(1).join(" ") || lines[0] || "";
});

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
  <article :id="`post-${article.id}`">
    <!-- Mobile-only image, above the title -->
    <n-tooltip
      trigger="hover"
      placement="bottom-start"
      :disabled="!imageMetaphor"
      :show-delay="300"
    >
      <template #trigger>
        <a
          v-if="article.cleaned_image || article.image_url"
          :href="article.source_url"
          target="_blank"
          rel="noopener noreferrer"
          :title="
            imageMetaphor
              ? null
              : 'Open ' + (article.source_type || 'link') + ' in new tab'
          "
          class="md:hidden mb-3 flex h-[130px] w-[130px] items-center justify-center overflow-hidden rounded-md bg-surface-2"
        >
          <img
            :src="article.cleaned_image || article.image_url"
            :alt="imageMetaphor"
            class="w-full h-full"
            :class="article.cleaned_image ? 'object-cover' : 'object-contain'"
            decoding="async"
            :loading="priorityLoad ? 'eager' : 'lazy'"
          />
        </a>
      </template>
      {{ imageMetaphor }}
    </n-tooltip>

    <div class="flex flex-col md:flex-row md:items-start gap-4 mb-4">
      <div class="flex-grow text-left">
        <!-- Title -->
        <h2 class="text-xl font-semibold text-ink leading-snug text-balance">
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
                    ? 'Open ' + (article.source_type || 'link') + ' in new tab'
                    : null
                "
                class="cursor-pointer transition-colors hover:text-accent"
              >
                {{ displayTitle }}
              </a>
            </template>
            {{ originalTitleTooltipContent }}
          </n-tooltip>
        </h2>

        <!-- Sentence summary -->
        <p
          v-if="article.sentence_summary"
          class="mt-3 max-w-[66ch] text-base leading-relaxed text-ink-2"
        >
          {{ article.sentence_summary }}
        </p>

        <!-- Cluster + topic chips -->
        <ul
          v-if="article.cluster_tag || filteredTopics.length"
          class="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2"
        >
          <li v-if="article.cluster_tag" class="inline-flex items-center">
            <span
              class="inline-flex items-center gap-1 rounded-md bg-accent-soft px-2 py-1 text-xs font-medium text-accent-ink"
            >
              <component
                :is="ClusterIcon"
                class="w-4 h-4"
                stroke-width="1.75"
              />
              {{ formatTagForDisplay(article.cluster_tag) }}
            </span>
          </li>
          <li
            v-for="topic in filteredTopics.slice(0, 3)"
            :key="topic"
            class="inline-flex items-center"
          >
            <span
              class="inline-block rounded-full bg-surface-2 px-2.5 py-1 text-xs leading-tight text-ink-2"
            >
              {{ formatTagForDisplay(topic) }}
            </span>
          </li>
        </ul>
      </div>

      <!-- Desktop-only image, right of the text -->
      <n-tooltip
        trigger="hover"
        placement="left-start"
        :disabled="!imageMetaphor"
        :show-delay="300"
      >
        <template #trigger>
          <a
            v-if="article.cleaned_image || article.image_url"
            :href="article.source_url"
            target="_blank"
            rel="noopener noreferrer"
            :title="
              imageMetaphor
                ? null
                : 'Open ' + (article.source_type || 'link') + ' in new tab'
            "
            class="hidden md:flex flex-shrink-0 h-[202px] w-[202px] items-center justify-center overflow-hidden rounded-md bg-surface-2"
          >
            <img
              :src="article.cleaned_image || article.image_url"
              :alt="imageMetaphor"
              class="w-full h-full"
              :class="article.cleaned_image ? 'object-cover' : 'object-contain'"
              decoding="async"
              :loading="priorityLoad ? 'eager' : 'lazy'"
            />
          </a>
        </template>
        {{ imageMetaphor }}
      </n-tooltip>
    </div>

    <div class="text-left">
      <div v-if="article.unique_aspects" class="mb-4">
        <span class="block text-[13px] font-semibold text-ink-3 mb-1"
          >How it's Unique</span
        >
        <div class="text-base text-ink-2">
          {{ article.unique_aspects }}
        </div>
      </div>
      <div v-if="article.author_credentials" class="mb-4">
        <span class="block text-[13px] font-semibold text-ink-3 mb-1"
          >About the Authors</span
        >
        <div class="text-base text-ink-2">
          {{ article.author_credentials }}
        </div>
      </div>

      <!-- Actions and authors -->
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 mt-4"
      >
        <div class="flex items-center flex-wrap gap-2">
          <n-button
            v-if="article.paragraph_summary || article.key_implication"
            @click="toggleParagraphSummary"
            size="small"
            :quaternary="!isParagraphSummaryExpanded"
            :type="isParagraphSummaryExpanded ? 'info' : 'default'"
            :aria-expanded="isParagraphSummaryExpanded"
            :title="
              isParagraphSummaryExpanded
                ? 'Hide Main Points'
                : 'Show Main Points'
            "
          >
            <template #icon>
              <IconListDetails stroke-width="2" class="w-4 h-4" />
            </template>
            Main Points
          </n-button>
          <n-button
            v-if="article.novelty_score !== null && article.novelty_note"
            @click="toggleNovelty"
            size="small"
            :quaternary="!isNoveltyExpanded"
            :type="isNoveltyExpanded ? 'info' : 'default'"
            :aria-expanded="isNoveltyExpanded"
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
            :to="`/similar/${slugify(displayTitle)}-${article.id}`"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex h-7 items-center gap-1 rounded-md px-2 text-sm text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            title="View similar posts"
          >
            <IconListSearch stroke-width="2" class="h-4 w-4" />
            Similar Posts
          </router-link>
          <n-button
            @click="emit('toggle-bookmark', article.id)"
            size="small"
            quaternary
            :aria-pressed="isBookmarked"
            :title="isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'"
          >
            <template #icon>
              <component
                :is="isBookmarked ? IconBookmarkFilled : IconBookmark"
                stroke-width="2"
                class="w-4 h-4"
                :class="{ 'text-accent fill-current': isBookmarked }"
              />
            </template>
          </n-button>
        </div>

        <!-- Source meta: favicon, source, forum username, date -->
        <div
          class="flex justify-start sm:justify-end flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-3 mt-2 sm:mt-0"
        >
          <img
            v-if="host"
            :src="faviconUrl"
            width="16"
            height="16"
            alt=""
            class="rounded-sm"
            loading="lazy"
          />
          <span v-if="article.source_type" class="font-medium text-ink-2">
            {{ article.source_type }}
          </span>

          <!-- Only forums put a real per-post username in 'authors'; blogs and
               podcasts just repeat the source name or its domain there. -->
          <template v-if="isForumSource && article.authors?.length">
            <span aria-hidden="true">&middot;</span>
            <n-tooltip trigger="hover" v-if="article.authors.length > 3">
              <template #trigger>
                <span class="inline-flex flex-wrap gap-x-1">
                  <span
                    v-for="(author, index) in article.authors.slice(0, 3)"
                    :key="author"
                  >
                    {{ author }}<span v-if="index < 2">,</span>
                  </span>
                  <span>Et al.</span>
                </span>
              </template>
              {{ fullAuthorList }}
            </n-tooltip>
            <span v-else class="inline-flex flex-wrap gap-x-1">
              <span v-for="(author, index) in article.authors" :key="author">
                {{ author
                }}<span v-if="index < article.authors.length - 1">,</span>
              </span>
            </span>
          </template>

          <span
            v-if="article.source_type && article.published_date"
            aria-hidden="true"
            >&middot;</span
          >
          <time
            v-if="article.published_date"
            :datetime="article.published_date"
            :title="formatDate(article.published_date)"
          >
            {{ formatRelativeDate(article.published_date) }}
          </time>
        </div>
      </div>

      <!-- Novelty note -->
      <Transition name="collapse">
        <div
          v-if="isNoveltyExpanded && article.novelty_note"
          class="grid [grid-template-rows:1fr]"
        >
          <div class="min-h-0 overflow-hidden">
            <div class="mt-3 rounded-md bg-surface-2 px-4 py-3">
              <span class="block text-[13px] font-semibold text-ink-3 mb-1">
                Novelty ({{ noveltyRating }}/5 Score)
              </span>
              <div class="text-ink-2" v-html="formattedNoveltyNote"></div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Main points / implication -->
      <Transition name="collapse">
        <div
          v-if="isParagraphSummaryExpanded"
          class="grid [grid-template-rows:1fr]"
        >
          <div class="min-h-0 overflow-hidden">
            <div class="mt-3 rounded-md bg-surface-2 px-4 py-3">
              <div v-if="article.paragraph_summary">
                <span class="block text-[13px] font-semibold text-ink-3 mb-1"
                  >Main Points</span
                >
                <div
                  class="prose prose-sm max-w-none text-ink-2"
                  v-html="formattedParagraphSummary"
                ></div>
              </div>

              <div
                v-if="article.key_implication"
                :class="article.paragraph_summary ? 'mt-4' : ''"
              >
                <span class="block text-[13px] font-semibold text-ink-3 mb-1"
                  >Implication</span
                >
                <div class="text-ink-2">
                  {{ article.key_implication }}
                </div>
              </div>

              <p class="mt-3 text-xs text-ink-3">AI-generated summary</p>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </article>
</template>

<style>
/* Flash the card background when it is the URL hash target */
@keyframes highlight-fade {
  0%,
  70% {
    background-color: var(--color-accent-soft);
  }
  100% {
    background-color: transparent;
  }
}

article[id^="post-"]:target {
  animation: highlight-fade 2s ease-out forwards;
  border-radius: var(--radius-md);
  /* Add scroll margin to create space below fixed headers */
  scroll-margin-top: 100px;
}
</style>
