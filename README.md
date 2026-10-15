# ToolHub

English-language tools site. The first release has seven tools:

- Image Compressor, Image Converter, Image Resizer
- PDF Merge, PDF Compress
- JSON Formatter and Password Generator (browser only)

Image and PDF work runs through the Laravel API. JSON and passwords never leave the browser. Anonymous visitors get 20 successful image or PDF operations per IP hash per UTC day.

The roadmap named Laravel 12. This app uses the current Laravel 13 skeleton, with the same API layout (`bootstrap/app.php`, `/api/v1/...`).

## Layout

- `frontend/` — Next.js App Router, Tailwind, TypeScript
- `backend/` — Laravel API
- `deploy/` — Nginx and systemd examples

Production database is MySQL. The checked-in local `backend/.env` uses SQLite so the API can run when MySQL is not started. Copy `backend/.env.example` on the VPS and point it at MySQL.

Cloudflare R2 is configured as the `r2` disk and an `ObjectStorage` interface. Leave the R2 keys empty for this release. Files are processed in `storage/app/tmp` and deleted after download. `toolhub:prune-temp` removes anything older than 60 minutes. The queue driver is `sync`.

## Local development

```bash
cd backend
composer install
cp .env.example .env   # or keep the sqlite .env already generated
php artisan key:generate
php artisan migrate
composer serve
```

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000. The frontend calls `NEXT_PUBLIC_API_URL` (default `http://127.0.0.1:8000`).

`php artisan serve` and `composer serve` both start the local API with `upload_max_filesize=25M` and `post_max_size=64M`. The system PHP default is often 2 MB, which rejects a normal photo before Laravel can read it. On PHP-FPM the same values live in `backend/public/.user.ini`.

Ghostscript (`gs`) is required for PDF compress and as the PDF merge fallback.

```bash
cd backend && php artisan test
```

## VPS (Nginx, PHP-FPM, MySQL, Certbot)

Install PHP 8.3+ with `gd`, `pdo_mysql`, `mbstring`, `xml`, `curl`, `zip`, and `fileinfo`, plus MySQL, Nginx, Node.js, and Ghostscript.

```bash
sudo apt install nginx mysql-server ghostscript certbot python3-certbot-nginx
```

```sql
CREATE DATABASE toolhub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'toolhub'@'127.0.0.1' IDENTIFIED BY 'change-me';
GRANT ALL PRIVILEGES ON toolhub.* TO 'toolhub'@'127.0.0.1';
FLUSH PRIVILEGES;
```

On the server, set `backend/.env` from `.env.example`:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://toolhub.example.com`
- MySQL credentials above
- `QUEUE_CONNECTION=sync`
- `FRONTEND_URL=https://toolhub.example.com`
- `GS_BINARY=gs`

Do not start a queue worker for this release. Bulk jobs can move to Redis later.

Build the frontend with the public origin so the browser calls `/api` on the same host:

```bash
cd frontend
# NEXT_PUBLIC_API_URL=https://toolhub.example.com
# NEXT_PUBLIC_SITE_URL=https://toolhub.example.com
npm ci
npm run build
```

Nginx proxies `/` to Next.js and sends `/api/` to PHP-FPM. See `deploy/nginx/toolhub.conf`. The sample overwrites `X-Forwarded-For` with `$remote_addr` so clients cannot spoof the daily-limit IP. Laravel trusts only `127.0.0.1`.

```bash
sudo certbot --nginx -d toolhub.example.com
```

`www-data` needs write access to `backend/storage` and `backend/bootstrap/cache`.

```bash
cd backend
php artisan migrate --force
php artisan config:cache
php artisan route:cache
```

Schedule the temp cleanup with cron (queue stays sync, so this is the only background task):

```cron
* * * * * cd /var/www/html/toolhub/backend && php artisan schedule:run >> /dev/null 2>&1
```

`routes/console.php` runs `toolhub:prune-temp` hourly.

A sample unit for `next start` is in `deploy/systemd/toolhub-web.service`.

## API

```http
POST /api/v1/image/compress
POST /api/v1/image/convert
POST /api/v1/image/resize
POST /api/v1/pdf/merge
POST /api/v1/pdf/compress
```

Image uploads are JPG, PNG, WebP, or GIF up to 10 MB. PDFs are up to 20 MB. Merge accepts 2–10 PDFs and 200 pages. Responses are file downloads. A `429` means the daily free limit was reached. Validation and processing errors return `422`.
# toolhub
# toolhub
