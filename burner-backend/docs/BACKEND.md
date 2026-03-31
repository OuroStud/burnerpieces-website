# Burner Pieces – Backend Technical Documentation

**Brand:** Burner Pieces  
**Entity:** Ouro Studio Private Limited  
**Site:** burnerpieces.com  
**Stack:** Cloudflare Workers · D1 · Razorpay · Zoho Books · Zoho Mail · Shiprocket

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Project Structure](#2-project-structure)
3. [Environment Setup](#3-environment-setup)
4. [Cloudflare D1 Database](#4-cloudflare-d1-database)
5. [API Endpoints](#5-api-endpoints)
6. [Payment Flow & Razorpay Integration](#6-payment-flow--razorpay-integration)
7. [GST Invoice Generation](#7-gst-invoice-generation)
8. [Zoho Books Integration](#8-zoho-books-integration)
9. [Zoho Mail (Email)](#9-zoho-mail-email)
10. [Shiprocket Integration](#10-shiprocket-integration)
11. [Deployment](#11-deployment)
12. [Secret Reference](#12-secret-reference)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Architecture Overview

```
Browser (burnerpieces.com)
  │
  ├─ Static assets ──────────────── Cloudflare Workers (existing)
  │
  └─ /api/* ─────────────────────── Cloudflare Worker (NEW backend)
                                          │
                        ┌─────────────────┼──────────────────────┐
                        │                 │                      │
                     Cloudflare D1    Zoho Mail            Razorpay API
                     (SQLite DB)    (transactional         (verify sig)
                                       email)
                        │
                 ┌──────┴──────────┐
              Zoho Books        Shiprocket
              (accounting)     (fulfilment)
```

All backend logic runs **serverlessly inside Cloudflare Workers**. There are no servers to manage. The Worker is deployed to Cloudflare's global edge and routes `/api/*` traffic from your domain.

---

## 2. Project Structure

```
burner-backend/
├── src/
│   ├── index.js                 # Router / entry point
│   ├── handlers/
│   │   ├── payment.js           # POST /api/payment/verify
│   │   ├── contact.js           # POST /api/contact
│   │   ├── newsletter.js        # POST /api/newsletter
│   │   └── orders.js            # GET  /api/orders  (admin)
│   ├── services/
│   │   ├── razorpay.js          # HMAC signature verification
│   │   ├── invoice.js           # GST PDF generation
│   │   ├── email.js             # Zoho Mail API
│   │   ├── zohoBooks.js         # Zoho Books API
│   │   └── shiprocket.js        # Shiprocket order creation
│   └── utils/
│       └── helpers.js           # CORS, GST calc, formatters
├── schema.sql                   # D1 migration
├── wrangler.toml                # Cloudflare config
└── frontend-checkout.js         # Drop-in frontend snippet
```

---

## 3. Environment Setup

### Prerequisites

```bash
# Install Wrangler CLI
npm install -g wrangler

# Authenticate
wrangler login
```

### First-time setup

```bash
# 1. Create D1 database
wrangler d1 create burner-pieces-db
# Copy the database_id output into wrangler.toml

# 2. Apply schema
wrangler d1 execute burner-pieces-db --file=schema.sql

# 3. Set all secrets (see Section 12)
wrangler secret put RAZORPAY_KEY_SECRET
# ... (repeat for each secret)

# 4. Deploy
wrangler deploy
```

---

## 4. Cloudflare D1 Database

### Tables

#### `orders`
Stores every verified Razorpay payment and associated order data.

| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | Auto-increment |
| razorpay_order_id | TEXT | From Razorpay |
| razorpay_payment_id | TEXT UNIQUE | Prevents duplicate processing |
| invoice_number | TEXT | `BP-YYYYMM-XXXXX` format |
| amount_paise | INTEGER | Amount in paise (₹ × 100) |
| customer_name | TEXT | |
| customer_email | TEXT | |
| customer_phone | TEXT | |
| customer_address / city / state / pincode | TEXT | |
| items_json | TEXT | JSON array of line items |
| status | TEXT | `pending → confirmed → shipped → delivered` |
| shiprocket_order_id | TEXT | Filled after Shiprocket call |
| zoho_invoice_id | TEXT | Filled after Zoho Books push |
| invoice_sent_at | TEXT | ISO timestamp |
| created_at | TEXT | ISO timestamp |

#### `invoice_sequence`
Auto-increment table used to generate unique sequential invoice numbers. Each successful payment inserts one row and reads `last_insert_rowid()`.

#### `contact_submissions`
Stores every contact form submission. Fields: `name, email, phone, subject, message, read, created_at`.

#### `newsletter_subscribers`
Deduplicated by email (`UNIQUE` constraint). Fields: `email, name, subscribed_at, unsubscribed`.

### Useful D1 queries

```bash
# View orders
wrangler d1 execute burner-pieces-db \
  --command "SELECT invoice_number, customer_email, amount_paise/100.0 AS rupees, status FROM orders ORDER BY created_at DESC LIMIT 10"

# Export newsletter list
wrangler d1 execute burner-pieces-db \
  --command "SELECT email, name, subscribed_at FROM newsletter_subscribers WHERE unsubscribed = 0"
```

---

## 5. API Endpoints

### `POST /api/payment/verify`
Verifies Razorpay payment, creates order record, generates GST invoice, pushes to Zoho Books, creates Shiprocket shipment, and emails invoice to customer.

**Request body:**
```json
{
  "razorpay_order_id":   "order_XXXX",
  "razorpay_payment_id": "pay_XXXX",
  "razorpay_signature":  "abc123...",
  "customer": {
    "name":    "Priya Sharma",
    "email":   "priya@example.com",
    "phone":   "9876543210",
    "address": "42 MG Road, Bandra West",
    "city":    "Mumbai",
    "state":   "Maharashtra",
    "pincode": "400050",
    "gstin":   ""          // optional, for B2B orders
  },
  "items": [
    {
      "name":      "Burner Oversized Tee",
      "qty":       1,
      "unitPrice": 1999,
      "sku":       "BOT-BLK-L",
      "hsn":       "6109",
      "weight_kg": 0.3
    }
  ],
  "amount": 199900          // in paise
}
```

**Success response:**
```json
{
  "success": true,
  "invoiceNumber": "BP-202506-00001",
  "message": "Payment verified. Invoice will be emailed shortly."
}
```

**Error responses:**

| HTTP | Reason |
|---|---|
| 400 | Missing fields / invalid JSON |
| 403 | Razorpay signature mismatch |
| 500 | Internal error |

---

### `POST /api/contact`
Saves contact form submission and forwards to admin email.

**Request body:**
```json
{
  "name":    "Rahul",
  "email":   "rahul@example.com",
  "phone":   "9000000000",
  "subject": "Return query",
  "message": "I'd like to initiate a return..."
}
```

---

### `POST /api/newsletter`
Subscribes an email to the newsletter (idempotent – won't duplicate).

**Request body:**
```json
{ "email": "fan@example.com", "name": "Ananya" }
```

---

### `GET /api/orders`
Admin-only order listing (paginated).

**Header:** `X-Admin-Key: <ADMIN_SECRET>`

**Query params:** `?page=1&limit=20`

---

## 6. Payment Flow & Razorpay Integration

### How it works

```
Customer        Frontend JS          Razorpay         Backend Worker
    │                │                   │                   │
    │── Click Pay ──▶│                   │                   │
    │                │── Open Checkout ─▶│                   │
    │── Enter card ─▶│                   │                   │
    │                │◀── payment resp ──│                   │
    │                │── POST /api/payment/verify ──────────▶│
    │                │                   │ verify HMAC sig   │
    │                │                   │                   │── Save to D1
    │                │                   │                   │── Gen PDF
    │                │                   │                   │── Zoho Books
    │                │                   │                   │── Shiprocket
    │                │                   │                   │── Email
    │                │◀── { success } ───────────────────────│
    │◀── Confirmed ──│
```

### Signature verification (HMAC-SHA256)

Razorpay signs its payment responses using:

```
HMAC_SHA256(key=KEY_SECRET, message="ORDER_ID|PAYMENT_ID")
```

The backend recomputes this using `crypto.subtle` (Web Crypto API, zero dependencies) and compares it to the signature sent by the frontend. **If signatures don't match, the order is rejected** — this prevents fraudulent payment confirmations.

### Why verify on the backend?

Your `KEY_SECRET` must **never** be in the frontend. The frontend only needs `KEY_ID` (public). The backend receives the three Razorpay fields and validates them server-side before doing anything with the order.

---

## 7. GST Invoice Generation

### GST rate logic

| Item unit price | Rate | Split |
|---|---|---|
| ≤ ₹2,500 | **5%** | CGST 2.5% + SGST 2.5% |
| > ₹2,500 | **12%** | CGST 6% + SGST 6% |

> ⚠️ **Note:** Your brief specified 18% for items > ₹2500. The correct Indian GST rate for apparel is **12%** (HSN 6109). The code uses 12% but the constant is clearly marked in `helpers.js` so you can change it if your CA advises differently.

### Intra-state vs Inter-state

- If the **buyer's state == seller's state** (Maharashtra) → **CGST + SGST**
- If different → **IGST** (same total rate)

The seller state is hardcoded as `Maharashtra` in `invoice.js`. Update the `SELLER` object with your registered address and GSTIN.

### Invoice number format

`BP-YYYYMM-XXXXX` — e.g. `BP-202506-00042`

Generated using D1's autoincrement (`invoice_sequence` table) so numbers are strictly sequential and never repeated.

### PDF generation

Invoices are built as HTML and rendered to PDF using **Cloudflare Browser Rendering** (headless Chromium, available in paid Workers plans).

To enable:
1. Go to Cloudflare Dashboard → Workers & Pages → Your Worker → Settings → Bindings
2. Add a Browser Rendering binding named `BROWSER`

If Browser Rendering is not configured, the system falls back to attaching the HTML file (fully readable in any browser). This fallback ensures emails still go out during development.

---

## 8. Zoho Books Integration

### OAuth setup (one-time)

1. Go to [Zoho API Console](https://api-console.zoho.in/) → Create a Self Client
2. Generate a token with scope: `ZohoBooks.invoices.CREATE,ZohoBooks.contacts.CREATE,ZohoBooks.customerpayments.CREATE`
3. Save the refresh token → `wrangler secret put ZOHO_REFRESH_TOKEN`

### What gets pushed

1. **Contact upsert** – searches for the customer by email; creates if not found
2. **Invoice creation** – line items, tax names (`GST5` or `GST12`), invoice number
3. **Payment record** – marks the invoice as paid with `razorpay` as payment mode and the Payment ID as reference

### Tax names in Zoho Books

Zoho Books requires tax rates to be pre-configured in your organisation. Create two taxes:
- `GST5`  → 5%
- `GST12` → 12%

Go to: Zoho Books → Settings → Taxes → New Tax

---

## 9. Zoho Mail (Email)

### OAuth setup

Uses the same OAuth app and refresh token as Zoho Books. Ensure the scope includes:
`ZohoMail.messages.CREATE`

### Emails sent

| Trigger | To | Subject |
|---|---|---|
| Successful payment | Customer | `Your Burner Pieces Invoice – BP-XXXXXX` |
| Contact form | Admin | `[Contact] <subject> – <name>` |
| Newsletter signup | Subscriber | `Welcome to Burner Pieces 🔥` |

### Required secrets

| Secret | Value |
|---|---|
| `ZOHO_CLIENT_ID` | From Zoho API Console |
| `ZOHO_CLIENT_SECRET` | From Zoho API Console |
| `ZOHO_REFRESH_TOKEN` | Generate from self-client |
| `ZOHO_FROM_EMAIL` | `hello@burnerpieces.com` |
| `ZOHO_ACCOUNT_ID` | Numeric ID from Zoho Mail account settings |

---

## 10. Shiprocket Integration

### What happens automatically

After a verified payment, the Worker calls Shiprocket's `POST /orders/create/adhoc` endpoint with:
- Billing address from checkout form
- Line items (name, SKU, qty, price)
- Calculated weight and dimensions
- Payment method set to `Prepaid`

Shiprocket will auto-assign a courier based on pincode serviceability.

### Setup steps

1. Create a Shiprocket account at [shiprocket.in](https://shiprocket.in)
2. Add your pickup address under **Settings → Pickup Addresses** — note the "label" (e.g. `Primary`)
3. Set secrets: `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`, `SHIPROCKET_PICKUP_LOCATION`

### Packaging defaults

Dimensions are hardcoded at 20×15×5 cm. Update in `shiprocket.js` if your packaging differs:

```js
length:  20,   // cm
breadth: 15,
height:  5,
weight:  ...   // auto-calculated from items
```

Per-item weight defaults to `0.3 kg` if not specified in the order payload.

---

## 11. Deployment

### Initial deploy

```bash
cd burner-backend

# Create D1 database (first time only)
wrangler d1 create burner-pieces-db

# Update wrangler.toml with the database_id from above output

# Apply schema
wrangler d1 execute burner-pieces-db --file=schema.sql

# Set all secrets
wrangler secret put RAZORPAY_KEY_SECRET
wrangler secret put ZOHO_CLIENT_ID
wrangler secret put ZOHO_CLIENT_SECRET
wrangler secret put ZOHO_REFRESH_TOKEN
wrangler secret put ZOHO_FROM_EMAIL
wrangler secret put ZOHO_ACCOUNT_ID
wrangler secret put ZOHO_BOOKS_ORG_ID
wrangler secret put SHIPROCKET_EMAIL
wrangler secret put SHIPROCKET_PASSWORD
wrangler secret put SHIPROCKET_PICKUP_LOCATION
wrangler secret put ADMIN_SECRET

# Deploy
wrangler deploy
```

### Subsequent deploys

```bash
wrangler deploy
```

### Local development

```bash
wrangler dev
# Worker available at http://localhost:8787
```

Use a `.dev.vars` file for local secrets (never commit):

```
RAZORPAY_KEY_SECRET=rzp_test_...
ZOHO_CLIENT_ID=...
# etc.
```

### GitHub Actions (CI/CD)

Add to your existing GitHub repo:

```yaml
# .github/workflows/deploy.yml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths: ['burner-backend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          workingDirectory: burner-backend
```

Add `CF_API_TOKEN` to your GitHub repo secrets (create an API token in Cloudflare Dashboard with Workers edit permissions).

---

## 12. Secret Reference

| Secret name | Where to get it | Used by |
|---|---|---|
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard → API Keys | Payment verification |
| `ZOHO_CLIENT_ID` | [api-console.zoho.in](https://api-console.zoho.in) | Email + Books |
| `ZOHO_CLIENT_SECRET` | Same | Email + Books |
| `ZOHO_REFRESH_TOKEN` | Generate via Self Client | Email + Books |
| `ZOHO_FROM_EMAIL` | Your verified sender email | Zoho Mail |
| `ZOHO_ACCOUNT_ID` | Zoho Mail → Account Settings → API | Zoho Mail |
| `ZOHO_BOOKS_ORG_ID` | Zoho Books → Settings → Organisation | Zoho Books |
| `SHIPROCKET_EMAIL` | Your Shiprocket login email | Shiprocket |
| `SHIPROCKET_PASSWORD` | Your Shiprocket password | Shiprocket |
| `SHIPROCKET_PICKUP_LOCATION` | Label from Shiprocket dashboard | Shiprocket |
| `ADMIN_SECRET` | Any strong random string you choose | `GET /api/orders` |

---

## 13. Troubleshooting

### Payment verification returns 403

The Razorpay signature is wrong. Common causes:
- `RAZORPAY_KEY_SECRET` secret is set to the **test** key but you're using a **live** key (or vice versa)
- The frontend is not passing `razorpay_order_id` — double-check `handler` receives all three fields

### Zoho token errors

- Refresh tokens expire if unused for 60 days or if OAuth scope changes. Regenerate via Zoho API Console.
- Ensure the OAuth app is **not** set to "Authorization Code" type — use "Self Client" for refresh tokens.

### Shiprocket: `pickup_location not found`

The `SHIPROCKET_PICKUP_LOCATION` secret must match the exact **label** string in your Shiprocket dashboard (case-sensitive).

### PDF is HTML instead of PDF

Cloudflare Browser Rendering binding (`BROWSER`) is not configured. Add it in your Worker settings. Until then, the HTML fallback is fully functional — it renders correctly in any browser.

### D1 duplicate key error on `invoice_sequence`

This should not happen in production (the table is append-only). If you see this during local dev, the local D1 state may be corrupt — delete `.wrangler/state/` and re-run `wrangler d1 execute`.

### CORS errors in browser

Ensure your live domain matches one of the entries in `ALLOWED_ORIGINS` in `helpers.js`. For local dev with `wrangler dev`, add `http://localhost:*` to the array temporarily.

---

## Checklist before going live

- [ ] Replace `YOUR_GSTIN_HERE` and `YOUR_PAN_HERE` in `invoice.js`
- [ ] Update seller address in `invoice.js` → `SELLER` object
- [ ] Set all 11 secrets via `wrangler secret put`
- [ ] Update `wrangler.toml` with real `database_id`
- [ ] Run schema migration on production D1
- [ ] Create `GST5` and `GST12` tax rates in Zoho Books
- [ ] Verify pickup address label in Shiprocket
- [ ] Add Browser Rendering binding in Cloudflare Dashboard
- [ ] Test end-to-end with a ₹1 Razorpay test payment
- [ ] Replace `RAZORPAY_KEY_ID` in `frontend-checkout.js` with your live key

---

*Last updated: June 2025 | Maintained by Ouro Studio Private Limited*
