<script setup>
import { NConfigProvider, NMessageProvider } from "naive-ui";
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
import { naiveTheme } from "./theme/naive";
</script>

<template>
  <n-config-provider :theme-overrides="naiveTheme">
    <n-message-provider>
      <div class="bg-ground text-ink min-h-screen flex flex-col">
        <AppHeader />

        <main id="main" class="flex-grow w-full py-8 px-4">
          <router-view />
        </main>

        <AppFooter />
      </div>
    </n-message-provider>
  </n-config-provider>
</template>
