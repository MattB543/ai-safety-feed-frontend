<template>
  <footer id="site-footer" class="mt-24 w-full px-6 pb-6 lg:mt-48">
    <div class="mx-auto max-w-content">
      <div
        class="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-14"
      >
        <!-- Wordmark, mission and "about" pill -->
        <div class="lg:w-[315px]">
          <router-link
            to="/"
            class="text-[22px] leading-6 font-semibold tracking-[-0.04em] text-accent"
          >
            AI Safety Feed
          </router-link>
          <p class="mt-6 text-small text-white">
            High-signal AI safety research and discussion from forums, blogs,
            newsletters and podcasts, with AI-written summaries, tags and
            novelty scores.
          </p>
          <router-link to="/about" class="btn-secondary mt-8">
            About the feed
          </router-link>
        </div>

        <!-- Link columns -->
        <div class="grid grid-cols-2 gap-8 sm:gap-14 lg:flex">
          <div v-for="col in columns" :key="col.heading">
            <h2 class="text-small font-semibold text-white">
              {{ col.heading }}
            </h2>
            <ul class="mt-4 flex flex-col gap-2">
              <li v-for="link in col.links" :key="link.label">
                <router-link
                  v-if="link.to"
                  :to="link.to"
                  class="text-small text-white/80 transition-colors hover:text-aisc-teal-200"
                  >{{ link.label }}</router-link
                >
                <a
                  v-else
                  :href="link.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-small text-white/80 transition-colors hover:text-aisc-teal-200"
                  >{{ link.label }}</a
                >
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div
        class="mt-16 flex flex-col gap-2 border-t border-line pt-6 text-xs text-white/80 sm:flex-row sm:justify-between lg:mt-32"
      >
        <p>© {{ new Date().getFullYear() }} AI Safety Feed</p>
        <p>
          Summaries, tags and novelty scores are AI-generated · Posts belong to
          their authors
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { API_BASE_URL } from "../api";

const columns = [
  {
    heading: "Help us out",
    links: [
      {
        label: "Suggest a source",
        href: "https://forms.gle/Kgy2xe6m7Y32nqKv7",
      },
      { label: "Share feedback", href: "https://forms.gle/rZodzMMSFh2sFMXZA" },
      { label: "Join the Discord", href: "https://discord.gg/kq3Uux8yDN" },
    ],
  },
  {
    heading: "Get the feed",
    links: [
      { label: "Email digest", to: "/digest" },
      { label: "RSS feed", href: `${API_BASE_URL}/rss.xml` },
      { label: "Data and API", to: "/data" },
    ],
  },
];
</script>
