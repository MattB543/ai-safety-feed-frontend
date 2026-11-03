<template>
  <div class="mx-auto max-w-content pt-10 lg:pt-14">
    <h1 class="type-h1 -ml-1 text-ink">Data</h1>
    <p class="type-h2 mt-8 mb-10 max-w-[680px] text-ink lg:mt-10 lg:mb-14">
      There are three ways to get our curated AI safety content data:
      <span class="text-accent"
        >a CSV download, a JSON API, and an RSS feed</span
      >.
    </p>

    <div class="data-page flex flex-col gap-6 lg:gap-10">
      <!-- Direct Download Option -->
      <section class="card p-6 lg:p-10">
        <h2 class="type-h3 mb-4 flex items-center gap-3 text-ink">
          <span class="icon-disc" aria-hidden="true">
            <Download class="h-4 w-4" stroke-width="1.5" />
          </span>
          Option 1: Direct database download
        </h2>
        <p class="mb-4 text-small text-ink">
          Download the complete dataset as a CSV file containing all articles
          with their metadata, summaries, tags, and novelty scores.
        </p>
        <ul class="mb-6 list-disc space-y-1 pl-6 text-small text-ink-2">
          <li>Complete dataset with all historical content</li>
          <li>Includes AI-generated summaries and key implications</li>
          <li>Topic tags and novelty scores</li>
          <li>Source metadata and engagement metrics</li>
          <li>Perfect for research, analysis, and offline use</li>
        </ul>
        <a
          :href="`${API_BASE_URL}/api/content/export`"
          class="btn-secondary"
          aria-label="Download full CSV dataset"
          title="Download full CSV dataset"
        >
          <Download class="h-4 w-4" stroke-width="1.5" />
          Download CSV dataset
        </a>
        <p class="mt-4 text-xs text-ink-2">
          The download leaves out the article text to keep it small. Add
          <code>?include_content=true</code>
          to the URL for the full markdown bodies (about ten times larger), or
          filter it with the same query parameters as the API, e.g.
          <code>?source_type=Less Wrong</code>.
        </p>
      </section>

      <!-- API Access Option -->
      <section class="card p-6 lg:p-10">
        <h2 class="type-h3 mb-4 flex items-center gap-3 text-ink">
          <span class="icon-disc" aria-hidden="true">
            <ApiApp class="h-4 w-4" stroke-width="1.5" />
          </span>
          Option 2: Public API access
        </h2>
        <p class="mb-4 text-small text-ink">
          Integrate our data directly into your applications using our free
          public API. Perfect for building custom tools, research platforms, or
          automated workflows.
        </p>
        <ul class="mb-8 list-disc space-y-1 pl-6 text-small text-ink-2">
          <li>Real-time access to the latest content</li>
          <li>Flexible filtering and search capabilities</li>
          <li>Structured JSON responses</li>
          <li>Support for pagination and custom queries</li>
          <li>Free to use with reasonable rate limits</li>
        </ul>

        <div class="space-y-8">
          <div>
            <h3 class="type-label mb-1 text-ink-2">API documentation</h3>
            <p class="mb-4 text-small text-ink">
              Explore our interactive API documentation with live examples and
              detailed endpoint descriptions:
            </p>
            <a
              href="https://ai-safety-feed-backend.onrender.com/api-docs/"
              target="_blank"
              class="btn-primary"
              aria-label="View API Documentation"
              title="View API Documentation"
            >
              <Book class="h-4 w-4" stroke-width="1.5" />
              View API documentation
            </a>
          </div>
          <div>
            <h3 class="type-label mb-1 text-ink-2">Quick start</h3>
            <p class="mb-3 text-small text-ink">
              No API key needed. Everything is a GET request returning JSON:
            </p>
            <pre><code>{{ API_BASE_URL }}/api/v1/posts?limit=20
{{ API_BASE_URL }}/api/v1/posts?source_type=Less Wrong&amp;novelty_min=60
{{ API_BASE_URL }}/api/v1/posts?source_type=EA Forum&amp;source_type=Alignment Forum
{{ API_BASE_URL }}/api/v1/posts?tags=technical ml safety&amp;published_after=2026-01-01
{{ API_BASE_URL }}/api/v1/posts/1234            # one post, with full text
{{ API_BASE_URL }}/api/v1/posts/sources         # sources, tags, topics, stats</code></pre>
            <p class="mt-3 text-xs text-ink-2">
              Results are paginated (limit up to 100, plus offset) and sorted
              newest first. Limit: 100 requests per 10 minutes per IP.
            </p>
          </div>
        </div>
      </section>

      <!-- RSS Option -->
      <section class="card p-6 lg:p-10">
        <h2 class="type-h3 mb-4 flex items-center gap-3 text-ink">
          <span class="icon-disc" aria-hidden="true">
            <Rss class="h-4 w-4" stroke-width="1.5" />
          </span>
          Option 3: RSS feed
        </h2>
        <p class="mb-4 text-small text-ink">
          Follow new posts in any feed reader, or wire them into tools like
          Zapier or Slack. Each item links to the original post and carries our
          summaries, key implication and tags.
        </p>
        <pre class="mb-4"><code>{{ API_BASE_URL }}/rss.xml</code></pre>
        <p class="text-xs text-ink-2">
          The feed takes the same filters as the API, so you can subscribe to
          just one source or tag, e.g.
          <code>/rss.xml?source_type=EA Forum</code>
          or
          <code>/rss.xml?tags=technical ml safety&amp;novelty_min=60</code>.
        </p>
      </section>

      <!-- Usage Guidelines (secondary panel: outline box, not a card) -->
      <section class="outline-box p-6 lg:p-8">
        <h2 class="type-h3 mb-3 text-ink">Usage guidelines</h2>
        <p class="mb-3 text-small text-ink">Please use our data responsibly:</p>
        <ul class="list-disc space-y-1 pl-6 text-small text-ink-2">
          <li>Respect the original authors' intellectual property</li>
          <li>Provide attribution when using our curated summaries</li>
          <li>Use reasonable rate limits when accessing the API</li>
        </ul>
      </section>
    </div>

    <!-- Action Links Section -->
    <div class="mt-12 flex flex-wrap items-center gap-3 lg:mt-14">
      <!-- Back to Feed Button -->
      <router-link
        to="/"
        class="btn-secondary"
        aria-label="Back to Feed"
        title="Back to Feed"
      >
        <ArrowLeft class="h-4 w-4" stroke-width="1.5" />
        Back to feed
      </router-link>

      <!-- Feedback Button -->
      <a
        href="https://forms.gle/rZodzMMSFh2sFMXZA"
        target="_blank"
        class="btn-secondary"
        aria-label="Provide Feedback"
        title="Provide Feedback"
      >
        Share feedback
      </a>

      <!-- Discord Icon -->
      <a
        href="https://discord.gg/kq3Uux8yDN"
        target="_blank"
        class="btn-secondary"
        aria-label="Join Discord"
        title="Join Discord"
      >
        <DiscordIcon class="h-4 w-4" />
        Join Discord
      </a>
    </div>
  </div>
</template>

<script setup>
import { Download, ArrowLeft, Rss, Book, ApiApp } from "@vicons/tabler";
import DiscordIcon from "../components/icons/DiscordIcon.vue";

// Get API base URL from environment or use default
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
</script>

<style scoped>
.data-page pre {
  overflow-x: auto;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-aisc-teal-750);
  background-color: var(--color-ground);
  padding: 16px;
  color: var(--color-ink);
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.7;
  letter-spacing: 0;
}

.data-page :not(pre) > code {
  border-radius: var(--radius-xs);
  background-color: rgb(255 255 255 / 0.06);
  padding: 1px 4px;
  color: var(--color-ink);
  font-family: var(--font-mono);
  font-size: 0.92em;
  letter-spacing: 0;
}
</style>
