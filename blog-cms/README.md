# VersaExam Blog CMS

A separate Next.js App Router application for the VersaExam study journal and its private editorial desk. It stores content in PostgreSQL through Prisma. The existing `index.html` site reads published article previews from this application through its public API.

## Requirements

- Node.js 20.9 or newer and npm
- Docker Desktop with Compose, or an existing PostgreSQL server
- Windows PowerShell

## First-time setup (PowerShell)

Run these commands from `C:\Users\Admin\Desktop\verseExams\blog-cms`:

```powershell
Copy-Item .env.example .env
npm install

# Generate random local-only values; no default database or session secrets are provided.
$dbBytes = New-Object byte[] 24
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($dbBytes)
$dbPassword = ([BitConverter]::ToString($dbBytes)).Replace('-', '').ToLowerInvariant()
$sessionBytes = New-Object byte[] 48
$rng.GetBytes($sessionBytes)
$sessionSecret = [Convert]::ToBase64String($sessionBytes)
$envText = Get-Content .env -Raw
$envText = $envText -replace '(?m)^POSTGRES_PASSWORD=.*$', "POSTGRES_PASSWORD=$dbPassword"
$envText = $envText -replace '(?m)^DATABASE_URL=.*$', "DATABASE_URL=postgresql://versaexam:$dbPassword@localhost:5433/versaexam_blog?schema=public"
$envText = $envText -replace '(?m)^ADMIN_SESSION_SECRET=.*$', "ADMIN_SESSION_SECRET=$sessionSecret"
Set-Content -Path .env -Value $envText -NoNewline -Encoding ASCII
```

Set a private administrator email in `.env`, then create a password hash. The helper asks for a password and confirmation; use at least 12 characters:

```powershell
npm run hash-password
```

Copy the printed bcrypt hash into `ADMIN_PASSWORD_HASH` in `.env`, escaping each `$` as `\$` (for example, the hash should begin `\$2b\$12\$...`). Next.js expands `$` in environment values unless escaped. Do not commit or share `.env`. `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`, and `DATABASE_URL` must be set before use.

## Start PostgreSQL

```powershell
docker compose up -d db
docker compose ps
```

The database uses a named Docker volume and the random password in `.env`. To stop it without deleting data, run `docker compose down`. To intentionally remove the local database and its data, run `docker compose down -v`.

For an existing PostgreSQL server, set `DATABASE_URL` in `.env` to its URL and skip Docker Compose. URL-encode any special characters in the database username or password.

## Migrate, seed, and run

```powershell
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open [http://localhost:3000/blog](http://localhost:3000/blog). The editorial sign-in is at [http://localhost:3000/admin/login](http://localhost:3000/admin/login). Seed content is attributed to the VersaExam editorial team; seed dates are left unset because no original publication dates were supplied. Seeding is repeatable and does not overwrite posts that already exist.

The dashboard supports creating, editing, publishing, unpublishing, and deleting posts. Draft posts are available only in the authenticated dashboard and are excluded from public listing, search, article pages, and metadata. Article bodies accept Markdown; embedded raw HTML is not rendered. The editor toolbar inserts Markdown at the current selection and previews using the same raw-HTML-disabled renderer. Uploaded JPEG, PNG, GIF, and WebP files (up to 5 MiB) are stored as PostgreSQL byte data and inserted into the article as `/api/media/{id}` image links.

The checked-in `20261107000000_add_media` migration adds the `Media` table. Apply it with `npx prisma migrate deploy` before using image uploads. Existing installations must run migrations before restarting the app; PostgreSQL stores the image bytes in the database, so include this table in backup and retention planning.

## Legacy site integration

The existing `index.html` blog preview requests `GET /api/public/posts` from this app when a visitor opens Blogs. The endpoint returns at most 50 published posts, ordered newest first, with only `title`, `slug`, `excerpt`, and `category`. It is read-only and allows unauthenticated cross-origin GET requests for the public preview; it does not return post bodies, drafts, or admin data. Preview cards link to each canonical `/blog/{slug}` article.

The CMS base URL is configured once in `index.html` as `BLOG_APP_URL`, defaulting to `http://localhost:3000`. **Change this value to the deployed CMS origin before publishing the legacy site.** The CMS must be reachable over HTTPS in production; the public endpoint sends wildcard CORS headers because its published preview data is intentionally public.

## Checks and useful commands

```powershell
npm test
npm run lint
npm run typecheck
npm run build
npm run db:studio
```

`npm run db:migrate` runs `prisma migrate dev` for local schema development; the setup instructions use `prisma migrate deploy` to apply the checked-in migration. Do not use `prisma db push` as a replacement for migrations.

## Security notes

- No registration or hard-coded/default credentials are included.
- The admin uses an eight-hour HMAC-signed, HttpOnly, SameSite=Lax cookie; it is Secure in production and scoped to `/`.
- Admin pages and each write action verify the signature, expiration, and configured email on the server. Next.js Server Actions enforce their request-origin checks.
- Image upload is a same-origin authenticated POST, capped at 5 MiB per file, and validates both the raster MIME allowlist and file signature. Public media reads serve only stored raster bytes with explicit content length and `nosniff`; no upload CORS is enabled.
- Login attempts for the configured account are counted in PostgreSQL and temporarily locked after eight consecutive failures.
- Configure HTTPS at the hosting/reverse-proxy layer before production use. Generate separate production secrets and do not reuse development credentials.

## Troubleshooting

- **Docker cannot start:** Start Docker Desktop, then retry `docker compose up -d db`.
- **Docker port 5433 is occupied:** Change the left-hand port in `docker-compose.yml` and the port in `DATABASE_URL`. The container itself continues to listen on port 5432.
- **Prisma cannot connect:** Check `docker compose ps`, `DATABASE_URL`, and `POSTGRES_PASSWORD` in `.env`; then retry `npx prisma migrate deploy`.
- **Login is unavailable:** Confirm `ADMIN_EMAIL`, the bcrypt `ADMIN_PASSWORD_HASH`, and an `ADMIN_SESSION_SECRET` of at least 32 characters. To clear a development lockout, remove its `LoginThrottle` row in Prisma Studio or wait 15 minutes.
- **Empty journal:** Run `npm run db:seed` after the migration, or publish a post from the editorial desk.

## Project layout

- `app/blog` — published-only journal and article pages
- `app/api/public/posts` — cross-origin, published-only preview feed for the legacy site
- `app/admin` — authenticated editorial desk and CRUD screens
- `app/actions` — server-only login, logout, and post mutations
- `app/api/media` — authenticated PostgreSQL-backed image uploads and public raster reads
- `prisma/schema.prisma` and `prisma/migrations` — PostgreSQL data model and migration
- `prisma/seed.ts` — five VersaExam editorial starter posts
