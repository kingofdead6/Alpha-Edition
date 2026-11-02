# Éditions Alfa · منشورات ألفا

A bilingual (English / Arabic, full right-to-left) website for an independent publishing house, with an admin panel.

- **Frontend:** React 18, React Router, Tailwind CSS, Vite
- **Backend:** Node.js, Express 5, MongoDB (Mongoose), Cloudinary, JWT auth
- **Languages:** every piece of content is stored in English and Arabic. Visitors switch with one button, and the whole layout mirrors for Arabic (the hero book even opens from the right, like an Arabic book).

---

## 1. Fill in `server/.env`

Open `server/.env` and fill the empty values:

| Key | What to put |
| --- | --- |
| `MONGODB_URI` | Your MongoDB connection string (MongoDB Atlas works) |
| `JWT_SECRET` | A long random string. Generate one: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | From the Cloudinary dashboard → API Keys |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | The first admin account. It is created automatically on first start. |

The client has no `.env`. The API address is set once in `client/vite.config.js` (`API_URL`, currently `https://alpha-edition.onrender.com`).

The site runs without Cloudinary. Only cover/portrait uploads and manuscript attachments are switched off, and the admin dashboard shows a notice until the keys are set.

## 2. Install and run

```bash
npm run install:all     # installs root, server and client
npm run seed            # adds the admin + 8 sample books and authors (in both languages)
npm run dev             # API on :5000, site on :5173 (the site uses the Render API, see below)
```

- Site: http://localhost:5173
- Admin: http://localhost:5173/admin (sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`)

`npm run seed:fresh` deletes the books and authors and re-creates the samples.
`npm run seed --prefix server -- --reset-admin` resets the admin password to the one in `.env`.

## 3. What's inside

### Public site
- Animated hero: book spines drop into a stack, then a 3D book rises, opens on its own and types its epigraph. It tilts with the mouse.
- A proofreader's red circle draws itself around "slowly / على مهل", with a hand-written "stet".
- Ticker of new titles with ISBNs. It runs the other way in Arabic.
- Catalogue: covers drawn in CSS (8 motifs, 3 colours) or uploaded images, 3D tilt, collection filters with animated reshuffle, search and sort.
- Book pages: the cover morphs from the catalogue into the page (View Transitions in Chromium browsers). Each page has specs and an author bio.
- **"Look inside" reader**: a two-page spread with real page-turn animation, running heads and folios. It turns right-to-left in Arabic, and arrow keys work.
- Scroll-driven "how a book is made" timeline, counters, a rotating "author in residence" seal.
- Manuscript submission form with drag-and-drop file upload, word counter, spam honeypot and a "RECEIVED" stamp with a reference number.
- Reading list drawer (saved on the visitor's device), newsletter sign-up, light/dark/system theme.
- Arabic uses Amiri, IBM Plex Sans Arabic and Aref Ruqaa, Algerian month names (جانفي، فيفري…) and no letter-spacing, so letters stay joined.

### Admin panel (`/admin`, also bilingual)
- **Dashboard:** counts, submission pipeline, submissions per month, latest submissions, books by collection.
- **Books:** list, search and filter. The editor has side-by-side EN/AR fields, an ISBN-13 check-digit validator, a cover designer with motif picker, palettes and colour pickers or an image upload, a live EN + AR cover preview, a "hero book" toggle and an unsaved-changes guard.
- **Authors:** bilingual bio, quote and note, a portrait upload, and an "author in residence" toggle.
- **Submissions:** status workflow (new → reading → shortlisted → accepted/declined), editor notes, a signed private link to the manuscript, and reply by email.
- **Subscribers:** search, CSV export, delete.
- **Settings:** contact details, opening hours, reading period (open/close + end date), the numbers shown on the home page.

## 4. API overview

Public: `GET /api/public/home`, `GET /api/public/books/:slug`, `GET /api/public/settings`, `POST /api/public/submissions` (multipart), `POST /api/public/subscribers`

Auth: `POST /api/auth/login`, `GET /api/auth/me`

Admin (Bearer token): `/api/admin/books`, `/api/admin/authors`, `/api/admin/submissions`, `/api/admin/subscribers`, `/api/admin/settings`, `/api/admin/stats`, `POST|DELETE /api/admin/uploads`

Security: helmet (with a CSP that allows Google Fonts and Cloudinary), CORS limited to `CLIENT_URL`, rate limits on login, submissions and newsletter sign-ups, zod validation on every write, and bcrypt password hashes. Manuscripts are stored as **private** Cloudinary files and opened through short-lived signed links.

## 5. Deployment

**One server (simplest):** `npm run build`, then `npm start` with `NODE_ENV=production`. Express serves the built React app and the API from the same domain. Works on Render, Railway, a VPS, etc.

**Split (e.g. Vercel + Render):** deploy `server/` as a Node service and `client/` as a static site. The API address lives in `API_URL` in `client/vite.config.js`: in development Vite forwards `/api` to it, and `npm run build` bakes it into the site. Add the site's URL to `CLIENT_URL` in the API's environment (on Render: Environment tab) so the browser is allowed to call it. On Vercel, add a rewrite of `/(.*)` to `/index.html` so book pages work on refresh.

## 6. Project structure

```
editions-alfa/
├── package.json            # root scripts (dev, seed, build, start)
├── server/
│   ├── .env                # ← fill this in
│   └── src/
│       ├── index.js, app.js
│       ├── config/          # env, MongoDB, Cloudinary
│       ├── models/          # Book, Author, Submission, Subscriber, Admin, Settings
│       ├── routes/          # public, auth, admin/*
│       ├── middleware/      # auth, uploads, errors
│       ├── validators.js    # zod schemas
│       └── seed/            # sample bilingual catalogue
└── client/
    ├── vite.config.js      # API_URL: where the API lives
    └── src/
        ├── i18n/en.js, ar.js   # all interface text
        ├── lib/                # api, language, theme, auth, reading list
        ├── components/site/    # hero, catalogue, reader, footer…
        ├── pages/              # home, book page, 404
        └── admin/              # admin panel
```

All authors, books and contact details in the seed are invented. Replace them from the admin panel.
