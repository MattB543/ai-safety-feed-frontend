The visual direction is sound, but the plan treats several broken interactions as settled foundations. Fix those first; otherwise the refresh will make unreliable controls look more authoritative. No files changed.

**1. FACT CHECK**

- **Novelty “minimum” is incorrect today.** [NoveltyFilter.vue:51](C:/Users/matth/projects/ai-safety-feed/frontend/src/components/NoveltyFilter.vue:51) displays “4+”, but `backend/server.js:779–810` selects the **exclusive bucket**, so 4 excludes 5. The proposed “Novelty ≥ 4” chip would perpetuate this bug.
- **API-field diagnosis is mostly correct.** `server.js:813–818` returns source, authors, summaries, implication, topics, novelty and image fields, but no reading time, `unique_aspects`, or `author_credentials`. However, `CONTENT_COLS` excludes both embeddings (`server.js:199–211`); bookmarks do not normally return “every column.” Similar results use their own endpoint, not `/by-ids`, and return no generated similarity explanation (`server.js:1095–1116`).
- **Counts cannot support the proposed digest estimate.** `/source-stats` returns historical counts without a time window (`server.js:708–716`). It supplies neither posts/week nor ingestion freshness. Likewise, “Check your inbox” implies a confirmation email the subscribe handler does not send (`server.js:1588–1611`).
- **State is per invocation, not module-local/shared.** All refs sit inside `useArticles()` (`useArticles.js:3–26`). URL synchronization alone neither prevents re-instantiation nor preserves loaded pages.
- **“Zero motion” is overstated.** There are header/toolbar transitions, an animated spinner, and the target-highlight animation (`AppHeader.vue:7`, `ArticleList.vue:208`, `ArticleCard.vue:546`). “No disclosure transitions” is accurate.
- **Colour diagnosis is broadly right, but incomplete.** Search blue is explicitly overridden (`SearchBar.vue:37–39`); Data’s green is Tailwind (`DataView.vue:92`), so `NConfigProvider` cannot fix everything. The spinner adds `#09f` (`ArticleList.vue:207`).
- **Landing fonts/cream are correctly identified** (`landing-page/index.html:11–27`). The three proposed dead files have no source references; `helpers.js` is empty. `IntroCard.vue` is unused but contains different release-note content, not an exact duplicate.
- **Dark-mode instructions are wrong:** `@theme` must be top-level, not nested under `[data-theme="dark"]`. Override ordinary CSS variables under that selector, optionally mapping them through `@theme inline`. [Tailwind documentation](https://tailwindcss.com/docs/theme)
- **CSV failure is not established by source inspection.** The export buffers all rows (`server.js:893`), supporting the risk, but the live 502/service-crash claim needs dated operational evidence.

**2. WHAT’S MISSING**

- **Apply/Cancel is currently misleading.** [SourceFilters.vue:153](C:/Users/matth/projects/ai-safety-feed/frontend/src/components/SourceFilters.vue:153) and `TagFilters.vue:173` merely close; cancelled edits survive reopening. Sources even styles its trigger from the *draft* (`:63`). Reset drafts on opening and discard on every non-Apply dismissal, including outside click/Escape. Novelty’s explicit Cancel resets, but outside dismissal does not.
- **“None” means “all” at the network boundary.** `useArticles.js:184–186` omits empty selections, leaving the API unfiltered; digest empty arrays behave similarly (`server.js:618–626`). Define all/subset/none explicitly. Also, `/api/tags` returns **clusters only** (`server.js:727`): rename the control “Categories” or “Clusters,” rather than suggesting it filters topic chips.
- **Displayed counts ignore the current result set.** `FeedView.vue:217–219` supplies `allSourceCounts`, while filtered counts fetched by the composable go unused. Label these archive totals or implement consistent faceted counts.
- **Append errors erase the visible feed.** [FeedView.vue:237](C:/Users/matth/projects/ai-safety-feed/frontend/src/views/FeedView.vue:237) replaces the entire list with an error, even when loaded articles remain. Preserve them; show an inline “Retry loading more” control. `useArticles.js:230` currently marks errors as `allLoaded`, conflating failure with completion.
- **Random pagination is broken.** `fetchRandomOrder()` requests random, but `loadMore()` requests date order (`useArticles.js:431,445`). Even consistently using SQL `RANDOM()` would produce overlaps/gaps across offset pages; use a stable seed/order or make random a single-batch discovery action.
- **Bookmarks need their own state owner.** Removing one refetches the whole saved list (`useArticles.js:74–76`); storage failures are console-only, and separate tabs can overwrite stale bookmark sets. Worse, the original Similar-page card has neither bookmark binding nor handler (`SimilarPage.vue:17–21`), so its save button does nothing. Extract `useBookmarks`; importing `useArticles` there currently triggers unnecessary feed/metadata requests.
- **Search has draft-versus-applied ambiguity.** `searchTerm` differs from `queryTerm` (`FeedView.vue:63`), with clearing immediately executing search (`SearchBar.vue:28`). Retain explicit submission, show the applied query, and provide a real accessible input label. Backend matching includes hidden enrichment fields but excludes `cleaned_title` (`server.js:295–303`), allowing apparently inexplicable matches and missed visible titles.
- **Mobile needs more than reflow.** Digest stacks outer padding (`App.vue:15`, `DigestView.vue:2`, `EmailSubscription.vue:2`) then forces email/Subscribe onto one row (`:110`). Stack that row on narrow screens. Bound popover height/width; Tags currently has no scrolling constraint (`TagFilters.vue:154`).
- **Accessibility omissions:** Similar nests a button inside a link (`ArticleCard.vue:393–406`); author markup nests list items inside a span (`:440–462`). Add a nav landmark, skip link, result/loading announcements, and keyboard-accessible original-title/author details.
- **Similar requests race.** Parameter changes launch uncancelled requests (`SimilarPage.vue:244–256`), allowing old results to overwrite newer navigation.
- **Performance:** metadata requests serialize before articles (`useArticles.js:398–402`); every route is eagerly imported (`router/index.js:2–6`). Article images already reserve CSS dimensions, so absent HTML dimensions are not proof of CLS. About images have no reserved dimensions and appear after mount (`AboutView.vue:8–13,205`), a clearer risk.

**3. PUSHBACK**

Move interaction correctness, keyboard access, retry states and mobile sizing into **Tier 1**, alongside restrained tokens and typography. Tier 2 should cover URL/history restoration, digest simplification and measured performance improvements. Keep decorative motion, dark mode and extra sorting in Tier 3.

Specific disagreements:

- **Keep an explicit Search action.** A visible submit button helps touch users and communicates when expensive requests happen. Enter support does not make it redundant.
- **Don’t switch Similar navigation yet.** `savedPosition` restores coordinates, not previously fetched pages or expanded cards. Returning to a freshly mounted feed can restore against insufficient document height.
- **Don’t render 33 source chips inline in the digest.** Use a searchable multi-select with a concise selection summary; inline category choices are reasonable.
- **Don’t demote low-novelty titles.** Novelty is neither importance nor reliability. Foundational explanations deserve equal legibility.
- **Defer eight primitives plus five card subcomponents.** Extract shared filter behaviour and bookmark state first; split presentation only where reuse or complexity justifies it.
- **Skip lifting whole-card hovers and a three-column footer.** Cards contain multiple distinct actions, and an expanding feed makes footer navigation hard to reach.
- **The 2–4 day estimate is optimistic** once routing, pagination, accessibility and backend semantics are included. It is plausible for the visual pass alone.

**4. DESIGN LANGUAGE**

**Tokens:** Keep warm paper and one blue accent, but reduce the initial palette. For example: ground `#F8F7F3`, surface white, ink `#252A30`, secondary ink `#505861`, muted ink `#626A73`, accent `#315EA8`, accent-soft `#EDF2FA`. Validate actual text/background combinations.

The proposed `ink-3` at 58% OKLCH lightness is marginal for small text on tinted surfaces. Seven cluster colours plus amber novelty also undermines “one deliberate accent.” Start with neutral category chips and existing icons. If colour helps recognition, restrict seven hues to small dots with explicit labels and an unknown-category fallback; avoid coloured card rails. The current icon map already omits Biorisk (`ArticleCard.vue:54–61`).

**Typography:** Funnel Display for the wordmark/page headings and Commissioner for body **and article titles** would give cohesion without making every feed item a miniature hero. Use titles around 20/600 with 1.35 leading, summaries 16/1.6, metadata 14, labels 12–13 sentence case. Avoid 11px uppercase labels. Don’t clamp informative research titles; the diagram’s two-line maximum also contradicts the proposed `line-clamp-3`.

**Anatomy:** Prefer source/date → title → sentence summary → category/topics → actions. That restores the “skim first” hierarchy the plan praises but does not actually propose.

Keep the continuous stream initially, with inset dividers and less nested padding. Separate cards add boundaries and vertical space to an already tall feed.

Show novelty numerically—“AI novelty 3/5”—with an explanation, rather than hiding the number in a tooltip. Handle missing scores separately.

A 4:3 `object-cover` box still crops charts. Use a reserved thumbnail area with `object-contain` for unknown imagery, no image on narrow screens by default, and graceful failure handling. A cleaned title is not automatically meaningful image alt text; decorative thumbnails can have empty alt text when their link has an accessible name.

**5. ADDITIONAL IDEAS**

1. **Undo bookmark removal**, retaining focus near the removed item—prevents accidental loss from Saved. **3–5 hours.**
2. **“Saved on this browser” plus export/import bookmarks**—makes local persistence understandable and portable. **½–1 day.**
3. **Clickable category chips** using existing `cluster_tag` filtering—turns metadata into useful exploration. **2–4 hours.**
4. **“+N topics” expansion** using the existing `topics` array—reveals currently hidden classifications without clutter. **2–3 hours.**
5. **Remember text-only versus thumbnail preference**—improves reading density and mobile bandwidth. **3–5 hours.**
6. **Copy original article link** using `source_url`—makes sharing useful without exposing a Similar-page URL. **1–2 hours.**
7. **“AI-generated summary” provenance beside expanded text**—distinguishes the publisher’s work from generated interpretation. **1–2 hours.**
8. **Visible Load more fallback** alongside automatic loading—supports deliberate navigation and recovery. **3–5 hours.**

**6. IMPLEMENTATION RISKS**

- **URL sync needs a state model:** initialize once after metadata reconciliation; avoid source initialization overwriting URL selections (`useArticles.js:127`) and empty tags being repopulated (`:145`). Watch route changes, preserve sort through pagination, and prevent reciprocal watchers from issuing duplicate requests.
- **`router.replace` does not create filter history.** Push committed Apply/Search changes if Back should undo them; replace normalization/transient updates. Existing `scrollBehavior` always returns top for new navigation, including query changes (`router/index.js:41–45`).
- **Naive overrides are incomplete:** explicitly set info hover/pressed/supplemental colours, primary supplemental colour, text levels and surfaces. Those are independent defaults; changing `textColorBase` does not replace every text token. [Naive theme source](https://raw.githubusercontent.com/tusen-ai/naive-ui/main/src/_styles/common/light.ts)
- **Generate matching CSS/JS tokens**, rather than hand-maintaining approximate OKLCH/hex mirrors. Naive’s JavaScript colour transformations require checking parser compatibility before passing CSS variables.
- **`prose-sm` currently has no implementation:** the Typography plugin is absent (`package.json`). Add it or style sanitized markdown explicitly. Use complete static class mappings for cluster colours.
- **Font loading:** prefer head links or local WOFF2 over the proposed CSS import; load only necessary weights and measure swap-induced reflow. `display=swap` does not itself prevent CLS.
- **Client-only head tags are insufficient for dependable social previews.** Put default metadata in `index.html`; article-specific previews need prerendered/server-delivered metadata.

**FINAL ANSWER**

1. Fix novelty semantics, empty selections and Cancel behaviour before restyling.
2. Move accessibility, mobile sizing and recoverable error states into Tier 1.
3. Extract shared bookmark state and repair Similar’s nonfunctional save button.
4. Design URL/history, pagination and scroll restoration together.
5. Simplify the palette and preserve equal title prominence across novelty scores.
6. Keep a compact stream; prioritize source, title and readable summary.
7. Replace unsupported digest estimates with accurate settings and confirmation.
8. Correct Tailwind/Naive guidance and reduce the initial component-refactor scope.