<template>
  <header
    ref="headerRef"
    class="sticky top-0 z-40 transition-[translate,background-color] duration-200 ease-out focus-within:translate-y-0"
    :class="[
      isHidden ? '-translate-y-full' : 'translate-y-0',
      isScrolled ? 'bg-ground/40 backdrop-blur-[16px]' : 'bg-transparent',
    ]"
  >
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-[13px] focus:font-semibold focus:text-ink-inverse"
      >Skip to content</a
    >
    <div ref="barRef" class="flex h-[88px] items-center gap-4 px-6 lg:px-10">
      <!-- Wordmark: Inter 600, always pale aqua, as on aisafety.com -->
      <router-link
        to="/"
        class="shrink-0 rounded-sm pr-4 text-[22px] leading-6 font-semibold tracking-[-0.04em] whitespace-nowrap text-accent lg:pr-6"
      >
        AI Safety Feed
      </router-link>

      <!-- Desktop navigation -->
      <nav
        aria-label="Primary"
        class="ml-auto hidden items-center gap-2 lg:flex"
      >
        <router-link
          v-for="item in navItems"
          :key="item.to"
          v-slot="{ href, navigate, isActive, isExactActive }"
          :to="item.to"
          custom
        >
          <a
            :href="href"
            class="nav-pill"
            :class="{
              'is-current': item.exact ? isExactActive : isActive,
            }"
            :aria-current="
              (item.exact ? isExactActive : isActive) ? 'page' : undefined
            "
            @click="navigate"
          >
            <span class="icon-disc" aria-hidden="true">
              <component :is="item.icon" class="h-4 w-4" stroke-width="1.5" />
            </span>
            {{ item.label }}
          </a>
        </router-link>
      </nav>

      <div class="ml-auto flex shrink-0 items-center gap-1 lg:ml-2">
        <a
          href="https://forms.gle/rZodzMMSFh2sFMXZA"
          target="_blank"
          rel="noopener noreferrer"
          class="icon-btn hidden lg:inline-flex"
          aria-label="Send feedback"
          title="Send feedback"
        >
          <MessageCircle class="h-6 w-6" stroke-width="1.25" />
        </a>
        <a
          href="https://discord.gg/kq3Uux8yDN"
          target="_blank"
          rel="noopener noreferrer"
          class="icon-btn hidden lg:inline-flex"
          aria-label="Join the Discord"
          title="Join the Discord"
        >
          <DiscordIcon class="h-5 w-5" />
        </a>

        <!-- Mobile menu toggle -->
        <button
          ref="toggleRef"
          type="button"
          class="inline-flex h-10 items-center justify-center rounded-[20px] border border-white/40 px-4 text-white transition-colors hover:bg-white/[.08] lg:hidden"
          aria-label="Open menu"
          :aria-expanded="isMenuOpen"
          aria-controls="mobile-menu"
          @click="openMenu"
        >
          <Menu2 class="h-6 w-6" stroke-width="1.25" />
        </button>
      </div>
    </div>

    <!-- Full-screen mobile menu -->
    <Teleport to="body">
      <Transition name="menu">
        <div
          v-if="isMenuOpen"
          id="mobile-menu"
          ref="menuRef"
          class="fixed inset-0 z-50 overflow-y-auto bg-[rgb(5_24_26/0.8)] px-6 backdrop-blur-[16px] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          @keydown="onMenuKeydown"
        >
          <div class="flex h-[88px] items-center justify-between gap-4">
            <router-link
              to="/"
              class="text-[22px] leading-6 font-semibold tracking-[-0.04em] text-accent"
              @click="closeMenu({ focus: 'main' })"
            >
              AI Safety Feed
            </router-link>
            <button
              ref="closeButtonRef"
              type="button"
              class="inline-flex h-10 items-center justify-center rounded-[20px] border border-white/40 px-4 text-white transition-colors hover:bg-white/[.08]"
              aria-label="Close menu"
              @click="closeMenu({ focus: 'toggle' })"
            >
              <X class="h-6 w-6" stroke-width="1.25" />
            </button>
          </div>

          <nav aria-label="Primary" class="mt-6 flex flex-col gap-2 pb-10">
            <router-link
              v-for="(item, index) in navItems"
              :key="item.to"
              v-slot="{ href, navigate, isActive, isExactActive }"
              :to="item.to"
              custom
            >
              <a
                :href="href"
                class="nav-pill menu-item w-full"
                :class="{
                  'is-current': item.exact ? isExactActive : isActive,
                }"
                :style="{ '--i': index }"
                :aria-current="
                  (item.exact ? isExactActive : isActive) ? 'page' : undefined
                "
                @click="
                  (e) => {
                    closeMenu({ focus: 'main' });
                    navigate(e);
                  }
                "
              >
                <span class="icon-disc" aria-hidden="true">
                  <component
                    :is="item.icon"
                    class="h-4 w-4"
                    stroke-width="1.5"
                  />
                </span>
                {{ item.label }}
              </a>
            </router-link>
            <a
              href="https://forms.gle/rZodzMMSFh2sFMXZA"
              target="_blank"
              rel="noopener noreferrer"
              class="nav-pill menu-item w-full"
              :style="{ '--i': navItems.length }"
            >
              <span class="icon-disc" aria-hidden="true">
                <MessageCircle class="h-4 w-4" stroke-width="1.5" />
              </span>
              Send feedback
            </a>
            <a
              href="https://discord.gg/kq3Uux8yDN"
              target="_blank"
              rel="noopener noreferrer"
              class="nav-pill menu-item w-full"
              :style="{ '--i': navItems.length + 1 }"
            >
              <span class="icon-disc" aria-hidden="true">
                <DiscordIcon class="h-4 w-4" />
              </span>
              Join the Discord
            </a>
          </nav>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import {
  MessageCircle,
  News,
  Mail,
  InfoCircle,
  Database,
  Menu2,
  X,
} from "@vicons/tabler";
import DiscordIcon from "./icons/DiscordIcon.vue";

