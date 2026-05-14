# Jambo Tickets

Kenya's premier event ticketing platform. Buy tickets for concerts, sports, conferences and more — powered by M-Pesa.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, TailwindCSS, Framer Motion, React Query, React Router v6 |
| Backend | Node.js + Express.js, Prisma ORM |
| Database | PostgreSQL |
| Payments | Safaricom Daraja API (M-Pesa STK Push) |
| Auth | JWT (access + refresh tokens), bcryptjs |
| Email | Nodemailer (SMTP) |
| QR Codes | qrcode npm package |
| PDF Tickets | pdfkit |
| File Uploads | Multer (local `/uploads` — swap to S3 in production) |

---

## Project Structure

```
jambo-tickets/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (10 models)
│   │   └── seed.js             # Seed: admin, organiser, 5 events, blog posts
│   ├── src/
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # auth.js, upload.js, errorHandler.js
│   │   ├── routes/             # Express routers
│   │   └── services/           # mpesa, email, pdf, qr
│   ├── uploads/                # Local file storage (gitignored)
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/         # Navbar, Footer, EventCard, etc.
    │   ├── context/            # AuthContext
    │   ├── hooks/              # useAuth, useMpesaPolling
    │   ├── pages/
    │   │   ├── admin/          # Admin portal pages
    │   │   └── organiser/      # Organiser portal pages
    │   └── utils/              # api.js (Axios), formatters
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.js
    └── .env.example
```

---

## Prerequisites

- **Node.js** v18 or later
- **PostgreSQL** v14 or later (running locally or remote)
- **npm** v9 or later
- A **Safaricom Developer** account at https://developer.safaricom.co.ke (for M-Pesa)
- An **SMTP** account (Gmail, Mailgun, etc.) for sending emails

---

## Setup Guide

### 1. Clone the repository

```bash
git clone https://github.com/your-org/jambo-tickets.git
cd jambo-tickets
```

---

### 2. Configure the Backend

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in every variable:

```env
# PostgreSQL — create a database first: createdb jambo_tickets
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/jambo_tickets?schema=public"

# JWT — generate with: openssl rand -base64 64
JWT_SECRET=your_very_long_random_secret_here
JWT_REFRESH_SECRET=another_very_long_random_secret_here

PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# M-Pesa Daraja (from developer.safaricom.co.ke)
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASSKEY=your_passkey
MPESA_SHORTCODE=your_shortcode
MPESA_CALLBACK_URL=https://your-ngrok-or-domain.com/api/mpesa/callback
MPESA_ENVIRONMENT=sandbox

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="Jambo Tickets <noreply@jambotikets.co.ke>"
```

> **Gmail tip:** Use an App Password, not your main password. Enable 2FA first, then generate at https://myaccount.google.com/apppasswords

