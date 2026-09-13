| table_name                | column_name        | data_type                   |
| ------------------------- | ------------------ | --------------------------- |
| classes                   | id                 | bigint                      |
| classes                   | school_id          | bigint                      |
| classes                   | class_name         | text                        |
| classes                   | created_at         | timestamp with time zone    |
| doubts                    | id                 | bigint                      |
| doubts                    | student_id         | uuid                        |
| doubts                    | question           | text                        |
| doubts                    | ai_answer          | text                        |
| doubts                    | teacher_answer     | text                        |
| doubts                    | status             | text                        |
| doubts                    | created_at         | timestamp without time zone |
| invite_codes              | id                 | bigint                      |
| invite_codes              | school_id          | bigint                      |
| invite_codes              | code               | text                        |
| invite_codes              | role               | text                        |
| invite_codes              | expires_at         | timestamp with time zone    |
| invite_codes              | is_active          | boolean                     |
| invite_codes              | created_by         | uuid                        |
| invite_codes              | created_at         | timestamp with time zone    |
| marks                     | id                 | bigint                      |
| marks                     | student_id         | bigint                      |
| marks                     | teacher_id         | bigint                      |
| marks                     | subject_id         | bigint                      |
| marks                     | assessment_name    | text                        |
| marks                     | score              | numeric                     |
| marks                     | max_score          | numeric                     |
| marks                     | assessed_at        | date                        |
| marks                     | created_at         | timestamp with time zone    |
| profiles                  | id                 | uuid                        |
| profiles                  | created_at         | timestamp with time zone    |
| profiles                  | role               | text                        |
| profiles                  | name               | text                        |
| profiles                  | school_id          | bigint                      |
| school_admins             | id                 | bigint                      |
| school_admins             | school_id          | bigint                      |
| school_admins             | user_id            | uuid                        |
| school_admins             | created_at         | timestamp with time zone    |
| schools                   | id                 | bigint                      |
| schools                   | name               | text                        |
| schools                   | school_code        | text                        |
| student_classes           | id                 | bigint                      |
| student_classes           | student_id         | bigint                      |
| student_classes           | class_id           | bigint                      |
| student_classes           | created_at         | timestamp with time zone    |
| students                  | id                 | bigint                      |
| students                  | name               | text                        |
| students                  | class              | text                        |
| students                  | school_id          | bigint                      |
| students                  | user_id            | uuid                        |
| study_session_completions | id                 | bigint                      |
| study_session_completions | student_id         | bigint                      |
| study_session_completions | timetable_entry_id | bigint                      |
| study_session_completions | completed          | boolean                     |
| study_session_completions | completed_at       | timestamp with time zone    |
| study_streaks             | id                 | bigint                      |
| study_streaks             | student_id         | uuid                        |
| study_streaks             | streak_date        | date                        |
| subjects                  | id                 | bigint                      |
| subjects                  | student_id         | bigint                      |
| subjects                  | subject            | text                        |
| subjects                  | score              | bigint                      |
| subjects                  | exam_days          | bigint                      |
| subjects                  | exam_date          | date                        |
| teacher_classes           | id                 | bigint                      |
| teacher_classes           | teacher_id         | bigint                      |
| teacher_classes           | class_id           | bigint                      |
| teacher_classes           | created_at         | timestamp with time zone    |
| teachers                  | id                 | bigint                      |
| teachers                  | school_id          | bigint                      |
| teachers                  | user_id            | uuid                        |
| teachers                  | full_name          | text                        |
| teachers                  | email              | text                        |
| teachers                  | created_at         | timestamp with time zone    |
| timetable_entries         | id                 | bigint                      |
| timetable_entries         | student_id         | bigint                      |
| timetable_entries         | study_date         | date                        |
| timetable_entries         | start_time         | time without time zone      |
| timetable_entries         | end_time           | time without time zone      |
| timetable_entries         | subject            | text                        |
| timetable_entries         | reason             | text                        |
| timetable_entries         | completed          | boolean                     |
| timetable_entries         | created_at         | timestamp with time zone    |
| timetable_entries         | generated_by_ai    | boolean                     |
| timetable_settings        | id                 | bigint                      |
| timetable_settings        | student_id         | bigint                      |
| timetable_settings        | wake_time          | time without time zone      |
| timetable_settings        | school_start       | time without time zone      |
| timetable_settings        | school_end         | time without time zone      |
| timetable_settings        | tuition_start      | time without time zone      |
| timetable_settings        | tuition_end        | time without time zone      |
| timetable_settings        | sleep_time         | time without time zone      |
| timetable_settings        | created_at         | timestamp with time zone    |
| timetable_settings        | updated_at         | timestamp with time zone    |
| timetable_settings        | study_hours        | numeric                     |