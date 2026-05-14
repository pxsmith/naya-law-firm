# Naya Law Firm Website

Marketing website for Naya Law Firm. Built with Next.js, deployed on Vercel.

## Stack

- **Next.js 15** (App Router) — framework
- **MDX** — content as `.mdx` files in `content/`
- **CSS Modules** — component-scoped styling (no Tailwind)
- **Formspree** — contact form handling
- **Vercel** — hosting
- **Vercel Analytics** — optional, off by default

No CMS, no database. Content is version-controlled in this repo.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # preview the production build
npm run typecheck
```

## Project layout

```
content/                  Editable content (settings + MDX files)
  settings.ts             Firm name, contact info, disclaimers
  practice-areas/         One .mdx per practice area
  attorneys/              One .mdx per attorney
  insights/               One .mdx per article
  case-studies/           One .mdx per case study
public/
  images/                 Photos and static assets
src/
  app/                    Next.js routes
  components/             Shared components
  lib/content.ts          Loaders that read from content/
  styles/                 Global CSS + typography
```

## Editing content

### Update firm-wide settings (name, address, phone, disclaimers)

Edit [content/settings.ts](content/settings.ts). All site-wide values flow from this file.

### Add or edit an attorney

1. Create `content/attorneys/firstname-lastname.mdx` (or edit an existing one).
2. Fill in the `frontmatter` object at the top — `name`, `slug`, `title`, `photo`, `email`, `phone`, `practiceAreas`, `barAdmissions`, `education`, `order`.
3. Drop the photo into `public/images/attorneys/firstname-lastname.jpg` (referenced by `photo` in frontmatter).
4. Write the bio below the frontmatter using Markdown.

### Add or edit a practice area

1. Create `content/practice-areas/some-area.mdx`.
2. Fill in `title`, `slug`, `summary`, `order`, `featured` in frontmatter.
3. Write the practice description in Markdown below.

### Add an article (insights)

1. Create `content/insights/YYYY-MM-short-title.mdx`.
2. Fill in `title`, `slug`, `excerpt`, `author` (must match an attorney slug), `publishedAt` (ISO date), `tags`.
3. Write the article in Markdown.

### Add a case study

Same pattern in `content/case-studies/`.

After any content change: commit, push, and Vercel will redeploy automatically.

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SITE_URL=https://www.nayalawfirm.com
NEXT_PUBLIC_FORMSPREE_ID=xyzabcd
```

`NEXT_PUBLIC_FORMSPREE_ID` is the form ID from your Formspree dashboard. Without it, the contact form will show an error on submit.

In Vercel: set the same variables under **Project Settings → Environment Variables** for both Production and Preview.

## Deployment to Vercel

1. Push this repo to GitHub.
2. In Vercel, **Import Project** → select the GitHub repo.
3. Set the environment variables above.
4. Deploy. Vercel will auto-deploy on every push to `main` and create preview deploys per PR.
5. Connect the production domain under **Project Settings → Domains**.

## Customization checklist for launch

Before going live, replace placeholders:

- [ ] `content/settings.ts` — firm name, real address, phone, email, disclaimers (confirm wording with the firm's bar)
- [ ] Replace all attorney `.mdx` files with real bios
- [ ] Replace practice area `.mdx` files with real descriptions
- [ ] Drop real attorney photos into `public/images/attorneys/`
- [ ] Update `/about` page with the firm's actual story
- [ ] Update `/privacy` policy with the firm's actual data practices and an effective date
- [ ] Update `/disclaimer` with any bar-specific language required by the states the attorneys are admitted in
- [ ] Customize colors and typography in `src/styles/globals.css` (CSS variables at top)
- [ ] Add a favicon at `src/app/icon.png` (and `apple-icon.png`)
- [ ] Create the Formspree form and set `NEXT_PUBLIC_FORMSPREE_ID`
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the real production domain
- [ ] Validate structured data with [Google's Rich Results Test](https://search.google.com/test/rich-results)

## Notes

- The contact form does not create an attorney-client relationship; the form copy warns submitters not to send confidential information.
- Attorney advertising disclaimer and "prior results" caveats appear in the footer on every page. Adjust wording in `content/settings.ts` once the firm confirms the language required by their state bar(s).
