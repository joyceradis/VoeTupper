import { describe, expect, it } from 'vitest';
import { readSupabasePublicConfig } from './config';

describe('Supabase public configuration',()=>{
  it('returns null while the backend is not configured',()=>{
    expect(readSupabasePublicConfig({})).toBeNull();
    expect(readSupabasePublicConfig({NEXT_PUBLIC_SUPABASE_URL:'https://example.supabase.co'})).toBeNull();
  });

  it('returns only the public URL and anon key when both exist',()=>{
    expect(readSupabasePublicConfig({
      NEXT_PUBLIC_SUPABASE_URL:'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY:'anon-public',
      SUPABASE_SERVICE_ROLE_KEY:'server-secret'
    })).toEqual({url:'https://example.supabase.co',anonKey:'anon-public'});
  });
});
