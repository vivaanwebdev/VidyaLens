| table_name                | constraint_name                                             | definition                                                                           |
| ------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| classes                   | classes_school_id_fkey                                      | FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE                     |
| classes                   | classes_class_name_check                                    | CHECK ((char_length(TRIM(BOTH FROM class_name)) > 0))                                |
| classes                   | classes_school_id_class_name_key                            | UNIQUE (school_id, class_name)                                                       |
| classes                   | classes_pkey                                                | PRIMARY KEY (id)                                                                     |
| doubts                    | doubts_pkey                                                 | PRIMARY KEY (id)                                                                     |
| invite_codes              | invite_codes_role_check                                     | CHECK ((role = ANY (ARRAY['admin'::text, 'teacher'::text, 'student'::text])))        |
| invite_codes              | invite_codes_school_id_fkey                                 | FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE                     |
| invite_codes              | invite_codes_code_check                                     | CHECK (((code = upper(code)) AND (code ~ '^[A-Z0-9]{8}$'::text)))                    |
| invite_codes              | invite_codes_code_key                                       | UNIQUE (code)                                                                        |
| invite_codes              | invite_codes_created_by_fkey                                | FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL                |
| invite_codes              | invite_codes_pkey                                           | PRIMARY KEY (id)                                                                     |
| marks                     | marks_score_check                                           | CHECK ((score >= (0)::numeric))                                                      |
| marks                     | marks_subject_id_fkey                                       | FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL                  |
| marks                     | marks_student_id_fkey                                       | FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE                   |
| marks                     | marks_check                                                 | CHECK (((max_score > (0)::numeric) AND (score <= max_score)))                        |
| marks                     | marks_pkey                                                  | PRIMARY KEY (id)                                                                     |
| marks                     | marks_teacher_id_fkey                                       | FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE RESTRICT                  |
| profiles                  | profiles_pkey                                               | PRIMARY KEY (id)                                                                     |
| school_admins             | school_admins_user_id_fkey                                  | FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE                    |
| school_admins             | school_admins_pkey                                          | PRIMARY KEY (id)                                                                     |
| school_admins             | school_admins_school_id_fkey                                | FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE                     |
| school_admins             | school_admins_school_id_user_id_key                         | UNIQUE (school_id, user_id)                                                          |
| school_admins             | school_admins_user_id_key                                   | UNIQUE (user_id)                                                                     |
| schools                   | schools_pkey                                                | PRIMARY KEY (id)                                                                     |
| student_classes           | student_classes_student_id_fkey                             | FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE                   |
| student_classes           | student_classes_class_id_fkey                               | FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE                      |
| student_classes           | student_classes_pkey                                        | PRIMARY KEY (id)                                                                     |
| student_classes           | student_classes_student_id_key                              | UNIQUE (student_id)                                                                  |
| students                  | students_pkey                                               | PRIMARY KEY (id)                                                                     |
| students                  | students_user_id_key                                        | UNIQUE (user_id)                                                                     |
| study_session_completions | study_session_completions_timetable_entry_id_fkey           | FOREIGN KEY (timetable_entry_id) REFERENCES timetable_entries(id) ON DELETE SET NULL |
| study_session_completions | study_session_completions_student_id_fkey                   | FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE                   |
| study_session_completions | study_session_completions_student_id_timetable_entry_id_key | UNIQUE (student_id, timetable_entry_id)                                              |
| study_session_completions | study_session_completions_pkey                              | PRIMARY KEY (id)                                                                     |
| study_streaks             | study_streaks_student_id_streak_date_key                    | UNIQUE (student_id, streak_date)                                                     |
| study_streaks             | study_streaks_pkey                                          | PRIMARY KEY (id)                                                                     |
| subjects                  | subjects_pkey                                               | PRIMARY KEY (id)                                                                     |
| subjects                  | subjects_student_id_fkey                                    | FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE                   |
| teacher_classes           | teacher_classes_teacher_id_fkey                             | FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE                   |
| teacher_classes           | teacher_classes_teacher_id_class_id_key                     | UNIQUE (teacher_id, class_id)                                                        |
| teacher_classes           | teacher_classes_pkey                                        | PRIMARY KEY (id)                                                                     |
| teacher_classes           | teacher_classes_class_id_fkey                               | FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE                      |
| teachers                  | teachers_user_id_key                                        | UNIQUE (user_id)                                                                     |
| teachers                  | teachers_user_id_fkey                                       | FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE                    |
| teachers                  | teachers_school_id_fkey                                     | FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE                     |
| teachers                  | teachers_school_id_email_key                                | UNIQUE (school_id, email)                                                            |
| teachers                  | teachers_pkey                                               | PRIMARY KEY (id)                                                                     |
| teachers                  | teachers_full_name_check                                    | CHECK ((char_length(TRIM(BOTH FROM full_name)) > 0))                                 |
| timetable_entries         | timetable_entries_student_id_fkey                           | FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE                   |
| timetable_entries         | timetable_entries_pkey                                      | PRIMARY KEY (id)                                                                     |
| timetable_settings        | timetable_settings_student_id_key                           | UNIQUE (student_id)                                                                  |
| timetable_settings        | timetable_settings_student_id_fkey                          | FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE                   |
| timetable_settings        | timetable_settings_pkey                                     | PRIMARY KEY (id)                                                                     |