<template>
  <header
    class="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur"
  >
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:ring-2 focus:ring-accent"
      >Skip to feed</a
    >
    <div
      class="mx-auto flex max-w-[980px] flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 sm:h-14 sm:flex-nowrap sm:py-0"
    >
      <router-link
        to="/"
        class="flex shrink-0 items-center gap-2 text-ink transition-colors hover:text-accent"
      >
        <img src="/robot.svg" width="24" height="24" alt="" class="h-6 w-6" />
        <span class="font-display text-[22px] font-bold tracking-tight"
          >AI Safety Feed</span
        >
      </router-link>

      <nav
        aria-label="Primary"
        class="order-last flex w-full min-w-0 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:order-none sm:ml-auto sm:w-auto"
      >
        <router-link
          to="/"
          exact-active-class="bg-surface-2 text-ink"
          class="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >Feed</router-link
        >
        <router-link
          to="/digest"
          active-class="bg-surface-2 text-ink"
          class="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >Digest</router-link
        >
        <router-link
          to="/about"
          active-class="bg-surface-2 text-ink"
          class="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >About</router-link
        >
        <router-link
          to="/data"
          active-class="bg-surface-2 text-ink"
          class="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >Data</router-link
        >
      </nav>

      <div class="ml-auto flex shrink-0 items-center gap-1 sm:ml-0">
        <a
          href="https://forms.gle/rZodzMMSFh2sFMXZA"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Send feedback"
          title="Send feedback"
        >
          <MessageCircle class="h-5 w-5" stroke-width="1.75" />
        </a>
        <a
          href="https://discord.gg/kq3Uux8yDN"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Join the Discord"
          title="Join the Discord"
        >
          <DiscordIcon class="h-5 w-5" />
        </a>
      </div>
    </div>
  </header>
</template>

<script setup>
import { MessageCircle } from "@vicons/tabler";
import DiscordIcon from "./icons/DiscordIcon.vue";
</script>
