<template>
  <div class="max-w-[980px] mx-auto py-8 px-4">
    <article class="bg-white rounded-lg shadow-md p-6 md:p-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">
        Access AI Safety Feed Data
      </h2>

      <section class="mb-8">
        <p class="text-gray-700 text-lg mb-6">
          We provide two convenient ways to access our curated AI safety content
          data:
        </p>
      </section>

      <!-- Direct Download Option -->
      <section class="mb-8 p-6 bg-gray-50 rounded-lg">
        <h3
          class="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"
        >
          <Download class="h-5 w-5" stroke-width="2" />
          Option 1: Direct Database Download
        </h3>
        <p class="text-gray-700 mb-4">
          Download the complete dataset as a CSV file containing all articles
          with their metadata, summaries, tags, and novelty scores.
        </p>
        <ul class="list-disc space-y-2 pl-6 text-gray-700 mb-6">
          <li>Complete dataset with all historical content</li>
          <li>Includes AI-generated summaries and key implications</li>
          <li>Topic tags and novelty scores</li>
          <li>Source metadata and engagement metrics</li>
          <li>Perfect for research, analysis, and offline use</li>
        </ul>
        <a
          :href="`${API_BASE_URL}/api/content/export`"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors gap-2"
          aria-label="Download full CSV dataset"
          title="Download full CSV dataset"
        >
          <Download class="h-5 w-5" stroke-width="2" />
          Download CSV Dataset
        </a>
      </section>

      <!-- API Access Option -->
      <section class="mb-8 p-6 bg-blue-50 rounded-lg">
        <h3
          class="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-5 w-5"
          >
            <rect x="14" y="2" width="4" height="20" rx="1"></rect>
            <rect x="6" y="2" width="4" height="20" rx="1"></rect>
          </svg>
          Option 2: Public API Access
        </h3>
        <p class="text-gray-700 mb-4">
          Integrate our data directly into your applications using our free
          public API. Perfect for building custom tools, research platforms, or
          automated workflows.
        </p>
        <ul class="list-disc space-y-2 pl-6 text-gray-700 mb-6">
          <li>Real-time access to the latest content</li>
          <li>Flexible filtering and search capabilities</li>
          <li>Structured JSON responses</li>
          <li>Support for pagination and custom queries</li>
          <li>Free to use with reasonable rate limits</li>
        </ul>

        <div class="space-y-4">
          <div>
            <h4 class="text-lg font-medium text-gray-800 mb-2">
              API Documentation
            </h4>
            <p class="text-gray-700 mb-3">
              Explore our interactive API documentation with live examples and
              detailed endpoint descriptions:
            </p>
            <a
              href="https://ai-safety-feed-backend.onrender.com/api-docs/"
              target="_blank"
              class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors gap-2"
              aria-label="View API Documentation"
              title="View API Documentation"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-5 w-5"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path
                  d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                ></path>
              </svg>
              View API Documentation
            </a>
          </div>
        </div>
      </section>

      <!-- Usage Guidelines -->
      <section class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-3">
          Usage Guidelines
        </h3>
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p class="text-gray-700 mb-3">Please use our data responsibly:</p>
          <ul class="list-disc space-y-1 pl-6 text-gray-700 text-sm">
            <li>Respect the original authors' intellectual property</li>
            <li>Provide attribution when using our curated summaries</li>
            <li>Use reasonable rate limits when accessing the API</li>
          </ul>
        </div>
      </section>
    </article>

    <!-- Action Links Section -->
    <div class="mt-8 flex items-center justify-center flex-wrap gap-3">
      <!-- Back to Feed Button -->
      <router-link
        to="/"
        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 gap-1"
        aria-label="Back to Feed"
        title="Back to Feed"
      >
        <ArrowLeft class="h-4 w-4" stroke-width="2" />
        Back to Feed
      </router-link>

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
import { Download, ArrowLeft } from "@vicons/tabler";

// Get API base URL from environment or use default
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
</script>
