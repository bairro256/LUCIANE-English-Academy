create table if not exists public.practice_generation_limits (
  ip_hash text not null,
  window_start timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  primary key (ip_hash, window_start)
);

alter table public.practice_generation_limits enable row level security;
revoke all on table public.practice_generation_limits from public, anon, authenticated;
grant all on table public.practice_generation_limits to service_role;

create or replace function public.consume_practice_generation_limit(
  p_ip_hash text,
  p_window_start timestamptz
)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.practice_generation_limits (ip_hash, window_start, request_count)
  values (p_ip_hash, p_window_start, 1)
  on conflict (ip_hash, window_start)
  do update set request_count = public.practice_generation_limits.request_count + 1
  returning request_count into v_count;

  delete from public.practice_generation_limits
  where window_start < now() - interval '2 days';

  return v_count;
end;
$$;

revoke all on function public.consume_practice_generation_limit(text, timestamptz) from public, anon, authenticated;
grant execute on function public.consume_practice_generation_limit(text, timestamptz) to service_role;
