# Restored feature access

| Canonical route restored | Existing file reused | Navigation link added |
| --- | --- | --- |
| `/teacher/doubts` | `app/teacher/page.tsx` | Teacher: **Doubts** |
| `/teacher/report-card-import` | `app/teacher/upload/page.tsx` | Teacher: **Report Import** |
| `/student/timetable-settings` | `app/timetable/page.tsx` | Student: **Timetable Settings** |

The teacher doubts route reuses its original teacher authorization and management UI, updated to check the current `teachers` membership table instead of legacy `profiles.role`. The canonical teacher layout continues to provide the role guard.
