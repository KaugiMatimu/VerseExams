# VersaExam Blog CMS implementation brief

## Confirmed scope
The user chose a separate Next.js blog/admin application and local development setup, leaving the existing one-file website intact for now. There is only `index.html` in the workspace; no current Next app, PostgreSQL service, or existing admin login. Build this app in `C:\Users\Admin\Desktop\verseExams\blog-cms`.

## Objective
Build a working blog publishing system where anyone can view published articles, and only the configured admin can log in and create, edit, publish/unpublish, and delete blog posts. Store posts in PostgreSQL. Provide local Windows-friendly run instructions. Do not edit the existing `index.html` unless specifically necessary; defer domain/reverse-proxy integration to later because hosting is not yet selected.

## Required architecture
- Next.js App Router with strict TypeScript and responsive React UI.
- PostgreSQL with Prisma ORM/schema and repeatable migrations.
- Public `/blog` listing with feature article, categories, search, responsive card grid, and `/blog/[slug]` article details. Query only published posts; draft data must never leak to public routes/metadata/search.
- Admin `/admin/login` and protected `/admin` dashboard with CRUD for title, slug, excerpt, category, Markdown body, status draft/published, publication timestamp; accessible form validation and useful success/error messages.
- All mutations and authorization checks are server-side (server actions or route handlers). No client-controlled role flags/localStorage auth.
- One admin account configured via environment variables (`ADMIN_EMAIL`, bcrypt password hash, and strong `ADMIN_SESSION_SECRET`). No public registration, no default admin credentials, no committed secrets. Provide an interactive local password-hash helper and clear setup docs.
- Session cookie must be HttpOnly, SameSite=Lax, Secure in production, scoped correctly, signed with a strong secret, and expire. Verify auth on every protected page and every write action. Use no open redirects. Basic persistent failed-login throttling is preferred if uncomplicated.
- Content is Markdown rendered safely without raw HTML. Validate form data with Zod; validate slug and protect against duplicate slug/errors.
- Seed the current five study blog entries if practical, so there is immediately visible content after following setup instructions. Label/attribute seed content as VersaExam editorial content only; don't invent authors, factual claims, customer results, images, dates, or inventory.
- Avoid remote images; style illustrations or category covers locally.
- Add `.env.example`, `.gitignore`, `docker-compose.yml` for local PostgreSQL, Prisma schema/migration/seed, package scripts, and README with exact Windows PowerShell setup steps, app URLs, admin initialization, migration/seed, start, and troubleshooting.
- No production credentials, secrets, or deploy-specific claims.

## Design direction
Follow VersaExam's existing blog visual direction and the broad editorial pattern already requested: restrained neutral/navy/blue palette, clear type hierarchy, compact editorial masthead, category/filter controls, featured post, responsive multi-column cards, readable article width. The admin should be a simple, focused editorial dashboard matching the public styling, not an overbuilt admin template. Use Sora/Plus Jakarta Sans via local/system fallbacks or existing font strategy; prefer no runtime external font dependency. Ensure mobile layouts and visible focus states.

## Quality and safety gates
- Build/lint/typecheck.
- Validate Prisma schema and run migration/seed where local PostgreSQL/Docker are available; report clearly if Docker/Postgres cannot run in this environment.
- Exercise public published list/detail, search/category, draft invisibility, unauthenticated admin redirect and action denial, admin login/session/logout, and create/edit/publish/delete flows.
- Never present disabled or fake success as a functional backend; database-dependent functionality requires documented configured `DATABASE_URL`.
- Keep the legacy website unchanged until deployment integration is selected.
