import { createClient } from '@supabase/supabase-js';
import { UserWallet } from './types';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database helper functions
export async function getWalletByTwitterId(twitterId: string): Promise<UserWallet | null> {
  const { data, error } = await supabase
    .from('user_wallets')
    .select('*')
    .eq('twitter_id', twitterId)
    .single();

  if (error) {
    console.error('Error fetching wallet:', error);
    return null;
  }

  return data;
}

export async function createWalletRecord(twitterId: string, publicKey: string): Promise<UserWallet | null> {
  const { data, error } = await supabase
    .from('user_wallets')
    .insert([
      {
        twitter_id: twitterId,
        stellar_public_key: publicKey,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating wallet record:', error);
    return null;
  }

  return data;
} 