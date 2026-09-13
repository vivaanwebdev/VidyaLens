# VidyaLens Database Map

Derived from migrations and repository queries; this is not a live Supabase schema export.

## Existing tables consumed

| Table | Features / operations | Status |
| --- | --- | --- |
| `students` | Role lookup, dashboard, timetable, onboarding, streaks | Active; expected `id bigint`, `user_id`, `name`, `school_id`. |
| `schools` | Student school name, legacy registration, school FKs | Active; expected `id bigint`, `name`. |
| `profiles` | Legacy registration and shadowed teacher page | Legacy-only for roles; canonical resolver does not use it. |
| `subjects` | Dashboard, charts, health aggregation, OCR, legacy teacher updates | Active. |
| `timetable_settings` | Timetable settings and AI plan configuration | Active through `/student/timetable-settings`. |
| `timetable_entries` | AI sessions, completion, streaks, teacher summary | Active. |
| `doubts` | AI doubt submission/history/legacy teacher replies | Active; live schema confirms `student_id uuid`, matching the student pages’ Auth user ID. |

## School administration tables

| Table | Foreign keys / role | Used by |
| --- | --- | --- |
| `school_admins` | `school_id → schools`, `user_id → auth.users` | Role resolution, admin RLS. |
| `teachers` | `school_id → schools`, `user_id → auth.users` | Role resolution, teacher RLS. |
| `classes` | `school_id → schools` | Admin class management. |
| `teacher_classes` | `teacher_id → teachers`, `class_id → classes` | Teacher assignment/roster. |
| `student_classes` | `student_id → students`, `class_id → classes` | Student assignment/roster. |
| `invite_codes` | `school_id → schools`, `created_by → auth.users` | Invite onboarding. |
| `marks` | Student, teacher, optional subject FK | Teacher writes; no current student/admin read UI. |
| `study_session_completions` | Student, optional timetable entry FK | Streaks and teacher completion summary. |

## Supabase functions

| Function | Called by | Purpose |
| --- | --- | --- |
| `is_school_admin`, `is_assigned_teacher` | RLS / RPCs | School membership checks. |
| `redeem_invite_code`, `invite_classes` | Join flow | Invite onboarding. |
| `school_academic_health`, `admin_students_by_class` | Admin APIs | Scoped reporting. |
| `set_study_session_completion`, `study_streak_stats` | `AIStudyPlan` | Atomic completion and streak reporting. |

## Orphaned or weak connections

- No migration-created table is completely orphaned.
- `profiles` is a legacy role source and conflicts conceptually with membership-based role routing.
- `marks` is write-only in the current UI.
- `timetable_settings` is editable at canonical `/student/timetable-settings` and legacy `/timetable`.
- `study_streaks` exists in the live schema but has no current repository reference; streak reporting uses `study_session_completions` and `timetable_entries` instead.
