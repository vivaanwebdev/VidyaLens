-- Ensure every student has the platform's default subject set without altering
-- existing table structures. Advisory locking makes concurrent seed calls safe
-- even where legacy subjects data does not have a unique constraint.
create or replace function public.seed_default_subjects(p_student_id bigint)
returns integer
language plpgsql security definer set search_path = public as $$
declare
  v_created integer := 0;
begin
  if not exists (
    select 1 from public.students s
    where s.id = p_student_id and s.user_id = auth.uid()
  ) and not exists (
    select 1 from public.student_classes sc
    where sc.student_id = p_student_id and public.is_assigned_teacher(sc.class_id)
  ) then
    raise exception 'You cannot seed subjects for this student';
  end if;

  perform pg_advisory_xact_lock(p_student_id);
  insert into public.subjects (student_id, subject, score, exam_days)
  select p_student_id, seed.subject, 0, 30
  from (values ('Maths'::text), ('Science'::text), ('English'::text), ('Social Studies'::text)) as seed(subject)
  where not exists (
    select 1 from public.subjects existing
    where existing.student_id = p_student_id and existing.subject = seed.subject
  );
  get diagnostics v_created = row_count;
  if v_created > 0 then
    raise log 'VidyaLens auto-seeded % default subjects for student %', v_created, p_student_id;
  end if;
  return v_created;
end;
$$;

-- Replace the existing invite-redemption function only to add default-subject
-- seeding after the student record has been created/resolved.
create or replace function public.redeem_invite_code(p_code text, p_full_name text, p_class_id bigint default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_invite public.invite_codes%rowtype;
  v_user_id uuid := auth.uid();
  v_email text;
  v_student_id bigint;
begin
  if v_user_id is null then raise exception 'Authentication is required'; end if;
  select * into v_invite from public.invite_codes where code = upper(trim(p_code)) and is_active and expires_at > now() for update;
  if not found then raise exception 'This invite code is invalid, inactive, or expired'; end if;
  if v_invite.role = 'student' and p_class_id is null then raise exception 'A class is required for students'; end if;
  if p_class_id is not null and not exists (select 1 from public.classes where id = p_class_id and school_id = v_invite.school_id) then raise exception 'The selected class does not belong to this school'; end if;
  if v_invite.role = 'admin' then
    insert into public.school_admins (school_id, user_id) values (v_invite.school_id, v_user_id) on conflict do nothing;
  elsif v_invite.role = 'teacher' then
    select email into v_email from auth.users where id = v_user_id;
    insert into public.teachers (school_id, user_id, full_name, email) values (v_invite.school_id, v_user_id, trim(p_full_name), v_email)
    on conflict (user_id) do update set school_id = excluded.school_id, full_name = excluded.full_name, email = excluded.email;
  else
    insert into public.students (user_id, name, school_id) values (v_user_id, trim(p_full_name), v_invite.school_id)
    on conflict (user_id) do update set name = excluded.name, school_id = excluded.school_id returning id into v_student_id;
    if v_student_id is null then select id into v_student_id from public.students where user_id = v_user_id; end if;
    insert into public.student_classes (student_id, class_id) values (v_student_id, p_class_id)
    on conflict (student_id) do update set class_id = excluded.class_id;
    perform public.seed_default_subjects(v_student_id);
  end if;
  return jsonb_build_object('school_id', v_invite.school_id, 'role', v_invite.role);
end;
$$;

grant execute on function public.seed_default_subjects(bigint) to authenticated;
grant execute on function public.redeem_invite_code(text, text, bigint) to authenticated;
