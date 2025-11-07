import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Configuração do Supabase com chaves mockadas
// TODO: Substituir por variáveis de ambiente reais
const supabaseUrl = process.env.SUPABASE_URL || 'https://mock-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'mock-anon-key-123456789';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

