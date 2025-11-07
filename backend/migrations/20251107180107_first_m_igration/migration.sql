-- CreateEnum
CREATE TYPE "JobTitleType" AS ENUM ('text', 'id');

-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('text', 'id');

-- CreateEnum
CREATE TYPE "Workplace" AS ENUM ('ON_SITE', 'HYBRID', 'REMOTE');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'OTHER', 'VOLUNTEER', 'INTERNSHIP');

-- CreateEnum
CREATE TYPE "RecruiterProjectType" AS ENUM ('name', 'id');

-- CreateEnum
CREATE TYPE "Seniority" AS ENUM ('INTERNSHIP', 'ENTRY_LEVEL', 'ASSOCIATE', 'MID_SENIOR_LEVEL', 'DIRECTOR', 'EXECUTIVE', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "ApplyMethodType" AS ENUM ('linkedin', 'external');

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "job_title" TEXT NOT NULL,
    "job_title_type" "JobTitleType" NOT NULL,
    "company" TEXT NOT NULL,
    "company_type" "CompanyType" NOT NULL,
    "workplace" "Workplace" NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "employment_status" "EmploymentStatus",
    "auto_rejection_template" TEXT,
    "screening_questions" JSONB NOT NULL DEFAULT '[]',
    "recruiter_project" TEXT NOT NULL,
    "recruiter_project_type" "RecruiterProjectType" NOT NULL,
    "recruiter_functions" JSONB NOT NULL DEFAULT '[]',
    "recruiter_industries" JSONB NOT NULL DEFAULT '[]',
    "recruiter_seniority" "Seniority" NOT NULL,
    "recruiter_apply_method_type" "ApplyMethodType" NOT NULL,
    "recruiter_apply_method_notification_email" TEXT,
    "recruiter_apply_method_resume_required" BOOLEAN NOT NULL DEFAULT true,
    "recruiter_apply_method_url" TEXT,
    "recruiter_include_poster_info" BOOLEAN NOT NULL DEFAULT true,
    "recruiter_tracking_pixel_url" TEXT,
    "recruiter_company_job_id" TEXT,
    "recruiter_auto_archive_screening_questions" BOOLEAN NOT NULL DEFAULT true,
    "recruiter_auto_archive_outside_country" BOOLEAN NOT NULL DEFAULT true,
    "recruiter_send_rejection_notification" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "jobs_created_at_idx" ON "jobs"("created_at" DESC);

-- CreateIndex
CREATE INDEX "jobs_workplace_idx" ON "jobs"("workplace");

-- CreateIndex
CREATE INDEX "jobs_company_idx" ON "jobs"("company");
