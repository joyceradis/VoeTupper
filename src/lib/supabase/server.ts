import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { currentSupabasePublicConfig } from './config';

export async function getSupabaseServerClient():Promise<SupabaseClient|null>{
  const config=currentSupabasePublicConfig();
  if(!config)return null;
  const cookieStore=await cookies();
  return createServerClient(config.url,config.anonKey,{
    cookies:{
      getAll(){return cookieStore.getAll();},
      setAll(cookiesToSet){
        try{
          cookiesToSet.forEach(({name,value,options})=>cookieStore.set(name,value,options));
        }catch{
          // Server Components may be read-only. Middleware or actions refresh cookies.
        }
      }
    }
  });
}
