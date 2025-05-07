<template>
  <div class="max-w-[980px] mx-auto py-8 px-4">
    <article class="bg-white rounded-lg shadow-md p-6 md:p-8">
      <!-- Image Grid -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6 rounded-lg overflow-hidden"
      >
        <img
          v-for="(image, index) in selectedImages"
          :key="index"
          :src="image"
          alt="AI Safety Feed Banner"
          class="w-full h-auto"
        />
      </div>

      <h2 class="text-2xl font-bold text-gray-900 mb-6">
        About the AI Safety Feed
      </h2>

      <section class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">The Challenge</h3>
        <p class="text-gray-700">
          Keeping up with AI safety is difficult. Important research,
          discussions, and ideas are scattered across forums (LessWrong,
          Alignment Forum, EA Forum), blogs, newsletters, and more. Finding the
          most relevant or novel content takes significant time and effort.
        </p>
      </section>

      <section class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Our Solution</h3>
        <p class="text-gray-700">
          The <strong>AI Safety Feed</strong> is a web application designed to
          be a central hub for high-signal AI safety content. We aim to save
          researchers, policymakers, and the community valuable time by
          automating the discovery and initial assessment process.
        </p>
      </section>

      <section class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">
          How it Works (V1)
        </h3>
        <ol class="list-decimal space-y-3 pl-6 text-gray-700">
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
        <h3 class="text-lg font-semibold text-gray-800 mb-2">
          Impact & Vision
        </h3>
        <p class="text-gray-700 mb-4">
          We want this feed to become an indispensable tool for the AI safety
          community, significantly reducing the time spent searching and
          increasing the time spent thinking and engaging with critical ideas.
        </p>
        <p class="text-gray-700">
          Future plans include adding more sources (arXiv, Substack, etc.),
          improving search capabilities (semantic search), and potentially
          adding features like email digests.
        </p>
      </section>

      <section class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Get Involved</h3>
        <p class="text-gray-700">
          This project offers opportunities to work with modern web
          technologies, LLM integration, data processing, and contribute
          directly to a tool supporting the AI safety ecosystem. Join our
          Discord to discuss volunteering!
        </p>
      </section>

      <section class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">
          Technology Stack
        </h3>
        <ul class="list-disc space-y-1 pl-6 text-gray-700">
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
        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 gap-1"
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
        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 gap-1"
        aria-label="Provide Feedback"
        title="Provide Feedback"
      >
        Share Feedback
      </a>

      <!-- Discord Icon -->
      <a
        href="https://discord.gg/kq3Uux8yDN"
        target="_blank"
        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
        aria-label="Join Discord"
        title="Join Discord"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 640 512"
          class="w-4 h-4 mr-1"
          fill="currentColor"
        >
          <!-- SVG Path Copied from your header -->
          <path
            d="M524.531 69.836a1.5 1.5 0 0 0-.764-.7A485.065 485.065 0 0 0 404.081 32.03a1.816 1.816 0 0 0-1.923.91a337.461 337.461 0 0 0-14.9 30.6a447.848 447.848 0 0 0-134.426 0a309.541 309.541 0 0 0-15.135-30.6a1.89 1.89 0 0 0-1.924-.91a483.689 483.689 0 0 0-119.688 37.107a1.712 1.712 0 0 0-.788.676C39.068 183.651 18.186 294.69 28.43 404.354a2.016 2.016 0 0 0 .765 1.375a487.666 487.666 0 0 0 146.825 74.189a1.9 1.9 0 0 0 2.063-.676A348.2 348.2 0 0 0 208.12 430.4a1.86 1.86 0 0 0-1.019-2.588a321.173 321.173 0 0 1-45.868-21.853a1.885 1.885 0 0 1-.185-3.126a251.047 251.047 0 0 0 9.109-7.137a1.819 1.819 0 0 1 1.9-.256c96.229 43.917 200.41 43.917 295.5 0a1.812 1.812 0 0 1 1.924.233a234.533 234.533 0 0 0 9.132 7.16a1.884 1.884 0 0 1-.162 3.126a301.407 301.407 0 0 1-45.89 21.83a1.875 1.875 0 0 0-1 2.611a391.055 391.055 0 0 0 30.014 48.815a1.864 1.864 0 0 0 2.063.7A486.048 486.048 0 0 0 610.7 405.729a1.882 1.882 0 0 0 .765-1.352c12.264-126.783-20.532-236.912-86.934-334.541zM222.491 337.58c-28.972 0-52.844-26.587-52.844-59.239s23.409-59.241 52.844-59.241c29.665 0 53.306 26.82 52.843 59.239c0 32.654-23.41 59.241-52.843 59.241zm195.38 0c-28.971 0-52.843-26.587-52.843-59.239s23.409-59.241 52.843-59.241c29.667 0 53.307 26.82 52.844 59.239c0 32.654-23.177 59.241-52.844 59.241z"
          ></path>
        </svg>
        Join Discord
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
// Import the icon used in the template
import { CirclePlus } from "@vicons/tabler";

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
