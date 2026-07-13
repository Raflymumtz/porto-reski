# Reski — Portfolio + CMS

A portfolio website for **Reski** (Social Media Specialist, Jakarta) with a
liquid-glass + gradient design, plus a built-in content management system (CRUD).

- **Public site** — Home, About, Projects (with category filter & detail pages)
- **Admin CMS** — login-protected panel to manage all content and images
- **No database engine to install** — data is stored in a single JSON file
  (`data/db.json`) and uploaded images live in `public/uploads/`.

Built with Node.js + Express + EJS. Every dependency is pure JavaScript, so it
runs on Windows/macOS/Linux without any native build step.

---

## 1. Requirements

- [Node.js](https://nodejs.org/) 18 or newer (includes `npm`).

## 2. Install

```bash
npm install
```

## 3. Run

```bash
npm start
```

Then open:

| Area          | URL                                             |
|---------------|-------------------------------------------------|
| Public site   | http://localhost:3000                           |
| Admin CMS     | http://localhost:3000/admin                     |
| Admin (subdomain, optional) | http://admin.localhost:3000       |

Use `npm run dev` to auto-restart on file changes.

### Default admin login

```
username: admin
password: reski123
```

> **Change this before going live.** See _Configuration_ below.

---

## 4. Two "domains": public vs admin

The app serves both audiences from one server:

- The **public** portfolio is served on the main host (e.g. `example.com`).
- The **admin** CMS is served on the `admin.` subdomain (e.g. `admin.example.com`).
- For convenience during local development, the admin panel is **also** reachable
  at `/admin` on the main host. To disable that and force the subdomain only,
  set `STRICT_SUBDOMAIN=true`.

`admin.localhost` works out of the box in most browsers. On real hosting, point
both `example.com` and `admin.example.com` at this server.

---

## 5. Managing content (the CMS)

Log in at `/admin`, then use the sidebar:

- **Projects** — portfolio items. Each has a category, cover image, image
  gallery, tags, description, client, year, engagement note, external link, and
  a "featured" toggle (featured projects appear on the home page).
- **Creative Spaces** — the four service cards on the home page
  (Social Media Management, Content Design, Brand Visual, Copy Writing).
- **Experience** — the work-history timeline on the About page.
- **Tools** — the "Tools of the Trade" cards on the About page.
- **Site Settings** — name, role, hero text, about text, photos, email & LinkedIn.

All create / edit / delete actions save immediately to `data/db.json`.
Uploaded images are stored in `public/uploads/`.

---

## 6. Configuration

Configuration lives in `config.js` and can be overridden with environment
variables:

| Variable              | Purpose                                              | Default            |
|-----------------------|------------------------------------------------------|--------------------|
| `PORT`                | Port to listen on                                    | `3000`             |
| `ADMIN_USERNAME`      | Admin username                                       | `admin`            |
| `ADMIN_PASSWORD`      | Admin password (plain text)                          | `reski123`         |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash of the password (takes priority)         | derived from above |
| `SESSION_SECRET`      | Secret used to sign the session cookie               | change me          |
| `STRICT_SUBDOMAIN`    | `true` = admin only on `admin.` subdomain            | `false`            |

Example (PowerShell):

```powershell
$env:ADMIN_PASSWORD = "my-strong-password"
$env:SESSION_SECRET = "some-long-random-string"
npm start
```

---

## 7. Project structure

```
porto-reski/
├── server.js            # Express app + host/path routing
├── config.js            # Settings (admin login, port, session)
├── data/db.json         # All content (the "database")
├── lib/
│   ├── db.js            # JSON read/write CRUD helpers
│   ├── resources.js     # Field schema that drives the admin forms
│   └── upload.js        # Image upload (multer) config
├── routes/
│   ├── public.js        # Home / About / Projects
│   └── admin.js         # Login + generic CRUD + settings
├── views/
│   ├── public/          # Public pages (EJS)
│   ├── admin/           # Admin pages (EJS)
│   └── partials/        # Shared header/footer/icons
└── public/
    ├── css/             # style.css (site) + admin.css
    ├── js/main.js       # Nav, scroll reveal, parallax
    └── uploads/         # Uploaded images
```

---

## 8. Backup

To back up all content, copy `data/db.json` and the `public/uploads/` folder.
To reset content, edit or replace `data/db.json`.

---

## 9. Notes

- Sessions are stored in memory, so restarting the server logs you out — fine for
  a single-owner portfolio.
- For public deployment, run behind a reverse proxy (e.g. Nginx) with HTTPS and
  set a strong `ADMIN_PASSWORD` and `SESSION_SECRET`.
