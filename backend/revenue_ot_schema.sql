-- ============================================================
-- REVENUE MODULE — OVERTIME (OT)
-- ============================================================
CREATE TABLE "revenue_ot_structure" (
  "id" SERIAL PRIMARY KEY,
  "designation" TEXT NOT NULL UNIQUE,
  "rate_per_hour" NUMERIC DEFAULT 125,
  "updated_at" TIMESTAMP DEFAULT now()
);

-- One row per staff, per day (matches OTDetails.jsx manual entry / import)
CREATE TABLE "revenue_ot_entries" (
  "id" SERIAL PRIMARY KEY,
  "staff_id" INTEGER NOT NULL,
  "month" TEXT NOT NULL,
  "year" TEXT NOT NULL,
  "entry_date" DATE NOT NULL,
  "in_time" TEXT,
  "out_time" TEXT,
  "ot_before_office_hours" TEXT DEFAULT '0:00',
  "ot_after_office_hours" TEXT DEFAULT '0:00',
  "total_hours_for_day" NUMERIC DEFAULT 0,
  "remarks" TEXT,
  "created_at" TIMESTAMP DEFAULT now(),
  UNIQUE ("staff_id", "entry_date")
);

CREATE TABLE "revenue_ot_sanctions" (
  "id" SERIAL PRIMARY KEY,
  "month" TEXT NOT NULL,
  "year" TEXT NOT NULL,
  "proc_no" TEXT,
  "total_amount" NUMERIC NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'approved',
  "created_by" TEXT,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "revenue_ot_sanction_entries" (
  "id" SERIAL PRIMARY KEY,
  "sanction_id" INTEGER NOT NULL,
  "staff_id" INTEGER,
  "staff_name" TEXT,
  "designation" TEXT,
  "bank_account_number" TEXT,
  "rate_per_hour" NUMERIC DEFAULT 0,
  "total_hours" NUMERIC DEFAULT 0,
  "total_amount" NUMERIC DEFAULT 0
);

CREATE TABLE "revenue_ot_sanction_history" (
  "id" SERIAL PRIMARY KEY,
  "sanction_id" INTEGER NOT NULL,
  "role" TEXT,
  "name" TEXT,
  "action" TEXT,
  "comment" TEXT,
  "created_at" TIMESTAMP DEFAULT now()
);

ALTER TABLE "revenue_ot_entries" ADD CONSTRAINT fk_roe_staff FOREIGN KEY ("staff_id") REFERENCES "revenue_staff" ("id") ON DELETE CASCADE;
ALTER TABLE "revenue_ot_sanction_entries" ADD CONSTRAINT fk_rose_sanction FOREIGN KEY ("sanction_id") REFERENCES "revenue_ot_sanctions" ("id") ON DELETE CASCADE;
ALTER TABLE "revenue_ot_sanction_entries" ADD CONSTRAINT fk_rose_staff FOREIGN KEY ("staff_id") REFERENCES "revenue_staff" ("id");
ALTER TABLE "revenue_ot_sanction_history" ADD CONSTRAINT fk_rosh_sanction FOREIGN KEY ("sanction_id") REFERENCES "revenue_ot_sanctions" ("id") ON DELETE CASCADE;