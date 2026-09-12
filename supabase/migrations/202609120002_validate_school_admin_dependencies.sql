-- Safety validation for the existing VidyaLens tables consumed by the school
-- administration migration. This changes no existing table or policy.
do $$
begin
  if to_regclass('public.subjects') is null then
    raise exception 'Expected existing table public.subjects was not found';
  end if;
  if to_regclass('public.timetable_entries') is null then
    raise exception 'Expected existing table public.timetable_entries was not found';
  end if;

  if (select data_type from information_schema.columns where table_schema = 'public' and table_name = 'students' and column_name = 'school_id') <> 'bigint' then
    raise exception 'public.students.school_id must be bigint to reference public.schools.id';
  end if;
  if (select data_type from information_schema.columns where table_schema = 'public' and table_name = 'subjects' and column_name = 'id') <> 'bigint'
     or (select data_type from information_schema.columns where table_schema = 'public' and table_name = 'subjects' and column_name = 'student_id') <> 'bigint' then
    raise exception 'public.subjects.id and public.subjects.student_id must be bigint';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'subjects' and column_name = 'score') then
    raise exception 'Expected existing column public.subjects.score was not found';
  end if;
  if (select data_type from information_schema.columns where table_schema = 'public' and table_name = 'timetable_entries' and column_name = 'id') <> 'bigint' then
    raise exception 'public.timetable_entries.id must be bigint';
  end if;
end $$;

-- Reading the roster through this controlled function avoids depending on the
-- legacy students-table RLS policy, which normally permits a student to see
-- only their own row. It returns only fields required by the admin UI.
create or replace function public.admin_students_by_class(p_school_id bigint)
returns table (student_id bigint, class_id bigint, student_name text)
language sql stable security definer set search_path = public as $$
  select sc.student_id, sc.class_id, s.name
  from public.student_classes sc
  join public.classes c on c.id = sc.class_id
  join public.students s on s.id = sc.student_id
  where c.school_id = p_school_id and public.is_school_admin(p_school_id)
  order by s.name;
$$;

grant execute on function public.admin_students_by_class(bigint) to authenticated;
