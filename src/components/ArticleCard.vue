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
import { NTooltip } from "naive-ui";
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

// Pastel category hues from aisafety.com, used only for the cluster chip.
// Clusters without a hue fall back to the neutral grey-teal chip.
const clusterHueMap = {
  "core ai safety & alignment": "text-aisc-green",
  "technical ml safety": "text-aisc-blue",
  "ai governance & policy": "text-aisc-purple",
  "forecasting & world modeling": "text-aisc-yellow",
  "effective altruism & meta": "text-aisc-pink",
};

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
    (match, id) => `<a href="#post-${id}" class="link">ID ${id}</a>` // Keep ID for clarity
  );
  return DOMPurify.sanitize(linkedHtml);
});

const clusterHueClass = computed(
  () =>
    clusterHueMap[(props.article.cluster_tag || "").toLowerCase()] ||
    "text-ink-2"
);

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
  <article :id="`post-${article.id}`" class="card p-6 lg:p-10">
    <div class="flex flex-col gap-6 md:flex-row md:items-start">
      <!-- Phones: title (with a small thumbnail beside it), summary, then
           chips, so the first title lands in the first screen. md and up:
           chips first, as on aisafety.com cards. -->
      <div class="flex min-w-0 flex-grow flex-col text-left">
        <!-- Cluster + topic chips -->
        <ul
          v-if="article.cluster_tag || filteredTopics.length"
          class="order-3 mt-4 flex flex-wrap items-center gap-2 md:order-1 md:mt-0 md:mb-4"
        >
          <li v-if="article.cluster_tag" class="inline-flex">
            <span class="chip" :class="clusterHueClass">
              <component
                :is="ClusterIcon"
                class="h-3.5 w-3.5"
                stroke-width="1.75"
                aria-hidden="true"
              />
              {{ formatTagForDisplay(article.cluster_tag) }}
            </span>
          </li>
          <li
            v-for="topic in filteredTopics.slice(0, 3)"
            :key="topic"
            class="inline-flex"
          >
            <span class="chip text-ink-2">
              {{ formatTagForDisplay(topic) }}
            </span>
          </li>
        </ul>

        <div class="order-1 flex items-start gap-4 md:order-2">
          <!-- Title -->
          <h2 class="type-h3 min-w-0 flex-1 text-balance text-ink">
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
                  class="cursor-pointer transition-colors hover:text-accent"
                >
                  {{ displayTitle }}
                </a>
              </template>
              {{ originalTitleTooltipContent }}
            </n-tooltip>
          </h2>

          <!-- Phone-only thumbnail beside the title.
               v-if sits on the tooltip: an empty trigger slot makes Naive throw. -->
          <n-tooltip
            v-if="article.cleaned_image || article.image_url"
            trigger="hover"
            placement="bottom-end"
            :disabled="!imageMetaphor"
            :show-delay="300"
          >
            <template #trigger>
              <a
                :href="article.source_url"
                target="_blank"
                rel="noopener noreferrer"
                :title="
                  imageMetaphor
                    ? null
                    : 'Open ' + (article.source_type || 'link') + ' in new tab'
                "
                class="post-image flex h-[72px] w-[72px] shrink-0 md:hidden"
              >
                <img
                  :src="article.cleaned_image || article.image_url"
                  :alt="imageMetaphor"
                  class="h-full w-full"
                  :class="
                    article.cleaned_image ? 'object-cover' : 'object-contain'
                  "
                  decoding="async"
                  :loading="priorityLoad ? 'eager' : 'lazy'"
                />
              </a>
            </template>
            {{ imageMetaphor }}
          </n-tooltip>
        </div>

        <!-- Sentence summary -->
        <p
          v-if="article.sentence_summary"
          class="order-2 mt-3 max-w-[66ch] text-small text-ink md:order-3"
        >
          {{ article.sentence_summary }}
        </p>
      </div>

      <!-- Desktop-only image, right of the text -->
      <n-tooltip
        v-if="article.cleaned_image || article.image_url"
        trigger="hover"
        placement="left-start"
        :disabled="!imageMetaphor"
        :show-delay="300"
      >
        <template #trigger>
          <a
            :href="article.source_url"
            target="_blank"
            rel="noopener noreferrer"
            :title="
              imageMetaphor
                ? null
                : 'Open ' + (article.source_type || 'link') + ' in new tab'
            "
            class="post-image hidden h-[202px] w-[202px] flex-shrink-0 md:flex"
          >
            <img
              :src="article.cleaned_image || article.image_url"
              :alt="imageMetaphor"
              class="h-full w-full"
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
      <div v-if="article.unique_aspects" class="mt-5">
        <span class="type-label mb-1 block text-ink-2">How it's unique</span>
        <div class="text-small text-ink">
          {{ article.unique_aspects }}
        </div>
      </div>
      <div v-if="article.author_credentials" class="mt-5">
        <span class="type-label mb-1 block text-ink-2">About the authors</span>
        <div class="text-small text-ink">
          {{ article.author_credentials }}
        </div>
      </div>

      <!-- Actions and source meta -->
      <div
        class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="-ml-3 flex flex-wrap items-center gap-1">
          <button
            v-if="article.paragraph_summary || article.key_implication"
            type="button"
            class="action-pill"
            :class="{ 'is-active': isParagraphSummaryExpanded }"
            :aria-expanded="isParagraphSummaryExpanded"
            :title="
              isParagraphSummaryExpanded
                ? 'Hide main points'
                : 'Show main points'
            "
            @click="toggleParagraphSummary"
          >
            <IconListDetails
              stroke-width="1.5"
              class="h-4 w-4"
              aria-hidden="true"
            />
            Main points
          </button>
          <button
            v-if="article.novelty_score !== null && article.novelty_note"
            type="button"
            class="action-pill"
            :class="{ 'is-active': isNoveltyExpanded }"
            :aria-expanded="isNoveltyExpanded"
            :title="
              isNoveltyExpanded ? 'Hide novelty note' : 'Show novelty note'
            "
            @click="toggleNovelty"
          >
            <IconSparklesCustom
              class="h-4 w-4"
              :class="{ 'text-novelty-high': noveltyRating >= 4 }"
            />
            Novelty: {{ noveltyRating }}/5
          </button>
          <router-link
            v-if="!hideSimilarButton"
            :to="`/similar/${slugify(displayTitle)}-${article.id}`"
            target="_blank"
            rel="noopener noreferrer"
            class="action-pill"
            title="View similar posts"
          >
            <IconListSearch
              stroke-width="1.5"
              class="h-4 w-4"
              aria-hidden="true"
            />
            Similar posts
          </router-link>
          <button
            type="button"
            class="action-pill px-2"
            :aria-pressed="isBookmarked"
            :aria-label="isBookmarked ? 'Remove bookmark' : 'Add bookmark'"
            :title="isBookmarked ? 'Remove bookmark' : 'Add bookmark'"
            @click="emit('toggle-bookmark', article.id)"
          >
            <component
              :is="isBookmarked ? IconBookmarkFilled : IconBookmark"
              stroke-width="1.5"
              class="h-4 w-4"
              :class="{ 'fill-current text-accent': isBookmarked }"
              aria-hidden="true"
            />
          </button>
        </div>

        <!-- Source meta: favicon, source, forum username, date -->
        <div
          class="flex flex-wrap items-center justify-start gap-x-2 gap-y-1 text-xs text-ink-2 sm:justify-end"
        >
          <span
            v-if="host"
            class="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-xs bg-white"
          >
            <img
              :src="faviconUrl"
              width="14"
              height="14"
              alt=""
              class="h-3.5 w-3.5"
              loading="lazy"
            />
          </span>
          <span v-if="article.source_type" class="font-normal text-ink">
            {{ article.source_type }}
          </span>

          <!-- Only forums put a real per-post username in 'authors'; blogs and
               podcasts just repeat the source name or its domain there. -->
          <template v-if="isForumSource && article.authors?.length">
            <span aria-hidden="true">&middot;</span>
            <n-tooltip v-if="article.authors.length > 3" trigger="hover">
              <template #trigger>
                <span class="inline-flex flex-wrap gap-x-1">
                  <span
                    v-for="(author, index) in article.authors.slice(0, 3)"
                    :key="author"
                  >
                    {{ author }}<span v-if="index < 2">,</span>
                  </span>
                  <span>et al.</span>
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
            class="text-ink-3"
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
            <div class="detail-panel mt-4">
              <span class="type-label mb-1 block text-ink">
                Novelty ({{ noveltyRating }}/5)
              </span>
              <div
                class="max-w-[68ch] text-[14px] leading-[1.7] text-ink-2 lg:text-[15px]"
                v-html="formattedNoveltyNote"
              ></div>
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
            <div class="detail-panel mt-4">
              <div v-if="article.paragraph_summary">
                <span class="type-label mb-1 block text-ink">Main points</span>
                <div
                  class="prose prose-sm max-w-[68ch] lg:text-[15px]"
                  v-html="formattedParagraphSummary"
                ></div>
              </div>

              <div
                v-if="article.key_implication"
                :class="article.paragraph_summary ? 'mt-5' : ''"
              >
                <span class="type-label mb-1 block text-ink">Implication</span>
                <div
                  class="max-w-[68ch] text-[14px] leading-[1.7] text-ink-2 lg:text-[15px]"
                >
                  {{ article.key_implication }}
                </div>
              </div>

              <p class="mt-4 text-xs text-ink-3">AI-generated summary</p>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </article>
</template>

<style>
/* AI-generated post images: an 8px tile on a slightly lighter surface with a
   hairline so light images don't glare against the dark card. */
.post-image {
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--radius-sm);
  background-color: var(--color-surface-2);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.06);
}
.post-image img {
  filter: brightness(0.92);
  transition: filter 100ms ease-in-out;
}
.post-image:hover img {
  filter: none;
}

/* Expanded Main points / Novelty panel inside a card. */
.detail-panel {
  border-radius: var(--radius-md);
  background-color: rgb(0 25 27 / 0.5);
  padding: 16px 20px;
}
@media (min-width: 62rem) {
  .detail-panel {
    padding: 20px 24px;
  }
}

/* Ring the card when it is the URL hash target */
@keyframes highlight-fade {
  0%,
  70% {
    box-shadow:
      0 0 0 2px var(--color-accent-strong),
      var(--shadow-card);
  }
  100% {
    box-shadow: var(--shadow-card);
  }
}

article[id^="post-"]:target {
  animation: highlight-fade 2s ease-out forwards;
  /* Clear the sticky header */
  scroll-margin-top: 110px;
}
</style>
