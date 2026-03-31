-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  resume_text TEXT NOT NULL,
  jd_text TEXT NOT NULL,
  match_analysis JSONB NOT NULL,
  questions JSONB NOT NULL,
  is_favorited BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for sidebar history list
CREATE INDEX IF NOT EXISTS reports_user_id_created_at_idx
  ON public.reports (user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Users can only read their own reports
CREATE POLICY "Users can select own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own reports
CREATE POLICY "Users can insert own reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own reports
CREATE POLICY "Users can update own reports"
  ON public.reports FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own reports
CREATE POLICY "Users can delete own reports"
  ON public.reports FOR DELETE
  USING (auth.uid() = user_id);
