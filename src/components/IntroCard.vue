<script setup>
import { ref } from "vue";

const expanded = ref(false);

const summary =
  "The goal of this feed is to surface the highest‑signal writing, research and discussion about AI risk. " +
  "Our crawler + LLM rank, tag, and summarise each item so you can decide in seconds if you want to dive deeper. " +
  "We're very open to feedback as we iterate, just join the Discord in the top right corner.";

function toggle() {
  expanded.value = !expanded.value;
}
</script>

<template>
  <article class="bg-white rounded-lg shadow-md p-6">
    <!-- three‑sentence blurb -->
    <h3 class="text-xl font-medium mb-4">V1 MVP Release Notes</h3>
    <p class="text-gray-700 mb-4">{{ summary }}</p>

    <!-- toggle -->
    <button
      @click="toggle"
      class="text-sm text-blue-600 hover:underline focus:outline-none"
    >
      {{ expanded ? "Hide" : "Read details" }}
    </button>

    <!-- full write‑up -->
    <div v-if="expanded" class="mt-6 prose max-w-none text-gray-800">
      <p>
        <strong>Why this exists</strong><br />
        The AI‑safety conversation is scattered across forums, blogs, papers,
        podcasts and social threads. AI Safety Feed skims that fire‑hose and
        puts the highest‑signal items in one clean stream.
      </p>

      <p class="mt-4"><strong>How it works (V1)</strong></p>
      <ul>
        <li>
          <strong>Curate → Filter</strong> – crawlers pull fresh posts from
          LessWrong, Alignment Forum, EA Forum and a handful of newsletters.
          Simple heuristics (score × comments × recency) keep only the most
          engaged pieces.
        </li>
        <li>
          <strong>Analyse → Enrich</strong> – An LLM produces a one‑sentence
          skim, bullet‑point main points, a <em>key implication</em> and
          canonical tags + a cluster label; images and author data are scraped
          for context.
        </li>
        <li>
          <strong>Serve → Slice</strong> – instant search, source & tag filters,
          CSV export and a Discord for link suggestions.
        </li>
      </ul>

      <p class="mt-4">
        <strong>Goal</strong><br />
        Save researchers, policymakers and curious readers hours per week: less
        trawling, more thinking.
      </p>

      <p class="mt-4"><strong>Near‑term roadmap</strong></p>
      <ul>
        <li>Add arXiv, Substack, YouTube, & Twitter threads</li>
        <li>Importance score that blends citations/likes</li>
        <li>Semantic search + chat over the archive</li>
        <li>Email digests, and more</li>
      </ul>

      <p class="mt-4">
        Enjoy the signal, ignore the noise — and let us know what would make
        this feed more useful.
      </p>
    </div>
  </article>
</template>