const navItems = [
  { to: "/", label: "Feed", icon: News, exact: true },
  { to: "/digest", label: "Digest", icon: Mail },
  { to: "/about", label: "About", icon: InfoCircle },
  { to: "/data", label: "Data", icon: Database },
];

const headerRef = ref(null);
const barRef = ref(null);
const toggleRef = ref(null);
const menuRef = ref(null);
const closeButtonRef = ref(null);
const route = useRoute();

// Media queries (created on mount; SSR-safe enough for this SPA).
let desktopMq = null; // aisafety.com's desktop switch, 992px
let reducedMotionMq = null;

// --- Scroll behaviour (aisafety.com): transparent at the top, hides while
// scrolling down, comes back blurred while scrolling up. Never hides while it
// holds focus or when the user prefers reduced motion. ---
const isScrolled = ref(false);
const isHidden = ref(false);
let lastY = 0;
let ticking = false;

function headerHasFocus() {
  return !!headerRef.value?.contains(document.activeElement);
}

function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    isScrolled.value = y > 8;
    // Small threshold so trackpad jitter doesn't flicker the header.
    if (Math.abs(y - lastY) > 6) {
      isHidden.value =
        y > lastY &&
        y > 88 &&
        !isMenuOpen.value &&
        !headerHasFocus() &&
        !reducedMotionMq?.matches;
      lastY = y;
    }
    ticking = false;
  });
}

function onHeaderFocusIn() {
  isHidden.value = false;
}

// --- Mobile menu ---
const isMenuOpen = ref(false);
let savedOverflow = null;
// Where focus goes once the menu has closed: "toggle" (Esc / Close button),
// "main" (after navigating), or null (closed by resizing to desktop).
let focusAfterClose = null;

