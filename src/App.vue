<script setup>
import { NConfigProvider, NMessageProvider } from "naive-ui";
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
import { feedDarkTheme, naiveTheme } from "./theme/naive";
</script>

<template>
  <n-config-provider :theme="feedDarkTheme" :theme-overrides="naiveTheme">
    <n-message-provider>
      <!-- No background here: the page ground and its aqua glow live on <body>. -->
      <div class="flex min-h-screen flex-col text-ink">
        <AppHeader />

        <main
          id="main"
          tabindex="-1"
          class="w-full flex-grow px-6 pb-8 focus:outline-none"
        >
          <router-view />
        </main>

        <AppFooter />
      </div>
    </n-message-provider>
  </n-config-provider>
</template>
