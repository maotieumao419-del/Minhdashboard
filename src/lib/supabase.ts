import { createClient } from '@supabase/supabase-js';

// Đảm bảo rằng bạn đã thêm 2 biến này vào file .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Khởi tạo client kết nối đến Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
