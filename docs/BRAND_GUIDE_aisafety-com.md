# AISafety.com brand guide (for restyling the AI Safety Feed)

> **Purpose.** This guide describes the visual identity of https://aisafety.com in enough detail to restyle the AI Safety Feed (Vue 3 + Tailwind 4 + Naive UI) so it reads as a sibling product.
> **Method.** Researched on 2026-11-02 with a headless Chromium (Playwright 1.58) at 1280×800 desktop and 390×844 mobile (DPR 2). Values come from `getComputedStyle`, the site's own CSS bundles (`/_next/static/immutable/chunks/*.css`), and its SVG assets. Pages covered: home, training, events, field map, communities, self-study, jobs, funding, media channels, advisors, founders, donation guide, about, newsletters, newsletter archive (`/newsletter/events`), press/media, developers, privacy.
> **Confidence markers.** Values with no marker were **measured**, either from computed styles or from the site's CSS source. **[Inferred]** marks a judgement call or a recommendation. **[Not verified]** marks something I couldn't observe.

Screenshots referenced below live in [`screenshots/aisafety-com/`](screenshots/aisafety-com/).

---

## 0. TL;DR identity card

| | |
|---|---|
| **Feel** | Calm, dark, deep-teal "night aquarium". Big, light-weight (300) Inter headlines with tight tracking. Lots of air. Rounded pills everywhere. Cards float on soft, heavy shadows. Restrained: almost everything is white or grey-teal on near-black teal, plus one pale-aqua accent. |
| **Font** | **Inter**, used everywhere. Body text is **weight 300**, headings are 300 or 400, emphasis is **600**. Tracking is negative throughout (h1 −0.06em). |
| **Background** | `#00191B` (teal-900), with a soft blurred aqua glow (`#62B0BA` at 20–40% opacity) at the top of every page. |
| **Surface (cards)** | `#04292A` (teal-bright-850). Popovers use `#04292A` with a `#094141` border. Modals use `#0E2628`. |
| **Text** | `#FFFFFF` primary, `#AAB2B3` secondary (teal-300), `#8E999A` tertiary (teal-400), `#717F80` faint (teal-500). |
| **Accent** | Pale aqua `#A6DAD9` (bright-teal-300: highlighted phrases, links, active outlines, the logo). Mid aqua `#6CBDBB` (bright-teal-500: focus ring, checked state). |
| **Primary CTA** | White pill (`#FFF`) with dark text `#00191B`, 48px tall, 24px radius, 15px/600. The secondary CTA is a transparent pill with a 1px `rgba(255,255,255,.4)` border. |
| **Radius** | Cards 16px. Buttons and inputs are full pills (24px, 999px). Logo tiles 4px. Modals 20px. |
| **Shadow** | `0 16px 40px rgba(0,0,0,.4)` on cards, `.7` on popovers. |
| **Mode** | **Dark only.** `<meta name="color-scheme" content="dark">` is set and the CSS has no `prefers-color-scheme` rules. |

![Homepage, desktop](screenshots/aisafety-com/home-desktop.png)

---

## 1. Brand essence and tone of voice

**What it is.** AISafety.com is "the hub for AI existential safety" (from the meta description): curated, regularly updated directories of events, training programs, communities, jobs, funders, self-study, media, and advisors, plus an illustrated "Field map". It is run by a small nonprofit with volunteers and is maintained by "AI safety community-builders".

**Personality:** earnest, competent, warm, unhyped. It feels like a well-kept public library card catalogue, not a startup landing page. The dark teal palette and light type read as serious and calm, not alarmist. The subject is existential risk, but the UI never uses red, warning colours, or dramatic imagery.

**Copy patterns observed** (paraphrased):
- **Inviting and second-person headlines.** The hero says roughly "Find your place in the AI safety ecosystem", and page intros start with "Find …" or describe how the list helps *you* contribute.
- **Plain statement of mission.** The site describes itself as curated lists aimed at preventing human extinction from AI. It names the stakes once, plainly, without exclamation marks.
- **Radical transparency, with dry self-deprecating precision.** The About page says the team is "1.25 salaried employees" plus volunteers, gives its annual budget, and has a section called "(Lack of) financial motivations".
- **Reassuring and inclusive.** The jobs intro notes that many roles don't require technical skills. Advisors are introduced as offering free calls.
- **Freshness is a feature.** Every directory shows "Updated today" or "Updated 3 days ago" directly under the H1, and home cards carry the same stamp.
- **Utility microcopy.** "Suggest a correction", "Give anonymous feedback", "Help us out", "Contribute to this page", "Add an event", "Get a weekly summary of all new events".
- **Gentle whimsy in the right place.** The Field map uses playful place names such as Funding Forest, Capabilities Cove, Conceptual Cliffs, Career Castle, and Gone Graveyard for defunct orgs. Elsewhere the copy stays straight.
- **Typography in copy.** Sentence case everywhere: headings, buttons, nav, filters. Ranges use en dashes ("12–13 Dec 2026", "$1–1,000"). Cross-links use a trailing arrow ("Training programs →"). Lists use the middle dot (" · "). The footer uses the copyleft glyph "(ɔ) 2026" with a CC BY-SA licence line.
- **No ALL CAPS** in body UI. The one exception is small group labels in the search modal (uppercase, letter-spacing 1px, teal-500).

**Feed implications:** use sentence case and short declarative intros. Show a highlighted phrase in the intro (see §4). Stamp freshness ("Updated 2 hours ago"). Offer "Suggest a source" or "Suggest a correction" affordances. Avoid hype, exclamation marks, emoji, and alarm colours.

---

## 2. Logo, wordmark and favicon

| Asset | Details |
|---|---|
| **Header logo** | Wordmark only: "AISafety.com" set in a semibold geometric/grotesk face (Inter-like), as an SVG. **Single colour `#A6DAD9`** (all 12 paths `fill="#A6DAD9"`). Intrinsic size **139×24px**, rendered at exactly that size, top-left of the header, followed by 24px of right padding (`padding-right-24px`, which shrinks to 16px at ≤ 991px). Copy: [`asset-logo.svg`](screenshots/aisafety-com/asset-logo.svg). Source: `https://aisafety.com/images/logo.svg` |
| **Footer logo** | The same SVG, top of the footer's left column, with 24px below it. |
| **Favicon / app icon** | A **shield** outline in white (thick rounded stroke) filled with mid teal, on a dark-teal rounded-square tile with a subtle diagonal gradient (lighter top-left to darker bottom-right). Files: `/favicon.ico` (48×48), `/images/favicon.png` (32×32), `/images/webclip.png` (256×256 apple-touch icon). Copies: [`asset-favicon-32.png`](screenshots/aisafety-com/asset-favicon-32.png), [`asset-webclip-256.png`](screenshots/aisafety-com/asset-webclip-256.png). **[Inferred]** The shield fill is about `#2A5A5E` and the tile runs from about `#2D5E62` to `#06201F`, sampled by eye, not from the source. |
| **Social card** | 1200×630 ([`asset-og-link-preview.jpg`](screenshots/aisafety-com/asset-og-link-preview.jpg)). Wordmark top-left, a large light-weight Inter headline in white, the teal glow background, and a column of the site's nav pills (white icon disc plus label) bleeding off the right edge. A good template for a Feed OG image. |

**Usage rules (observed and inferred):**
- The wordmark is always pale aqua `#A6DAD9` on dark teal. It is never white, never on a light background, and never paired with the shield in the header.
- The shield appears only as the favicon / app icon.
- Give the wordmark at least 24px of clear space (its own height) at the left edge of the header. Header side padding is 40px (desktop) or 6.4vw (mobile).
- **Feed [Inferred]:** if the Feed becomes an aisafety.com property, set a wordmark such as "AISafety.com" plus a "Feed" sub-label, or "AI Safety Feed" in the same style: Inter 600, `#A6DAD9`, about 24px cap-height box, tracking around −0.04em. Reuse the shield favicon style.

---

## 3. Colour system

### 3.1 Source tokens (verbatim from the site's `:root`)

The site defines two 100–900 ramps plus accent hues. Note the naming collision: there are **two aliases**, `--bright-teal-300` (= teal-bright-300) and `--bright-teal-500` (= **teal-bright-400**, `#6CBDBB`). Components use the aliases heavily.

**Neutral teal ("teal"), greyish:**

| Token | Hex | Main uses observed |
|---|---|---|
| `--teal-100` | `#E3E5E6` | n/a |
| `--teal-200` | `#C6CCCC` | Footer link hover colour |
| `--teal-300` | `#AAB2B3` | **Secondary text**: meta rows, "Updated today", counts, filter-pill text, nav counts |
| `--teal-400` | `#8E999A` | Tertiary text, placeholders, archive dates, focused text-field border |
| `--teal-500` | `#717F80` | Faint text: "Posted …" dates, search placeholder, group labels |
| `--teal-600` | `#556667` | Default `.text-field` border, faint placeholders |
| `--teal-700` | `#394C4E` | **Dividers**, modal and panel borders |
| `--teal-750` | `#2A3F41` | Search input-row divider, browse-card borders |
| `--teal-800` | `#1C3334` | Hover fill in modals and lists, chat button fill |
| `--teal-850` | `#0E2628` | **Nav item hover/active fill, modal background** |
| `--teal-900` | `#00191B` | **Page background**, dark text on white buttons |

**Bright teal ("teal-bright"), saturated aqua:**

