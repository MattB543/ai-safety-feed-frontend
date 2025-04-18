<script setup>
import { ref, computed } from "vue";
import {
  ListDetails as IconListDetails,
  ExternalLink as IconExternalLink,
  Key as IconKey,
} from "@vicons/tabler";
import { formatDate, formatTagForDisplay } from "../utils/formatters";
import MarkdownIt from "markdown-it";

// --- Props ---
const props = defineProps({
  article: {
    type: Object,
    required: true,
  },
});

// --- State ---
const isParagraphSummaryExpanded = ref(false);
const isKeyImplicationExpanded = ref(false);
const md = new MarkdownIt(); // Initialize markdown-it

// --- Computed ---
const formattedParagraphSummary = computed(() => {
  if (!props.article.paragraph_summary) {
    return "";
  }
  // Render the paragraph_summary (assumed to be Markdown) to HTML
  return md.render(props.article.paragraph_summary);
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
  <article class="bg-white px-6">
    <!-- Top Section: Image on Left, Info on Right -->
    <div class="flex flex-col md:flex-row gap-4 mb-4">
      <div v-if="article.image_url" class="md:w-1/4 flex-shrink-0">
        <a
          :href="article.source_url"
          target="_blank"
          rel="noopener noreferrer"
          :title="'Open ' + (article.source_type || 'link') + ' in new tab'"
        >
          <img
            :src="article.image_url"
            alt=""
            class="w-full h-32 object-cover rounded-md hover:opacity-80 transition-opacity"
          />
        </a>
      </div>

      <div class="flex-grow text-left">
        <div class="flex justify-between items-start mb-3">
          <h2 class="text-2xl font-bold text-gray-900 mr-4">
            {{ article.title }}
          </h2>
        </div>

        <!-- Metadata: Authors, Date, Topics -->
        <div
          class="text-sm text-gray-500 mb-4 flex flex-wrap items-center gap-x-3 gap-y-1"
        >
          <!-- Authors -->
          <div class="flex items-center gap-x-1.5">
            <div
              v-if="!article.authors || article.authors.length === 0"
              class="inline-flex items-center"
            >
              <!-- <img
                src="https://pbs.twimg.com/profile_images/1764332051195428864/Mc3cZJA9_400x400.jpg"
                alt="Author profile picture"
                class="h-5 w-5 rounded-full mr-1 align-middle object-cover"
              /> -->
              <span class="text-sm text-gray-600">Unknown Author</span>
            </div>
            <div
              v-else
              v-for="(author, index) in article.authors"
              :key="author"
              class="inline-flex items-center"
            >
              <!-- <img
                src="https://pbs.twimg.com/profile_images/1764332051195428864/Mc3cZJA9_400x400.jpg"
                alt="Author profile picture"
                class="h-5 w-5 rounded-full mr-1 align-middle object-cover"
              /> -->
              <span class="text-sm text-gray-600">
                {{ author }}
              </span>
              <span v-if="index < article.authors.length - 1" class="mx-0.5"
                >,</span
              >
            </div>
          </div>

          <span class="text-gray-300 hidden md:inline">|</span>

          <!-- Date -->
          <span class="whitespace-nowrap">{{
            formatDate(article.published_date)
          }}</span>

          <span class="text-gray-300 hidden md:inline">|</span>

          <!-- Topics (inline) -->
          <span
            v-if="article.topics && article.topics.length"
            class="inline-flex items-center flex-wrap gap-1"
          >
            <!-- Display first 4 topics -->
            <span
              v-for="topic in article.topics.slice(0, 4)"
              :key="topic"
              class="inline-block bg-gray-100 rounded px-1.5 py-0.5 text-sm text-gray-500"
            >
              {{ formatTagForDisplay(topic) }}
            </span>
          </span>
        </div>

        <!-- Authors with Placeholders -->
        <!-- Removed this section as it's now part of the metadata above -->
      </div>
    </div>

    <!-- Bottom Section: Summary and Actions -->
    <div class="text-left">
      <!-- Sentence Summary -->
      <p
        v-if="article.sentence_summary"
        class="text-gray-700 mb-4 bg-gray-100 px-3 py-2 rounded-md"
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

      <!-- Actions -->
      <div class="flex items-center flex-wrap gap-2 mb-4">
        <button
          v-if="article.paragraph_summary"
          @click="toggleParagraphSummary"
          class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded text-sm flex items-center"
        >
          <IconListDetails class="w-4 h-4 mr-1.5" stroke-width="2" />
          {{ isParagraphSummaryExpanded ? "Hide Main Points" : "Main Points" }}
        </button>
        <button
          v-if="article.key_implication"
          @click="toggleKeyImplication"
          class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded text-sm flex items-center"
          :title="
            isKeyImplicationExpanded
              ? 'Hide Key Implication'
              : 'Show Key Implication'
          "
        >
          <IconKey class="w-4 h-4 mr-1.5" stroke-width="2" />
          {{
            isKeyImplicationExpanded
              ? "Hide Key Implication"
              : "Key Implication"
          }}
        </button>
        <a
          :href="article.source_url"
          class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded text-sm flex items-center no-underline"
          target="_blank"
          rel="noopener noreferrer"
          :title="'Open ' + (article.source_type || 'link') + ' in new tab'"
        >
          <IconExternalLink class="w-4 h-4 mr-1.5" stroke-width="2" />
          <span v-if="article.source_type">
            {{
              article.source_type.charAt(0).toUpperCase() +
              article.source_type.slice(1)
            }}</span
          >
          <span v-else>Open Link</span>
        </a>
      </div>

      <!-- Key Implication (Conditional & Styled) -->
      <div
        v-if="isKeyImplicationExpanded && article.key_implication"
        class="text-gray-700 mt-4 bg-gray-100 px-3 py-2 rounded-md mb-4"
      >
        <span class="block text-sm text-gray-500 font-medium mb-1"
          >Key Implication</span
        >
        <div class="text-base text-gray-600">
          {{ article.key_implication }}
        </div>
      </div>

      <!-- Paragraph Summary (Conditional) -->
      <div
        v-if="isParagraphSummaryExpanded && article.paragraph_summary"
        class="text-gray-700 mt-4 bg-gray-100 px-3 py-2 rounded-md prose max-w-none"
        v-html="formattedParagraphSummary"
      ></div>
    </div>
  </article>
</template>
