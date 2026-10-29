# Jj Up — Full-stack starter

This is a **development foundation**, not a production-ready marketplace yet.

## Stack
- Existing HTML/CSS/JavaScript prototype in `frontend/`
- Node.js + Express API in `backend/`
- MongoDB Atlas via Mongoose
- Password hashing with bcrypt
- Server-side sessions in an HTTP-only cookie
- Helmet security headers, rate limiting, input validation

## 1. Requirements
Install Node.js LTS and create a MongoDB Atlas database. In Atlas, create a database user and allow access only from your current IP when possible.

## 2. Configure backend
Open a terminal in `backend/` and run:

```bash
npm install
```

Copy `.env.example` to `.env` and replace every placeholder. Use a long random `SESSION_SECRET` (at least 32 random bytes). Never upload `.env` to GitHub.

```bash
npm run dev
```

The API starts at `http://localhost:4000`. Test `GET /api/health`.

## 3. Important current limitation
The included `frontend/Jj Up.html` is the original prototype. It still uses `localStorage` demo data and simulated verification/payment flows. It is preserved for design reference, **not yet connected to the API**. The next integration step is to replace the prototype's signup/login handlers and localStorage data access with calls to `/api/auth/*` and `/api/jobs`.

## Security notes
- Do not store passwords, session IDs, or access tokens in `localStorage`.
- This starter uses server-side sessions and an HTTP-only cookie.
- Production requires HTTPS, a real email verification provider, password reset, CSRF/origin protection appropriate to deployment, monitoring, backups, and security testing.
- Payments are not implemented. Never mark a real payment as received based on a frontend button. Integrate a supported payment provider and verify signed webhooks on the server before updating order/payment status.
- Do not launch with demo users, demo verification codes, or simulated escrow.
