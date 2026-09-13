-- Class-wide exam scheduling uses existing subjects.exam_date and
-- subjects.exam_days. No table structure is changed.
create or replace function public.schedule_class_exam(
  p_class_id bigint,
  p_subject text,
  p_exam_date date
) returns integer
language plpgsql security definer set search_path = public as $$
declare
  v_updated integer := 0;
begin
  if p_subject is null or char_length(trim(p_subject)) = 0 then
    raise exception 'A subject is required';
  end if;
  if p_exam_date is null then
    raise exception 'An exam date is required';
  end if;
  if not exists (
    select 1 from public.teacher_classes tc
    join public.teachers t on t.id = tc.teacher_id
    where tc.class_id = p_class_id and t.user_id = auth.uid()
  ) then
    raise exception 'You are not assigned to this class';
  end if;

  update public.subjects s
  set exam_date = p_exam_date,
      exam_days = greatest(0, p_exam_date - current_date)
  from public.student_classes sc
  where sc.student_id = s.student_id
    and sc.class_id = p_class_id
    and s.subject = trim(p_subject);
  get diagnostics v_updated = row_count;
  return v_updated;
end;
$$;

grant execute on function public.schedule_class_exam(bigint, text, date) to authenticated;
