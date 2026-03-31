-- ================================================================
-- Burner Pieces – Cloudflare D1 Schema
-- Run: wrangler d1 execute burner-pieces-db --file=schema.sql
-- ================================================================

-- Orders / Checkout
CREATE TABLE IF NOT EXISTS orders (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  razorpay_order_id     TEXT NOT NULL,
  razorpay_payment_id   TEXT UNIQUE NOT NULL,
  invoice_number        TEXT NOT NULL,
  amount_paise          INTEGER NOT NULL,           -- amount in paise (₹ × 100)
  customer_name         TEXT NOT NULL,
  customer_email        TEXT NOT NULL,
  customer_phone        TEXT,
  customer_address      TEXT,
  customer_city         TEXT,
  customer_state        TEXT,
  customer_pincode      TEXT,
  items_json            TEXT NOT NULL,              -- JSON array of line items
  status                TEXT NOT NULL DEFAULT 'pending',
  -- status: pending | confirmed | shipped | delivered | cancelled
  shiprocket_order_id   TEXT,
  zoho_invoice_id       TEXT,
  invoice_sent_at       TEXT,                       -- ISO timestamp
  created_at            TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_email     ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status    ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created   ON orders(created_at DESC);

-- Auto-incrementing invoice sequence
CREATE TABLE IF NOT EXISTS invoice_sequence (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  placeholder INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  subject    TEXT,
  message    TEXT NOT NULL,
  read       INTEGER NOT NULL DEFAULT 0,           -- 0 = unread, 1 = read
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contact_email   ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_submissions(created_at DESC);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT,
  subscribed_at TEXT NOT NULL,
  unsubscribed  INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_nl_email ON newsletter_subscribers(email);
