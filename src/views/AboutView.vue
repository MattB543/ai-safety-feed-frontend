<template>
  <div class="max-w-[980px] mx-auto py-8 px-4">
    <article
      class="bg-surface rounded-lg shadow-card border border-line p-6 md:p-8"
    >
      <!-- Image Grid -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6 rounded-lg overflow-hidden"
      >
        <img
          v-for="(image, index) in selectedImages"
          :key="index"
          :src="image"
          alt="AI Safety Feed Banner"
          width="400"
          height="300"
          class="w-full h-auto"
        />
      </div>

      <h2 class="font-display text-2xl font-semibold text-ink mb-6">
        About the AI Safety Feed
      </h2>

      <section class="mb-6">
        <h3 class="text-lg font-semibold text-ink mb-2">The Challenge</h3>
        <p class="text-ink-2">
          Keeping up with AI safety is difficult. Important research,
          discussions, and ideas are scattered across forums (LessWrong,
          Alignment Forum, EA Forum), blogs, newsletters, and more. Finding the
          most relevant or novel content takes significant time and effort.
        </p>
      </section>

      <section class="mb-6">
        <h3 class="text-lg font-semibold text-ink mb-2">Our Solution</h3>
        <p class="text-ink-2">
          The <strong>AI Safety Feed</strong> is a web application designed to
          be a central hub for high-signal AI safety content. We aim to save
          researchers, policymakers, and the community valuable time by
          automating the discovery and initial assessment process.
        </p>
      </section>

      <section class="mb-6">
        <h3 class="text-lg font-semibold text-ink mb-2">How it Works (V1)</h3>
        <ol class="list-decimal space-y-3 pl-6 text-ink-2">
          <li>
            <strong>Aggregation:</strong> We currently crawl key sources (LW,
            AF, EAF, select newsletters) to gather recent, highly-engaged
            content.
          </li>
          <li>
            <strong>AI-Powered Enrichment:</strong> Each piece is processed by
            an LLM (currently Google Gemini) to generate concise summaries,
            extract key points, identify implications, assign topic/cluster
            tags, and calculate a novelty score with explanations.
          </li>
          <li>
            <strong>Database Storage:</strong> All enriched data, metadata, and
            vector embeddings (for similarity search) are stored in a PostgreSQL
            database.
          </li>
          <li>
            <strong>Web Interface (Vue.js Frontend):</strong> Users interact
            with a clean interface to browse, search, filter (by source, tag,
            novelty), view details, discover semantically similar posts (using
            vector search + AI re-ranking), and export data.
          </li>
          <li>
            <strong>Backend API (Node.js/Express):</strong> Serves data, handles
            search/filtering, manages similarity calculations (including AI
            calls), and provides the CSV export.
          </li>
        </ol>
      </section>

      <section class="mb-6">
        <h3 class="text-lg font-semibold text-ink mb-2">Impact &amp; Vision</h3>
        <p class="text-ink-2 mb-4">
          We want this feed to become an indispensable tool for the AI safety
          community, significantly reducing the time spent searching and
          increasing the time spent thinking and engaging with critical ideas.
        </p>
        <p class="text-ink-2">
          Future plans include adding more sources (arXiv, Substack, etc.),
          improving search capabilities (semantic search), and potentially
          adding features like email digests.
        </p>
      </section>

      <section class="mb-6">
        <h3 class="text-lg font-semibold text-ink mb-2">Get Involved</h3>
        <p class="text-ink-2">
          This project offers opportunities to work with modern web
          technologies, LLM integration, data processing, and contribute
          directly to a tool supporting the AI safety ecosystem. Join our
          Discord to discuss volunteering!
        </p>
      </section>

      <section class="mb-6">
        <h3 class="text-lg font-semibold text-ink mb-2">Technology Stack</h3>
        <ul class="list-disc space-y-1 pl-6 text-ink-2">
          <li><strong>Frontend:</strong> Vue.js 3, Tailwind CSS, Naive UI</li>
          <li><strong>Backend:</strong> Node.js, Express.js</li>
          <li><strong>Database:</strong> PostgreSQL with pgvector</li>
          <li><strong>AI:</strong> OpenAI embeddings and Gemini</li>
        </ul>
      </section>
    </article>

    <!-- Action Links Section -->
    <div
      class="mt-8 flex items-center justify-center flex-wrap gap-3 clear-both"
    >
      <!-- Submit Content Button -->
      <a
        href="https://forms.gle/Kgy2xe6m7Y32nqKv7"
        target="_blank"
        class="btn-secondary"
        aria-label="Submit Content"
        title="Submit Content"
      >
        <CirclePlus class="h-4 w-4" stroke-width="2" />
        Submit Content
      </a>

      <!-- Feedback Button -->
      <a
        href="https://forms.gle/rZodzMMSFh2sFMXZA"
        target="_blank"
        class="btn-secondary"
        aria-label="Provide Feedback"
        title="Provide Feedback"
      >
        Share Feedback
      </a>

      <!-- Discord Icon -->
      <a
        href="https://discord.gg/kq3Uux8yDN"
        target="_blank"
        class="btn-secondary"
        aria-label="Join Discord"
        title="Join Discord"
      >
        <DiscordIcon class="mr-1 h-4 w-4" />
        Join Discord
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
// Import the icon used in the template
import { CirclePlus } from "@vicons/tabler";
import DiscordIcon from "../components/icons/DiscordIcon.vue";

const allImages = [
  "https://res.cloudinary.com/dwsfgvcde/image/upload/v1745812803/ai-safety-feed/ChatGPT_Image_Apr_27_2025_11_59_54_PM_tajvki.png",
  "https://res.cloudinary.com/dwsfgvcde/image/upload/v1745812663/ai-safety-feed/ChatGPT_Image_Apr_27_2025_11_57_29_PM_yxt3to.png",
  "https://res.cloudinary.com/dwsfgvcde/image/upload/v1745812660/ai-safety-feed/ChatGPT_Image_Apr_27_2025_11_57_32_PM_orvgec.png",
  "https://res.cloudinary.com/dwsfgvcde/image/upload/v1745812581/ai-safety-feed/ChatGPT_Image_Apr_27_2025_11_55_54_PM_ixskse.png",
  "https://res.cloudinary.com/dwsfgvcde/image/upload/v1745812578/ai-safety-feed/ChatGPT_Image_Apr_27_2025_11_55_59_PM_adcfkq.png",
  "https://res.cloudinary.com/dwsfgvcde/image/upload/v1745812389/ai-safety-feed/ChatGPT_Image_Apr_27_2025_11_52_28_PM_rovvra.png",
  "https://res.cloudinary.com/dwsfgvcde/image/upload/v1745812072/ai-safety-feed/ChatGPT_Image_Apr_27_2025_11_47_46_PM_pxpts0.png",
];

const selectedImages = ref([]);

// Function to shuffle array and select images based on screen width
const updateSelectedImages = () => {
  // Fisher-Yates (aka Knuth) Shuffle
  const shuffled = [...allImages];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // Select images based on screen width
  const width = window.innerWidth;
  let count = 1; // Default mobile
  if (width >= 980) {
    count = 3; // Desktop
  } else if (width >= 640) {
    count = 2; // Tablet
  }
  selectedImages.value = shuffled.slice(0, count);
};

// Select images when the component mounts
onMounted(() => {
  updateSelectedImages(); // Select images based on initial width
});
</script>

<style scoped>
/* Add any component-specific styles here if needed */
</style>
