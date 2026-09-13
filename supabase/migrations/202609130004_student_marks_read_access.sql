-- Students need to read only their own assessment records for the dashboard.
-- This is additive and leaves the marks schema unchanged.
create policy "students view own marks" on public.marks for select using (
  exists (select 1 from public.students s where s.id = marks.student_id and s.user_id = auth.uid())
);
