'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { currentSupabasePublicConfig } from './config';

let browserClient:SupabaseClient|null|undefined;

export function getSupabaseBrowserClient():SupabaseClient|null{
  if(browserClient!==undefined)return browserClient;
  const config=currentSupabasePublicConfig();
  if(!config){browserClient=null;return browserClient;}
  browserClient=createBrowserClient(config.url,config.anonKey);
  return browserClient;
}

export function createClient():SupabaseClient|null{
  return getSupabaseBrowserClient();
}