| Token | Hex | Main uses observed |
|---|---|---|
| `--teal-bright-100` | `#F1FAF9` | n/a |
| `--teal-bright-150` | `#E1F2F1` | n/a |
| `--teal-bright-200` | `#D0ECEB` | n/a |
| `--teal-bright-250` | `#B8E1E0` | n/a |
| `--teal-bright-300` | `#A6DAD9` | **Accent**: logo, highlighted intro phrases, inline links, active nav outline, search filter chip |
| `--teal-bright-350` | `#88CCC9` | n/a |
| `--teal-bright-400` | `#6CBDBB` | (= `--bright-teal-500`) focus ring, checked checkbox, bookmark ribbon default, AISafety.info outline |
| `--teal-bright-450` | `#5FB3B0` | n/a |
| `--teal-bright-500` | `#4DA9A7` | Tinted fills: `color-mix(#4DA9A7 10–35%, transparent)` for inputs and checkboxes; `.border-only` outline at 30% |
| `--teal-bright-550` | `#3F9D9B` | n/a |
| `--teal-bright-600` | `#2D9292` | n/a |
| `--teal-bright-650` | `#237C7D` | n/a |
| `--teal-bright-700` | `#176C6C` | n/a |
| `--teal-bright-750` | `#0F5858` | Filter-pill hover border |
| `--teal-bright-800` | `#094141` | Popover/pill border, **active filter-pill fill**, nav icon glyph colour, featured-card gradient start |
| `--teal-bright-850` | `#04292A` | **Card surface**, popover/dropdown fill, filter-pill fill |
| `--teal-bright-900` | `#00191B` | Same value as teal-900 |

**Category hues (pastel, for tags only):**

| Token | Hex | Used for (Events "type" chips) |
|---|---|---|
| `--orange` | `#FFB580` | Conference. Also **"Featured" pill and bookmark** on featured cards, and "down" trend in admin. |
| `--pink` | `#FF80FD` | Talk |
| `--blue` | `#75E3FF` | Meetup |
| `--bright-green` | `#7AFFB2` | Workshop |
| `--purple` | `#B390FF` | Hackathon |
| `--yellow` | `#FFFF99` (`#ff9`) | Defined, not seen in use |
| `--teal-300` | `#AAB2B3` | "Other" (neutral) |

**Others:** `--white: #FFFFFF`, `--off-white: #F3F3F3` (white button hover).

### 3.2 Backgrounds and surfaces (measured)

| Layer | Value |
|---|---|
| Page | `#00191B` plus `background-image: url(/images/bg.svg)` (2028×944, `background-position: top` on home and `50% -250px` elsewhere, no-repeat). The SVG is two Gaussian-blurred ellipses of `#62B0BA`: one 825×792 radius at 20% opacity centred above the top edge, and one rotated 458×208 at 40% opacity (blur stdDev about 122–125). The result is a soft teal glow behind the header and hero that fades to near-black by about 600px. |
| Card (`.card`) | `#04292A` |
| Featured card | `radial-gradient(farthest-corner at left top, #094141 0%, #04292A 100%)`. On the events page the gradient is sized `calc(200% + 56px) 100%` so two side-by-side featured cards share one continuous gradient. |
| Home "dark" promo card | `radial-gradient(circle at 20% 0, #094141, #073536)` |
| Home "light" promo card | `radial-gradient(circle at 20% 0, #6CBDBB, #4DA9A7)` |
| Glass panel over photo | `rgba(5,24,26,.5)` (also .2/.4/.6 variants), `backdrop-filter: blur(16px)`, radius 8px |
| Popover / dropdown | `#04292A`, border `1px solid #094141` (`.border-plus-fill`) |
| Modal / chat panel | `#0E2628`, border `1px solid #394C4E` |
| Sticky header (scrolled) | `rgba(0,25,27,.4)` plus `backdrop-filter: blur(16px)` |
| Sticky filter bar (stuck) | `color-mix(#00191B 85%, transparent)` plus `blur(8px)` |
| Overlay / scrim | `rgba(5,24,26,.8)` (`#05181ACC`) for search and mobile menu; `rgba(0,25,27,.55)` for chat |

### 3.3 Text colours

| Role | Hex | Example |
|---|---|---|
| Primary | `#FFFFFF` | Headings, card titles, body copy, card descriptions |
| Secondary | `#AAB2B3` (teal-300) | Card meta rows, "Updated today", list counts, filter-pill labels, month headers, prose paragraphs on the Privacy page |
| Tertiary | `#8E999A` (teal-400) | Archive dates, placeholders in pill inputs |
| Faint | `#717F80` (teal-500) | "Posted 2 November 2026" at the foot of job cards (**fails AA at 13px on a card; see §10**) |
| Accent / highlight | `#A6DAD9` | Highlighted phrase in intro H2s, inline links in prose, links in sidebar |
| On-white | `#00191B` | Text in the white primary button |
| Footer links | `#FFFFFF` at **opacity .8**, hover to `#C6CCCC` | |

### 3.4 Borders and dividers

| Use | Value |
|---|---|
| Divider / hairline | `1px solid #394C4E` (teal-700). Footer rule, archive rows, generic `.divider`. |
| Nav pill, featured pill, newsletter card | `1px solid color-mix(in srgb, #A6DAD9 30%, transparent)` (about `rgba(166,218,217,.3)`) |
| Outline card (`.border-only`) | `1px solid color-mix(#4DA9A7 30%, transparent)`, hover to 50% |
| Secondary button | `1px solid rgba(255,255,255,.4)` |
| Popover / filter pill | `1px solid #094141` |
| Filter pill hover | `#0F5858` |
| Active / current | `1px solid #A6DAD9` (full strength) |
| Text field | `1px solid #556667`, hover/focus `#8E999A` |
| Promo outline box | `1px solid #6CBDBB` |

### 3.5 Semantic colours

The public site has **no success, warning, or error palette.** It never shows error states in normal browsing. The admin CSS shipped in the same bundle uses: **error `#FF8B8B`**, **warning/draft `#F5B942`**, **live/ok `#A6DAD9` text with a `#6CBDBB` border**, **"down" trend `#FFB580`**, and **"up" trend `#A6DAD9`**. **[Inferred]** Adopt these for the Feed so it stays on-brand.

