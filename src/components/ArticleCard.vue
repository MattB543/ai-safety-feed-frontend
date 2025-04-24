<script setup>
import { ref, computed } from "vue";
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
} from "@vicons/tabler";
import { NTooltip, NButton } from "naive-ui";
import { formatDate, formatTagForDisplay } from "../utils/formatters";
import MarkdownIt from "markdown-it";

// --- Props ---
const props = defineProps({
  article: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["show-similar", "view-article"]);

// --- State ---
const isParagraphSummaryExpanded = ref(false);
const isKeyImplicationExpanded = ref(false);
const md = new MarkdownIt(); // Initialize markdown-it

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

const ClusterIcon = computed(
  () => clusterIconMap[props.article.cluster_tag] || IconTag // fallback
);

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
</script>

<template>
  <article class="bg-white px-6" :id="`article-${article.id}`">
    <!-- Top Section: Image on Left, Info on Right -->
    <div class="flex flex-col md:flex-row gap-4 mb-4">
      <div v-if="article.image_url" class="md:w-1/4 flex-shrink-0 max-w-sm">
        <a
          :href="article.source_url"
          target="_blank"
          rel="noopener noreferrer"
          :title="'Open ' + (article.source_type || 'link') + ' in new tab'"
          class="block aspect-[3/2]"
        >
          <img
            :src="article.image_url"
            alt=""
            class="w-full h-full object-cover rounded-md hover:opacity-80 transition-opacity"
          />
        </a>
      </div>

      <div class="flex-grow text-left">
        <div class="flex justify-between items-start mb-2">
          <h2 class="text-2xl font-bold text-gray-900 mr-4">
            <a
              :href="article.source_url"
              target="_blank"
              rel="noopener noreferrer"
              :title="'Open ' + (article.source_type || 'link') + ' in new tab'"
              class="cursor-pointer hover:underline"
            >
              {{ article.title }}
            </a>
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

        <!-- Row 2 – topics -->
        <!-- Removed the separate div for topics -->
      </div>
    </div>

    <!-- Bottom Section: Summary and Actions -->
    <div class="text-left">
      <!-- Sentence Summary -->
      <p
        v-if="article.sentence_summary"
        class="text-gray-700 mb-3 bg-gray-100 px-3 py-2 rounded-md"
      >
        {{ article.sentence_summary }}
      </p>

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
            v-if="article.paragraph_summary"
            @click="toggleParagraphSummary"
            size="small"
          >
            <template #icon>
              <IconListDetails stroke-width="2" class="w-4 h-4" />
            </template>
            {{
              isParagraphSummaryExpanded ? "Hide Main Points" : "Main Points"
            }}
          </n-button>
          <n-button
            v-if="article.key_implication"
            @click="toggleKeyImplication"
            size="small"
            :title="
              isKeyImplicationExpanded ? 'Hide Implication' : 'Show Implication'
            "
          >
            <template #icon>
              <IconKey stroke-width="2" class="w-4 h-4" />
            </template>
            {{ isKeyImplicationExpanded ? "Hide Implication" : "Implication" }}
          </n-button>
          <n-button
            size="small"
            @click="
              emit('show-similar', { id: article.id, title: article.title })
            "
          >
            <template #icon>
              <IconListSearch stroke-width="2" class="w-4 h-4" />
            </template>
            Similar Posts
          </n-button>
        </div>

        <!-- Author & Date (Right Side) - MOVED HERE -->
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

      <!-- Implication (Conditional) -->
      <div
        v-if="isKeyImplicationExpanded && article.key_implication"
        class="text-gray-700 mt-4 bg-gray-100 px-3 py-2 rounded-md mb-4"
      >
        <span class="block text-sm text-gray-500 font-medium mb-1"
          >Implication</span
        >
        <div class="text-gray-700">
          {{ article.key_implication }}
        </div>
      </div>

      <!-- Paragraph Summary (Conditional) -->
      <div
        v-if="isParagraphSummaryExpanded && article.paragraph_summary"
        class="text-gray-700 mt-4 bg-gray-100 px-3 py-2 rounded-md prose max-w-none"
      >
        <span class="block text-sm text-gray-500 font-medium mb-1"
          >Main Points</span
        >
        <div class="text-gray-700" v-html="formattedParagraphSummary"></div>
      </div>
    </div>
  </article>
</template>
