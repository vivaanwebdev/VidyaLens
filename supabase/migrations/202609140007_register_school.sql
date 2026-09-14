-- Creates a school and its first administrator as one authenticated operation.
-- Existing invite-code onboarding and existing table structures are unchanged.
create or replace function public.register_school(
  p_school_name text,
  p_school_code text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_school_id bigint;
  v_school_name text := trim(coalesce(p_school_name, ''));
  v_school_code text := upper(trim(coalesce(p_school_code, '')));
begin
  if v_user_id is null then
    raise exception 'Authentication is required';
  end if;
  if char_length(v_school_name) < 2 then
    raise exception 'School name must contain at least 2 characters';
  end if;
  if v_school_code !~ '^[A-Z0-9]{4,20}$' then
    raise exception 'School code must contain 4 to 20 letters or numbers';
  end if;
  if exists (select 1 from public.school_admins where user_id = v_user_id) then
    raise exception 'This account already administers a school';
  end if;
  perform pg_advisory_xact_lock(hashtext(v_school_code));
  if exists (select 1 from public.schools where upper(trim(school_code)) = v_school_code) then
    raise exception 'That school code is already in use';
  end if;

  insert into public.schools (name, school_code)
  values (v_school_name, v_school_code)
  returning id into v_school_id;

  insert into public.school_admins (school_id, user_id)
  values (v_school_id, v_user_id);

  return jsonb_build_object('school_id', v_school_id, 'school_name', v_school_name);
end;
$$;

grant execute on function public.register_school(text, text) to authenticated;
