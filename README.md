# AutoGlow v2

autoglowcare.in rebuilt on Next.js and Sanity. Studio Light design.

```
studio/   Sanity Studio (project 6qzta0cg, dataset production): content model and editors' UI
web/      Next.js site: reads published content from Sanity, deployed on Vercel
```

## Run locally

```bash
cd studio && npm install && npm run dev      # http://localhost:3333
cd web && cp .env.example .env.local && npm install && npm run dev   # http://localhost:3000
```

The dataset is public read, so the site needs no Sanity token. Form submissions need
`GOOGLE_SHEETS_WEBHOOK_URL` and `RESEND_API_KEY` in `web/.env.local` (never commit them).

## Content

Everything visible on the site is edited in the Studio:

- **Pages**: Home, Services, About, Brands, Locations, Articles, Book Inspection, WhatsApp, Landing, Privacy, Brand Kit, each with its own SEO fields
- **Services**, **Articles**, **Studios**, **Car brands**
- **Site settings**: navigation, footer, calls to action, cookie banner, default SEO

Slugs form the URLs (`/services/<slug>`, `/articles/<slug>`). Changing one breaks existing links and rankings.

`studio/migrations/seed/seed.ts` is the one-off migration that copied the previous site's content
word for word. Re-running it overwrites Studio edits, so only run it again deliberately.

## Types

After changing the schema or a GROQ query:

```bash
cd studio && npm run typegen   # writes web/sanity.types.ts
```

## Deploy

- **Site**: Vercel project with root directory `web`. Set the variables from `web/.env.example`.
  Non-production deployments send `noindex` and a blocking robots.txt automatically.
- **Studio**: `cd studio && npx sanity deploy` (needs a token with Deploy Studio permission).
- **Instant updates**: in Sanity Manage → API → Webhooks, add `https://<site>/api/revalidate`,
  trigger on create/update/delete, projection `{"tags": [_type, _type + ":" + slug.current]}`,
  secret = `SANITY_REVALIDATE_SECRET`. Without it, pages refresh within an hour.

## URL parity

All 31 live pages, the 5 existing redirects (308), `robots.txt`, `sitemap.xml`, `llms.txt`,
`llms-full.txt`, `/brands/*.svg` and `/api/lead` are kept at their exact paths, with the same
titles, descriptions, canonicals, Open Graph, Twitter and JSON-LD.
