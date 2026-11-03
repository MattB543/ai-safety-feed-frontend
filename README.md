# AI Safety Feed (frontend)

The website at [aisafetyfeed.com](https://aisafetyfeed.com): a filterable feed of AI safety writing from LessWrong, the EA Forum, blogs, newsletters and podcasts, with AI-written summaries, tags and novelty scores. Pages: the feed (`/`), similar posts (`/similar/<slug>-<id>`), the email digest sign-up (`/digest`), data and API docs (`/data`) and `/about`.

Vue 3 + Vite, with naive-ui for the popovers/forms and Tailwind 4 for everything else. Data comes from the [backend](https://github.com/MattB543/ai-safety-feed-backend) (Express on Render); posts are written by the [scraping pipeline](https://github.com/MattB543/ai-safety-feed-helpers).

## Setup

```sh
npm install
cp .env.example .env   # then set VITE_API_BASE_URL
npm run dev            # http://localhost:5173
```

`VITE_API_BASE_URL` is the backend's base URL, e.g. `http://localhost:8000` for a local backend or `https://ai-safety-feed-backend.onrender.com` for production. It falls back to `http://localhost:8000` and is read in one place, `src/api.js`.

| Command           | What it does                    |
| ----------------- | ------------------------------- |
| `npm run dev`     | Vite dev server with HMR        |
| `npm run build`   | Production build into `dist/`   |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run lint`    | ESLint (flat config)            |
| `npm run format`  | Prettier                        |

## How it talks to the backend

- Feed: `GET /api/v1/posts` (`search`, repeated `source_type` and `tags`, `novelty_min`, `sort=newest|random`, `limit`, `offset`); a filter that covers every source or tag is left out. Filter counts come from `/api/source-stats` and `/api/tags`.
- Similar page: `GET /api/v1/posts/:id` and `GET /api/similar/:id`.
- Bookmarks are stored in `localStorage` and fetched with `GET /api/content/by-ids` (100 ids per request).
- Feed filters are kept in the URL: `/?q=<search>&source=<name>&source=<name>&tag=<tag>&novelty=<1-5>`. Every key is optional and a missing `source`/`tag` means "all". The digest emails link to this.

The backend's interactive API docs are at `<backend>/api-docs`.

## Deploy

Netlify builds `npm run build` and publishes `dist/`; set `VITE_API_BASE_URL` in the Netlify environment. `netlify.toml` holds the rewrites: the PostHog proxy (`/ingest/*`), `/sitemap.xml` proxied to the backend, and the SPA catch-all, which must stay last.

**When a change touches the API, deploy the backend first**, then the frontend, so the live site never calls an endpoint that doesn't exist yet.

## Branding

The look follows aisafety.com. See [`docs/BRAND_GUIDE_aisafety-com.md`](docs/BRAND_GUIDE_aisafety-com.md) for colours, type and components; the tokens live in `src/assets/main.css` and the naive-ui theme in `src/theme/naive.js`.
