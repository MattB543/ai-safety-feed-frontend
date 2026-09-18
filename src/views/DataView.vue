<template>
  <div class="max-w-[980px] mx-auto py-8 px-4">
    <article
      class="bg-surface rounded-lg shadow-card border border-line p-6 md:p-8"
    >
      <h2 class="font-display text-2xl font-semibold text-ink mb-6">
        Access AI Safety Feed Data
      </h2>

      <section class="mb-8">
        <p class="text-ink-2 text-lg mb-6">
          There are three ways to get our curated AI safety content data: a CSV
          download, a JSON API, and an RSS feed.
        </p>
      </section>

      <!-- Direct Download Option -->
      <section class="mb-8 p-6 bg-surface-2 rounded-lg">
        <h3 class="text-xl font-semibold text-ink mb-4 flex items-center gap-2">
          <Download class="h-5 w-5" stroke-width="2" />
          Option 1: Direct Database Download
        </h3>
        <p class="text-ink-2 mb-4">
          Download the complete dataset as a CSV file containing all articles
          with their metadata, summaries, tags, and novelty scores.
        </p>
        <ul class="list-disc space-y-2 pl-6 text-ink-2 mb-6">
          <li>Complete dataset with all historical content</li>
          <li>Includes AI-generated summaries and key implications</li>
          <li>Topic tags and novelty scores</li>
          <li>Source metadata and engagement metrics</li>
          <li>Perfect for research, analysis, and offline use</li>
        </ul>
        <a
          :href="`${API_BASE_URL}/api/content/export`"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-accent hover:bg-accent-hover transition-colors gap-2"
          aria-label="Download full CSV dataset"
          title="Download full CSV dataset"
        >
          <Download class="h-5 w-5" stroke-width="2" />
          Download CSV Dataset
        </a>
        <p class="text-sm text-ink-3 mt-4">
          The download leaves out the article text to keep it small. Add
          <code class="bg-surface-2 px-1 rounded">?include_content=true</code>
          to the URL for the full markdown bodies (about ten times larger), or
          filter it with the same query parameters as the API, e.g.
          <code class="bg-surface-2 px-1 rounded">?source_type=Less Wrong</code
          >.
        </p>
      </section>

      <!-- API Access Option -->
      <section class="mb-8 p-6 bg-surface-2 rounded-lg">
        <h3 class="text-xl font-semibold text-ink mb-4 flex items-center gap-2">
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
        <p class="text-ink-2 mb-4">
          Integrate our data directly into your applications using our free
          public API. Perfect for building custom tools, research platforms, or
          automated workflows.
        </p>
        <ul class="list-disc space-y-2 pl-6 text-ink-2 mb-6">
          <li>Real-time access to the latest content</li>
          <li>Flexible filtering and search capabilities</li>
          <li>Structured JSON responses</li>
          <li>Support for pagination and custom queries</li>
          <li>Free to use with reasonable rate limits</li>
        </ul>

        <div class="space-y-4">
          <div>
            <h4 class="text-lg font-medium text-ink mb-2">API Documentation</h4>
            <p class="text-ink-2 mb-3">
              Explore our interactive API documentation with live examples and
              detailed endpoint descriptions:
            </p>
            <a
              href="https://ai-safety-feed-backend.onrender.com/api-docs/"
              target="_blank"
              class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-accent hover:bg-accent-hover transition-colors gap-2"
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
          <div>
            <h4 class="text-lg font-medium text-ink mb-2">Quick start</h4>
            <p class="text-ink-2 mb-3">
              No API key needed. Everything is a GET request returning JSON:
            </p>
            <pre
              class="bg-gray-900 text-gray-100 text-sm rounded-md p-4 overflow-x-auto"
            ><code>{{ API_BASE_URL }}/api/v1/posts?limit=20
{{ API_BASE_URL }}/api/v1/posts?source_type=Less Wrong&amp;novelty_min=60
{{ API_BASE_URL }}/api/v1/posts?source_type=EA Forum&amp;source_type=Alignment Forum
{{ API_BASE_URL }}/api/v1/posts?tags=technical ml safety&amp;published_after=2026-01-01
{{ API_BASE_URL }}/api/v1/posts/1234            # one post, with full text
{{ API_BASE_URL }}/api/v1/posts/sources         # sources, tags, topics, stats</code></pre>
            <p class="text-sm text-ink-3 mt-3">
              Results are paginated (limit up to 100, plus offset) and sorted
              newest first. Limit: 100 requests per 10 minutes per IP.
            </p>
          </div>
        </div>
      </section>

      <!-- RSS Option -->
      <section class="mb-8 p-6 bg-surface-2 rounded-lg">
        <h3 class="text-xl font-semibold text-ink mb-4 flex items-center gap-2">
          <Rss class="h-5 w-5" stroke-width="2" />
          Option 3: RSS Feed
        </h3>
        <p class="text-ink-2 mb-4">
          Follow new posts in any feed reader, or wire them into tools like
          Zapier or Slack. Each item links to the original post and carries our
          summaries, key implication and tags.
        </p>
        <pre
          class="bg-gray-900 text-gray-100 text-sm rounded-md p-4 overflow-x-auto mb-4"
        ><code>{{ API_BASE_URL }}/rss.xml</code></pre>
        <p class="text-sm text-ink-3">
          The feed takes the same filters as the API, so you can subscribe to
          just one source or tag, e.g.
          <code class="bg-surface-2 px-1 rounded"
            >/rss.xml?source_type=EA Forum</code
          >
          or
          <code class="bg-surface-2 px-1 rounded"
            >/rss.xml?tags=technical ml safety&amp;novelty_min=60</code
          >.
        </p>
      </section>

      <!-- Usage Guidelines -->
      <section class="mb-6">
        <h3 class="text-lg font-semibold text-ink mb-3">Usage Guidelines</h3>
        <div class="bg-surface-2 border border-line rounded-lg p-4">
          <p class="text-ink-2 mb-3">Please use our data responsibly:</p>
          <ul class="list-disc space-y-1 pl-6 text-ink-2 text-sm">
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
        class="btn-secondary"
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
import { Download, ArrowLeft, Rss } from "@vicons/tabler";
import DiscordIcon from "../components/icons/DiscordIcon.vue";

// Get API base URL from environment or use default
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
</script>
