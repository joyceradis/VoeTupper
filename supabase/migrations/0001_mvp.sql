create extension if not exists pgcrypto;
create type public.member_role as enum ('owner','member');
create type public.consultant_status as enum ('ACTIVE','NEW','PAUSED','INACTIVE');
create type public.week_status as enum ('PLANNED','ACTIVE','CLOSED');
create type public.order_stage as enum ('RECEIVED','ORGANIZED','PORTAL_DONE','CONFIRMATION_SENT','COMPLETED','CANCELLED');
create type public.source_channel as enum ('AUDIO','PHOTO','TEXT','OTHER');

create table public.workspaces(id uuid primary key default gen_random_uuid(), name text not null check(char_length(name) between 2 and 80), created_at timestamptz not null default now());
create table public.workspace_members(workspace_id uuid not null references public.workspaces on delete cascade,user_id uuid not null references auth.users on delete cascade,role public.member_role not null default 'member',created_at timestamptz not null default now(),primary key(workspace_id,user_id));
create table public.consultants(id uuid primary key default gen_random_uuid(),workspace_id uuid not null references public.workspaces on delete cascade,display_name text not null check(char_length(display_name) between 2 and 80),business_code text,phone text,status public.consultant_status not null default 'ACTIVE',note text check(char_length(note)<=500),created_at timestamptz not null default now());
create table public.campaigns(id uuid primary key default gen_random_uuid(),workspace_id uuid not null references public.workspaces on delete cascade,label text not null,created_at timestamptz not null default now());
create table public.weeks(id uuid primary key default gen_random_uuid(),workspace_id uuid not null references public.workspaces on delete cascade,campaign_id uuid not null references public.campaigns on delete restrict,label text not null,starts_at timestamptz,closes_at timestamptz,team_goal numeric(12,2) not null default 0 check(team_goal>=0),status public.week_status not null default 'PLANNED');
create table public.orders(id uuid primary key default gen_random_uuid(),workspace_id uuid not null references public.workspaces on delete cascade,consultant_id uuid not null references public.consultants on delete restrict,week_id uuid not null references public.weeks on delete restrict,source public.source_channel not null,summary text not null check(char_length(summary) between 1 and 500),amount numeric(12,2) check(amount>=0),stage public.order_stage not null default 'RECEIVED',created_by uuid references auth.users,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.offers(id uuid primary key default gen_random_uuid(),workspace_id uuid not null references public.workspaces on delete cascade,week_id uuid references public.weeks on delete cascade,campaign_id uuid references public.campaigns on delete cascade,title text not null,active boolean not null default true,check(week_id is not null or campaign_id is not null));
create table public.recognitions(id uuid primary key default gen_random_uuid(),workspace_id uuid not null references public.workspaces on delete cascade,week_id uuid not null references public.weeks on delete cascade,consultant_id uuid not null references public.consultants on delete cascade,label text not null,confirmed_at timestamptz,confirmed_by uuid references auth.users);
create table public.audit_events(id bigint generated always as identity primary key,workspace_id uuid not null references public.workspaces on delete cascade,actor_id uuid references auth.users,event_type text not null,entity_type text not null,entity_id uuid,created_at timestamptz not null default now());
create index on public.workspace_members(user_id,workspace_id);create index on public.orders(workspace_id,week_id,stage);create index on public.consultants(workspace_id,status);create index on public.weeks(workspace_id,status);

create or replace function public.is_workspace_member(target uuid) returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.workspace_members m where m.workspace_id=target and m.user_id=auth.uid()) $$;
create or replace function public.is_workspace_owner(target uuid) returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.workspace_members m where m.workspace_id=target and m.user_id=auth.uid() and m.role='owner') $$;

alter table public.workspaces enable row level security;alter table public.workspace_members enable row level security;alter table public.consultants enable row level security;alter table public.campaigns enable row level security;alter table public.weeks enable row level security;alter table public.orders enable row level security;alter table public.offers enable row level security;alter table public.recognitions enable row level security;alter table public.audit_events enable row level security;
create policy workspace_read on public.workspaces for select using(public.is_workspace_member(id));
create policy workspace_update on public.workspaces for update using(public.is_workspace_owner(id));
create policy members_read on public.workspace_members for select using(public.is_workspace_member(workspace_id));
create policy members_owner_write on public.workspace_members for all using(public.is_workspace_owner(workspace_id)) with check(public.is_workspace_owner(workspace_id));
create policy consultants_member on public.consultants for all using(public.is_workspace_member(workspace_id)) with check(public.is_workspace_member(workspace_id));
create policy campaigns_member on public.campaigns for all using(public.is_workspace_member(workspace_id)) with check(public.is_workspace_member(workspace_id));
create policy weeks_member on public.weeks for all using(public.is_workspace_member(workspace_id)) with check(public.is_workspace_member(workspace_id));
create policy orders_member on public.orders for all using(public.is_workspace_member(workspace_id)) with check(public.is_workspace_member(workspace_id));
create policy offers_member on public.offers for all using(public.is_workspace_member(workspace_id)) with check(public.is_workspace_member(workspace_id));
create policy recognitions_member on public.recognitions for all using(public.is_workspace_member(workspace_id)) with check(public.is_workspace_member(workspace_id));
create policy audit_read on public.audit_events for select using(public.is_workspace_owner(workspace_id));
create policy audit_insert on public.audit_events for insert with check(public.is_workspace_member(workspace_id) and actor_id=auth.uid());

-- Workspace creation is intentionally mediated by a trusted server/RPC in deployment so the creator membership is created atomically.
-- No password/credential column exists by design.
