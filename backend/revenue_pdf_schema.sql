-- ============================================================
-- REVENUE MODULE — PDF (PROFESSIONAL DEVELOPMENT FUND)
-- ============================================================
CREATE TABLE "revenue_pdf_requests" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER,                 -- faculty_users.id (submitter)
  "faculty_name" TEXT,
  "designation" TEXT,
  "department" TEXT,
  "campus" TEXT,
  "request_type" TEXT,               -- Reimbursement | Vendor Payment | Advance Payment
  "category" TEXT,                   -- Travel | Membership Fee | Purchase of Non-Consumables | ...
  "category_fields" JSONB,
  "bill_details" JSONB,              -- supplyOrderNo, invoiceNo, firmName, payeeName, itemDetails, ...
  "account" JSONB,                   -- accountHolder, accountNumber, ifsc, bankName
  "amount" NUMERIC NOT NULL,
  "letter_file_path" TEXT,
  "supporting_file_paths" JSONB,
  "status" TEXT NOT NULL DEFAULT 'pending',
    -- pending | assigned | sanctioned | bill_processing | awaiting_signature | completed | rejected
  "assigned_to" TEXT,                 -- staff name currently holding it
  "assigned_to_role" TEXT,            -- assistant | superintendent | deputy_director | director
  "submitted_at" TIMESTAMP DEFAULT now()
);

-- Office-entered fields used to generate the sanction letter
CREATE TABLE "revenue_pdf_office_fields" (
  "id" SERIAL PRIMARY KEY,
  "request_id" INTEGER NOT NULL UNIQUE,
  "mh_no" TEXT,
  "head" TEXT,
  "subhead" TEXT,
  "s_no" TEXT,
  "page_no" TEXT,
  "proceeding_no" TEXT,
  "proceeding_date" TEXT,
  "director_name" TEXT DEFAULT 'Dr. S. Balasivanandha Prabu',
  "updated_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "revenue_pdf_assign_history" (
  "id" SERIAL PRIMARY KEY,
  "request_id" INTEGER NOT NULL,
  "assigned_from" TEXT,
  "assigned_from_role" TEXT,
  "assigned_to" TEXT,
  "assigned_to_role" TEXT,
  "action" TEXT NOT NULL,   -- ASSIGN | APPROVE_AND_ASSIGN | FINAL_APPROVE | REJECT
  "remarks" TEXT,
  "created_at" TIMESTAMP DEFAULT now()
);

-- Claim Bill figures, entered by assistant after director's final approval
CREATE TABLE "revenue_pdf_bill_processing" (
  "id" SERIAL PRIMARY KEY,
  "request_id" INTEGER NOT NULL UNIQUE,
  "month" TEXT,
  "year" TEXT,
  "contact_no" TEXT,
  "csrc_bill_no" TEXT,
  "appropriation_1" NUMERIC,
  "appropriation_2" NUMERIC,
  "spent_1" NUMERIC,
  "spent_2" NUMERIC,
  "balance_1" NUMERIC,
  "balance_2" NUMERIC,
  "sent_to_faculty_at" TIMESTAMP
);

-- "For CSRC Office Use Only" block — registered once signed bill returns
CREATE TABLE "revenue_pdf_office_use" (
  "id" SERIAL PRIMARY KEY,
  "request_id" INTEGER NOT NULL UNIQUE,
  "appropriation_page_no" TEXT,
  "vds_folio_no" TEXT,
  "vds_year" TEXT,
  "passed_for_pay_rs" NUMERIC,
  "voucher_no" TEXT,
  "cash_book_page_no" TEXT,
  "paid_rs" NUMERIC,
  "cheque_no" TEXT,
  "dated" TEXT,
  "registered_at" TIMESTAMP DEFAULT now()
);

ALTER TABLE "revenue_pdf_requests" ADD CONSTRAINT fk_rpr_user FOREIGN KEY ("user_id") REFERENCES "faculty_users" ("id");
ALTER TABLE "revenue_pdf_office_fields" ADD CONSTRAINT fk_rpof_request FOREIGN KEY ("request_id") REFERENCES "revenue_pdf_requests" ("id") ON DELETE CASCADE;
ALTER TABLE "revenue_pdf_assign_history" ADD CONSTRAINT fk_rpah_request FOREIGN KEY ("request_id") REFERENCES "revenue_pdf_requests" ("id") ON DELETE CASCADE;
ALTER TABLE "revenue_pdf_bill_processing" ADD CONSTRAINT fk_rpbp_request FOREIGN KEY ("request_id") REFERENCES "revenue_pdf_requests" ("id") ON DELETE CASCADE;
ALTER TABLE "revenue_pdf_office_use" ADD CONSTRAINT fk_rpou_request FOREIGN KEY ("request_id") REFERENCES "revenue_pdf_requests" ("id") ON DELETE CASCADE;