> **M-Pesa sandbox tip:** Use shortcode `174379` and passkey from the Daraja sandbox. For the callback URL, use [ngrok](https://ngrok.com) to expose your local port 5000 during development.

---

### 3. Install backend dependencies

```bash
cd backend
npm install
```

---

### 4. Run database migrations

```bash
npx prisma migrate dev --name init
```

This creates all tables in your PostgreSQL database.

---

### 5. Seed the database

```bash
npx prisma db seed
```

Or:

```bash
node prisma/seed.js
```

This creates:
- **Admin user:** `admin@jambotikets.co.ke` / `Admin@1234`
- **Organiser user:** `organiser@jambotikets.co.ke` / `Organiser@1234`
- 5 published sample events with ticket tiers
- 3 blog posts
- Default platform settings

---

### 6. Start the backend

```bash
npm run dev
```

The API will be running at **http://localhost:5000**

Test it: http://localhost:5000/api/health

---

### 7. Configure the Frontend

Open a new terminal:

```bash
cd frontend
cp .env.example .env
```

The default `.env` is:

```env
VITE_API_URL=http://localhost:5000
```

Leave this as-is for local development (Vite proxies `/api` automatically).

---

### 8. Install frontend dependencies

```bash
cd frontend
npm install
```

---

### 9. Start the frontend

```bash
npm run dev
```

The app will be running at **http://localhost:5173**

---

## Default Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@jambotikets.co.ke | Admin@1234 |
| Organiser | organiser@jambotikets.co.ke | Organiser@1234 |

---

## Key Routes

### Public
| Route | Description |
|---|---|
| `/` | Homepage with hero, featured events, filter grid |
| `/events` | Events listing with search and filters |
| `/events/:slug` | Event detail with ticket tiers |
| `/checkout` | M-Pesa payment checkout |
| `/booking-confirmation/:ref` | Post-payment confirmation with QR |
| `/calendar` | Monthly event calendar |
| `/blog` | Blog listing |
| `/blog/:slug` | Blog post detail |
| `/about` | About page |
| `/contact` | Contact form |

### Auth
| Route | Description |
|---|---|
| `/login` | Login page |
| `/register` | Registration page |
| `/forgot-password` | Password reset request |
| `/reset-password/:token` | Set new password |
| `/my-tickets` | Authenticated user's tickets |

### Organiser Portal (`/organiser/*`)
| Route | Description |
|---|---|
| `/organiser` | Dashboard with stats |
| `/organiser/create-event` | Create new event |
| `/organiser/events` | My events list |
| `/organiser/events/:id/analytics` | Per-event analytics + CSV export |
| `/organiser/payouts` | Request and track payouts |

### Admin Panel (`/admin/*`)
| Route | Description |
|---|---|
| `/admin` | Dashboard with charts |
| `/admin/events` | Manage all events (approve/delete) |
| `/admin/users` | Manage users (roles, suspend) |
| `/admin/bookings` | All bookings with search |
| `/admin/blog` | Blog CRUD |
| `/admin/payouts` | Approve/reject payout requests |
| `/admin/settings` | Platform settings |

---

## API Endpoints

All responses follow the format:
```json
{ "success": true, "data": {}, "message": "" }
```

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT tokens |
| GET | `/api/auth/me` | Bearer | Current user profile |
| POST | `/api/auth/refresh-token` | Public | Refresh access token |
| POST | `/api/auth/forgot-password` | Public | Send reset email |
| POST | `/api/auth/reset-password/:token` | Public | Set new password |
| GET | `/api/events` | Public | List published events (filterable) |
| GET | `/api/events/:slug` | Public | Event detail by slug |
| POST | `/api/events` | Organiser+ | Create event (multipart) |
| PUT | `/api/events/:id` | Organiser+ | Update event |
| DELETE | `/api/events/:id` | Organiser+ | Delete event |
| PATCH | `/api/events/:id/approve` | Admin | Publish event |
| GET | `/api/events/:id/analytics` | Organiser+ | Event analytics |
| POST | `/api/bookings/initiate` | Optional | Start M-Pesa checkout |
| GET | `/api/bookings/confirm/:ref` | Public | Check booking status |
| GET | `/api/bookings/my` | Bearer | User's bookings |
| GET | `/api/bookings/download/:ref` | Public | Stream PDF ticket |
| GET | `/api/bookings/qr/:ref` | Public | QR code data URL |
| POST | `/api/bookings/scan/:qrCode` | Organiser+ | Mark ticket as used |
| POST | `/api/mpesa/callback` | Public | Daraja callback |
| GET | `/api/mpesa/status/:checkoutRequestId` | Public | Poll payment status |
| GET | `/api/blog` | Public | Published blog posts |
| GET | `/api/blog/:slug` | Public | Single blog post |
| POST | `/api/blog` | Admin | Create blog post |
| PUT | `/api/blog/:id` | Admin | Update blog post |
| DELETE | `/api/blog/:id` | Admin | Delete blog post |
| POST | `/api/contact` | Public | Submit contact form |
| GET | `/api/calendar` | Public | Events grouped by date |
| POST | `/api/newsletter` | Public | Subscribe to newsletter |
| GET | `/api/settings` | Public | Platform settings |
| PUT | `/api/settings` | Admin | Update settings |
| GET | `/api/users` | Admin | All users |
| PUT | `/api/users/:id/role` | Admin | Change user role |
| PUT | `/api/users/:id/suspend` | Admin | Toggle user suspension |
| POST | `/api/payouts` | Organiser | Request payout |
| GET | `/api/payouts/my` | Organiser | My payout history |
| GET | `/api/payouts` | Admin | All payout requests |
| PATCH | `/api/payouts/:id/status` | Admin | Approve/reject payout |

---

## M-Pesa Integration Notes

### How the payment flow works

1. User fills checkout form → clicks **Pay Now**
2. Frontend calls `POST /api/bookings/initiate`
3. Backend creates a `PENDING` booking, calls Daraja STK Push
4. User receives M-Pesa prompt on their phone
5. Frontend polls `GET /api/mpesa/status/:checkoutRequestId` every 5 seconds
6. Daraja sends callback to `POST /api/mpesa/callback`
7. Backend confirms booking, updates ticket quantities, sends email with QR + PDF download link
8. Frontend detects `CONFIRMED` status → redirects to `/booking-confirmation/:ref`

### Sandbox testing

Use the [Daraja sandbox](https://developer.safaricom.co.ke/test_credentials) test credentials.
For callbacks to reach your local machine, use [ngrok](https://ngrok.com):

```bash
ngrok http 5000
# Copy the https URL → set as MPESA_CALLBACK_URL in .env
# e.g. https://abc123.ngrok.io/api/mpesa/callback
```

---

## Production Deployment Notes

- **File storage:** Replace Multer local storage with S3 or Cloudinary. Update `upload.js` middleware and change image URLs to use CDN.
- **Database:** Use a managed PostgreSQL service (Supabase, Neon, Railway, or RDS).
- **HTTPS:** Required for M-Pesa callbacks. Use Nginx + Certbot or a platform like Railway/Render that provides SSL.
- **Environment:** Set `NODE_ENV=production` and `MPESA_ENVIRONMENT=production`.
- **Secrets:** Never commit `.env` to version control.
- **Rate limiting:** Already configured on auth routes (10 req / 15 min).

---

## Development Scripts

### Backend
```bash
npm run dev        # Start with nodemon (auto-reload)
npm start          # Production start
npx prisma studio  # Visual DB browser at http://localhost:5555
npx prisma migrate dev --name <name>  # Create new migration
node prisma/seed.js  # Re-run seed
```

### Frontend
```bash
npm run dev        # Vite dev server with HMR
npm run build      # Production build to dist/
npm run preview    # Preview production build locally
```

---

## License

MIT — built for Kenya's event ecosystem.
