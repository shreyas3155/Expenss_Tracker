import { createClient } from "@supabase/supabase-js";

export const USER_ID = "3f7ae45f-527a-4179-9077-b6009df92b7e";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://pvoazulclgrdqmfmjmgh.supabase.co";

const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_zqyWw9kDyFsZPw7UDXmMrA_LM8cvysX";

export const supabase = createClient(supabaseUrl, supabaseKey);
