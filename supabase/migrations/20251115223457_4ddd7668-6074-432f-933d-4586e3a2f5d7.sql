-- Add bookmarking functionality to chat_history table
ALTER TABLE public.chat_history 
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;

-- Create index for faster favorite queries
CREATE INDEX IF NOT EXISTS idx_chat_history_favorites ON public.chat_history(user_id, is_favorite) WHERE is_favorite = true;

-- Add policy for updating favorites
DROP POLICY IF EXISTS "Users can update their own chat history" ON public.chat_history;
CREATE POLICY "Users can update their own chat history"
  ON public.chat_history
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);