# VidyaLens Feature Map

| Feature | Pages | Tables / functions | APIs | Dependencies | Audit result |
| --- | --- | --- | --- | --- | --- |
| Authentication and role routing | `/login`, `/join`, `/register`, role layouts | `school_admins`, `teachers`, `students`; `invite_codes`, `classes`; invite RPCs | `/api/onboarding/redeem` | Supabase, Next | Canonical roles use memberships. Legacy teacher registration does not create `teachers`. |
| Student dashboard / analytics | `/student/dashboard`, `/subjects`, `/study-plan`, `/analytics`, `/` | `students`, `schools`, `subjects` | `/api/study-plan` | Supabase, Recharts | Three canonical nav items are aliases of the same dashboard. |
| Smart timetable | Dashboard `AIStudyPlan`, `/student/timetable-settings`, `/timetable` | `timetable_settings`, `timetable_entries`, `students` | `/api/study-plan` | OpenAI/Groq, Supabase | Generation and its required settings page are reachable. |
| Completion and streaks | Dashboard `AIStudyPlan` | `timetable_entries`, `study_session_completions`; streak RPCs | Direct Supabase RPCs | Supabase, React | Active; migration required for atomic writes/stats. |
| AI doubts / replies | `/student/doubts`, `/student/solved-doubts`, `/teacher/doubts`, legacy pages | `doubts`, `teachers` | `/api/chat` | OpenAI/Groq, Supabase | Student and teacher-reply UI are reachable. |
| School administration | `/admin/*`, `/admin` | School/admin/class/invite tables; admin functions | `/api/admin/*` | Supabase, Node crypto | Active; four nav destinations alias one dashboard, settings lacks behavior. |
| Teacher classroom / marks | `/teacher/*`, `/teacher-dashboard` | Teacher/class/student/subject/timetable/completion/marks tables | `/api/teacher/*` | Supabase | Subject dropdown loads the selected learner’s `subjects`; mark entry saves `marks.subject_id` and recomputes `subjects.score` as the assessment percentage average. |
| OCR report-card import | `/teacher/report-card-import`, `/teacher/upload` | `subjects` | Direct Supabase | Tesseract | Restored in teacher navigation; existing page retains its current subject-update scope. |
| Debug data inspection | `/test` | `subjects` | Direct Supabase | Supabase | Publicly routable orphan/debug code. |

## Dependency inventory

| Dependency | Observed usage |
| --- | --- |
| `next`, `react`, `react-dom`, TypeScript, Tailwind | App framework and UI. |
| `@supabase/supabase-js` | Authentication, database reads/writes, RPCs. |
| `openai` | Groq-compatible chat and timetable route handlers. |
| `recharts` | Dashboard chart components. |
| `tesseract.js` | OCR upload only. |
| `@google/genai` | No repository import found; unused dependency candidate. |
