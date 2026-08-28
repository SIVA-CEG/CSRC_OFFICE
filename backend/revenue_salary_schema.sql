-- ============================================================
-- REVENUE MODULE — SALARY
-- ============================================================
CREATE TABLE "revenue_salary_structure" (
  "id" SERIAL PRIMARY KEY,
  "designation" TEXT NOT NULL UNIQUE,
  "consolidated_amount" NUMERIC DEFAULT 15000,
  "daily_wage_per_day" NUMERIC DEFAULT 500,
  "daily_wage_incentive_per_day" NUMERIC DEFAULT 500,
  "rate_factor_wage_per_day" NUMERIC DEFAULT 500,
  "rate_factor" NUMERIC DEFAULT 1.15,
  "rate_factor_incentive" NUMERIC DEFAULT 1.15,
  "updated_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "revenue_salary_sanctions" (
  "id" SERIAL PRIMARY KEY,
  "month" TEXT NOT NULL,
  "year" TEXT NOT NULL,
  "salary_type" TEXT NOT NULL,   -- Consolidated Pay | Daily Wages | Daily Wages with Rate Factor
  "proc_no" TEXT,
  "total_amount" NUMERIC NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'approved',  -- always 'approved' — applied immediately by assistant
  "created_by" TEXT,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "revenue_salary_sanction_entries" (
  "id" SERIAL PRIMARY KEY,
  "sanction_id" INTEGER NOT NULL,
  "staff_id" INTEGER,
  "staff_name" TEXT,
  "designation" TEXT,
  "bank_account_number" TEXT,
  "days_worked" NUMERIC DEFAULT 0,
  "wage_per_day" NUMERIC DEFAULT 0,
  "rate_factor" NUMERIC DEFAULT 1,
  "incentive_days" NUMERIC DEFAULT 0,
  "incentive_rate" NUMERIC DEFAULT 0,
  "lump_sum" NUMERIC DEFAULT 0,
  "gross_salary" NUMERIC DEFAULT 0,
  "incentive_amount" NUMERIC DEFAULT 0,
  "net_salary" NUMERIC DEFAULT 0
);

CREATE TABLE "revenue_salary_sanction_history" (
  "id" SERIAL PRIMARY KEY,
  "sanction_id" INTEGER NOT NULL,
  "role" TEXT,
  "name" TEXT,
  "action" TEXT,
  "comment" TEXT,
  "created_at" TIMESTAMP DEFAULT now()
);

ALTER TABLE "revenue_salary_sanction_entries" ADD CONSTRAINT fk_rsse_sanction FOREIGN KEY ("sanction_id") REFERENCES "revenue_salary_sanctions" ("id") ON DELETE CASCADE;
ALTER TABLE "revenue_salary_sanction_entries" ADD CONSTRAINT fk_rsse_staff FOREIGN KEY ("staff_id") REFERENCES "revenue_staff" ("id");
ALTER TABLE "revenue_salary_sanction_history" ADD CONSTRAINT fk_rssh_sanction FOREIGN KEY ("sanction_id") REFERENCES "revenue_salary_sanctions" ("id") ON DELETE CASCADE;