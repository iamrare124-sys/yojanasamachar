-- ============================================================
-- YojanaSamachar / SyndicateHub — Supabase Schema
-- Matches EXACTLY your actual live Supabase table structure
-- Run ALTER TABLE statements if table already exists
-- ============================================================

-- ─── OPTION A: Fresh install (table does not exist yet) ──────
CREATE TABLE IF NOT EXISTS public.posts (
  id               uuid                     NOT NULL DEFAULT gen_random_uuid(),
  slug             text                     NOT NULL,
  title            text                     NOT NULL,
  excerpt          text                     NULL,
  content          text                     NOT NULL,        -- TEXT, not JSONB
  category         text                     NOT NULL,
  tags             text[]                   NULL DEFAULT '{}'::text[],
  cover_image      text                     NULL,
  cover_image_alt  text                     NULL,
  author_name      text                     NULL,
  author_title     text                     NULL,
  meta_title       text                     NULL,
  meta_description text                     NULL,
  schema_json      jsonb                    NULL,
  live_data        jsonb                    NULL,
  faq              jsonb                    NULL,            -- faq IS a column
  reading_time     integer                  NULL DEFAULT 5,
  word_count       integer                  NULL DEFAULT 800,
  ai_score         integer                  NULL DEFAULT 8,
  published        boolean                  NULL DEFAULT true,
  tweeted          boolean                  NULL DEFAULT false,
  views            integer                  NULL DEFAULT 0,
  source_url       text                     NULL,
  source_headline  text                     NULL,
  site_name        text                     NULL DEFAULT 'yojanasamachar'::text,
  published_at     timestamp with time zone NULL DEFAULT now(),
  created_at       timestamp with time zone NULL DEFAULT now(),
  updated_at       timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_slug_key UNIQUE (slug)   -- matches your live DB
) TABLESPACE pg_default;

-- ─── OPTION B: Table already exists — run these ALTERs ──────
-- Only run if you already have the table live.
-- Add any missing columns safely:

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS site_name        text    DEFAULT 'yojanasamachar';
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS cover_image_alt  text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS author_title     text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS schema_json      jsonb;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS live_data        jsonb;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS faq              jsonb;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS word_count       integer DEFAULT 800;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS ai_score         integer DEFAULT 8;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS tweeted          boolean DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS views            integer DEFAULT 0;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS published_at     timestamp with time zone DEFAULT now();

-- ─── INDEXES ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_posts_slug
  ON public.posts USING btree (slug) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_posts_category
  ON public.posts USING btree (category) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_posts_created_at
  ON public.posts USING btree (created_at DESC) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_posts_published
  ON public.posts USING btree (published) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_posts_source_url
  ON public.posts USING btree (source_url) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS posts_site_name_idx
  ON public.posts USING btree (site_name) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_posts_views
  ON public.posts USING btree (views DESC) TABLESPACE pg_default;

-- ─── AUTO-UPDATE updated_at TRIGGER ─────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posts_updated_at ON public.posts;
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published" ON public.posts;
CREATE POLICY "Public read published"
  ON public.posts FOR SELECT
  USING (published = true);

DROP POLICY IF EXISTS "Service full access" ON public.posts;
CREATE POLICY "Service full access"
  ON public.posts FOR ALL
  USING (auth.role() = 'service_role');
