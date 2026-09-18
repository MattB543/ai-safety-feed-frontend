# AI Safety Feed — Frontend Design & UX Review

**Date:** 2026-09-17 (revised same day after a second-opinion review, see §9)
**Scope:** `frontend/` (Vue 3 + Vite + Tailwind 4 + Naive UI), reviewed against the live site at aisafetyfeed.com at 1280px and 390px widths. Screenshots in `docs/screenshots/`.
**Brief from Matt:** "I like the modern clean feel, but it feels a bit bare bones and bland right now." Keep the clean/modern feel; add identity, hierarchy, and polish.
**Companion file:** `DESIGN_REVIEW_codex-critique.md` — the unedited second-opinion review (Codex, gpt-6-astra, medium effort). Its accepted points are folded into this doc; disagreements are recorded in §9.

---

## 0. TL;DR

The app is structurally sound and the information design is good (one-sentence skim, cluster + topics, expandable main points, novelty). What makes it feel bland is not a lack of features, it is the absence of a **design language**, and a handful of interaction bugs that a restyle would make *look* more trustworthy without being so:

1. **No brand identity in the app.** System font stack, pure white on gray-50, text-only wordmark. Meanwhile `landing-page/index.html` already has a distinctive identity (Funnel Display headings, Commissioner body, warm cream ground) that never made it into the app.
2. **Four competing accent colours.** Tailwind `blue-600` (links, chips), Naive UI's default info blue `#2080f0` (active "Main Points" button, and hard-coded as the search focus ring), Naive UI's default primary green `#18a058` (Apply, Subscribe) plus Tailwind `green-600` (API docs CTA), and a `#09f` spinner. There is no `NConfigProvider`, so Naive's stock theme leaks through, and two of the four are hard-coded outside Naive so theming alone won't fix them.
3. **Everything has the same visual weight.** Every card is `text-2xl font-bold` + a gray box + four identical gray buttons. Five identical gray pills in the header make "Feedback" look as important as the feed itself.
4. **No design tokens, no shared components.** The same 150-character button class string is copy-pasted ~15 times across 9 files. Colour, radius, and spacing decisions are made ad hoc per element.
5. **The source is never shown on a card.** For a feed *aggregator*, which forum/newsletter/podcast an item came from is a primary scanning cue, and it is only visible in a hover tooltip (and only when the title was cleaned).
6. **No disclosure motion, no loading skeletons.** Expand/collapse is a hard `v-if` swap; nothing eases in; the first thing a cold-start visitor reads is "refresh after 1 minute".
7. **Several controls don't do what they say** (found in the second-opinion pass, all verified against the code): the novelty filter labelled "4+" selects *only* bucket 4 and excludes 5/5 posts; Cancel in the Sources/Tags popovers doesn't discard edits; unchecking every source means "all sources"; the "Tags" filter actually filters *clusters*; the bookmark button on the Similar page's original card does nothing; a failed infinite-scroll append wipes the whole visible feed; the `prose` class does nothing because the typography plugin isn't installed, so the expanded Main Points has no list markers.

The recommended path is **fix the lying controls, then a token-first refresh**: define ~15 CSS variables via Tailwind 4 `@theme`, wire Naive UI to the same tokens, adopt the landing page's type pairing, and then fix the card, header, and toolbar hierarchy on that foundation. The visual pass is a 2–3 day job; with the correctness, a11y and URL-state work it is closer to a week. Prioritised roadmap in §7.

---

## 1. Current state: how the FE is built

### 1.1 Stack and structure

| Layer | What's used | Notes |
|---|---|---|
| Framework | Vue 3.5, `<script setup>`, Vue Router 4 | 5 routes: `/`, `/similar/:slugWithId`, `/about`, `/digest`, `/data`; all eagerly imported |
| Build | Vite 6, `@tailwindcss/vite` | Tailwind v4 (CSS-first config), but `@theme` is never used; `@tailwindcss/typography` not installed |
| Styling | Tailwind utilities inline in templates + Naive UI components + 3 small `<style>` blocks | `src/assets/main.css` is 4 lines: `@import "tailwindcss"` and `button { cursor: pointer }` |
| Components | Naive UI: `NButton`, `NPopover`, `NTooltip`, `NInput`, `NCheckbox`, `NSlider`, `NForm*`, `NSpin`, `NMessageProvider` | No `NConfigProvider` → default Naive theme |
| Icons | `@vicons/tabler` + 3 hand-rolled SVG components + inline Discord SVG (duplicated in 3 files) | Cluster icon map has 6 entries; "Biorisk & Other GCRs" falls back to a generic tag icon |
| State | `useArticles()` composable; every ref is created per invocation | `FeedView` and `SimilarPage` each get an independent instance; `SimilarPage` calling it triggers a full set of feed/metadata fetches it never uses. Bookmarks in `localStorage`; filters not reflected in URL |
| Fonts | None loaded. Tailwind's default `ui-sans-serif, system-ui…` → Segoe UI on Windows, SF on Mac | Landing page loads Funnel Display + Commissioner from Google Fonts |
| Analytics | PostHog (prod only) | |
| SEO | `@vueuse/head` used only on `SimilarPage` | `index.html` has no description / OG / theme-color |

### 1.2 What the API gives the card

`/api/content` (the feed) selects: `id, title, sentence_summary, paragraph_summary, key_implication, novelty_score, novelty_note, image_url, source_url, source_type, authors, topics, cluster_tag, published_date, cleaned_title, cleaned_image, image_prompt`.
`/api/content/by-ids` (bookmarks) and `/api/similar/:id/ai` select `CONTENT_COLS` = every column except the two embeddings, so they *also* return `unique_aspects`, `author_credentials`, `why_valuable`, `score`, `comment_count`, `full_content*`.
`/api/tags` returns `LOWER(cluster_tag)` with counts — it is a **cluster** list, not the per-post `topics` array.
`/api/source-stats` returns all-time counts per source, no time window.
`/api/subscribe` upserts a row and returns 201; it does not send a confirmation email.
Search (`buildWhere`) matches `title, authors, sentence_summary, paragraph_summary, topics, why_valuable, unique_aspects, author_credentials, cluster_tag` but **not** `cleaned_title`, so a visible title can fail to match while hidden enrichment text produces surprising hits.

### 1.3 Page inventory (as seen live)