| Semantic | Hex | Notes |
|---|---|---|
| success / positive | `#7AFFB2` text, or `#A6DAD9` for subtle | |
| warning | `#F5B942` | From the admin CSS |
| error / danger | `#FF8B8B` | From the admin CSS. Contrast on `#00191B` ≈ 9:1. |
| info | `#75E3FF` | |
| highlight / "hot" (Feed's novelty) | `#FFB580` | Orange is the site's "featured" colour |

### 3.6 Hover and active states (summary)

| Element | Rest | Hover | Active / selected |
|---|---|---|---|
| Primary button | bg `#FFF` | bg `#F3F3F3` | n/a |
| Secondary button | transparent | bg `rgba(255,255,255,.08)` (`#ffffff14`) | n/a |
| Nav pill | transparent, border aqua-30% | bg `#0E2628` plus shadow `0 16px 40px rgba(0,0,0,.4)` | border `#A6DAD9`, bg `#0E2628`. Active plus hover: `color-mix(#0E2628 60%, #1C3334)`. |
| Filter pill | bg `#04292A`, border `#094141`, text `#AAB2B3` | border `#0F5858` | **bg `#094141`, text `#FFF`**. While the popover is open, the chevron rotates 180°. |
| Card | scale(1) | **scale(1.015)** | n/a |
| Footer link | white at 80% | `#C6CCCC` | n/a |
| `.underline` link | underline `rgba(166,218,217,.3)`, offset 6px | underline `#FFF` | n/a |
| Sidebar link (`.hover-white`) | `#A6DAD9` | `#FFF` | n/a |
| List row in modal | transparent | bg `#1C3334`, border `#394C4E` | n/a |
| Checkbox | bg `#4DA9A7` @20% | @35% | bg `#6CBDBB`, white check, shadow `0 4px 12px rgba(0,0,0,.2)` |

---

## 4. Typography

### 4.1 Family and loading

- **Inter** is the only family (`font-family: var(--font-inter), Inter, sans-serif`). It is loaded via Next.js `next/font/google` as self-hosted woff2 subsets, weights 100–900, `font-display: swap`. Next also adds a metric-matched **"Inter Fallback"** face (local Arial with size-adjust) to avoid layout shift.
- **Weights in practice:** **300** (body and most headings), **400** (H1 only), **600** (labels, buttons, eyebrow text, bold). 500, 700 and 800 are not used in the UI.
- No monospace in the public UI. The admin uses `ui-monospace, SFMono-Regular, Menlo, monospace` for code.
- `body` has `-webkit-font-smoothing: antialiased` (Tailwind's `antialiased` class on `<body>`).
- **For the Feed:**
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
  ```
  Or self-host with `@fontsource-variable/inter`. Fallback stack: `Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`. Drop the current Feed fonts (Funnel Display, Commissioner).

### 4.2 Type scale (desktop ≥ 992px; mobile ≤ 991px in brackets)

| Style | Size / line-height | Weight | Letter-spacing | Colour | Used for |
|---|---|---|---|---|---|
| **H1** | **72px / 115% (82.8px)** [56px / 115%] | 400 | **−4.32px** (−0.06em) [−3.36px] | `#FFF` | Page title ("Events", "Jobs"), home hero. Has `margin-left: -4px` for optical alignment. |
| **H2** | **28px / 120% (33.6px)** [24px / 125%] | 300 | −1.4px (−0.05em) [−0.96px] | `#FFF` | Page intro sentence, home card headlines, prose section titles |
| **H3** | **22px / 125% (27.5px)** [20px / 130%] | 300 | −1.1px (−0.05em) [−0.8px] | `#FFF` | **Card titles**, sub-sections |
| H4 (footer col.) | 15px / 165% | 600 | −0.3px | `#FFF` | Uses `.paragraph-small-bold` |
| **Body** (`body`, `p`) | **17px / 160% (27.2px)** [15px / 165%] | **300** | −0.45px [−0.3px] | `#FFF` | Default text, card description on featured cards |
| Body bold | 17px / 160% | 600 | −0.45px | `#FFF` | `.paragraph-default-bold` |
| **Small** (`.paragraph-small`) | **15px / 165% (24.75px)** [13px / 167.5%] | 300 | −0.3px [−0.2px] | `#FFF` or `#AAB2B3` | Card descriptions (standard cards), "Updated today", result counts, footer links |
| **Small bold** (`.paragraph-small-bold`) | 15px / 165% [13px] | 600 | −0.3px | `#FFF` | **Nav labels**, eyebrow ("Attend an event"), toggle tabs, footer headings |
| **XS** (`.paragraph-xs`) | **13px / 167.5% (21.7px)** [11px / 170%] | 300 | −0.2px | `#AAB2B3` | **Card meta rows** (location, date, org), nav counts, footer fine print |
| **XS bold** (`.paragraph-xs-bold`) | 13px / 167.5% [11px] | 600 | −0.2px | varies | **Filter pills**, category chips, featured pill |
| **Button** | 15px / 27.2px [13px / 167.5%] | 600 | −0.3px [−0.2px] | per variant | `.button-primary`, `.button-secondary` |
| Search input | 16px | 300 | n/a | `#FFF` | Search modal |
| Group label | ~11–13px, UPPERCASE | 600 | **+1px** | `#717F80` | Search modal only |

Mobile drops body to 15px: everything shifts one step smaller below 992px.

### 4.3 Conventions

- **Light is the default.** Headings are *lighter* (300) than you'd expect, which gives the "airy" look. Only the H1 is 400. Never set headings in bold.
- **Tight tracking.** Negative letter-spacing is applied at every size. It scales roughly −0.06em (display) → −0.05em (H2/H3) → −0.026em (body) → −0.015em (xs).
- **Highlighted phrase.** Page intros (H2 at 28px/300) colour one key phrase `#A6DAD9`. For example: "Find **conferences, talks, workshops, meetups, and competitions** in AI safety…". Use this pattern for the Feed's intro.
- **Helper line.** Below the intro sits a 15px `#AAB2B3` line containing a white link ending in " →". Example: "For fellowships, bootcamps, and courses go to Training programs →".
- Sentence case for everything. No italics in UI. The `.italic` utility exists but was not seen in use.
- Numbers in data views use `font-variant-numeric: tabular-nums` (search counts, tables).
- Text over photos uses `.shadow-text`: `text-shadow: 0 0 12px rgba(0,25,27,.8)`.

---

## 5. Spacing, layout and breakpoints

### 5.1 Spacing scale (utility classes in the site CSS)

`4, 8, 12, 16, 24, 32, 40, 56, 80, 104, 128, 192` px.

At ≤ 991px, larger steps compress: 24→16, 32→20, 40→28, 56→40 (gap 56→24), 80→48, 104→64, 128→80 (margin-bottom 128→56), 192→96.

**Stacks used repeatedly:**
- Inside cards: icon-row gap **8px**, meta-row stack gap **4px**, logo-to-title gap **16px**, block separation **24px** (`padding-bottom-24px`).
- Between cards in a grid: **40px** (24px mobile).
- Filter bar: pills gap **8px**, bar-to-count gap **16px**, bar bottom padding **40px**.
- Page header: H1 `padding-top: 56px`, `padding-bottom: 8px`, then "Updated…" with `margin-bottom: 40px`, then the intro H2 with `margin-bottom: 56px`.
- Footer: `margin-top: 192px`; the main block has 128px below it, then a divider, 24px, and the bottom row.

### 5.2 Containers and grid

| Container | Value |
|---|---|
| `.container-default` | **max-width 1056px**, centred (used for nearly all content) |
| `.container-narrow` | max-width 880px (About page) |
| `.container-wide` | 90vw |
| Mobile padding | 24px left/right on all containers (≤ 991px) |
| Header padding | 24px 40px (desktop), 24px 6.4vw (mobile); height 88px (`--nav-offset: 88px`) |

**12-column grid on 1056px:** column widths come from fixed classes. 1-col = 37px, 2 = 129, 3 = 222, 4 = 315, 5 = 407, 6 = 500, 7 = 593, 8 = 685, 9 = 778, 10 = 871, 11 = 963, 12 = 1056. That implies a 37px column and a ~55.6px gutter. The narrow grid (880px) uses 1-col = 22px … 12 = 880.

**Directory page layout (events, jobs):** the main column is 9-col (**778px**) and holds a 2-column card grid (`.collection-list`: `grid-template-columns: 369px 369px; gap: 40px`). A right **sidebar is 3-col (222px)** with 56px between, offset 49px down, containing the "Contribute to this page" card and a "View data in Airtable" card. The featured row above uses two 6-col (500px) cards with a 56px gap. On mobile everything goes to one column with 24px gaps.

**Page hero row:** title block on the left (flex auto), newsletter signup card on the right (4-col, 315px, `margin-top: 72px`). They stack below 992px.

### 5.3 Breakpoints

- **Main breakpoint: `max-width: 991px`** (desktop is ≥ 992px). This is when the nav collapses to a hamburger, type steps down, grids go to one column, and card padding drops 40→32px.
- Secondary (component-specific): 1100px, 767px (map tooltips), 640px. Also `(hover: hover)` gates the card scale hover, and `(max-width: 991px) and (pointer: coarse)`.
- **[Inferred]** For Tailwind (min-width based), set `lg = 992px` as the desktop switch.

### 5.4 Section rhythm

Big vertical breathing room: 56px above the H1, 56px between the intro and content, 40px between card rows, and 192px before the footer. Home promo cards are tall and fixed-height (375px full-width, 680px half-width, 510px third-width), separated by 40px.

---

## 6. Shape and depth

| Token | Value | Where |
|---|---|---|
| radius-xs | **4px** | Logo/image tiles (`.featured-img` 64×64, `.card-image`), checkbox |
| radius-sm | **8px** | Glass panels inside home cards, list options, map tooltips |
| radius-md | **12px** | Search result rows, browse cards, citation cards |
| radius-card | **16px** | **All cards**, popovers, dropdowns, newsletter box, outline cards, text-field |
| radius-modal | **20px** | Search modal, chat panel |
| radius-button | **24px** (48px-tall buttons) / **20px** (40px nav pills) | Effectively full pills |
| radius-pill | **999px / 100px** | Chips, filter pills, input fields, toggles |
| circle | 50% | Icon discs (32px nav icon, 40px submit), avatars |

**Shadows (site tokens):**

| Token | Value | Use |
|---|---|---|
| `--shadow-light` | `0 4px 12px rgba(0,0,0,.1)` | Small icon discs |
| `--shadow` | `0 4px 12px rgba(0,0,0,.2)` | Primary button, checked checkbox |
| `--shadow-dark` | `0 16px 40px rgba(0,0,0,.4)` | **Cards**, nav hover, modal, white nav icon discs |
| `--shadow-extra-dark` | `0 16px 40px rgba(0,0,0,.7)` | **Popovers, nav dropdown** |
| Floating controls | `0 12px 24px rgba(0,25,27,.5)` | Map buttons, active tab |

Depth is created by **shadow plus a slightly lighter surface**, never by borders alone. Cards have **no border**. Outline-style containers (`border-only`) have no fill and no shadow. Popovers combine fill, border, and extra-dark shadow. Glass (blur 16px) is used over photos, the scrolled header, and the mobile menu.

**Dividers:** `1px #394C4E`. Used sparingly (footer, archive lists, tab panes), never between cards.

**Bookmark ribbon:** a 16×24 notched-flag shape (`M0 24V0H16V24L8 16L0 24Z`) pinned to the top edge of featured cards, `right: 24px`. Colour is `currentColor`: orange `#FFB580` for "Featured", `#6CBDBB` default teal.

---

## 7. Components

### 7.1 Header / navigation

![Nav with hover on Events](screenshots/aisafety-com/component-nav-hover.png)

- `position: sticky; top: 0; z-index: max`. Height **88px**, padding **24px 40px**. Transparent at the top of the page.
- **Scroll behaviour:** scrolling down hides the header (`transform: translateY(-100%)`). Scrolling up brings it back with the class `nav-blur`: background `rgba(0,25,27,.4)` and `backdrop-filter: blur(16px)`. Measured at 1600px down, then scrolling up.
- Layout: logo left, menu right-aligned (`flex: 1; justify-content: flex-end; gap: 8px`).
- **Nav item (pill):** height **40px**, radius 20px, `border: 1px solid rgba(166,218,217,.3)`, padding-left **4px**, padding-right **16px**, gap **8px**. Contents, left to right:
  1. **Icon disc**: 32×32 white circle, `box-shadow: var(--shadow-dark)`, holding a 16px line icon coloured `#094141`.
  2. **Label**: 15px / 600 / −0.3px, white.
  3. **Count**: 13px / 300, `#AAB2B3` (for example "Events 43").
  - Hover: bg `#0E2628` plus shadow-dark. Current page (`aria-current="page"`): border `#A6DAD9`, bg `#0E2628`. All transitions `.1s ease-in-out`.
- **Overflow ("+6") pill:** the same pill without an icon (padding 0 16px), label "+6". Hovering opens a **dropdown**: 266px wide, radius 16px, padding 24 24 16, bg `#04292A`, border `1px #094141`, shadow extra-dark. It holds a vertical stack of full-width nav pills (gap 8px) and opens with a `.12s ease-out` animation from `translateY(-6px) scale(.98)`. See [`component-nav-more-dropdown.png`](screenshots/aisafety-com/component-nav-more-dropdown.png).
- **Search button:** 40×40 circle, transparent, 24px search glyph in white, hover bg `#0E2628`. Opens the search modal (§7.9).
- **Mobile (≤ 991px):** the menu is hidden and a hamburger button appears: an outlined pill (1px `rgba(255,255,255,.4)`, radius 20px, padding 8px 16px) with three 1px white bars on a 24×24 box, which morph into an "×". The **full-screen menu** uses bg `rgba(5,24,26,.8)` plus blur(16px) and lists all 11 sections plus Search as full-width 40px pills (gap 8px). Items fade and slide in from −20px over .3s. See [`mobile-menu-open.png`](screenshots/aisafety-com/mobile-menu-open.png).

### 7.2 Page header pattern (directory pages)

![Events header](screenshots/aisafety-com/events-desktop.png)

1. **H1** (72px/400). Example: "Events".
2. "Updated today" in 15px / 300, `#AAB2B3`.
3. **Intro H2** (28px/300, 7-col width ≈ 593px) with one phrase in `#A6DAD9`.
4. Optional helper line (15px `#AAB2B3`) with a white link and " →".
5. Right column: **newsletter signup card** (§7.7).

### 7.3 Buttons

| Variant | Spec |
|---|---|
| **Primary** (`.button-primary`) | `display:inline-flex; align-items:center; gap:8px; height:48px; padding:0 18px; border-radius:24px; background:#FFF; color:#00191B; font:600 15px/27.2px Inter; letter-spacing:-.3px; border:none;` Often has `box-shadow: 0 4px 12px rgba(0,0,0,.2)`. Hover: bg `#F3F3F3` (`transition: background-color .1s ease-in-out`). Mobile: height 40px, padding 0 16px, 13px. |
| **Secondary** (`.button-secondary`) | The same geometry, but `background: transparent; border: 1px solid rgba(255,255,255,.4); color: #FFF`. Hover: bg `rgba(255,255,255,.08)`. |
| **Round icon button** (newsletter submit) | 40×40 circle, transparent, `border: 1px solid #FFF`, 16px white arrow-right icon. |
| **Ghost icon button** (header search) | 40×40 circle, transparent, hover bg `#0E2628`. |
| **Accent button** (chat "suggest") | bg `#6CBDBB`, text `#00191B`, radius 999px, padding 9px 16px, 13px/600. Hover bg `#A6DAD9`. Rare. |
| **Floating action** (chat launcher) | 56×56 circle, bg `#1C3334`, border `1px #394C4E`, fixed `bottom: 24px; right: 24px`. Hover bg `#2A3F41`, border `#556667`, `translateY(-1px)`. |
| Disabled | `opacity: .3; cursor: not-allowed` (seen on the chat send button). **[Inferred]** Apply this globally. |

Button labels are short, sentence case, verb-first: "View all events", "Learn more", "Join", "View map", "Send us an email". There are no icons in standard buttons except the trailing arrow on round buttons.

### 7.4 Links

- **Inline prose link:** colour `#A6DAD9`, **no underline**, same weight as the surrounding text. Seen on the Privacy, newsletter, and jobs "Source" pages. **[Not verified]** Hover state; probably to white, matching `.hover-white`.
- **Emphasised underline link** (`.underline`): white text, `text-decoration: underline; text-decoration-color: rgba(166,218,217,.3); text-underline-offset: 6px`. Hover: underline turns white. Seen on "Maintained by AI safety community-builders".
- **Cross-link with arrow:** white text plus " →" inside a teal-300 sentence.
- **Footer link:** white at 80% opacity, hover `#C6CCCC`.
- **Sidebar action link:** `#A6DAD9` 13px with a 24px circular badge (bg `#04292A`) holding a 12px icon (plus, pencil). Hover: white.
- **Whole-card links:** directory cards are `<a>` elements (the entire card is clickable and opens the external site in a new tab with `rel="noopener noreferrer"` and UTM params).

### 7.5 Cards (the most important pattern for the Feed)

#### Standard directory card (`.card`): used for events, jobs, funders, communities, media

![Standard event card](screenshots/aisafety-com/component-card-standard-event.png)

```
background: #04292A;  border-radius: 16px;  padding: 40px (32px mobile);
box-shadow: 0 16px 40px rgba(0,0,0,.4);  border: none;  position: relative;
transition: background-color .1s ease-in-out, transform .1s ease-in-out;
@media (hover:hover) { :hover { transform: scale(1.015) } }
scroll-margin-top: 110px;
```
Width in the grid is **369px** (2 per row in a 778px column, gap 40px). Anatomy, top to bottom:
1. *(optional)* **Category chip row**: `padding-bottom: 24px`, chips gap 8px (§7.6).
2. **Header row**: `display:flex; gap:16px; align-items:flex-start; padding-bottom:24px`.
   - **Logo tile**: 64×64, radius 4px, `object-fit: contain`. Org logos are shown as-is: some have white backgrounds, some are transparent.
   - **Title**: H3 22px/300/−1.1px white, wrapping freely (no clamp).
   - **Meta stack** under the title (`padding-top: 8px`, gap 4px): rows of a **16px line icon** plus **13px/300 text** in `#AAB2B3`, gap 8px. Icons are building (org), pin (location), calendar (date).
3. **Description**: 15px/300 white (featured cards use 17px), `padding-bottom: 24px`.
4. **Footer meta stack** (gap 4px), using the same icon-row style. Icons are person ("By …"), tag (cost), paper ("Apply by …"), wrench (skills), briefcase (experience), timer (type), money (salary).
5. *(optional)* **Timestamp**: "Posted 2 November 2026" in 13px `#717F80`, `padding-top: 16px`.

Cards in a list are grouped under **plain month headers** ("October 2026": 15px/300 `#AAB2B3`, 24px below). Not bold, not sticky.

#### Featured card (`t6eyza_card`)

![Featured card](screenshots/aisafety-com/component-card-featured.png)

Same anatomy, but:
- `padding: 56px` (32px mobile), `display:flex; flex-direction:column; overflow:hidden`.
- Background `radial-gradient(farthest-corner at left top, #094141 0%, #04292A 100%)`.
- **Bookmark ribbon** at the top right (16×24, `right: 24px`), orange for "Featured", teal `#6CBDBB` for editorial picks such as "Top blog recommendation".
- A **featured pill** above the logo: height 24px, radius 999px, padding 0 8px, gap 8px, 13px/600, and a **6px dot**. Accent version (orange): `color: #FFB580; border: 1px solid color-mix(currentColor 30%); background: color-mix(currentColor 12%)`. Neutral version: `border: 1px solid rgba(166,218,217,.3)`, dot `#AAB2B3`, text `#AAB2B3`. Example labels: "Featured conference", "Top recommended videos", "Standard introductory courses".
- Description at 17px body size.

#### Home promo cards

Large editorial tiles (radius 16px, padding 56px, fixed heights). Variants:
- **Photo** with `linear-gradient(90deg, rgba(0,0,0,.5), transparent 75%)` over it.
- **Light-teal gradient**: `radial-gradient(circle at 20% 0, #6CBDBB, #4DA9A7)`.
- **Dark-teal gradient**: `radial-gradient(circle at 20% 0, #094141, #073536)`, with a cut-out photo (hands, phone) anchored to the bottom.

Each has an eyebrow (15px/600), an H2 headline (28px/300), and a CTA. Many embed a **glass sub-card** (bg `rgba(5,24,26,.5)` + blur 16px, radius 8px, padding 40px, flush to the bottom/right with 16px inset) spotlighting one item. A 13px "Updated today" stamp sits in a corner (bottom-left 12/16px, or top-right). See [`component-home-feature-card.png`](screenshots/aisafety-com/component-home-feature-card.png) and [`component-home-half-cards.png`](screenshots/aisafety-com/component-home-half-cards.png).

#### Outline card (`.border-only`)

Transparent, `1px solid color-mix(#4DA9A7 30%, transparent)`, radius 16px, padding 16–24px. Hover raises the border to 50%. Used for the sidebar "Contribute" box, the "Find events near you" box, the newsletter box, and the About contact box. **Use this for secondary panels, not for content items.**

#### Compact list row (newsletter archive)

![Newsletter archive](screenshots/aisafety-com/newsletter-events-desktop.png)

`<li>` grid `150px 1fr`, `padding: 12px 0`, `border-top: 1px solid #394C4E`. Date in 15px `#8E999A`, title in 15px white. A good model for a dense/compact Feed view.

### 7.6 Tags, chips and badges

| Type | Spec |
|---|---|
| **Category chip** (`BSUTtG_pill`) | `display:inline-flex; align-items:center; height:24px; padding:0 8px; border-radius:999px; font:600 13px/167.5% Inter; letter-spacing:-.2px; color:<hue>; border:1px solid color-mix(in srgb, currentColor 30%, transparent); background-color: color-mix(in srgb, currentColor 12%, transparent);`. The hue comes from the category palette (§3.1). Neutral chips use `#AAB2B3`. |
| **Featured pill** | As above with a 6px dot (currentColor) and gap 8px (§7.5). |
| **Count badge** (nav) | Not a badge: plain 13px `#AAB2B3` text after the label. |
| **Active filter chip** (search modal) | Solid `#A6DAD9` bg, `#00191B` text, radius 999px. Hover mixes 20% white in. |
| **Location chip** (selected city) | bg `#094141`, white, radius 999px, padding 5px 10px 5px 14px, with an × in `#8E999A` (hover white). |
| **Circular icon badge** | 24px circle bg `#04292A` with a 12px icon (sidebar actions). |
| **Admin status badges** (reference) | 10px, 1px border, radius 999px, padding 3px 6px: live `#A6DAD9`/`#6CBDBB`, draft `#F5B942`. |

### 7.7 Inputs, search, filters and dropdowns

![Filter bar with popover](screenshots/aisafety-com/component-filter-popover.png)

**Filter bar** (`_64Qr5a_bar`): flex row, gap 16px, wraps, `padding-bottom: 40px`. A pill group (gap 8px) is followed by a **result count** ("565 jobs", "26 upcoming events in person": 15px/300 `#AAB2B3`, `line-height: 40px`). On mobile it stacks vertically.

**Filter pill** (dropdown trigger):
```
min-height:40px; padding:7px 16px; border-radius:100px; gap:4px;
background:#04292A; border:1px solid #094141; color:#AAB2B3;
font:600 13px/167.5% Inter; letter-spacing:-.2px;
[leading 16px line icon] Label [16px chevron-down, rotates 180° when open]
:hover → border-color:#0F5858
.active (a value is selected) → background:#094141; color:#FFF; label becomes "Skill set: Research"
```
![Active filter](screenshots/aisafety-com/component-filter-active.png)

**Filter popover:** `position:absolute; top:calc(100% + 8px); left:0; padding:20px; border-radius:16px; background:#04292A; border:1px solid #094141; box-shadow:0 16px 40px rgba(0,0,0,.7); width:max-content`. It holds a vertical list (gap 16px) of checkbox rows. Each row is a **checkbox** (24×24, radius 4px, bg `rgba(77,169,167,.2)`, hover `.35`, checked `#6CBDBB` with a white 16px check glyph and shadow) followed by a 15px white label and a 13px `#AAB2B3` count "(115)".

**Segmented toggle** (In person / Online; Upcoming / Recurring): buttons with 15px/600 white text, a 16px icon, padding 8px 16px, radius 999px, and a **transparent border**. Active: `border-color: color-mix(#4DA9A7 30%, transparent)`. **No fill.** The toggle bar is **sticky** under the header (`top: 86px`) and gains a translucent, blurred bg when stuck.

**Pill text input** (newsletter):
```
field: display:flex; align-items:center; gap:8px; padding:4px; border-radius:999px;
       background: color-mix(in srgb, #4DA9A7 20%, transparent); border:1px solid transparent;
       :focus-within → border-color: color-mix(#4DA9A7 60%, transparent)
input: transparent, no border, padding-left:12px, 15px/300 white; placeholder #8E999A
submit: 40×40 circle, 1px white border, arrow icon
```
![Newsletter signup](screenshots/aisafety-com/component-newsletter-signup.png)

The newsletter box wraps the field in an outline card (`1px rgba(166,218,217,.3)`, radius 16px, padding 16px, gap 16px) with centred 15px copy: "Get a weekly summary of all new events".

**Location search ("Find events near you"):** an outline card (padding 24px) with a field of `background: color-mix(#4DA9A7 10%)`, radius 24px, min-height 48px, padding 6px 44px 6px 40px, a 16px pin icon at the left in `#8E999A`, a 15px input, and a `#717F80` placeholder. The suggestion list is an absolute panel, bg `#04292A`, radius 16px, padding 8px. Options have radius 8px, padding 12px 16px, and hover `color-mix(#6CBDBB 10%)`.

**Classic text field** (`.text-field`, forms): height 56px, radius 16px, bg `#00191B`, `1px solid #556667`, padding 0 16px, text `#8E999A`, placeholder `#556667`. Hover/focus border `#8E999A` with no outline. `<select>` variant: appearance none, chevron at right 12px, padding-right 48px.

### 7.8 Sidebar ("Contribute to this page")

An outline card with radius 16px and padding 12px 16px 16px: a 13px `#AAB2B3` heading, then action links (§7.4). Below it, an outline image card ("View data in Airtable") with a 24px arrow badge in the top-right (bg `#1C3334`). See [`events-list-section.png`](screenshots/aisafety-com/events-list-section.png).

### 7.9 Modals and popovers

![Search modal](screenshots/aisafety-com/component-search-modal.png)

**Search modal** (opened with the header search button, closed with Esc):
- Overlay: fixed, `rgba(5,24,26,.8)`, padding 88px 24px 24px. The page behind looks dimmed and blurred.
- Panel: **max-width 680px**, bg `#0E2628`, `1px solid #394C4E`, **radius 20px**, `box-shadow: 0 16px 40px rgba(0,0,0,.4)`, `max-height: calc(100vh - 112px)`. Entrance: `.22s cubic-bezier(.16,1,.3,1)` from `translateY(-12px) scale(.98)`, opacity 0 to 1.
- Input row: padding 16px 24px, gap 12px, `border-bottom: 1px solid #2A3F41`. A 16px search icon in `#8E999A`, then a 16px input with placeholder "Search all resource pages…" in `#717F80`, then an **"esc" hint** (radius 6px, padding 4px 8px, border `#394C4E`, 13px `#8E999A`).
- Empty state: a 2-col grid (gap 6px, padding 6px) of **browse cards**. Each has `border: 1px solid #2A3F41`, radius 12px, padding 8px 12px 8px 8px, gap 12px, a 28px white icon disc, a 15px/600 title, and a 13px/600 `#AAB2B3` count. Hover: bg `#1C3334`, border `#6CBDBB`.
- Result rows: radius 12px, a 40px logo, title, an `#A6DAD9` subtitle, a 2-line-clamped description, and a `#717F80` category. Hover/active: bg `#1C3334`, border `#394C4E`.

**Popovers and dropdowns:** see §7.1 and §7.7. All use radius 16px, bg `#04292A`, border `#094141`, and shadow `0 16px 40px rgba(0,0,0,.7)`.

**Chat panel** (AI assistant, bottom-right): 420px wide, bg `#0E2628`, border `#394C4E`, radius 20px. Bubbles use bg `#1C3334`: the user bubble has radius 14px 14px 4px 14px; the assistant greeting has radius 14px 14px 14px 4px. Suggestion chips are outlined pills (border `#556667`, 13px, padding 8px 14px). The Feed doesn't need this, but it is a useful style reference for any toast or drawer.

### 7.10 Footer

![Footer](screenshots/aisafety-com/component-footer.png)

- `margin-top: 192px; padding-bottom: 24px`, inside `.container-default`. It sits on plain `#00191B`.
- Left column (4-col, 315px): wordmark, a 15px/300 white mission paragraph (32px below), and a **secondary button** "Learn more about us".
- Right: three link columns (gap 56px). The heading is 15px/600 white with 16px below it. Links are 15px/300 white at 80% opacity, stacked with gap 8px, hover `#C6CCCC`. Columns: "Help us out" (Suggest a correction, Give anonymous feedback, Donate), "Newsletters", "For press and developers".
- There are 128px below the main block, then a **1px `#394C4E` divider**, 24px, then a bottom row (space-between): three overlapping maintainer avatars plus "Maintained by AI safety community-builders" (13px) on the left, and "(ɔ) 2026 · This site is released under a CC BY-SA license · Privacy" (13px, 80% opacity) on the right.
- Mobile: a single column with gap 32px, a centred bottom row, and the attribution hidden.

### 7.11 Icons

- **Style:** custom **16×16 line icons, 1px stroke**, square caps, round joins, geometric and minimal (calendar, pin, building, person, tag, paper, wrench, briefcase, timer, money, globe, map, book, grad-cap, megaphone, rocket, heart, search, chevron-down, arrow-right, arrow-up-right, plus, pencil). Source SVGs are stroked `#AAB2B3`, but they are rendered as **CSS masks** (`background-color: currentColor; mask: url(icon.svg)`) so they inherit text colour.
- **Sizes:** 16px in UI rows and pills, 24px for header search, 12px in small badges.
- **Containers:** in the nav and search browse cards, icons sit inside **white circles** (32px / 28px) and are tinted `#094141`.
- **Feed mapping [Inferred]:** the Feed already uses `@vicons/tabler`. Tabler outline icons at `stroke-width: 1` to `1.25` and 16px are a close match. Don't use filled or duotone icons.

---

## 8. Imagery, illustration and iconography

- **Photography** appears only on the homepage promo tiles: a moody dusk cityscape (San Francisco), a dim co-working scene, a backlit keyboard, a laptop on a sofa. It is always darkened with a left-to-right black gradient (50% to 0 at 75%) so white text sits on the left. Tones are muted purple-teal and desaturated.
- **Cut-out objects** on teal gradients: a handshake, cupped open hands, a phone showing a podcast plus earbuds. Real photos, isolated, anchored to the card's bottom edge.
- **The Field map** is a flat vector "fantasy island" illustration in the brand teals with **burnt orange (`~#E8692A`)** cliffs and roofs, small boats, castles, and forests. Hundreds of org logos sit in white circles, with region labels in dark pills. It is the one place with a warm accent. **[Inferred]** The orange there is about `#E8692A`, sampled visually.
- **Community map:** Mapbox dark navy style (`~#13213D` land) with magenta borders and teal speech-bubble markers.
- **Org logos** are shown raw in 64px tiles with radius 4px. No tinting or greyscaling.
- **People:** small circular avatars (overlapping trio of maintainers) in the hero and footer.
- **No stock illustrations, no 3D blobs, no gradients-as-decoration** beyond the background glow and card radial gradients.
- **Feed [Inferred]:** article thumbnails should get a radius of 8px (inside cards) or 4px (logo-like favicons). Overlay any thumbnail behind text with the site's dark left gradient. Use source favicons in 64px or 40px tiles, like org logos.

---

## 9. Motion and interaction

| Thing | Spec |
|---|---|
| Global hover transition | `--hover-transition: .1s ease-in-out` (colour, bg, border, transform) |
| Card hover | `transform: scale(1.015)`, only on `(hover: hover)`. Uses `will-change: transform; backface-visibility: hidden`. |
| Header | Hides on scroll down (`translateY(-100%)`) and returns on scroll up with a blurred translucent bg |
| Nav dropdown | `.12s ease-out` in from `translateY(-6px) scale(.98)`, opacity 0. Closes with `.1s ease-in`. |
| Search modal | `.22s cubic-bezier(.16,1,.3,1)` from `translateY(-12px) scale(.98)` |
| Chat panel | `.22s cubic-bezier(.32,.72,.3,1)`; scrim fades `.18s ease-out` |
| Mobile menu | Items fade and slide from `translateY(-20px)`, `.3s`. The hamburger bars rotate ±45° (`.3s`). |
| Tab content | Fades out in `.1s`, in over `.3s` |
| Filter chevron | Rotates 180° when open (`.1s`) |
| Spinner | 16px ring, 2px `rgba(255,255,255,.3)` with a white top, `.8s linear infinite` |
| Reduced motion | `prefers-reduced-motion: reduce` disables the dropdown animation and slows spinners (2.4s) |

Overall: **fast and subtle.** Nothing bounces, there are no parallax or scroll-triggered reveals, and transitions run around 100–220ms.

---

## 10. Accessibility notes

**Contrast (WCAG 2.x, computed):**

| Pair | Ratio | Verdict |
|---|---|---|
| `#FFFFFF` on `#00191B` (page) | **18.2:1** | AAA |
| `#FFFFFF` on `#04292A` (card) | **15.5:1** | AAA |
| `#AAB2B3` on `#00191B` | 8.4:1 | AAA |
| `#AAB2B3` on `#04292A` | 7.2:1 | AAA |
| `#8E999A` on `#00191B` | 6.2:1 | AA |
| `#717F80` on `#00191B` | 4.4:1 | **Fails AA** for small text (just under 4.5) |
| `#717F80` on `#04292A` ("Posted …" in cards) | **3.7:1** | **Fails AA** for 13px text. Use `#8E999A` instead in the Feed. |
| `#556667` on `#00191B` (placeholder) | 3.0:1 | Fails. Use `#8E999A` for placeholders. |
| `#A6DAD9` on `#00191B` | 11.8:1 | AAA |
| `#A6DAD9` on `#04292A` | 10.1:1 | AAA |
| `#6CBDBB` on `#00191B` | 8.3:1 | AAA |
| `#00191B` on `#FFFFFF` (primary button) | 18.2:1 | AAA |
| `#00191B` on `#6CBDBB` (accent button) | 8.3:1 | AAA |
| Category hues on `#04292A` | orange 9.0, pink 7.2, blue 10.5, green 12.4, purple 6.2 | All AA+ |
| `#FFFFFF` on `#4DA9A7` (light promo card) | 2.8:1 | **Fails.** The site gets away with it via large text and text-shadow. Avoid for Feed body text. |

**Focus:** a global `:focus-visible { outline: 2px solid #6CBDBB; outline-offset: 2px }`. Some components override it: inputs remove the outline and change the border instead, and browse cards change bg and border on `:focus-visible`. Keep the global ring in the Feed. Don't remove outlines on custom pills.

**Other good practices observed:** icon-only buttons have `aria-label` ("Search", "Toggle menu", "Subscribe", "Close search"). Decorative icons are `aria-hidden`. Toggles use `aria-pressed`, the current nav item has `aria-current="page"`, and status regions use `aria-live="polite"`. Mobile `<input>` font size is ≥ 16px in search and chat (avoids iOS zoom), but the newsletter input is 15px. Card hover scale is gated on `(hover: hover)`.

---

## 11. Do / Don't

**Do**
- Use **dark teal `#00191B`** as the only page background, with the soft aqua glow at the top.
- Set everything in **Inter**: **300 for body and headings**, 600 for labels and buttons, with negative tracking.
- Make headings big and light (72px/400 H1, 28px/300 intro), with one phrase highlighted in `#A6DAD9`.
- Put content in **borderless 16px-radius cards** on `#04292A` with a deep soft shadow, and scale them to 1.015 on hover.
- Use **pills** for every control: nav, filters, toggles, inputs, buttons.
- Make the **primary CTA white with dark text**. Make the secondary CTA an outlined pill with a white 40% border.
- Show meta as **16px thin line icon + 13px grey-teal text** rows.
- Use the pastel category hues only for **small tinted chips** (12% fill, 30% border, full-strength text).
- Show counts and freshness ("Updated today", "565 jobs").
- Keep motion at about 100ms and keep it subtle.

**Don't**
- Don't use a light theme, white surfaces, or light-mode toggles. aisafety.com is dark-only.
- Don't use bold (700+) headings, all-caps headings, or positive letter-spacing (except tiny uppercase group labels).
- Don't use saturated brand blues, reds, or purples as UI colours. Accents are aqua; pastels are for category tags only.
- Don't add borders to content cards, and don't use hard 1px-bordered tables or boxes for primary content.
- Don't use square corners on interactive controls, and don't use small 4–8px radii on buttons.
- Don't use filled or duotone icons or emoji.
- Don't use heavy animation, bounce, or parallax.
- Don't put white text on the mid-teal `#4DA9A7` for body copy (contrast 2.8:1).
- Don't use `#717F80` or `#556667` for any text that must be read.

---

## 12. Ready-to-paste tokens

### 12.1 Tailwind v4 (`src/assets/main.css`)

This **keeps the Feed's existing semantic token names** (`ground`, `surface`, `line`, `ink`, `accent`, …) so most components restyle without class changes, and adds the full aisafety.com palette under `aisc-*` to avoid clobbering Tailwind's default `teal`.

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme {
  /* ---- Raw aisafety.com palette (measured from :root) ---- */
  --color-aisc-teal-100: #e3e5e6;
  --color-aisc-teal-200: #c6cccc;
  --color-aisc-teal-300: #aab2b3;
  --color-aisc-teal-400: #8e999a;
  --color-aisc-teal-500: #717f80;
  --color-aisc-teal-600: #556667;
  --color-aisc-teal-700: #394c4e;
  --color-aisc-teal-750: #2a3f41;
  --color-aisc-teal-800: #1c3334;
  --color-aisc-teal-850: #0e2628;
  --color-aisc-teal-900: #00191b;

  --color-aisc-bright-100: #f1faf9;
  --color-aisc-bright-200: #d0eceb;
  --color-aisc-bright-300: #a6dad9; /* accent: logo, highlights, links */
  --color-aisc-bright-350: #88ccc9;
  --color-aisc-bright-400: #6cbdbb; /* focus ring, checked (site alias --bright-teal-500) */
  --color-aisc-bright-500: #4da9a7; /* tint base for fills/borders */
  --color-aisc-bright-600: #2d9292;
  --color-aisc-bright-700: #176c6c;
  --color-aisc-bright-750: #0f5858;
  --color-aisc-bright-800: #094141; /* popover border, active filter fill */
  --color-aisc-bright-850: #04292a; /* card surface */

  --color-aisc-orange: #ffb580;
  --color-aisc-pink: #ff80fd;
  --color-aisc-blue: #75e3ff;
  --color-aisc-green: #7affb2;
  --color-aisc-purple: #b390ff;
  --color-aisc-yellow: #ffff99;
  --color-aisc-off-white: #f3f3f3;

  /* ---- Semantic tokens (same names the Feed already uses) ---- */
  --color-ground: #00191b;        /* page bg */
  --color-surface: #04292a;       /* cards, popovers */
  --color-surface-2: #0e2628;     /* modals, hover fills, active nav */
  --color-surface-3: #1c3334;     /* list-row hover inside modals */
  --color-line: #394c4e;          /* dividers, modal borders */
  --color-line-strong: #556667;   /* text-field border */
  --color-line-pop: #094141;      /* popover / filter-pill border */
  --color-ink: #ffffff;           /* primary text */
  --color-ink-2: #aab2b3;         /* secondary text */
  --color-ink-3: #8e999a;         /* tertiary / placeholder (AA-safe) */
  --color-ink-4: #717f80;         /* decorative only, fails AA on cards */
  --color-ink-inverse: #00191b;   /* text on white buttons */
  --color-accent: #a6dad9;        /* links, highlights, active outline */
  --color-accent-hover: #ffffff;
  --color-accent-strong: #6cbdbb; /* focus ring, checked */
  --color-accent-soft: rgb(77 169 167 / 0.2);  /* input/checkbox fill */
  --color-accent-ink: #00191b;
  --color-novelty-high: #ffb580;  /* the site's "featured" orange */
  --color-danger: #ff8b8b;        /* [inferred from admin CSS] */
  --color-danger-soft: rgb(255 139 139 / 0.12);
  --color-warning: #f5b942;       /* [inferred from admin CSS] */
  --color-success: #7affb2;       /* [inferred] */

  /* ---- Type ---- */
  --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  --font-display: "Inter", ui-sans-serif, system-ui, sans-serif;

  --text-display: 72px;  --text-display--line-height: 1.15;  --text-display--letter-spacing: -0.06em;  --text-display--font-weight: 400;
  --text-h2: 28px;       --text-h2--line-height: 1.2;        --text-h2--letter-spacing: -0.05em;       --text-h2--font-weight: 300;
  --text-h3: 22px;       --text-h3--line-height: 1.25;       --text-h3--letter-spacing: -0.05em;       --text-h3--font-weight: 300;
  --text-body: 17px;     --text-body--line-height: 1.6;      --text-body--letter-spacing: -0.026em;
  --text-small: 15px;    --text-small--line-height: 1.65;    --text-small--letter-spacing: -0.02em;
  --text-xs: 13px;       --text-xs--line-height: 1.675;      --text-xs--letter-spacing: -0.015em;

  /* ---- Shape ---- */
  --radius-xs: 4px;     /* logo tiles, checkbox */
  --radius-sm: 8px;     /* glass panels, list options, thumbnails */
  --radius-md: 12px;    /* rows/cards inside modals */
  --radius-lg: 16px;    /* cards, popovers, outline boxes */
  --radius-xl: 20px;    /* modals, drawers */
  --radius-btn: 24px;   /* 48px buttons */
  --radius: 16px;

  /* ---- Depth ---- */
  --shadow-light: 0 4px 12px rgb(0 0 0 / 0.1);
  --shadow-btn: 0 4px 12px rgb(0 0 0 / 0.2);
  --shadow-card: 0 16px 40px rgb(0 0 0 / 0.4);
  --shadow-pop: 0 16px 40px rgb(0 0 0 / 0.7);
  --shadow-float: 0 12px 24px rgb(0 25 27 / 0.5);

  /* ---- Layout ---- */
  --breakpoint-lg: 62rem;       /* 992px: aisafety.com's desktop switch (max-width 991px) */
  --container-content: 1056px;  /* .container-default */
  --container-narrow: 880px;
  --spacing: 4px;               /* scale used: 4 8 12 16 24 32 40 56 80 104 128 192 */

  /* ---- Motion ---- */
  --ease-out-snappy: cubic-bezier(.16, 1, .3, 1);
  --default-transition-duration: 100ms;
  --default-transition-timing-function: ease-in-out;
}

html { color-scheme: dark; }
body {
  background-color: var(--color-ground);
  /* Approximation of /images/bg.svg (two blurred #62B0BA ellipses) */
  background-image:
    radial-gradient(825px 600px at 50% -60px, rgb(98 176 186 / 0.20), transparent 70%),
    radial-gradient(520px 260px at 42% 170px, rgb(98 176 186 / 0.16), transparent 70%);
  background-repeat: no-repeat;
  color: var(--color-ink);
  font-family: var(--font-sans);
  font-size: 15px; font-weight: 300; line-height: 1.65; letter-spacing: -0.3px;
  -webkit-font-smoothing: antialiased;
}
@media (min-width: 992px) {
  body { font-size: 17px; line-height: 1.6; letter-spacing: -0.45px; }
}
:focus-visible { outline: 2px solid var(--color-accent-strong); outline-offset: 2px; }
button { cursor: pointer; }

/* Components mirroring aisafety.com */
@utility btn-primary {
  @apply inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-semibold text-ink-inverse shadow-btn transition-colors hover:bg-aisc-off-white lg:h-12 lg:px-[18px] lg:text-[15px];
  letter-spacing: -0.3px;
}
@utility btn-secondary {
  @apply inline-flex h-10 items-center gap-2 rounded-full border border-white/40 bg-transparent px-4 text-[13px] font-semibold text-white transition-colors hover:bg-white/[.08] disabled:cursor-not-allowed disabled:opacity-30 lg:h-12 lg:px-[18px] lg:text-[15px];
  letter-spacing: -0.3px;
}
@utility card {
  @apply relative rounded-lg bg-surface p-8 shadow-card transition-transform lg:p-10;
  @media (hover: hover) { &:hover { transform: scale(1.015); } }
}
@utility chip {
  @apply inline-flex h-6 items-center rounded-full px-2 text-[13px] font-semibold;
  letter-spacing: -0.2px;
  border: 1px solid color-mix(in srgb, currentColor 30%, transparent);
  background-color: color-mix(in srgb, currentColor 12%, transparent);
}
@utility filter-pill {
  @apply flex min-h-10 items-center justify-center gap-1 rounded-full border border-line-pop bg-surface px-4 py-[7px] text-[13px] font-semibold text-ink-2 transition-all hover:border-aisc-bright-750;
}
@utility nav-pill {
  @apply flex h-10 items-center gap-2 rounded-[20px] pr-4 pl-1 transition-all hover:bg-surface-2 hover:shadow-card;
  border: 1px solid color-mix(in srgb, #a6dad9 30%, transparent);
}
@utility outline-box {
  @apply rounded-lg p-4;
  border: 1px solid color-mix(in srgb, #4da9a7 30%, transparent);
}
```

> **Note:** `@utility` names must not collide with ones Tailwind already defines. The current `main.css` defines `btn-secondary` twice; keep one. The colour utility names (`bg-surface`, `text-ink-2`, `border-line-pop`, …) follow from the `--color-*` names above.

### 12.2 Naive UI `themeOverrides` (`src/theme/naive.js`)

Use **`darkTheme`** as the base: `<n-config-provider :theme="darkTheme" :theme-overrides="naiveTheme">`. Naive's light theme would fight these colours.

```js
import { darkTheme } from "naive-ui"; // pass :theme="darkTheme" in App.vue

const INTER = 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

export const naiveTheme = {
  common: {
    fontFamily: INTER,
    fontWeight: "300",
    fontWeightStrong: "600",
    fontSize: "15px",
    fontSizeMedium: "15px",
    fontSizeSmall: "13px",
    fontSizeLarge: "17px",
    lineHeight: "1.65",

    primaryColor: "#6CBDBB",        // bright-teal-500 alias: focus, checked, sliders
    primaryColorHover: "#A6DAD9",
    primaryColorPressed: "#4DA9A7",
    primaryColorSuppl: "#88CCC9",
    infoColor: "#75E3FF",
    infoColorHover: "#A6DAD9",
    infoColorPressed: "#4DA9A7",
    infoColorSuppl: "#75E3FF",
    successColor: "#7AFFB2",
    successColorHover: "#A6DAD9",
    successColorPressed: "#4DA9A7",
    successColorSuppl: "#7AFFB2",
    warningColor: "#F5B942",
    warningColorHover: "#FFB580",
    warningColorPressed: "#E0A52E",
    warningColorSuppl: "#F5B942",
    errorColor: "#FF8B8B",
    errorColorHover: "#FFA3A3",
    errorColorPressed: "#E67373",
    errorColorSuppl: "#FF8B8B",

    bodyColor: "#00191B",
    cardColor: "#04292A",
    modalColor: "#0E2628",
    popoverColor: "#04292A",
    tableColor: "#04292A",
    inputColor: "rgba(77,169,167,0.2)",
    inputColorDisabled: "rgba(77,169,167,0.08)",
    actionColor: "#0E2628",
    hoverColor: "rgba(108,189,187,0.10)",
    pressedColor: "rgba(108,189,187,0.18)",
    tagColor: "rgba(170,178,179,0.12)",

    textColorBase: "#FFFFFF",
    textColor1: "#FFFFFF",
    textColor2: "#AAB2B3",
    textColor3: "#8E999A",
    textColorDisabled: "#556667",
    placeholderColor: "#8E999A",
    iconColor: "#AAB2B3",
    iconColorHover: "#FFFFFF",

    borderColor: "#394C4E",
    dividerColor: "#394C4E",

    borderRadius: "16px",
    borderRadiusSmall: "8px",

    boxShadow1: "0 4px 12px rgba(0,0,0,.2)",
    boxShadow2: "0 16px 40px rgba(0,0,0,.4)",
    boxShadow3: "0 16px 40px rgba(0,0,0,.7)",

    cubicBezierEaseInOut: "cubic-bezier(.4, 0, .2, 1)",
    cubicBezierEaseOut: "cubic-bezier(.16, 1, .3, 1)",
  },
  Button: {
    heightMedium: "48px", heightSmall: "40px", heightTiny: "32px",
    borderRadiusMedium: "24px", borderRadiusSmall: "20px", borderRadiusTiny: "16px",
    paddingMedium: "0 18px", paddingSmall: "0 16px",
    fontSizeMedium: "15px", fontSizeSmall: "13px",
    fontWeight: "600",
    // type="primary" → aisafety.com white pill
    colorPrimary: "#FFFFFF", colorHoverPrimary: "#F3F3F3", colorPressedPrimary: "#E3E5E6", colorFocusPrimary: "#F3F3F3",
    textColorPrimary: "#00191B", textColorHoverPrimary: "#00191B", textColorPressedPrimary: "#00191B", textColorFocusPrimary: "#00191B",
    borderPrimary: "none", borderHoverPrimary: "none", borderPressedPrimary: "none", borderFocusPrimary: "none",
    // default → outlined secondary pill
    color: "transparent", colorHover: "rgba(255,255,255,.08)", colorPressed: "rgba(255,255,255,.12)", colorFocus: "rgba(255,255,255,.08)",
    textColor: "#FFFFFF", textColorHover: "#FFFFFF", textColorPressed: "#FFFFFF", textColorFocus: "#FFFFFF",
    border: "1px solid rgba(255,255,255,.4)", borderHover: "1px solid rgba(255,255,255,.4)",
    borderPressed: "1px solid rgba(255,255,255,.6)", borderFocus: "1px solid #6CBDBB",
  },
  Input: {
    heightMedium: "48px", heightSmall: "40px",
    borderRadius: "24px",
    color: "rgba(77,169,167,0.2)", colorFocus: "rgba(77,169,167,0.2)",
    border: "1px solid transparent", borderHover: "1px solid rgba(77,169,167,.4)", borderFocus: "1px solid rgba(77,169,167,.6)",
    boxShadowFocus: "none",
    textColor: "#FFFFFF", placeholderColor: "#8E999A", caretColor: "#FFFFFF",
    fontSizeMedium: "15px",
    paddingMedium: "0 16px",
  },
  Tag: {
    heightSmall: "24px", heightMedium: "28px",
    borderRadius: "999px",
    fontSizeSmall: "13px",
    fontWeightStrong: "600",
    padding: "0 8px",
    color: "rgba(170,178,179,.12)", textColor: "#AAB2B3", border: "1px solid rgba(170,178,179,.3)",
    colorCheckable: "#04292A", textColorCheckable: "#AAB2B3",
    colorChecked: "#094141", colorCheckedHover: "#0F5858", colorCheckedPressed: "#094141", textColorChecked: "#FFFFFF",
  },
  Card: {
    color: "#04292A", colorModal: "#0E2628", colorEmbedded: "#0E2628",
    borderColor: "transparent",
    borderRadius: "16px",
    paddingMedium: "40px", paddingSmall: "32px",
    titleFontSizeMedium: "22px", titleFontWeight: "300", titleTextColor: "#FFFFFF",
    textColor: "#FFFFFF",
  },
  Popover: {
    color: "#04292A", borderRadius: "16px", padding: "20px",
    boxShadow: "0 16px 40px rgba(0,0,0,.7)",
  },
  Dropdown: {
    color: "#04292A", borderRadius: "16px",
    optionColorHover: "rgba(108,189,187,0.10)", optionColorActive: "#094141",
    optionTextColor: "#FFFFFF", optionHeightMedium: "40px",
    boxShadow: "0 16px 40px rgba(0,0,0,.7)",
  },
  Select: { peers: { InternalSelection: {
    heightMedium: "40px", borderRadius: "100px",
    color: "#04292A", colorActive: "#094141",
    border: "1px solid #094141", borderHover: "1px solid #0F5858", borderActive: "1px solid #0F5858", borderFocus: "1px solid #6CBDBB",
    boxShadowActive: "none", boxShadowFocus: "none",
    textColor: "#FFFFFF", placeholderColor: "#AAB2B3", fontSizeMedium: "13px",
  } } },
  Checkbox: {
    sizeMedium: "24px", borderRadius: "4px",
    color: "rgba(77,169,167,0.2)", colorChecked: "#6CBDBB",
    border: "none", borderChecked: "none", borderFocus: "none",
    checkMarkColor: "#FFFFFF",
    boxShadowFocus: "0 0 0 2px #6CBDBB",
    labelFontWeight: "300", textColor: "#FFFFFF",
  },
  Modal: { color: "#0E2628", borderRadius: "20px", boxShadow: "0 16px 40px rgba(0,0,0,.4)" },
  Dialog: { color: "#0E2628", borderRadius: "20px", titleFontSize: "22px", titleFontWeight: "300" },
  Message: { color: "#0E2628", textColor: "#FFFFFF", borderRadius: "16px", boxShadow: "0 16px 40px rgba(0,0,0,.7)" },
  Tooltip: { color: "#0E2628", textColor: "#FFFFFF", borderRadius: "8px", padding: "8px 12px" },
  Divider: { color: "#394C4E" },
  Skeleton: { color: "#0E2628", colorEnd: "#1C3334" },
  Pagination: { itemBorderRadius: "999px", itemColorActive: "#094141", itemTextColorActive: "#FFFFFF", itemBorderActive: "1px solid #094141" },
};
```

> **[Inferred]** Naive's per-component key names change slightly between versions. The keys above match Naive 2.41's theme variables, but verify any that don't take effect with `<n-theme-editor>` and drop unknown keys.

---

## 13. Applying this to a news-feed / list app

| Feed element | aisafety.com pattern to copy |
|---|---|
| **App shell** | `#00191B` page with the top glow. Sticky 88px header, transparent at the top; it hides on scroll down and returns blurred (`rgba(0,25,27,.4)` + blur 16px) on scroll up. Content in a 1056px container with 24px mobile gutters. |
| **Header** | The `#A6DAD9` wordmark on the left. On the right, **nav pills** (40px, white 32px icon disc + 15px/600 label + 13px grey count): "All", "Research", "Policy", "Podcasts" with item counts. Then a 40px round search button. Collapse to a hamburger and full-screen blurred menu below 992px. |
| **Page intro** | H1 72px/400 "AI Safety Feed" (or "News"). Under it, "Updated 12 minutes ago" in 15px `#AAB2B3`. Then a 28px/300 intro sentence with one phrase in `#A6DAD9`, for example "The latest **research, policy, and commentary** on AI safety, in one place." On the right, put the **email signup card** (outline box + pill input + round arrow button) in place of the Feed's current EmailSubscription styling. |
| **Filter toolbar** (SourceFilters, TagFilters, NoveltyFilter) | One wrapping row of **filter pills** with a leading icon and chevron, each opening a 16px-radius popover of 24px checkbox rows with grey counts. A selected filter pill turns solid `#094141` with white text and shows its value ("Source: LessWrong"). The **result count** sits at the end of the row ("1,284 articles"). A Latest / Top switch should be the **segmented outline toggle** (no fill, active gets the aqua-30% border), sticky under the header with the blurred stuck state. The search field should be the pill input (aqua 20% fill) or open the 680px search modal. |
| **Article card** (ArticleCard) | `.card`: `#04292A`, radius 16, padding 40/32, shadow `0 16px 40px rgba(0,0,0,.4)`, no border, scale 1.015 on hover, and the **whole card is the link**. Layout: (1) a **category chip row** (source type or topic chips using the pastel hues: e.g. Research = blue `#75E3FF`, Policy = purple `#B390FF`, Podcast = pink `#FF80FD`, Newsletter = green `#7AFFB2`, Opinion = neutral `#AAB2B3`). (2) A header row with a 64px source-favicon or thumbnail tile (radius 4) plus an **H3 22px/300 title** and a meta stack (person icon + author, building icon + publication, calendar icon + date) in 13px `#AAB2B3`. (3) The summary in 15px/300 white. (4) Footer meta (tags, read time) as icon rows. Put the relative "Posted 3h ago" in `#8E999A`, **not** `#717F80`. |
| **Featured / high-novelty article** | The featured-card variant: radial gradient `#094141`→`#04292A`, 56px padding, an **orange bookmark ribbon** top-right, and an orange "● High novelty" pill. This replaces the Feed's current `--color-novelty-high`. Show 1–2 of these above the list, like the events page does. |
| **List layout** | Main column 778px with a 2-column card grid (369px, gap 40) and a 222px right sidebar holding an outline "Contribute" box ("Suggest a source", "Report an issue") and an RSS/API link card. Group cards under **plain date headers** ("Today", "2 November 2026") in 15px `#AAB2B3`. On mobile, use one column with 24px gaps. **Compact view option:** archive-style rows (grid `150px 1fr`, 1px `#394C4E` top border, 12px vertical padding, date in `#8E999A`, title in white). |
| **Buttons** | "Load more" or "Subscribe" as the **white primary pill**. "Clear filters" or "View source" as the **outlined secondary pill**. Icon actions (share, bookmark) as 40px round ghost buttons with hover `#0E2628`. |
| **Empty / loading** | Use the site's tone: plain sentence and a secondary button ("No articles match these filters." + "Clear filters"). Skeletons on `#0E2628`→`#1C3334`. The spinner is a 16px white ring. |
| **Footer** | Copy the structure: wordmark + mission paragraph + "Learn more about us" (or "About the Feed"), link columns ("Help us out", "Newsletters", "For developers"), a `#394C4E` divider, then "Maintained by AI safety community-builders" plus a licence line. |
| **Article reading view** (if any) | `.container-narrow` (880px). H1 at 56–72px/400. Paragraphs at 17px/300/1.6. Inline links in `#A6DAD9` with no underline. H3 sub-heads at 22px/300. Restyle `@tailwindcss/typography` with `prose-invert` and override the link colour and heading weights to 300. |

**Migration checklist for the engineer:**
1. Swap the fonts to Inter 300/400/600 and remove Funnel Display and Commissioner.
2. Replace the `@theme` block (§12.1) and the Naive overrides (§12.2). Add `darkTheme` to `NConfigProvider`.
3. Set `<meta name="color-scheme" content="dark">` and remove any light-mode assumptions (white backgrounds in components, `bg-white` cards).
4. Rebuild ArticleCard per §7.5, the filters per §7.7, and the header per §7.1.
5. Check focus rings (2px `#6CBDBB`, offset 2) and contrast for the grey-teal text roles (§10).

---

## 14. Screenshot index

| File | What |
|---|---|
| `home-desktop.png`, `home-desktop-full.png`, `home-mobile.png` | Homepage (viewport, full page, mobile) |
| `events-desktop.png`, `events-desktop-full.png`, `events-mobile.png`, `events-list-section.png` | Events directory (featured cards, filters, near-me search, month groups, sidebar) |
| `jobs-desktop.png`, `jobs-mobile.png` | Jobs directory with the filter bar |
| `training-desktop.png`, `self-study-desktop.png`, `media-channels-desktop.png`, `advisors-desktop.png`, `funding-desktop.png`, `funding-desktop-full.png`, `founders-desktop.png` | Other directory page types |
| `map-desktop.png`, `communities-desktop.png` | Illustrated field map; Mapbox community map |
| `about-desktop.png`, `donation-guide-desktop.png`, `newsletter-desktop.png`, `newsletter-events-desktop.png`, `media-desktop.png`, `privacy-desktop.png`, `developers-desktop.png` | Prose, guide, newsletter, and archive page types |
| `component-nav-hover.png`, `component-nav-scrolled.png`, `component-nav-more-dropdown.png`, `mobile-menu-open.png` | Navigation states |
| `component-filter-bar-events.png`, `component-filter-popover.png`, `component-filter-active.png` | Filter pills, popover, active state |
| `component-card-standard-event.png`, `component-card-featured.png`, `component-job-card-hover.png` | Cards |
| `component-home-feature-card.png`, `component-home-half-cards.png` | Home promo tiles |
| `component-newsletter-signup.png`, `component-search-modal.png`, `component-footer.png` | Inputs, modal, footer |
| `asset-logo.svg`, `asset-favicon-32.png`, `asset-webclip-256.png`, `asset-og-link-preview.jpg` | Brand assets (copied from aisafety.com for reference) |

---

## 15. Not verified / open questions

- **Hover colour of inline `#A6DAD9` prose links** was not measured; probably white.
- **Exact favicon and shield colours** were sampled by eye from the PNG, not from a source file.
- **Semantic colours** (success, warning, error) aren't used on the public site. The values here come from the admin CSS in the same bundle plus inference.
- **Field-map orange** (about `#E8692A`) is sampled visually from the illustration, not a token.
- **Search overlay blur:** the screenshot shows a blurred page behind the modal, but the overlay CSS I read only sets a translucent colour. The blur may come from another rule I didn't capture.
- **Naive UI key names** in §12.2 are believed correct for v2.41 but not tested against the Feed.
- **The logo's typeface** looks like Inter SemiBold but is outlined in the SVG, so this could not be confirmed.
- I didn't find any blog or article pages on aisafety.com; the closest prose pages are About, Privacy, and Press/Media. The "reading view" guidance is extrapolated from those.
