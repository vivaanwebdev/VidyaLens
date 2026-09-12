-- Study streak calculations reuse timetable_entries and
-- study_session_completions. No new data table is required.
do $$
begin
  if to_regclass('public.timetable_entries') is null
     or to_regclass('public.study_session_completions') is null then
    raise exception 'Expected timetable_entries and study_session_completions tables were not found';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'timetable_entries' and column_name = 'study_date')
     or not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'timetable_entries' and column_name = 'completed') then
    raise exception 'Expected timetable_entries.study_date and timetable_entries.completed columns were not found';
  end if;
end $$;

create index if not exists timetable_entries_student_study_date_idx
  on public.timetable_entries(student_id, study_date);

-- A single atomic write updates the legacy display flag and the canonical
-- completion ledger. The entry ownership check prevents cross-student writes.
create or replace function public.set_study_session_completion(
  p_timetable_entry_id bigint,
  p_completed boolean
) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_student_id bigint;
begin
  select student_id into strict v_student_id
  from public.timetable_entries
  where id = p_timetable_entry_id;

  if not exists (select 1 from public.students where id = v_student_id and user_id = auth.uid()) then
    raise exception 'You cannot update this study session';
  end if;

  update public.timetable_entries set completed = p_completed where id = p_timetable_entry_id;
  insert into public.study_session_completions (student_id, timetable_entry_id, completed, completed_at)
  values (v_student_id, p_timetable_entry_id, p_completed, now())
  on conflict (student_id, timetable_entry_id) do update
    set completed = excluded.completed, completed_at = excluded.completed_at;
  return p_completed;
exception when no_data_found then
  raise exception 'Study session was not found';
end;
$$;

-- A scheduled day is complete only when all of its timetable entries are
-- complete. The range begins at the earliest scheduled day, so longest streak
-- includes historical streaks and weekly consistency reads only seven days.
create or replace function public.study_streak_stats()
returns table (current_streak integer, longest_streak integer, weekly_consistency integer)
language sql stable security definer set search_path = public as $$
  with current_student as (
    select id from public.students where user_id = auth.uid()
  ), daily as (
    select te.study_date,
      bool_and(coalesce(sc.completed, te.completed, false)) as is_complete
    from public.timetable_entries te
    join current_student cs on cs.id = te.student_id
    left join public.study_session_completions sc
      on sc.student_id = te.student_id and sc.timetable_entry_id = te.id
    where te.study_date <= current_date
    group by te.study_date
  ), current_days as (
    select study_date,
      study_date + row_number() over (order by study_date desc)::integer as grp
    from daily where is_complete
  ), current_run as (
    select count(*)::integer as value from current_days
    where grp = (select grp from current_days where study_date = current_date)
  ), all_runs as (
    select count(*)::integer as value from (
      select study_date - row_number() over (order by study_date)::integer as grp
      from daily where is_complete
    ) grouped group by grp
  ), weekly as (
    select count(*) filter (where is_complete)::numeric / nullif(count(*), 0) * 100 as value
    from daily where study_date between current_date - 6 and current_date
  )
  select coalesce((select value from current_run), 0),
    coalesce((select max(value) from all_runs), 0),
    coalesce(round((select value from weekly))::integer, 0);
$$;

grant execute on function public.set_study_session_completion(bigint, boolean) to authenticated;
grant execute on function public.study_streak_stats() to authenticated;
