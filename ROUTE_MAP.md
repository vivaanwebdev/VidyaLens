# VidyaLens route map

## Canonical application routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/student/dashboard` | Student | Existing student dashboard: health, priorities, and study planning. |
| `/student/subjects` | Student | Subject-focused entry point to the existing student dashboard. |
| `/student/study-plan` | Student | AI study plan entry point. |
| `/student/doubts` | Student | Ask AI and submit a doubt to a teacher. |
| `/student/solved-doubts` | Student | View submitted doubts and teacher replies. |
| `/student/analytics` | Student | Existing health and priority analytics entry point. |
| `/teacher/dashboard` | Teacher | Assigned classes, learner health, completion, and marks. |
| `/teacher/classes` | Teacher | Class-management entry point. |
| `/teacher/students` | Teacher | Student overview entry point. |
| `/teacher/marks` | Teacher | Marks-entry entry point. |
| `/admin/dashboard` | School admin | School administration overview. |
| `/admin/classes` | School admin | Classes and teacher assignment entry point. |
| `/admin/teachers` | School admin | Teacher-management entry point. |
| `/admin/invite-codes` | School admin | Invite-code management entry point. |
| `/admin/settings` | School admin | Administration settings entry point. |

## Authentication and onboarding

| Route | Access | Purpose |
| --- | --- | --- |
| `/login` | Public | Signs in and resolves membership in `school_admins`, `teachers`, or `students` before routing to the matching canonical dashboard. |
| `/join` | Public | Invite-based school onboarding. |
| `/register` | Public, legacy | Existing registration flow retained for compatibility. New school users should use `/join`. |

## Legacy compatibility routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Student, legacy | Original student dashboard. Canonical replacement: `/student/dashboard`. |
| `/admin` | School admin, legacy | Original administration dashboard. Canonical replacement: `/admin/dashboard`. |
| `/teacher` | Teacher, legacy | Redirects to `/teacher/dashboard`. |
| `/teacher-dashboard` | Teacher, legacy | Original standalone teacher dashboard implementation. |
| `/teacher/upload` | Teacher | Existing OCR report-card upload page; not in the primary navigation because it has no school-scoped authorization yet. |
| `/doubts` | Student, legacy | Canonical replacement: `/student/doubts`. |
| `/my-doubts` | Student, legacy | Canonical replacement: `/student/solved-doubts`. |
| `/timetable` | Student, legacy | Timetable settings; currently surfaced through the student dashboard workflow. |
| `/test` | Developer-only | Debug page for the subjects table; not linked from navigation. |

## API routes

`/api/admin/*` requires a `school_admins` membership, `/api/teacher/*` requires a `teachers` membership, and `/api/onboarding/redeem` finalizes an authenticated invite redemption. `/api/chat` and `/api/study-plan` back existing student AI features.
