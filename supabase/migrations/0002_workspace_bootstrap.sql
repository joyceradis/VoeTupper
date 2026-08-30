create or replace function public.create_workspace(workspace_name text)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare new_id uuid;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if char_length(trim(workspace_name)) not between 2 and 80 then raise exception 'invalid workspace name'; end if;
  insert into public.workspaces(name) values(trim(workspace_name)) returning id into new_id;
  insert into public.workspace_members(workspace_id,user_id,role) values(new_id,auth.uid(),'owner');
  return new_id;
end;
$$;
revoke all on function public.create_workspace(text) from public;
grant execute on function public.create_workspace(text) to authenticated;
