require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'SUPABASE_URL e SUPABASE_KEY nao definidos. Copie .env.example para .env e preencha com as ' +
      'chaves do seu projeto Supabase (Project Settings > API).'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
