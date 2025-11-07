-- Exemplo de estrutura da tabela jobs no Supabase
-- Execute este SQL no Supabase SQL Editor para criar a tabela

CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Informações básicas
  job_title TEXT NOT NULL,
  job_title_type TEXT NOT NULL CHECK (job_title_type IN ('text', 'id')),
  company TEXT NOT NULL,
  company_type TEXT NOT NULL CHECK (company_type IN ('text', 'id')),
  workplace TEXT NOT NULL CHECK (workplace IN ('ON_SITE', 'HYBRID', 'REMOTE')),
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  employment_status TEXT CHECK (employment_status IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'OTHER', 'VOLUNTEER', 'INTERNSHIP')),
  auto_rejection_template TEXT,
  screening_questions JSONB DEFAULT '[]'::jsonb,
  
  -- Dados do recruiter
  recruiter_project TEXT NOT NULL,
  recruiter_project_type TEXT NOT NULL CHECK (recruiter_project_type IN ('name', 'id')),
  recruiter_functions JSONB NOT NULL DEFAULT '[]'::jsonb,
  recruiter_industries JSONB NOT NULL DEFAULT '[]'::jsonb,
  recruiter_seniority TEXT NOT NULL CHECK (recruiter_seniority IN ('INTERNSHIP', 'ENTRY_LEVEL', 'ASSOCIATE', 'MID_SENIOR_LEVEL', 'DIRECTOR', 'EXECUTIVE', 'NOT_APPLICABLE')),
  recruiter_apply_method_type TEXT NOT NULL CHECK (recruiter_apply_method_type IN ('linkedin', 'external')),
  recruiter_apply_method_notification_email TEXT,
  recruiter_apply_method_resume_required BOOLEAN DEFAULT true,
  recruiter_apply_method_url TEXT,
  recruiter_include_poster_info BOOLEAN DEFAULT true,
  recruiter_tracking_pixel_url TEXT,
  recruiter_company_job_id TEXT,
  recruiter_auto_archive_screening_questions BOOLEAN DEFAULT true,
  recruiter_auto_archive_outside_country BOOLEAN DEFAULT true,
  recruiter_send_rejection_notification BOOLEAN DEFAULT true,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_workplace ON jobs(workplace);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

