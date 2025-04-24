<script setup>
import { computed } from "vue";
import {
  World as IconWorld,
  Scale as IconScale,
  ShieldLock as IconShieldLock,
  Cpu as IconCpu,
  Heart as IconHeart,
  Tag as IconTag,
  BuildingBank as IconBuildingBank,
} from "@vicons/tabler";
import { NButton } from "naive-ui";
import { formatTagForDisplay } from "../utils/formatters";
import MarkdownIt from "markdown-it";

// --- Props ---
const props = defineProps({
  article: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["scroll-to-article"]);

// --- Markdown Renderer ---
const md = new MarkdownIt();

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
const formattedParagraphSummary = computed(() => {
  if (!props.article.paragraph_summary) {
    return "";
  }
  // Render the paragraph_summary (assumed to be Markdown) to HTML
  return md.render(props.article.paragraph_summary);
});

const formattedSummary = computed(() => {
  if (!props.article.summary) {
    return "";
  }
  // Render the summary (assumed to be Markdown) to HTML
  return md.render(props.article.summary);
});

const ClusterIcon = computed(
  () => clusterIconMap[props.article.cluster_tag] || IconTag // fallback
);

// Computed property for the truncated author list
const displayAuthors = computed(() => {
  if (!props.article.authors || props.article.authors.length === 0) {
    return "";
  }
  if (props.article.authors.length <= 2) {
    return props.article.authors.join(" & ");
  }
  return `${props.article.authors[0]} et al.`;
});

// Filtered Topics
const filteredTopics = computed(() => {
  if (!props.article.topics) {
    return [];
  }
  if (props.article.cluster_tag === "AI Governance & Policy") {
    return props.article.topics.filter((topic) => topic !== "AI governance");
  }
  if (props.article.cluster_tag === "Forecasting & World Modeling") {
    return props.article.topics.filter((topic) => topic !== "Forecasting");
  }
  if (props.article.cluster_tag === "Biorisk & Other GCRs") {
    return props.article.topics.filter((topic) => topic !== "Biorisk");
  }
  // Show max 2 topic tags
  return props.article.topics.slice(0, 2);
});
</script>

<template>
  <div class="bg-white px-2 text-left">
    <!-- Title -->
    <h3 class="text-lg font-semibold text-gray-800 mb-2">
      {{ article.title }}
    </h3>

    <!-- Badges: Cluster Tag & Topics -->
    <ul
      class="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-gray-500 mb-3"
    >
      <!-- Cluster Tag -->
      <li v-if="article.cluster_tag" class="inline-flex items-center">
        <span
          class="inline-flex items-center bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-md ring-1 ring-inset ring-blue-100"
        >
          <component
            :is="ClusterIcon"
            class="w-3.5 h-3.5 mr-1"
            stroke-width="1.5"
          />
          {{ formatTagForDisplay(article.cluster_tag) }}
        </span>
      </li>
      <!-- Topic Chips -->
      <li
        v-for="topic in filteredTopics"
        :key="topic"
        class="inline-flex items-center"
      >
        <span
          class="inline-block bg-gray-100 rounded-full px-2 py-0.5 text-gray-600 leading-tight ring-1 ring-inset ring-gray-200"
        >
          {{ formatTagForDisplay(topic) }}
        </span>
      </li>
    </ul>

    <!-- Summary (Markdown or Sentence) -->
    <div
      v-if="formattedSummary"
      class="prose prose-sm max-w-none text-gray-600 mb-3"
      v-html="formattedSummary"
    ></div>
    <p v-else-if="article.sentence_summary" class="text-sm text-gray-600 mb-3">
      {{ article.sentence_summary }}
    </p>
    <div
      v-else-if="formattedParagraphSummary"
      class="prose prose-sm max-w-none text-gray-600 mb-3"
      v-html="formattedParagraphSummary"
    ></div>

    <!-- Footer: Author & View Button -->
    <div class="flex items-center justify-between mt-2">
      <span v-if="displayAuthors" class="text-xs text-gray-500">
        {{ displayAuthors }}
      </span>
      <NButton
        size="tiny"
        type="primary"
        ghost
        @click.stop="emit('scroll-to-article', article.id)"
      >
        View Post
      </NButton>
    </div>
  </div>
</template>

<style scoped>
/* Apply styles for prose elements like paragraphs, lists */
.prose :deep(p) {
  margin-bottom: 0.5rem; /* Adjust spacing between paragraphs */
}
.prose :deep(ul),
.prose :deep(ol) {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  padding-left: 1.5rem; /* Indent lists */
}
.prose :deep(li) {
  margin-bottom: 0.25rem;
}
</style>