- **Feed (`/`)** — header → dismissible intro banner (not persisted) → toolbar (search + Search button, bookmark toggle, dice, Novelty, Sources, Tags) → one 980px white card containing all articles separated by `divide-y`. Infinite scroll, page size 50.
- **Article card** — title (2xl bold, links out), cluster chip (blue-100) + up to 3 topic chips, sentence summary in a gray-100 box, optional 202×202 image top-right, action row (Main Points / Novelty: n/5 / Similar Posts / bookmark), author • long date. "Main Points" reveals a gray-100 panel with markdown bullets + Implication.
- **Similar (`/similar/…`)** — original card in its own white card, then "Similar Posts" heading and a list. Opens in a **new tab** from the feed.
- **About** — white card with a strip of 3 random orange AI-generated illustrations, then 6 prose sections, then 3 gray pill buttons.
- **Digest** — heading, white card, "Digest settings" form: Frequency (button → popover → radios), Sources (button → popover), Tags (button → popover), email + green Subscribe.
- **Data** — white card, gray-50 "Option 1" block with a **blue** CTA, blue-50 "Option 2" block with a **green** CTA, yellow-50 guidelines box. (The CSV export buffers the whole table in memory; on 2026-09-17 it returned 502 and took the Render service down for ~2 min — see the `public-api-state-2026-09` memory note. Don't promote it until the backend streams it.)
- **Footer** — centred "© 2026 AI Safety Feed". Nothing else.

### 1.4 What's working (keep this)

- The **information hierarchy inside a card** is right: skim sentence → cluster/topics → optional deep-dive. Don't restructure it, restyle it.
- **Progressive disclosure** ("Main Points" / novelty note on demand) keeps the feed scannable.
- **Filter popovers with Apply/Cancel** and counts per option are the right pattern for a toolbar (once Cancel actually cancels).
- Infinite scroll with a 600px root margin feels instant.
- Clean-title + tooltip-to-original is a thoughtful touch.
- Mobile layout reflows without breaking; it just gets tall.

---

## 2. Diagnosis: why it reads as "bland"

Ranked by how much each contributes to the feeling.

### 2.1 No typographic voice
Segoe UI / SF at Tailwind defaults is the "unstyled Tailwind starter" look. Titles are `text-2xl font-bold` (24px/700), heavy for a 980px-wide list; body is 16px gray-700. There is no display face, no size scale beyond `sm/base/2xl`, and no tracking/leading decisions. The landing page already solved this (Funnel Display 600 for display, Commissioner 400/500/600 for text) and the app should inherit it.

### 2.2 One thin accent, four actual accents

| Where | Colour | Source |
|---|---|---|
| Cluster chip, links, "Clear filters" | Tailwind `blue-600` / `blue-100` | Tailwind palette |
| Active "Main Points" / "Novelty" button | `#2080f0` | Naive UI `infoColor` default |
| Search input hover/focus ring | `#2080f0` | Hard-coded `inputThemeOverrides` in `SearchBar.vue` |
| Apply (filters), Subscribe (digest) | `#18a058` | Naive UI `primaryColor` default |
| "View API Documentation" CTA | Tailwind `green-600` | `DataView.vue` |
| Loading spinner | `#09f` | `ArticleList.vue` scoped style |

Blue is used so sparingly that the page doesn't feel designed, yet it still shows two blues and two greens. The user perceives "slightly off" without being able to name it.

### 2.3 Flat hierarchy
- **Header:** five identical `bg-gray-100` pills. No active-route state, so on `/about` nothing tells you where you are.
- **Toolbar:** two unlabeled icon buttons (bookmark, dice) next to three labeled ones.
- **Cards:** same title size, same gray box, same 4 tertiary buttons. Nothing rewards the eye for scanning.
- **Surfaces:** one giant white card with `shadow-md` holding 50 articles; gray-100 boxes inside a white card inside a gray-50 page is three nested neutral grays.

### 2.4 Layout / measure
At 980px with no image, the summary box runs full width → ~120 characters per line (Tristan Harris card in the screenshot). Comfortable measure is 60–80ch. With an image, the 202×202 square crop mangles bar charts, podcast art and headshots (Zvi and Brando Benifei cards).

### 2.5 No disclosure motion, no state feedback
- `v-if` toggles with no `<Transition>`; the only animations are the spinner, a `transition-colors` on the wordmark, and the gold `:target` title flash.
- Card has no hover state; only the title underlines.
- Loading = spinner + "refresh after 1 minute, the free tier server is starting up". That copy is the first thing many visitors read.
- No skeleton rows, so infinite-scroll appends "pop".

### 2.6 Brand disconnect with the landing page
`landing-page/index.html` ("Align AIS") uses a warm cream ground `hsl(48 33% 97%)`, Funnel Display, Commissioner, `border-gray-200` cards with `hover:shadow-xl`, and paper-cut illustrations. The feed app uses none of it. Someone arriving from the landing page experiences a visual reset.

---

## 3. Proposed design language

Goal: keep "modern, clean, quiet", add "warm, editorial, opinionated". Think *a well-set research digest*, not a SaaS dashboard.

### 3.1 Typography

Adopt the landing page pairing so the two properties feel like one product. Load via `<link>` in `index.html` (with `preconnect`) or, better, self-host the WOFF2 files in `public/fonts` — a CSS `@import` blocks rendering longer than either.

```css
/* src/assets/main.css */
@import "tailwindcss";

@theme {
  --font-display: "Funnel Display", ui-sans-serif, system-ui, sans-serif;
  --font-sans: "Commissioner", ui-sans-serif, system-ui, sans-serif;
}
```

Where the display face goes is a real choice:
- **Option A (recommended to try first):** Funnel Display for the wordmark and page headings only; card titles in Commissioner 600. Cohesive without turning every feed item into a miniature hero.
- **Option B:** Funnel Display on card titles too. More personality, more visual noise across 50 items. Prototype both on one screen and pick.

Proposed scale (desktop / mobile):

| Role | Size / weight / leading | Notes |
|---|---|---|
| Wordmark | 22px / display 700 / tight | Pair with a small mark (§4.1) |
| Page headings | 28px / display 600 | About, Digest, Data, Similar |
| Card title | 20px / 600 / 1.35 (18px mobile) | Down from 24/700. `text-wrap: balance`. **Don't clamp** — research titles carry information. |
| Sentence summary | 16px / 400 / 1.6, `text-ink-2` | Drop the gray box (§4.4) |
| Body (about, expanded panel) | 16px / 1.6, max-width 68ch | |
| Meta (source, date, authors) | 14px / 500 / `text-ink-3`, tabular-nums | |
| Chips | 12.5px / 500 | |
| Section labels ("Main points", "Implication") | 13px / 600 / sentence case, `text-ink-3` | Replaces the current 14px gray-500 label. Avoid tiny uppercase tracking. |

`font-variant-numeric: tabular-nums` on dates and counts; `text-wrap: pretty` on summaries.

*Alternative if you'd rather not tie the app to Funnel Display:* Inter Tight (display) + Inter (text), or Newsreader (serif display) + Inter for a more editorial feel. Reusing the landing page fonts is free cohesion.

### 3.2 Colour tokens

Define everything once in a top-level `@theme` block and reference tokens everywhere. Warm neutrals instead of Tailwind's cool grays give the "paper" feel without losing cleanliness. **Start small**: ground, surface, three inks, one accent, semantic danger. Cluster hues are a phase-2 experiment, not part of the foundation.

```css
@theme {
  /* Ground & surfaces */
  --color-ground:      #f8f7f3;   /* warm off-white ≈ landing page hsl(48 33% 97%) */
  --color-surface:     #ffffff;
  --color-surface-2:   #f2f1ec;   /* inset panels */
  --color-line:        #e6e3db;   /* hairlines */
  --color-line-strong: #d6d2c8;

  /* Ink — check every pairing with a contrast tool; ink-3 must stay ≥ 4.5:1 on surface-2 */
  --color-ink:   #252a30;
  --color-ink-2: #4b535c;
  --color-ink-3: #5f6771;

  /* One accent, used deliberately; replaces both blues and both greens */
  --color-accent:      #315ea8;
  --color-accent-hover:#28508f;
  --color-accent-soft: #edf2fa;
  --color-accent-ink:  #244477;

  /* Novelty ramp (1→5), only for the novelty meter */
  --color-novelty-low:  #d9d5cb;
  --color-novelty-high: #c9832a;

  /* Semantic */
  --color-danger:  #b4382d;
  --color-success: #2f7a4f;

  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 14px;
  --shadow-card: 0 1px 2px rgb(0 0 0 / 0.04), 0 0 0 1px var(--color-line);
  --shadow-pop:  0 8px 24px rgb(0 0 0 / 0.10), 0 0 0 1px var(--color-line);
}
```

Hex rather than oklch on purpose: Naive UI's theme engine parses colours in JS and needs hex/rgb, and keeping one hex source lets a tiny script generate both the CSS tokens and `src/theme/naive.js` so they can't drift.

Rules:
- **Accent** is for: links, the active filter state, the one primary CTA on a page, the bookmarked icon. Not for chips.
- **Novelty ramp** is for the novelty meter only.
- Green appears only for "success" feedback.
- **Cluster hues (phase 2, optional):** if you want colour to carry category, use it as a 6px dot inside a neutral chip with the label next to it, with a defined fallback for unknown clusters. Don't paint card rails or chip backgrounds in seven hues; that reintroduces the "too many accents" problem you're fixing. Add the missing "Biorisk & Other GCRs" icon to the cluster icon map regardless.

Wire Naive UI to the same tokens in `App.vue`:

```vue
<n-config-provider :theme-overrides="naiveTheme">
```
```js
// src/theme/naive.js — generated from the same hex source as the CSS tokens
export const naiveTheme = {
  common: {
    primaryColor: "#315ea8", primaryColorHover: "#28508f", primaryColorPressed: "#1f4078", primaryColorSuppl: "#28508f",
    infoColor: "#315ea8", infoColorHover: "#28508f", infoColorPressed: "#1f4078", infoColorSuppl: "#28508f",
    borderRadius: "10px", borderRadiusSmall: "6px",
    fontFamily: "Commissioner, ui-sans-serif, system-ui, sans-serif",
    textColorBase: "#252a30", textColor1: "#252a30", textColor2: "#4b535c", textColor3: "#5f6771",
    borderColor: "#e6e3db", dividerColor: "#e6e3db", popoverColor: "#ffffff",
  },
};
```
Naive's colour tokens are independent defaults: setting `primaryColor` does not derive hover/pressed/suppl, and `textColorBase` does not replace `textColor1/2/3`. Set each explicitly. Then delete the hard-coded `inputThemeOverrides` in `SearchBar.vue`, the `#09f` spinner, and the Tailwind `green-600` on the Data page.

### 3.3 Surfaces and spacing

- Page ground: `--color-ground` (warm), not `gray-50`.
- **Keep the single continuous stream** for now, but drop `shadow-md` for a hairline border, inset the dividers (`mx-6`), and cut the nested padding (`li.pt-14` + `article.px-6` + gray box padding stack up). One-card-per-article is the alternative; it adds a boundary and ~24px per item to an already tall feed, so prototype it only if the stream still feels undifferentiated after the type/colour pass.
- Inset panels (expanded main points) use `--color-surface-2` with no border, radius-md.
- 8px spacing grid. Standardise on `p-5 sm:p-6` for cards, `gap-2` for chip rows, `gap-3` for button rows.
- Content column: keep 980px max, but constrain **text** inside a card to `max-w-[66ch]` so summaries stay readable when there's no image.

### 3.4 Elevation and borders
Hairline (`--color-line`) + a very soft shadow instead of `shadow-md`. Popovers get `--shadow-pop`. Nothing else casts a shadow.

### 3.5 Motion
- `<Transition>` on Main Points / novelty panels: 180ms height+opacity (`grid-template-rows: 0fr → 1fr`).
- Chip / button hover: background only, 120ms.
- Skeleton shimmer for initial load and infinite-scroll appends (3 placeholder cards).
- Respect `@media (prefers-reduced-motion: reduce)`.
- No whole-card hover lift: a card holds five distinct actions, and lifting the whole thing on hover implies it is one target.

### 3.6 Dark mode (phase 3)
`@theme` must be top-level in Tailwind v4; you cannot nest it under a selector. Dark mode is: keep the `@theme` block as the light defaults, then override the *underlying* CSS variables under `[data-theme="dark"]` (or use `@theme inline` so utilities read from `var(--color-…)` at use time), plus Naive's `darkTheme` with a matching overrides object. Don't attempt it before tokens exist.

---

## 4. Component-by-component recommendations

### 4.1 Header (`AppHeader.vue`)

**Problems:** five equal-weight gray pills; no logo mark; no active route; wraps to two rows on mobile; Discord SVG path duplicated in 3 files; `API_BASE_URL` prop is unused; no `<nav>` landmark or skip link.

**Proposal:**
- **Left:** a small mark (the existing `public/robot.svg` at 24px, or a monogram) + wordmark in the display face.
- **Primary nav:** `Feed · Digest · About · Data` as text links inside `<nav aria-label="Primary">`, underline/ink-strong active state via `router-link-active`. Not buttons.
- **Far right, secondary:** Discord and Feedback as 32px icon buttons with tooltips and `aria-label`s.
- **Mobile (< 640px):** wordmark + Digest CTA + a menu button, or a horizontally scrollable nav row. Currently 5 pills wrapping to two rows above an 8-line intro banner pushes the first article ~900px down on a 390px phone.
- Make the header `sticky top-0` with `backdrop-blur` and a hairline bottom border. `ArticleCard` already assumes a sticky header (`:target { scroll-margin-top: 100px }`).
- Add a "Skip to feed" link as the first focusable element.
- Extract `DiscordIcon.vue`; delete the two other copies.

### 4.2 Intro banner (`FeedView.vue`, and the unused `IntroCard.vue`)

**Problems:** reappears every visit; a 4-line paragraph (8 on mobile) is the first thing on the page; `IntroCard.vue` is dead code holding older "V1 MVP Release Notes" copy.

**Proposal:**
- Persist dismissal in `localStorage` and default to hidden for returning visitors.
- Turn it into a **one-line value prop + archive stats** strip: "High-signal AI safety writing, summarised. **1,706 posts across 33 sources.**" Both numbers come from `/api/source-stats`. (Don't claim "updated daily" or "N per week" — the API has no time-windowed count; add one if you want freshness stats.)
- Delete `IntroCard.vue`, `helpers.js` (empty), `IconArrowBack.vue` (unused).

### 4.3 Toolbar and filters (`FeedView.vue`, `SearchBar.vue`, `SourceFilters.vue`, `TagFilters.vue`, `NoveltyFilter.vue`)

**Correctness first (these are bugs, not style):**
1. **Novelty filter semantics.** The button says "Novelty 4+" and the slider label says "Minimum Novelty Score", but `/api/content` maps `novelty_bucket=4` to `71 ≤ score ≤ 90` — an exclusive bucket. Selecting 4 hides every 5/5 post. Either send `novelty_min` and change the backend to `>=`, or relabel the control "Novelty is exactly N". Recommend the former.
2. **Cancel doesn't cancel.** In `SourceFilters.vue` and `TagFilters.vue`, Cancel just sets `showPopover = false`; the edited `localSelection` survives and is shown on next open. `SourceFilters` even styles its trigger's active state from the *draft*. Reset the draft from props on open, and discard on every non-Apply dismissal (Cancel, outside click, Escape). `NoveltyFilter`'s Cancel resets but outside-click doesn't.
3. **"None selected" means "all".** `useArticles.fetchArticles` only appends `sources`/`tags` when the array is non-empty, so unchecking everything returns the unfiltered feed. Decide what empty means (probably "show nothing" with an inline hint, or disallow it) and enforce it in the composable, not the API.
4. **"Tags" filters clusters.** `/api/tags` is `SELECT LOWER(cluster_tag)`. Rename the control **"Categories"** (or "Clusters") so it matches the cluster chip on the card, and don't imply it filters the per-post topic chips.
5. **Counts are archive totals, not result counts.** `FeedView` passes `allSourceCounts` to the popover while the filtered `sourceCounts` the composable also fetches goes unused. Either label them as totals or wire the faceted counts through consistently.

**Then the design:**
- Search: keep the input *and* a visible submit affordance (touch users, and it signals when a request fires), but make it a compact icon button inside the input rather than a second bordered button. Show the applied query (`queryTerm`) somewhere visible when it differs from the draft (`searchTerm`), e.g. as a removable chip in the active-filter row. Add a real `<label>` (visually hidden) and `/` to focus.
- Replace the dice with a **Sort** menu: `Newest · Highest novelty · Random`. Backend needs `order_by=novelty` (one line). See §5 for the random-pagination bug that has to be fixed at the same time.
- Bookmark toggle: label it ("Saved") and show a count badge when > 0.
- Add an **active-filter chip row** under the toolbar: `Sources: LessWrong, EA Forum ×`, `Categories: 3 selected ×`, `Novelty ≥ 4 ×`, `"query" ×`, `Clear all`. This replaces the 2px outline hack.
- Extract a single `FilterButton.vue` (icon, label, active, disabled) and a `useDraftSelection()` composable for the open/reset/apply/discard logic, and use both in `SourceFilters`, `TagFilters`, `NoveltyFilter`, and the digest form.
- Popover content: filter-within-list input for Sources (33 entries), right-aligned counts in a muted tabular column, "Select all / none" as text links rather than a checkbox that reads as "none" when 32/33 are checked. Give the Tags popover the same `max-h-60 overflow-y-auto` the Sources one has.
- Sync filter state to the URL (`?q=&sources=&cats=&novelty=&sort=`) so views are shareable and Back works. Design notes in §5.

### 4.4 Article card (`ArticleCard.vue`)

This is 80% of what users look at. Proposed anatomy, top to bottom — note the order change: **source/date → title → summary → category/topics → actions**, so the skim sentence comes before the metadata chips rather than after them.

```
┌──────────────────────────────────────────────────────────────┐
│ [favicon] LessWrong · 3d ago                                 │  ← meta row, 14px, ink-3
│ Title, 20/600, balanced, unclamped                      ┌──┐ │
│                                                         │img│ │  ← reserved 4:3 box, contain
│ Sentence summary, 16px ink-2, no box, max 66ch.         └──┘ │
│                                                              │
│ ◉ Core AI Safety & Alignment   Deceptive Alignment   CoT  +2 │  ← neutral chips; "+N" expands
│                                                              │
│ Main points ⌄   AI novelty 3/5 ⌄   Similar →   ☆   Authors   │  ← ghost buttons, ink-2
└──────────────────────────────────────────────────────────────┘
```

Specific changes:

1. **Show the source.** Meta row at the top: `source_type`, a 16px favicon (Google's `s2/favicons?domain=<host>&sz=32`, or a local map for the top 10 sources), then a relative date (`2h ago`, `3d ago`, then `Sep 17` after a week; full date in `title`). Authors move to the bottom-right, capped at 2 + "et al." with the full list in a tooltip that is also keyboard-reachable (`<details>` or a focusable trigger).
2. **Title:** 20px/600, `text-wrap: balance`, no clamp. Keep the external link, add an `↗` on hover to signal it leaves the site.
3. **Chips:** cluster chip keeps its icon (stroke 1.75, not 1 — at 16px with stroke 1 the icons are nearly invisible) and is **clickable** to filter by that category. Topic chips: neutral, no `ring-1` (ring + fill + rounded-full is three treatments for one element), and a `+N` chip that expands the rest of `topics` inline.
4. **Summary without the gray box.** With a proper type scale it doesn't need a container. If you want separation, a 2px left rule in `--color-line-strong`.
5. **Novelty stays numeric and visible:** "AI novelty 3/5" as the button label with five small filled/unfilled dots beside it in the novelty ramp, expanding to the note. Don't hide the number in a tooltip. Handle `novelty_score == null` with no control rather than "0/5".
6. **No novelty-driven emphasis.** Novelty is not importance; a 2/5 foundational explainer deserves the same legibility as a 5/5 hot take. If you want to experiment, add an optional amber dot to ≥ 4 posts and never demote.
7. **Action row:** ghost buttons (no border, ink-2, hover bg surface-2). "Main Points" gets a chevron that rotates when open plus `aria-expanded` and `aria-controls`. Bookmark: outline → filled accent when saved, `aria-pressed`, 120ms scale pop. Add a **"Copy link"** action for `source_url`.
8. **Images:** reserve a fixed 4:3 box (200×150 desktop) with `object-contain` on a `surface-2` background for unknown imagery (charts and screenshots stop being cropped), `object-cover` only when `cleaned_image` is set (those are already square-ish). On narrow screens, don't render the image by default; offer a "Show thumbnails" toggle (persisted) instead of the current 130px square floating left of nothing. `alt` is currently the AI *image prompt*; since the image is a duplicate link to the article, use `alt=""` and give the link an `aria-label`.
9. **Expanded panel:** section labels per §3.1, real list styling for the markdown (install `@tailwindcss/typography` and use `prose prose-sm`, or style `ul/li/strong` explicitly — right now `prose` is a no-op), 16px gap between Main points and Implication instead of an `<hr>`, and a small "AI-generated summary" provenance label so readers can tell the publisher's words from the model's. Wrap in `<Transition>`.
10. **`:target` highlight:** the gold `highlight-fade` keyframe uses off-palette `#b8860b`; use `--color-accent-soft` on the whole card instead.
11. **Consistency bug:** `unique_aspects` and `author_credentials` sections render only when present. The feed endpoint doesn't select them; bookmarks and similar do (§1.2). Pick one: add them to the feed SELECT or drop the sections.
12. **Novelty note links:** `ID 123` → `#post-123` only works if post 123 is in the current list. Link to `/similar/…-123` (or a future `/post/123`) instead.
13. **Similar page's original card can't be bookmarked.** `SimilarPage.vue` renders the original `ArticleCard` without `:is-bookmarked` or `@toggle-bookmark`, so the button renders and does nothing. Wire it (and see `useBookmarks` in §5).
14. **Markup validity:** the Similar action nests an `<n-button>` inside a `<router-link>` (button inside anchor); the author list nests `<li>` inside a `<span>`. Make Similar a styled link, and render authors as a plain inline list.

### 4.5 List container, loading, empty and error states (`ArticleList.vue`, `FeedView.vue`)

- **Skeleton rows** (3 cards) replace the spinner, for initial load and appends.
- Cold-start copy: if the first fetch takes > 4s, *then* show "The server is waking up, this can take up to a minute" under the skeletons. Not by default.
- **Append errors must not wipe the feed.** `FeedView` renders `<div v-if="error">` *instead of* the list, so a failed page 3 fetch replaces 100 loaded articles with an error line, and `useArticles` sets `allLoaded = true` on error, conflating failure with completion. Keep the list, show an inline "Couldn't load more — Retry" row, and keep `allLoaded` false.
- **Visible "Load more" button** at the sentinel as a fallback for when the observer doesn't fire (and for deliberate, keyboard-driven paging).
- Empty state: "Nothing matches" + the active-filter chips + "Clear filters" as a secondary button. Distinguish "no bookmarks yet" from "bookmarks exist but none match".
- Error styling uses the danger token, not `bg-red-100 border-red-400`.
- HTML validity: the `<ul>` has `<div>` children for loading/error/empty. Move states outside the `<ul>`.
- "You've reached the end" marker when `allLoaded`.
- Announce result counts and loading to screen readers (`aria-live="polite"` region).

### 4.6 Similar page (`SimilarPage.vue`)

- **Keep the new-tab behaviour for now.** In-app navigation is the right end state, but the router's `savedPosition` only restores scroll coordinates; coming back would remount `FeedView`, refetch page 1, and lose everything past 50 items and every expanded card. Switch to in-app navigation once feed state lives in a shared store (Tier 2, together with URL sync).
- Add a page header: "← Back to feed" + a "Posts similar to" eyebrow above the original card.
- Visually distinguish the original (accent-soft background or an "Original" label).
- Fix the request race: `route.params` changes launch new fetches without cancelling the previous ones, so a fast back-and-forth can paint stale results. Reuse the `AbortController` pattern from `useArticles`.
- Don't call `useArticles()` here just for bookmarks — it fires the whole feed/metadata fetch chain on mount. Use `useBookmarks()` (§5).
- Set default `useHead` on every route, not just this one (with the caveat in §5 that client-side head tags don't help social previews).

### 4.7 Digest form (`EmailSubscription.vue`, `DigestView.vue`)

**Problems:** a form built from feed-toolbar popovers. "Frequency" is a button → popover → radio group for a two-option choice; Sources/Tags require opening a popover, pressing Apply, then reading a hint line to see what's selected. Subscribe is Naive green. On a 390px phone, three stacked paddings (`App.vue` main, `DigestView`, `EmailSubscription`) plus a forced single-row email + Subscribe leaves the input ~180px wide. `NSelect` imported but unused; `NoveltyFilter` commented out.

**Proposal:**
- Frequency: a **segmented control** (Daily | Weekly) with a one-line description under it.
- Categories: inline selectable chips (there are ~7; all on by default, click to toggle, "All / none" links).
- Sources: a **searchable multi-select** with a compact summary ("All 33 sources" / "5 of 33"), not 33 inline chips.
- Skip the "N posts per week" preview unless the backend gains a windowed count; the archive totals can't produce it honestly.
- Stack email and Subscribe on narrow screens; Subscribe is the accent colour and the only filled button on the page.
- Success state: an inline confirmation card — "You're subscribed. First weekly digest goes out Monday." Don't say "check your inbox"; the subscribe endpoint sends nothing.
- Wrap `NMessageProvider` once in `App.vue`.

### 4.8 About and Data pages

- **About:** the three orange illustrations are the only saturated block in the app and don't match anything else; they also have no reserved dimensions and load after mount (CLS). Either recolour, use one wide image with `width`/`height`, or drop them for a typographic hero. Tighten the copy into "What / How / Who"; move "Technology Stack" to the bottom in muted text.
- **Data:** unify the two CTAs (both accent, or one filled + one outline). Hide or replace the CSV button until the export streams. Show the API base URL and one `curl` example in a code block.
- Both pages: use the header nav instead of a bottom row of pill links; add "← Back to feed" at the top of the card.

### 4.9 Footer (`AppFooter.vue`)

Keep it short: one row of muted links (Discord · Feedback · Submit content · Data · Landing page) + "© 2026 AI Safety Feed". A three-column footer under an infinite feed is never reached; put anything important in the header instead.

---

## 5. Code and architecture changes that unblock the above

Roughly in dependency order.

1. **Tokens:** top-level `@theme` in `main.css` (§3.2), a hex source of truth, a generated `src/theme/naive.js`, and `<n-config-provider>` + `<n-message-provider>` in `App.vue`. Delete the inline `inputThemeOverrides` in `SearchBar.vue`.
2. **Fonts:** `<link rel="preconnect">` + stylesheet link in `index.html`, or self-hosted WOFF2 with `font-display: swap` (swap alone doesn't stop reflow — measure it; consider `size-adjust` on the fallback).
3. **`@tailwindcss/typography`** (or explicit markdown styles) so the expanded panel's lists render.
4. **`useBookmarks()`** extracted from `useArticles`: owns the `Set`, persistence, a `storage` event listener so two tabs don't overwrite each other, an "Undo" toast on removal, and export/import. `useArticles` and `SimilarPage` consume it.
5. **Shared primitives, minimal set:** `AppButton.vue` (`primary | secondary | ghost | icon`), `Chip.vue`, `FilterButton.vue` + `useDraftSelection()`, `NoveltyMeter.vue`, `SkeletonCard.vue`, `DiscordIcon.vue`, `Collapse.vue`. Don't split `ArticleCard` into five subcomponents up front; clean the template (stale "MOVED UP" comments, dead branches) and split only where something is reused.
6. **Filter state model + URL sync (design this as one piece):**
   - Initialise filters from `route.query` *after* metadata loads, and stop `fetchAllSourceStats` / `fetchAvailableTags` from overwriting a URL-provided selection with "all".
   - Committed changes (Apply, Search submit, sort change) use `router.push` so Back undoes them; normalisation uses `router.replace`.
   - `scrollBehavior` currently returns `{ top: 0 }` for every non-history navigation, including query changes — return `false` for same-route query updates.
   - Guard against the reciprocal watchers (route → state → route) issuing duplicate fetches.
   - Carry `sort` through `loadMore`; today `fetchRandomOrder` asks for random but `loadMore` appends in date order, so page 2 of a random feed is page 1 of the date feed. Even with a consistent `ORDER BY RANDOM()`, offset paging overlaps; either seed the order (`setseed()` + `random()` in one transaction, or order by `md5(id || seed)`) or make Random a single-batch "shuffle" that disables infinite scroll.
7. **Add `order_by=novelty`** (and `novelty_min`) to `/api/content`, and add `cleaned_title` to the search `ILIKE` list.
8. **Lazy-load routes** (`() => import(...)`) so About/Data/Digest don't ship with the feed bundle. Fetch metadata and the first page in parallel instead of serially in `onMounted`.
9. **Head/SEO:** static defaults (title, description, OG image, `theme-color`) in `index.html`; `useHead` per route for the tab title. Note that client-only OG tags don't reach link-preview crawlers; article-specific previews need prerendering or a server route.
10. **A11y pass:** every `focus:outline-none` gets `focus-visible:ring-2 ring-accent`; `aria-expanded`/`aria-controls` on disclosures; `aria-pressed` on the bookmark toggle; `aria-label` on every icon-only button; `<nav>` landmark + skip link; `aria-live` for results; the `<ul>` and button-in-link validity issues; contrast check on all three inks against both surfaces.
11. **Housekeeping:** delete `IntroCard.vue`, `helpers.js`, `IconArrowBack.vue`, unused imports (`NSelect`, `NIcon`, `defineProps`/`defineEmits`, `NMessageProvider` in FeedView), the Vite-template `README.md`, and the ~40 `console.log` lines in `useArticles.js`. Run `eslint --fix`.
12. **Images:** `width`/`height` on About images; `decoding="async"` everywhere; consider proxying card images through Cloudinary (already used on About) with `f_auto,q_auto,c_pad,ar_4:3,w_400` so sizing is server-side and consistent.

---

## 6. Things I'd explicitly *not* do

- Don't add a sidebar or a multi-column layout. The single column is right for a reading feed.
- Don't add illustrations or gradients to the feed itself. Warmth comes from type, the ground colour, and restraint.
- Don't build user accounts for bookmarks yet; `localStorage` + export/import is fine until there's a reason.
- Don't switch component libraries. Naive UI is fine once themed; the cost is in the *unthemed* defaults.
- Don't make every card show Main Points by default. Progressive disclosure is the feature.
- Don't paint clusters in seven colours on day one, and don't let novelty change title weight.
- Don't split the feed into one card per article until the type/colour pass has been judged.

---

## 7. Prioritised roadmap

### Tier 1 — Correctness + foundation (3–4 days)
1. **Fix the lying controls:** novelty `>=` semantics, Cancel/outside-click discards drafts, empty selection semantics, rename Tags → Categories, Similar-page bookmark wiring, append error keeps the list + Retry, `Load more` fallback.
2. **Tokens + fonts + Naive theme** (§3.1–3.2) → kills the four-accent problem in one commit.
3. **Card restyle** (§4.4): meta row with source + relative date, title 20/600 unclamped, summary before chips and without the box, ghost actions, numeric novelty + dots, reserved 4:3 image box, typography plugin for the expanded panel, `<Transition>`.
4. **Header** (§4.1): mark + wordmark, text nav with active state, icon buttons, sticky, `<nav>` + skip link.
5. **Mobile sizing:** compact header, hide thumbnails by default, stack the digest email row, bound popover heights.
6. **A11y basics:** focus-visible rings, aria on disclosures/toggles, markup validity.
7. Extract `AppButton`, `Chip`, `FilterButton` + `useDraftSelection`, `useBookmarks`; delete dead files; skeleton loader.

### Tier 2 — State, navigation, digest (2–3 days)
8. Filter state model + URL sync + active-filter chip row + "Clear all" (§5 item 6).
9. Sort menu (Newest / Highest novelty / Random-as-shuffle) replacing the dice; backend `order_by=novelty`.
10. Shared feed store, then Similar page in-app navigation + page header + request cancellation.
11. Persisted intro dismissal; intro → archive-stats strip.
12. Digest form rebuild (segmented frequency, category chips, searchable sources, honest confirmation).
13. Lazy routes, parallel initial fetches, static head tags in `index.html`, self-hosted fonts.

### Tier 3 — Polish and reach (ongoing)
14. Dark mode via tokens (§3.6).
15. Footer links; About tightened; Data CTAs unified and CSV made safe on the backend.
16. Cluster-colour dots experiment; "+N topics" expansion; clickable category chips if not already done in Tier 1.
17. Bookmark undo, export/import, "Saved on this browser" hint.
18. Keyboard shortcuts (`/` search, `j`/`k` next/prev, `b` bookmark, `o` open).
19. Full a11y audit with axe; contrast fixes.
20. Reading-time estimate on cards (needs content length from the pipeline or API).

---

## 8. Open questions for Matt

1. **Display face placement:** wordmark + page headings only (Option A), or card titles too (Option B)? Recommend prototyping both on one screen.
2. **Accent hue:** the tokens propose `#315ea8` (deep blue). Keep close to the current blue, or go teal/green to stand apart from every other blue AI site?
3. **Continuous stream vs one card per article:** the revised recommendation is to keep the stream and judge after the type/colour pass. Agree?
4. **Cluster colour:** worth a phase-2 experiment as small dots, or keep categories fully neutral?
5. **Similar Posts:** stay a separate page (in-app once feed state is shared), or return to an inline drawer?
6. **Data page:** hide the CSV button until the backend streams the export?
7. **Empty selection semantics:** should unchecking every source/category show nothing, or snap back to "all"?

---

## 9. Second-opinion review (Codex, gpt-6-astra, medium) — what changed and why

The full critique is in `DESIGN_REVIEW_codex-critique.md`. Every factual claim below was re-verified against `backend/server.js` and the Vue source before being accepted.

**Accepted and folded in**
- Novelty filter is an exclusive bucket, not a minimum (`server.js` `novelty_bucket` switch). New Tier 1 item.
- `/api/tags` returns clusters; the control is mislabeled "Tags". Renamed to Categories throughout.
- Cancel in Sources/Tags popovers doesn't discard the draft; Sources' trigger styles from the draft. Added `useDraftSelection`.
- Empty selection is sent as "no filter". Added as an open question + Tier 1 fix.
- `FeedView` swaps the whole list for an error on append failure; `allLoaded` set on error. Tier 1.
- Random order + `loadMore` in date order; offset paging over `RANDOM()` overlaps. Added seeded-order / shuffle options.
- Similar page's original card has no bookmark binding. Tier 1.
- `useArticles` state is per-invocation; `SimilarPage` instantiating it fires unneeded fetches. Added `useBookmarks`.
- `@tailwindcss/typography` is not installed; `prose` is a no-op. Explains the missing list markers in the expanded panel.
- Search excludes `cleaned_title`. Added to backend change list.
- `/api/subscribe` sends no email, and `/source-stats` has no time window. Removed "Check your inbox" and the per-week estimate.
- Tailwind v4 `@theme` cannot be nested under a selector; dark-mode guidance rewritten.
- Naive UI theme tokens don't derive from each other; overrides expanded; hex source of truth instead of hand-mirrored oklch.
- Search focus blue is hard-coded and the Data page green is Tailwind; `NConfigProvider` alone can't remove all four accents. Colour table expanded.
- "Zero motion" was overstated (spinner, wordmark hover, `:target` flash exist). Softened to "no disclosure motion".
- `line-clamp-3` contradicted the two-line diagram; titles are now unclamped.
- Type scale: display face on card titles made optional; section labels moved from 11px uppercase to 13px sentence case; body 16px; meta 14px.
- Cluster palette demoted from foundation to a phase-2 dot experiment; novelty-driven title de-emphasis removed; whole-card hover lift removed; three-column footer replaced with a single row.
- Card anatomy reordered: summary before chips.
- Image handling: reserved box with `object-contain`, no thumbnails on narrow screens by default, `alt=""` for the duplicate image link.
- Keep the Search submit affordance; keep Similar in a new tab until feed state is shared; searchable multi-select rather than 33 inline chips in the digest.
- Similar page request race; digest mobile padding stack; Tags popover lacks a height bound; About images have no reserved dimensions; routes eagerly imported; metadata fetched serially.
- Correctness, a11y, mobile sizing and recoverable errors moved into Tier 1; estimate revised from "2–4 days" to roughly a week overall.
- Added ideas: bookmark undo + export/import, clickable category chips, "+N topics", thumbnail preference, copy link, AI-provenance label, visible Load more.

**Not accepted, with reasons**
- *"CSV failure is not established by source inspection."* It was established operationally on 2026-09-17 (502 → service 503 for ~2 min, recorded in the project memory `public-api-state-2026-09`); Codex just couldn't see that note. The claim stands with its evidence cited.
- *"Bookmarks do not normally return every column."* `CONTENT_COLS` is every column minus the two embeddings, which is the point: the feed omits `unique_aspects`/`author_credentials` and by-ids/similar include them. Wording tightened to "every non-embedding column"; the inconsistency stands.
- *Keep Similar in a new tab permanently.* Accepted as an interim; in-app navigation is still the target once feed state is shared (Tier 2).
- *"Defer extracting primitives."* Partially accepted: the list was cut from 8 primitives + 5 card subcomponents to 7 primitives and no card split. The button-class duplication across 9 files is the thing most likely to make the restyle drift, so `AppButton`/`Chip`/`FilterButton` stay in Tier 1.

## 10. Implementation log (2026-09-18)

The twelve "80/20" items from §7 Tier 1 shipped as uncommitted changes in `frontend/` plus the novelty block in `backend/server.js`. Execution: five parallel Opus agents with disjoint file ownership, a build/lint verifier, a Codex (gpt-6-astra, medium) final check, then a manual cleanup pass. After-screenshots are in `docs/screenshots/after-*.png`.

**Landed**
- Tokens + fonts + Naive theme (`main.css` `@theme`, `src/theme/naive.js`, `NConfigProvider` and `NMessageProvider` in `App.vue`, Google Fonts links and meta tags in `index.html`). Card titles use Commissioner (Option A in §3.1); the wordmark and page headings use Funnel Display.
- Card: source favicon + name + relative date meta row, 20/600 unclamped title, summary before chips and without the box, ghost actions, reserved 4:3 image box (`object-contain`, `object-cover` only for `cleaned_image`), `<Transition name="collapse">` on both panels, `prose prose-sm` via the typography plugin, "AI-generated summary" provenance line.
- Header: sticky, mark + wordmark, text nav with active state, Feedback/Discord icon buttons, skip link; on phones the nav wraps to its own row.
- Feed/list: warm ground, hairline container with soft shadow, inset dividers, delayed cold-start hint, end-of-feed marker, append errors keep the list and offer Retry, intro dismissal persisted.
- Filters: novelty is a minimum (`>=`) in the backend; Cancel and re-open discard the draft; "Tags" renamed "Categories" (the endpoint returns clusters); active state via the accent ring.
- Cleanup: `btn-secondary` utility in `main.css` replaces 15 pasted class strings; `DiscordIcon.vue` reused in header, About and Data; `eslint.config.mjs` (ESLint 9 flat config) replaces `.eslintrc.cjs`; deleted `IntroCard.vue`, `IconArrowBack.vue`, `helpers.js`; dead novelty code and debug logging removed from the digest form; Similar page and footer retokened; unused `API_BASE_URL` prop plumbing removed.

**Codex final-check findings accepted:** stale append error leaking into the Saved view; future dates rendering "just now"; doubled border + shadow outline; dividers not inset; Similar Posts nested a button inside a link; cold-start timer measured component age rather than request time; "All categories" checkbox inside the scrolling group.
**Deliberately kept against Codex:** the accent-tinted cluster chip (it is the only thing distinguishing category from topic chips) and `object-cover` for cleaned images (they are pre-cropped).

**Verification:** `npm run build` passes; `npx eslint .` reports 0 errors and 58 style warnings (43 `vue/attributes-order`, 8 `vue/attribute-hyphenation`, 5 pre-existing `required` + `default` props, 2 sanitised `v-html`); `node --check server.js` passes; the verifier also fixed a pre-existing regex in `formatters.js` that contained literal backspace bytes where `\b` was intended.

**Known leftovers:** `EmailSubscription.vue` is excluded from ESLint (the only TypeScript SFC; no TS parser installed); `formatters.js`, `index.html` and `NoveltyFilter.vue` are CRLF; the main chunk is ~790 kB (Naive UI) until routes are lazy-loaded (Tier 2); the toolbar still wraps "Categories" onto a second row on phones.

## Appendix A — Screenshot notes (2026-09-17, live site)

Captured with dev-browser; files in `docs/screenshots/`:
`feed-desktop-top.png`, `feed-desktop-scrolled.png`, `feed-desktop-expanded.png`, `feed-sources-popover.png`, `feed-mobile-top.png`, `feed-mobile-scrolled.png`, `about-desktop.png`, `digest-desktop.png`, `data-desktop.png`.

- Desktop 1280: header pills equal weight; intro banner 2 lines; first card's 202px square crop of a robot arm looks fine, second (Dwarkesh podcast art) fine, third (Zvi bar chart) cropped so labels are illegible, fifth (Brando Benifei) crops a face and text. Cards with no image run summary text ~120ch wide.
- Expanded "Main Points": readable but dense; bold lead-ins help; **no list markers** (typography plugin absent); active button is Naive blue `#2080f0`, visibly different from the chip blue.
- Sources popover: Apply button is Naive green; 33 sources in a 240px scroll area with no search.
- Mobile 390: header wraps to two rows ("Data" + Discord on row 2); intro banner 8 lines; filter row wraps ("Tags" alone on row 2); 130px square image sits above the title, left-aligned, with dead space to its right; first article title appears ~900px down.
- Digest: popover-buttons-in-a-form pattern; Subscribe is green.
- Data: blue CTA and green CTA on the same page.
- About: orange illustration strip is the only saturated colour block in the whole app.

## Appendix B — Files touched by Tier 1

`src/assets/main.css`, `index.html`, `src/App.vue`, `src/theme/naive.js` (new), `src/components/ui/*` (new), `src/composables/useBookmarks.js` (new), `src/composables/useDraftSelection.js` (new), `src/components/AppHeader.vue`, `ArticleCard.vue`, `ArticleList.vue`, `SearchBar.vue`, `SourceFilters.vue`, `TagFilters.vue`, `NoveltyFilter.vue`, `EmailSubscription.vue`, `src/views/FeedView.vue`, `SimilarPage.vue`, `src/composables/useArticles.js`, `backend/server.js` (novelty `>=`, `order_by=novelty`, `cleaned_title` in search). Deletions: `IntroCard.vue`, `icons/IconArrowBack.vue`, `utils/helpers.js`, `README.md` (replace with a real one).
