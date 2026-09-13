# VidyaLens Route Map

## Public routes

| Route | Access | Reachability | Purpose |
| --- | --- | --- | --- |
| `/login` | Public | Direct | Authenticates then resolves `school_admins` → `teachers` → `students` for dashboard redirect. |
| `/join` | Public | Invite URL only | Invite verification and school onboarding. |
| `/register` | Public | Linked from login | Legacy registration. |

## Student routes

| Route | Access | Reachability | Implementation |
| --- | --- | --- | --- |
| `/student/dashboard` | Student | Student nav | Canonical dashboard; re-exports `/`. |
| `/student/subjects` | Student | Student nav | Alias of full `/` dashboard; not subjects-only. |
| `/student/study-plan` | Student | Student nav | Alias of full `/` dashboard; not plan-only. |
| `/student/doubts` | Student | Student nav | Re-exports `/doubts`. |
| `/student/solved-doubts` | Student | Student nav | Re-exports `/my-doubts`. |
| `/student/analytics` | Student | Student nav | Alias of full `/` dashboard; charts are embedded there. |
| `/` | Student, legacy | Direct | Original dashboard without the role shell. |
| `/doubts` | Student, legacy | Direct | AI doubt solver. |
| `/my-doubts` | Student, legacy | Direct | Submitted doubts/replies. |
| `/student/timetable-settings` | Student | Student nav | Canonical route reusing the timetable-settings form. |
| `/timetable` | Student, legacy | Direct | Legacy timetable-settings form. |

## Teacher routes

| Route | Access | Reachability | Implementation |
| --- | --- | --- | --- |
| `/teacher/dashboard` | Teacher | Teacher nav | Re-exports `/teacher-dashboard`. |
| `/teacher/classes` | Teacher | Teacher nav | Alias of full teacher dashboard. |
| `/teacher/students` | Teacher | Teacher nav | Alias of full teacher dashboard. |
| `/teacher/marks` | Teacher | Teacher nav | Alias of full teacher dashboard; marks form is embedded. |
| `/teacher/doubts` | Teacher | Teacher nav | Canonical route reusing legacy doubt management. |
| `/teacher/report-card-import` | Teacher | Teacher nav | Canonical route reusing OCR report-card import. |
| `/teacher` | Teacher | Redirect | Proxy redirects to `/teacher/dashboard`; its page file is shadowed. |
| `/teacher-dashboard` | Teacher, legacy | Direct | Shared teacher dashboard implementation. |
| `/teacher/upload` | Teacher, legacy | Direct | Legacy OCR report-card import. |

## Admin routes

| Route | Access | Reachability | Implementation |
| --- | --- | --- | --- |
| `/admin/dashboard` | Admin | Admin nav | Re-exports `/admin`. |
| `/admin/classes` | Admin | Admin nav | Alias of full admin dashboard. |
| `/admin/teachers` | Admin | Admin nav | Alias of full admin dashboard. |
| `/admin/invite-codes` | Admin | Admin nav | Alias of full admin dashboard. |
| `/admin/settings` | Admin | Admin nav | Alias; no settings-specific UI exists. |
| `/admin` | Admin, legacy | Direct | Administration dashboard. |

## APIs and diagnostics

| Route | Access | Caller | Purpose |
| --- | --- | --- | --- |
| `/api/chat` | Client | Doubts page | AI tutor response. |
| `/api/study-plan` | Client | `AIStudyPlan` | AI daily timetable. |
| `/api/onboarding/redeem` | Authenticated | Join page | Invite redemption. |
| `/api/admin/classes`, `/invites`, `/assignments` | Admin | Admin dashboard | Administration workflow. |
| `/api/teacher/dashboard`, `/marks` | Teacher | Teacher dashboard | Classroom overview and marks. |
| `/test` | Public | None | **Orphaned** subjects debug page. |

## Findings

- Most canonical role-navigation pages are route aliases, not distinct screens.
- `/test` is the remaining orphaned route; timetable settings and report-card import are restored in role navigation.
- The original `app/teacher/page.tsx` is unreachable because `/teacher` is proxy-redirected.
- `/join` is intentionally external/invite-led, but has no in-app link.
- Legacy registration creates `profiles` records but canonical role routing reads membership tables; teacher registration can therefore redirect into an unrecognized canonical role.
