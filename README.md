# [saisur.me](https://www.saisur.me)
This repository holds the source code for my personal website. It is built with Next.js and uses Tailwind CSS for styling. To develop locally, clone the repo and install dependencies with `npm install`. Then, run `npm run dev` to start the development server.

Eldorado is available at `/musings/eldorado` and linked from the Musings index. It follows the site's blue, monospace layout and searches the historical corpus on the server.

The website includes a self-contained research snapshot: 28 source texts in `data/eldorado/texts`, edition metadata in `src/data/eldorado`, and map/art assets in `public/static/eldorado`. Sources retain their edition licenses, original URLs, and checksums. Refresh data after rebuilding the research workspace with:

```sh
node scripts/export-eldorado.mjs /path/to/eldorado
```

No running Eldorado server is required. Next.js file tracing includes the source books for the search endpoints. The imported place references and river paths remain provisional; text matches do not establish visits.

Verify the website with `npm run build` and `node --test tests/*.test.mjs`. Optional browser checks use Python Playwright: `ELDORADO_CHROMIUM_PATH=/path/to/chrome python scripts/check-musings.py` against a local website at port 3001, or set `MUSINGS_URL`.