function openMenu() {
  isMenuOpen.value = true;
}

function closeMenu({ focus = null } = {}) {
  if (!isMenuOpen.value) return;
  focusAfterClose = focus;
  isMenuOpen.value = false;
}

// Everything outside the dialog is inert while it is open.
function backgroundEls() {
  return [
    barRef.value,
    document.getElementById("main"),
    document.getElementById("site-footer"),
  ].filter(Boolean);
}

function focusMainRegion() {
  // Prefer the new page's heading; fall back to the <main> landmark.
  const heading = document.querySelector("#main h1");
  if (heading) {
    if (!heading.hasAttribute("tabindex"))
      heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  } else {
    document.getElementById("main")?.focus({ preventScroll: true });
  }
}

watch(isMenuOpen, async (open) => {
  const html = document.documentElement;
  if (open) {
    savedOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    backgroundEls().forEach((el) => (el.inert = true));
    await nextTick();
    closeButtonRef.value?.focus();
  } else {
    html.style.overflow = savedOverflow ?? "";
    savedOverflow = null;
    backgroundEls().forEach((el) => (el.inert = false));
    const target = focusAfterClose;
    focusAfterClose = null;
    if (target === "toggle") {
      await nextTick();
      toggleRef.value?.focus();
    } else if (target === "main") {
      // Focus moves once the new route has rendered (see the route watcher).
      // If the link pointed at the current page there is no route change, so
      // fall back to a short timeout.
      pendingMainFocus = true;
      clearTimeout(mainFocusTimer);
      mainFocusTimer = setTimeout(flushMainFocus, 400);
    }
  }
});

let pendingMainFocus = false;
let mainFocusTimer = null;

function flushMainFocus() {
  clearTimeout(mainFocusTimer);
  if (!pendingMainFocus) return;
  pendingMainFocus = false;
  focusMainRegion();
}

// Any route change (back button, links) closes the menu; runs after the new
// view has rendered so focus can land on its heading.
watch(
  () => route.fullPath,
  () => {
    closeMenu({ focus: "main" });
    nextTick(flushMainFocus);
  },
  { flush: "post" }
);

// Keep Tab / Shift+Tab inside the open menu; Esc closes it.
function onMenuKeydown(e) {
  if (e.key === "Escape") {
    e.preventDefault();
    closeMenu({ focus: "toggle" });
    return;
  }
  if (e.key !== "Tab" || !menuRef.value) return;
  const focusables = Array.from(
    menuRef.value.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function onDesktopChange(e) {
  if (e.matches) closeMenu();
}

onMounted(() => {
  desktopMq = window.matchMedia("(min-width: 62rem)");
  reducedMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  desktopMq.addEventListener("change", onDesktopChange);

  lastY = window.scrollY;
  isScrolled.value = lastY > 8;
  window.addEventListener("scroll", onScroll, { passive: true });
  headerRef.value?.addEventListener("focusin", onHeaderFocusIn);
});

onBeforeUnmount(() => {
  desktopMq?.removeEventListener("change", onDesktopChange);
  window.removeEventListener("scroll", onScroll);
  clearTimeout(mainFocusTimer);
  headerRef.value?.removeEventListener("focusin", onHeaderFocusIn);
  if (isMenuOpen.value) {
    document.documentElement.style.overflow = savedOverflow ?? "";
    backgroundEls().forEach((el) => (el.inert = false));
  }
});
</script>

<style scoped>
.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.2s ease-out;
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
}
.menu-enter-active .menu-item {
  transition:
    opacity 0.3s ease-out,
    transform 0.3s ease-out;
  transition-delay: calc(var(--i) * 30ms);
}
.menu-enter-from .menu-item {
  opacity: 0;
  transform: translateY(-20px);
}
@media (prefers-reduced-motion: reduce) {
  .menu-enter-active .menu-item {
    transition-delay: 0s;
  }
}
</style>
