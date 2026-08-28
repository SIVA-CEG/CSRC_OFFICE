-- Generated from column-list export. Run CREATE TABLEs first, then FKs.

CREATE TABLE "admin_users" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL,
  "username" VARCHAR(100) NOT NULL,
  "password_hash" TEXT NOT NULL,
  "role" VARCHAR(50) NOT NULL DEFAULT 'admin'::character varying,
  "created_at" TIMESTAMP DEFAULT now(),
  "phone" TEXT,
  "email" TEXT,
  "employee_no" TEXT,
  "signature_path" TEXT
);

CREATE TABLE "appointment_assign_history" (
  "id" SERIAL PRIMARY KEY,
  "appointment_id" INTEGER,
  "assigned_from" TEXT,
  "assigned_to" TEXT,
  "action" TEXT,
  "remarks" TEXT,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "approvals" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER,
  "installment_id" INTEGER,
  "approval_status" VARCHAR(50) NOT NULL DEFAULT 'Pending'::character varying,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "faculty_id" INTEGER
);

CREATE TABLE "claim_consumables" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "project_id" INTEGER NOT NULL,
  "installment_id" INTEGER NOT NULL,
  "endorsement_id" INTEGER NOT NULL,
  "proceeding_no" TEXT,
  "division_label" TEXT,
  "item_description" TEXT,
  "vendor_name" TEXT,
  "vendor_address" TEXT,
  "vendor_city" TEXT,
  "sanctioning_authority" TEXT,
  "mh_no" TEXT,
  "financial_year" TEXT,
  "sanction_page_no" TEXT,
  "sanction_sl_no" TEXT,
  "amount" NUMERIC NOT NULL,
  "status" VARCHAR(30) NOT NULL DEFAULT 'pending'::character varying,
  "report_html" TEXT,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "claim_contingency" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "project_id" INTEGER NOT NULL,
  "installment_id" INTEGER NOT NULL,
  "endorsement_id" INTEGER NOT NULL,
  "proceeding_no" TEXT,
  "division_label" TEXT,
  "item_description" TEXT,
  "sanctioning_authority" TEXT,
  "mh_no" TEXT,
  "financial_year" TEXT,
  "sanction_page_no" TEXT,
  "sanction_sl_no" TEXT,
  "amount" NUMERIC NOT NULL,
  "status" VARCHAR(30) NOT NULL DEFAULT 'pending'::character varying,
  "report_html" TEXT,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "claim_non_recurring" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "project_id" INTEGER NOT NULL,
  "installment_id" INTEGER NOT NULL,
  "endorsement_id" INTEGER NOT NULL,
  "non_recurring_head_id" INTEGER,
  "equipment_name" TEXT,
  "proceeding_no" TEXT,
  "hod_name" TEXT,
  "division_label" TEXT,
  "vendor_name" TEXT,
  "sanctioning_authority" TEXT,
  "mh_no" TEXT,
  "financial_year" TEXT,
  "sanction_page_no" TEXT,
  "sanction_sl_no" TEXT,
  "amount" NUMERIC NOT NULL,
  "status" VARCHAR(30) NOT NULL DEFAULT 'pending'::character varying,
  "report_html" TEXT,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "claim_other_expenses" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "project_id" INTEGER NOT NULL,
  "installment_id" INTEGER NOT NULL,
  "endorsement_id" INTEGER NOT NULL,
  "proceeding_no" TEXT,
  "division_label" TEXT,
  "purchase_of" TEXT,
  "vendor_name" TEXT,
  "vendor_city" TEXT,
  "sanctioning_authority" TEXT,
  "mh_no" TEXT,
  "financial_year" TEXT,
  "sanction_page_no" TEXT,
  "sanction_sl_no" TEXT,
  "amount" NUMERIC NOT NULL,
  "status" VARCHAR(30) NOT NULL DEFAULT 'pending'::character varying,
  "report_html" TEXT,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "claim_overhead" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "project_id" INTEGER NOT NULL,
  "installment_id" INTEGER NOT NULL,
  "endorsement_id" INTEGER NOT NULL,
  "overhead_head_key" VARCHAR(30) NOT NULL,
  "overhead_label" TEXT,
  "percent" NUMERIC,
  "amount" NUMERIC NOT NULL,
  "status" VARCHAR(30) NOT NULL DEFAULT 'pending'::character varying,
  "report_html" TEXT,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "claim_travel" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "project_id" INTEGER NOT NULL,
  "installment_id" INTEGER NOT NULL,
  "endorsement_id" INTEGER NOT NULL,
  "proceeding_no" TEXT,
  "division_label" TEXT,
  "payee_name" TEXT,
  "mode_of_travel" TEXT,
  "vehicle_no" TEXT,
  "travel_date" TEXT,
  "duration" TEXT,
  "from_place" TEXT,
  "to_place" TEXT,
  "purpose" TEXT,
  "start_km" NUMERIC,
  "end_km" NUMERIC,
  "head_of_account" TEXT,
  "financial_year" TEXT,
  "sanction_page_no" TEXT,
  "sanction_sl_no" TEXT,
  "amount" NUMERIC NOT NULL,
  "status" VARCHAR(30) NOT NULL DEFAULT 'pending'::character varying,
  "report_html" TEXT,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "endorsement_assign_history" (
  "id" SERIAL PRIMARY KEY,
  "endorsement_id" INTEGER NOT NULL,
  "assigned_from" TEXT,
  "assigned_to" TEXT,
  "action" TEXT,
  "remarks" TEXT,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "endorsement_copi" (
  "id" SERIAL PRIMARY KEY,
  "endorsement_id" INTEGER NOT NULL,
  "copi_user_id" INTEGER NOT NULL,
  "role" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "endorsement_documents" (
  "id" SERIAL PRIMARY KEY,
  "endorsement_id" INTEGER NOT NULL,
  "proposal_copy" TEXT,
  "signed_writeup" TEXT,
  "signed_budget" TEXT,
  "endorsement_format_file" TEXT,
  "overhead_exemption_file" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "endorsement_external_investigators" (
  "id" SERIAL PRIMARY KEY,
  "endorsement_id" INTEGER NOT NULL,
  "full_name" TEXT NOT NULL,
  "designation" TEXT,
  "institute" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "endorsements" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "endorsement_id" VARCHAR(50) NOT NULL,
  "applied_on" DATE,
  "scheme" TEXT,
  "status" TEXT DEFAULT 'pending'::character varying,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "pdf_file" TEXT,
  "funding_agency" TEXT,
  "funding_agency_type" TEXT,
  "project_type" TEXT,
  "full_project_title" TEXT,
  "reference_number" TEXT,
  "non_recurring" NUMERIC,
  "recurring" NUMERIC,
  "overhead_percent" NUMERIC,
  "gst_added" BOOLEAN DEFAULT false,
  "total_amount" NUMERIC,
  "submission_due_date" DATE,
  "is_pi_regular_faculty" BOOLEAN DEFAULT true,
  "endorsement_required" BOOLEAN DEFAULT true,
  "endorsement_format" TEXT,
  "report_pdf" TEXT,
  "assigned_to" TEXT,
  "assign_remarks" TEXT,
  "remarks" TEXT
);

CREATE TABLE "extension_assign_history" (
  "id" SERIAL PRIMARY KEY,
  "extension_id" INTEGER,
  "assigned_from" TEXT,
  "assigned_to" TEXT,
  "action" TEXT,
  "remarks" TEXT,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "faculty_assign_history" (
  "id" SERIAL PRIMARY KEY,
  "record_type" VARCHAR(20) NOT NULL,
  "record_id" INTEGER NOT NULL,
  "assigned_from" TEXT,
  "assigned_to" TEXT,
  "action" TEXT NOT NULL,
  "remarks" TEXT,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "faculty_profile" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER,
  "salutation" VARCHAR(20),
  "initial" VARCHAR(20),
  "staff_name" VARCHAR(200),
  "designation" VARCHAR(200),
  "department" VARCHAR(200),
  "campus" VARCHAR(100),
  "intercom" VARCHAR(20),
  "mobile" VARCHAR(20),
  "dob" DATE,
  "dos" DATE,
  "superannuation_date" DATE,
  "aadhaar_number" VARCHAR(20),
  "pan_number" VARCHAR(20),
  "bank_name" VARCHAR(200),
  "branch" VARCHAR(200),
  "account_number" VARCHAR(50),
  "ifsc_code" VARCHAR(20),
  "account_type" VARCHAR(50),
  "aadhaar_file" TEXT,
  "pan_file" TEXT,
  "passbook_file" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "faculty_users" (
  "id" SERIAL PRIMARY KEY,
  "staff_id" VARCHAR(20) NOT NULL,
  "full_name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(100) NOT NULL,
  "password_hash" TEXT NOT NULL,
  "role" VARCHAR(20) DEFAULT 'faculty'::character varying,
  "reset_token" TEXT,
  "reset_token_expiry" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "mobile_number" VARCHAR(15)
);

CREATE TABLE "installment_assign_history" (
  "id" SERIAL PRIMARY KEY,
  "installment_id" INTEGER,
  "assigned_from" TEXT,
  "assigned_to" TEXT,
  "action" TEXT,
  "remarks" TEXT,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "installments" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER,
  "installment" VARCHAR(10) NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "report_path" TEXT,
  "status" TEXT DEFAULT 'PENDING'::text,
  "assigned_to" TEXT,
  "assign_remarks" TEXT
);

CREATE TABLE "manpower" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER,
  "installment_id" INTEGER,
  "manpower_type" TEXT NOT NULL,
  "amount" NUMERIC NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "non_recurring_heads" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER,
  "installment_id" INTEGER,
  "equipment" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "amount" NUMERIC NOT NULL DEFAULT 0
);

CREATE TABLE "otp_codes" (
  "id" SERIAL PRIMARY KEY,
  "mobile_number" VARCHAR(15),
  "otp" VARCHAR(6),
  "expiry" TIMESTAMP,
  "verified" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "purpose" VARCHAR(50)
);

CREATE TABLE "overheads" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER,
  "installment_id" INTEGER,
  "total_overhead" NUMERIC DEFAULT 0,
  "registrar_ac" NUMERIC DEFAULT 0,
  "dean_ac" NUMERIC DEFAULT 0,
  "csrc_revenue_ac" NUMERIC DEFAULT 0,
  "pi_pdf_ac" NUMERIC DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "project_extensions" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER NOT NULL,
  "original_end_date" DATE,
  "revised_end_date" DATE NOT NULL,
  "extension_period" VARCHAR(50),
  "reason" TEXT,
  "status" VARCHAR(50) DEFAULT 'Under Review'::character varying,
  "created_at" TIMESTAMP DEFAULT now(),
  "assigned_to" TEXT,
  "assign_remarks" TEXT,
  "references_json" JSONB,
  "remarks" TEXT
);

CREATE TABLE "project_faculty_details" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER NOT NULL,
  "salutation" VARCHAR(20),
  "initial" VARCHAR(50),
  "staff_name" VARCHAR(255),
  "designation" VARCHAR(255),
  "degree" VARCHAR(255),
  "subject" VARCHAR(255),
  "mobile" VARCHAR(20),
  "email" VARCHAR(255),
  "aadhaar" VARCHAR(20),
  "phd_registration_no" VARCHAR(100),
  "account_number" VARCHAR(100),
  "bank_name" VARCHAR(255),
  "ifsc_code" VARCHAR(50),
  "pan_number" VARCHAR(20),
  "status" VARCHAR(40) DEFAULT 'Pending'::character varying,
  "appointment_order_no" VARCHAR(255),
  "appointment_order_date" DATE,
  "contract_period_from" DATE,
  "contract_period_upto" DATE,
  "joining_due_date" DATE,
  "fixed_salary" NUMERIC,
  "hra" NUMERIC,
  "minutes_of_meeting_path" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "appointment_letter_path" TEXT,
  "joining_letter_path" TEXT,
  "assigned_to" VARCHAR(100),
  "assign_remarks" TEXT
);

CREATE TABLE "project_faculty_extensions" (
  "id" SERIAL PRIMARY KEY,
  "project_faculty_id" INTEGER,
  "project_id" INTEGER,
  "extension_order_no" VARCHAR(100),
  "extension_order_date" DATE,
  "extension_from" DATE,
  "extension_upto" DATE,
  "rejoin_due_date" DATE,
  "fixed_salary" NUMERIC,
  "hra" NUMERIC,
  "appraisal_path" TEXT,
  "extension_letter_path" TEXT,
  "rejoining_letter_path" TEXT,
  "status" VARCHAR(40) DEFAULT 'pending'::character varying,
  "created_at" TIMESTAMP DEFAULT now(),
  "assigned_to" VARCHAR(100),
  "assign_remarks" TEXT
);

CREATE TABLE "project_transfer_assign_history" (
  "id" SERIAL PRIMARY KEY,
  "transfer_id" INTEGER,
  "assigned_from" TEXT,
  "assigned_to" TEXT,
  "action" TEXT NOT NULL,
  "remarks" TEXT,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "project_transfers" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER,
  "from_user_id" INTEGER NOT NULL,
  "to_user_id" INTEGER NOT NULL,
  "sub" TEXT,
  "ref" TEXT,
  "reason" TEXT,
  "status" VARCHAR(30) DEFAULT 'draft'::character varying,
  "letter_path" TEXT,
  "letter_upload_date" TIMESTAMP,
  "faculty_response_date" TIMESTAMP,
  "reject_remarks" TEXT,
  "created_at" TIMESTAMP DEFAULT now(),
  "assigned_to" TEXT,
  "assign_remarks" TEXT,
  "assigned_date" TIMESTAMP,
  "completed_date" TIMESTAMP
);

CREATE TABLE "projects" (
  "id" SERIAL PRIMARY KEY,
  "endorsement_id" INTEGER,
  "project_title" TEXT NOT NULL,
  "funding_agency" TEXT NOT NULL,
  "sanction_reference_no" TEXT,
  "sanction_reference_date" DATE,
  "pi_user_id" INTEGER,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "project_start_date" DATE,
  "project_end_date" DATE,
  "sanction_letter_path" TEXT,
  "account_type" VARCHAR(20),
  "current_installment_status" TEXT,
  "scheme" VARCHAR(255)
);

CREATE TABLE "reappropriation_assign_history" (
  "id" SERIAL PRIMARY KEY,
  "reappropriation_id" INTEGER,
  "assigned_from" VARCHAR(255),
  "assigned_to" VARCHAR(255),
  "action" VARCHAR(100),
  "remarks" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "reappropriation_details" (
  "id" SERIAL PRIMARY KEY,
  "reappropriation_id" INTEGER NOT NULL,
  "from_head" VARCHAR(255),
  "to_head" VARCHAR(255),
  "amount" NUMERIC
);

CREATE TABLE "reappropriation_requests" (
  "reappropriation_id" SERIAL PRIMARY KEY,
  "project_id" INTEGER NOT NULL,
  "installment_id" INTEGER NOT NULL,
  "letter_path" TEXT,
  "status" VARCHAR(50) DEFAULT 'Pending'::character varying,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "report_path" TEXT,
  "assigned_to" TEXT,
  "assign_remarks" TEXT,
  "reap_type" VARCHAR(20),
  "proceeding_no" TEXT,
  "proceeding_date" TEXT,
  "mh_no" TEXT,
  "sanction_reg_vol" TEXT,
  "sanction_reg_sl" TEXT,
  "sanction_reg_page" TEXT,
  "director_name" TEXT,
  "references_json" TEXT,
  "extra_json" TEXT
);

CREATE TABLE "recurring_heads" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER,
  "installment_id" INTEGER,
  "consumables" NUMERIC DEFAULT 0,
  "travel" NUMERIC DEFAULT 0,
  "contingency" NUMERIC DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "ssr_budget" NUMERIC
);

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "username" VARCHAR(100),
  "password" VARCHAR(255),
  "role" VARCHAR(50),
  "created_at" TIMESTAMP DEFAULT now()
);

-- Foreign keys (run after all tables exist)

ALTER TABLE "appointment_assign_history" ADD CONSTRAINT fk_appointment_assign_history_appointment_id FOREIGN KEY ("appointment_id") REFERENCES "project_faculty_details" ("id");
ALTER TABLE "approvals" ADD CONSTRAINT fk_approvals_project_id FOREIGN KEY ("project_id") REFERENCES "projects" ("id");
ALTER TABLE "approvals" ADD CONSTRAINT fk_approvals_installment_id FOREIGN KEY ("installment_id") REFERENCES "installments" ("id");
ALTER TABLE "approvals" ADD CONSTRAINT fk_approvals_faculty_id FOREIGN KEY ("faculty_id") REFERENCES "faculty_users" ("id");
ALTER TABLE "claim_consumables" ADD CONSTRAINT fk_claim_consumables_user_id FOREIGN KEY ("user_id") REFERENCES "faculty_users" ("id");
ALTER TABLE "claim_consumables" ADD CONSTRAINT fk_claim_consumables_project_id FOREIGN KEY ("project_id") REFERENCES "projects" ("id");
ALTER TABLE "claim_consumables" ADD CONSTRAINT fk_claim_consumables_installment_id FOREIGN KEY ("installment_id") REFERENCES "installments" ("id");
ALTER TABLE "claim_consumables" ADD CONSTRAINT fk_claim_consumables_endorsement_id FOREIGN KEY ("endorsement_id") REFERENCES "endorsements" ("id");
ALTER TABLE "claim_contingency" ADD CONSTRAINT fk_claim_contingency_user_id FOREIGN KEY ("user_id") REFERENCES "faculty_users" ("id");
ALTER TABLE "claim_contingency" ADD CONSTRAINT fk_claim_contingency_project_id FOREIGN KEY ("project_id") REFERENCES "projects" ("id");
ALTER TABLE "claim_contingency" ADD CONSTRAINT fk_claim_contingency_installment_id FOREIGN KEY ("installment_id") REFERENCES "installments" ("id");
ALTER TABLE "claim_contingency" ADD CONSTRAINT fk_claim_contingency_endorsement_id FOREIGN KEY ("endorsement_id") REFERENCES "endorsements" ("id");
ALTER TABLE "claim_non_recurring" ADD CONSTRAINT fk_claim_non_recurring_user_id FOREIGN KEY ("user_id") REFERENCES "faculty_users" ("id");
ALTER TABLE "claim_non_recurring" ADD CONSTRAINT fk_claim_non_recurring_project_id FOREIGN KEY ("project_id") REFERENCES "projects" ("id");
ALTER TABLE "claim_non_recurring" ADD CONSTRAINT fk_claim_non_recurring_installment_id FOREIGN KEY ("installment_id") REFERENCES "installments" ("id");
ALTER TABLE "claim_non_recurring" ADD CONSTRAINT fk_claim_non_recurring_endorsement_id FOREIGN KEY ("endorsement_id") REFERENCES "endorsements" ("id");
ALTER TABLE "claim_non_recurring" ADD CONSTRAINT fk_claim_non_recurring_non_recurring_head_id FOREIGN KEY ("non_recurring_head_id") REFERENCES "non_recurring_heads" ("id");
ALTER TABLE "claim_other_expenses" ADD CONSTRAINT fk_claim_other_expenses_user_id FOREIGN KEY ("user_id") REFERENCES "faculty_users" ("id");
ALTER TABLE "claim_other_expenses" ADD CONSTRAINT fk_claim_other_expenses_project_id FOREIGN KEY ("project_id") REFERENCES "projects" ("id");
ALTER TABLE "claim_other_expenses" ADD CONSTRAINT fk_claim_other_expenses_installment_id FOREIGN KEY ("installment_id") REFERENCES "installments" ("id");
ALTER TABLE "claim_other_expenses" ADD CONSTRAINT fk_claim_other_expenses_endorsement_id FOREIGN KEY ("endorsement_id") REFERENCES "endorsements" ("id");
ALTER TABLE "claim_overhead" ADD CONSTRAINT fk_claim_overhead_user_id FOREIGN KEY ("user_id") REFERENCES "faculty_users" ("id");
ALTER TABLE "claim_overhead" ADD CONSTRAINT fk_claim_overhead_project_id FOREIGN KEY ("project_id") REFERENCES "projects" ("id");
ALTER TABLE "claim_overhead" ADD CONSTRAINT fk_claim_overhead_installment_id FOREIGN KEY ("installment_id") REFERENCES "installments" ("id");
ALTER TABLE "claim_overhead" ADD CONSTRAINT fk_claim_overhead_endorsement_id FOREIGN KEY ("endorsement_id") REFERENCES "endorsements" ("id");
ALTER TABLE "claim_travel" ADD CONSTRAINT fk_claim_travel_user_id FOREIGN KEY ("user_id") REFERENCES "faculty_users" ("id");
ALTER TABLE "claim_travel" ADD CONSTRAINT fk_claim_travel_project_id FOREIGN KEY ("project_id") REFERENCES "projects" ("id");
ALTER TABLE "claim_travel" ADD CONSTRAINT fk_claim_travel_installment_id FOREIGN KEY ("installment_id") REFERENCES "installments" ("id");
ALTER TABLE "claim_travel" ADD CONSTRAINT fk_claim_travel_endorsement_id FOREIGN KEY ("endorsement_id") REFERENCES "endorsements" ("id");
ALTER TABLE "endorsement_copi" ADD CONSTRAINT fk_endorsement_copi_endorsement_id FOREIGN KEY ("endorsement_id") REFERENCES "endorsements" ("id");
ALTER TABLE "endorsement_copi" ADD CONSTRAINT fk_endorsement_copi_copi_user_id FOREIGN KEY ("copi_user_id") REFERENCES "faculty_users" ("id");
ALTER TABLE "endorsement_documents" ADD CONSTRAINT fk_endorsement_documents_endorsement_id FOREIGN KEY ("endorsement_id") REFERENCES "endorsements" ("id");
ALTER TABLE "endorsement_external_investigators" ADD CONSTRAINT fk_endorsement_external_investigators_endorsement_id FOREIGN KEY ("endorsement_id") REFERENCES "endorsements" ("id");
ALTER TABLE "endorsements" ADD CONSTRAINT fk_endorsements_user_id FOREIGN KEY ("user_id") REFERENCES "faculty_users" ("id");
ALTER TABLE "extension_assign_history" ADD CONSTRAINT fk_extension_assign_history_extension_id FOREIGN KEY ("extension_id") REFERENCES "project_extensions" ("id");
ALTER TABLE "faculty_profile" ADD CONSTRAINT fk_faculty_profile_user_id FOREIGN KEY ("user_id") REFERENCES "faculty_users" ("id");
ALTER TABLE "installment_assign_history" ADD CONSTRAINT fk_installment_assign_history_installment_id FOREIGN KEY ("installment_id") REFERENCES "installments" ("id");
ALTER TABLE "installments" ADD CONSTRAINT fk_installments_project_id FOREIGN KEY ("project_id") REFERENCES "projects" ("id");
ALTER TABLE "manpower" ADD CONSTRAINT fk_manpower_project_id FOREIGN KEY ("project_id") REFERENCES "projects" ("id");
ALTER TABLE "manpower" ADD CONSTRAINT fk_manpower_installment_id FOREIGN KEY ("installment_id") REFERENCES "installments" ("id");
ALTER TABLE "non_recurring_heads" ADD CONSTRAINT fk_non_recurring_heads_project_id FOREIGN KEY ("project_id") REFERENCES "projects" ("id");
ALTER TABLE "non_recurring_heads" ADD CONSTRAINT fk_non_recurring_heads_installment_id FOREIGN KEY ("installment_id") REFERENCES "installments" ("id");
ALTER TABLE "overheads" ADD CONSTRAINT fk_overheads_project_id FOREIGN KEY ("project_id") REFERENCES "projects" ("id");
ALTER TABLE "overheads" ADD CONSTRAINT fk_overheads_installment_id FOREIGN KEY ("installment_id") REFERENCES "installments" ("id");
ALTER TABLE "project_extensions" ADD CONSTRAINT fk_project_extensions_project_id FOREIGN KEY ("project_id") REFERENCES "projects" ("id");
ALTER TABLE "project_faculty_details" ADD CONSTRAINT fk_project_faculty_details_project_id FOREIGN KEY ("project_id") REFERENCES "projects" ("id");
ALTER TABLE "project_faculty_extensions" ADD CONSTRAINT fk_project_faculty_extensions_project_faculty_id FOREIGN KEY ("project_faculty_id") REFERENCES "project_faculty_details" ("id");
ALTER TABLE "project_faculty_extensions" ADD CONSTRAINT fk_project_faculty_extensions_project_id FOREIGN KEY ("project_id") REFERENCES "projects" ("id");
ALTER TABLE "project_transfer_assign_history" ADD CONSTRAINT fk_project_transfer_assign_history_transfer_id FOREIGN KEY ("transfer_id") REFERENCES "project_transfers" ("id");
ALTER TABLE "project_transfers" ADD CONSTRAINT fk_project_transfers_project_id FOREIGN KEY ("project_id") REFERENCES "projects" ("id");
ALTER TABLE "projects" ADD CONSTRAINT fk_projects_endorsement_id FOREIGN KEY ("endorsement_id") REFERENCES "endorsements" ("id");
ALTER TABLE "projects" ADD CONSTRAINT fk_projects_pi_user_id FOREIGN KEY ("pi_user_id") REFERENCES "faculty_users" ("id");
ALTER TABLE "reappropriation_assign_history" ADD CONSTRAINT fk_reappropriation_assign_history_reappropriation_id FOREIGN KEY ("reappropriation_id") REFERENCES "reappropriation_requests" ("reappropriation_id");
ALTER TABLE "reappropriation_details" ADD CONSTRAINT fk_reappropriation_details_reappropriation_id FOREIGN KEY ("reappropriation_id") REFERENCES "reappropriation_requests" ("reappropriation_id");
ALTER TABLE "reappropriation_requests" ADD CONSTRAINT fk_reappropriation_requests_project_id FOREIGN KEY ("project_id") REFERENCES "projects" ("id");
ALTER TABLE "reappropriation_requests" ADD CONSTRAINT fk_reappropriation_requests_installment_id FOREIGN KEY ("installment_id") REFERENCES "installments" ("id");
ALTER TABLE "recurring_heads" ADD CONSTRAINT fk_recurring_heads_project_id FOREIGN KEY ("project_id") REFERENCES "projects" ("id");
ALTER TABLE "recurring_heads" ADD CONSTRAINT fk_recurring_heads_installment_id FOREIGN KEY ("installment_id") REFERENCES "installments" ("id");


