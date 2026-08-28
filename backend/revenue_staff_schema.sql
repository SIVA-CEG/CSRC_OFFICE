-- ============================================================
-- REVENUE MODULE — STAFF
-- ============================================================
CREATE TABLE "revenue_staff" (
  "id" SERIAL PRIMARY KEY,
  "department" TEXT DEFAULT 'Centre for Sponsored Research and Consultancy',
  "employee_code" TEXT,
  "appellation" TEXT,
  "gender" TEXT,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT,
  "designation" TEXT NOT NULL,
  "mobile" TEXT,
  "email" TEXT,
  "staff_type" TEXT DEFAULT 'Regular',
  "tenure_from" DATE,
  "tenure_to" DATE,
  "dob" DATE,
  "doj" DATE,
  "allotment_year" TEXT,
  "order_number" TEXT,
  "order_date" DATE,
  "salary_type" TEXT DEFAULT 'Consolidated Pay',
  "bank_name" TEXT,
  "bank_account_number" TEXT,
  "ifsc_code" TEXT,
  "status" TEXT DEFAULT 'active',
  "created_by" TEXT,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "revenue_staff_documents" (
  "id" SERIAL PRIMARY KEY,
  "staff_id" INTEGER NOT NULL,
  "doc_type" TEXT NOT NULL,
  "file_path" TEXT NOT NULL,
  "uploaded_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "revenue_staff_extension_history" (
  "id" SERIAL PRIMARY KEY,
  "staff_id" INTEGER NOT NULL,
  "extension_from" DATE,
  "extension_to" DATE,
  "approved_by" TEXT,
  "approved_at" TIMESTAMP DEFAULT now(),
  "remarks" TEXT
);

CREATE TABLE "revenue_staff_resignation" (
  "id" SERIAL PRIMARY KEY,
  "staff_id" INTEGER NOT NULL,
  "resignation_date" DATE,
  "remarks" TEXT,
  "created_by" TEXT,
  "created_at" TIMESTAMP DEFAULT now()
);

ALTER TABLE "revenue_staff_documents" ADD CONSTRAINT fk_rsd_staff FOREIGN KEY ("staff_id") REFERENCES "revenue_staff" ("id") ON DELETE CASCADE;
ALTER TABLE "revenue_staff_extension_history" ADD CONSTRAINT fk_rseh_staff FOREIGN KEY ("staff_id") REFERENCES "revenue_staff" ("id") ON DELETE CASCADE;
ALTER TABLE "revenue_staff_resignation" ADD CONSTRAINT fk_rsr_staff FOREIGN KEY ("staff_id") REFERENCES "revenue_staff" ("id") ON DELETE CASCADE;