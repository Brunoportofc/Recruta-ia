import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Preferir variáveis de ambiente reais. Falhar rápido se não estiverem definidas
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
	// Mensagem clara para desenvolvedores — evita erros genéricos de fetch
	throw new Error([
		'SUPABASE_URL e SUPABASE_ANON_KEY não estão definidas.',
		'Por favor crie um arquivo .env na pasta /backend com as variáveis abaixo:',
		'SUPABASE_URL=https://seu-projeto.supabase.co',
		'SUPABASE_ANON_KEY=eyJ...'
	].join('\n'));
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

