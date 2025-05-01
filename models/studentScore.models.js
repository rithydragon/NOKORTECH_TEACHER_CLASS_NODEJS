import db from '../config/db.js';

class StudentScore {
    static async create(
        student_id,
        subject_id,
        course_id,
        class_id,
        semester_id,
        academic_id,
        score,
        midterm,
        final,
        ranking,
        exam_date,
        is_new = true,
        note = '',
        created_by
    ) {
        console.log('Creating student score with:', {
            student_id,
            subject_id,
            course_id,
            class_id,
            semester_id,
            academic_id,
            score,
            midterm,
            final,
            ranking,
            exam_date,
            is_new,
            note,
            created_by
        });

        try {
            // Validate required fields
            if (!student_id || !course_id || score === undefined) {
                throw new Error('Missing required fields (student_id, subject_id, score)');
            }

            const queryData = `
                INSERT INTO STUDENT_SCORE  
                    (STUDENT_ID, SUBJECT_ID, COURSE_ID, CLASS_ID, ACADEMIC_ID, SEMESTER_ID, SCORE, MIDTERM, FINAL, RANKING, EXAM_DATE, IS_CREATED, NOTE, CREATED_BY)  
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
            const [result] = await db.execute(queryData,
                [
                    student_id,
                    subject_id || null,
                    course_id,
                    class_id || null,
                    academic_id || null,
                    semester_id || null,
                    score || null,
                    midterm || null,
                    final || null,
                    ranking || null,
                    exam_date || null,
                    is_new = is_new ? 1 : 0,
                    note,
                    created_by
                ]
            );

            return result.insertId;
        } catch (error) {
            console.error('Error creating student score:', error);
            throw error; // Re-throw for controller handling
        }
    }

    static async update(
        id, student_id, subject_id, course_id, class_id,
        semester_id, academic_id, score, midterm, final,
        ranking, exam_date,note, updated_by
    ) {
        console.log('Updating student score with:', {
            id, student_id, subject_id, course_id, class_id,
            semester_id, academic_id, score, midterm, final,
            ranking,exam_date, note, updated_by
        });

        const query = `
            UPDATE STUDENT_SCORE SET 
            SUBJECT_ID = ?, COURSE_ID = ?, CLASS_ID = ?, SEMESTER_ID = ?, ACADEMIC_ID = ?,
            SCORE = ?, MIDTERM = ?, FINAL = ?, RANKING = ?, EXAM_DATE = ?, NOTE = ?,
            IS_EDITED = TRUE, UPDATED_BY = ?, UPDATED_DATE = CURRENT_TIMESTAMP
            WHERE ID = ? AND STUDENT_ID = ?
        `;

        const [result] = await db.execute(query, [
            subject_id ?? null, course_id ?? null, class_id ?? null, semester_id ?? null, academic_id ?? null,
            score ?? null, midterm ?? null, final ?? null, ranking ?? null, exam_date ?? null,
            note?.trim() || null, updated_by ?? null, id, student_id
        ]);

        return result.affectedRows > 0;
    }


    static async delete(id) {
        const [result] = await db.query(
            `DELETE FROM STUDENT_SCORE WHERE Id = ?`,
            [id]
        );
        return result.affectedRows;
    }

    static async findById(id) {
        const [rows] = await db.query(
            `SELECT * FROM STUDENT_SCORE WHERE ID = ?`,
            [id]
        );
        return rows[0];
    }


    static async findByStudentId(id) {
        const query =
            `
            SELECT 
            -- User Basic Information
            U.ID AS UserId,
            U.USER_CODE AS UserCode,
            U.NAME AS Name,
            U.NAME_ENGLISH AS NameEnglish,

            -- Student Score Information
            SS.ID AS ScoreId,
            SS.STUDENT_ID AS StudentId,
            SS.SUBJECT_ID AS SubjectId,
            SS.SCORE AS Score,
            SS.RANKING AS Ranking,
            SS.IS_EDITED AS IsEdited,
            SS.CREATED_DATE AS CreatedAt,
            COALESCE(U.USERNAME, 'Unknown') AS CreatedBy,
            COALESCE(U.USERNAME, 'Unknown') AS UpdatedBy,

            -- Academic Setting Information
            ACADEMIC.ID AS AcademicId,
            ACADEMIC.NAME AS AcademicYearName,
            ACADEMIC.ENGLISH_NAME AS AcademicYearEnglishName,
            ACADEMIC.CODE AS AcademicCode,

            -- Semester Information
            SEM.ID AS SemesterId,
            SEM.NAME AS SemesterName,
            SEM.DESCRIPTION AS SemesterDescription

        FROM STUDENT_SCORE SS

        -- Join to Academic Setting
        LEFT JOIN ACADEMIC_SETTING ACADEMIC ON SS.ACADEMIC_ID = ACADEMIC.ID

        -- Join to Semester from Academic Setting
        LEFT JOIN SEMESTER SEM ON ACADEMIC.SEMESTER_ID = SEM.ID

        -- Join to Users (who created the student score)
        LEFT JOIN USERS U ON SS.CREATED_BY = U.ID

        -- Filter by specific STUDENT_ID
        -- WHERE SS.STUDENT_ID = @StudentId;
        WHERE SS.STUDENT_ID = ?;

        `
        const [rows] = await db.query(query, [id]);
        return rows[0];
    }

    static async findAllByStudent(student_id) {
        const query = `
            -- Get by Student Id
            SELECT   -- get this
                SS.ID AS Id,
                SS.ID AS ScoreId,
                U.ID AS UserId,
                U.USER_CODE AS UserCode,
                U.NAME AS StudentName,
                U.ID AS StudentId,
                S.ID AS SubjectId,
                S.NAME AS SubjectName,
                S.NAME_ENGLISH AS SubjectEnglishName,
                C.ID AS ClassId,
                C.CODE AS ClassCode,
                C.ROOM AS Class,
                A.ID AS AcademicId,
                A.NAME AS AcademicName,
                A.ENGLISH_NAME AS AcademicEnglishName,
                SEM.ID AS SemesterId,
                SEM.NAME AS SemesterName,
                SS.SCORE AS Score,
                SS.MIDTERM AS Midterm,
                SS.FINAL AS Final,
                SS.RANKING AS Ranking,
                SS.EXAM_DATE AS ExamDate,
                SS.IS_EDITED AS IsEdited,
                SS.NOTE AS Note,
                SS.CREATED_DATE AS CreatedDate,
                SS.UPDATED_DATE AS UpdatedDate,
                CS.ID AS CourseId,
                CS.TITLE AS CourseName,
                CS.TITLE_ENGLISH AS CourseEnglishName
            FROM 
                STUDENT_SCORE SS
            LEFT JOIN 
                USERS U ON SS.STUDENT_ID = U.ID
            LEFT JOIN 
                SUBJECTS S ON SS.SUBJECT_ID = S.ID
            LEFT JOIN 
                CLASS C ON SS.CLASS_ID = C.ID
            LEFT JOIN 
                ACADEMIC_SETTING A ON SS.ACADEMIC_ID = A.ID
            LEFT JOIN 
                SEMESTER SEM ON SS.SEMESTER_ID = SEM.ID
            LEFT JOIN
                COURSES CS ON SS.COURSE_ID = CS.ID
            WHERE 
                SS.STUDENT_ID = ?  -- Replace 123 with the actual student ID
            ORDER BY 
                SS.EXAM_DATE DESC, S.NAME;

            `
        const [rows] = await db.query(query, [student_id]
        );
        return rows;
    }

    static async findAllBySemester(semester_id) {
        const query = `
           SELECT 
                U.ID AS UserId,
                U.USER_CODE AS UserCode,
                U.NAME AS StudentName,
                S.ID AS SubjectId,
                S.CODE AS SubjectCode,
                S.NAME AS SubjectName,
                C.ID AS ClassId,
                C.CODE AS ClassCode,
                A.ID AS AcademicId,
                A.NAME AS AcademicName,
                SEM.ID AS SemesterId,
                SEM.NAME AS SemesterName,
                SS.SCORE AS SubjectScore,
                SS.RANKING AS Ranking,
                SS.EXAM_DATE AS ExamDate,
                SS.IS_EDITED AS IsEdited,
                SS.CREATED_DATE AS ScoreCreatedDate,
                SS.UPDATED_DATE AS ScoreUpdatedDate
            FROM 
                STUDENT_SCORE SS
            LEFT JOIN 
                USERS U ON SS.STUDENT_ID = U.ID
            LEFT JOIN 
                SUBJECTS S ON SS.SUBJECT_ID = S.ID
            LEFT JOIN 
                CLASS C ON SS.CLASS_ID = C.ID
            LEFT JOIN 
                ACADEMIC_SETTING A ON SS.ACADEMIC_ID = A.ID
            LEFT JOIN 
                SEMESTER SEM ON SS.SEMESTER_ID = SEM.ID
            WHERE 
                SS.SEMESTER_ID = ?
            ORDER BY 
                U.NAME, A.NAME, S.NAME;
    
            `
        const [rows] = await db.query(query, [semester_id]
        );
        return rows;
    }

    static async findAllByAcademic(academic_id) {
        const query = `
            SELECT 
                U.ID AS UserId,
                U.USER_CODE AS UserCode,
                U.NAME AS StudentName,
                S.ID AS SubjectId,
                S.CODE AS SubjectCode,
                S.NAME AS SubjectName,
                C.ID AS ClassId,
                C.CODE AS ClassCode,
                A.ID AS AcademicId,
                A.NAME AS AcademicName,
                SEM.ID AS SemesterId,
                SEM.NAME AS SemesterName,
                SS.SCORE AS SubjectScore,
                SS.RANKING AS Ranking,
                SS.EXAM_DATE AS ExamDate,
                SS.IS_EDITED AS IsEdited,
                SS.CREATED_DATE AS ScoreCreatedDate,
                SS.UPDATED_DATE AS ScoreUpdatedDate
            FROM 
                STUDENT_SCORE SS
            LEFT JOIN 
                USERS U ON SS.STUDENT_ID = U.ID
            LEFT JOIN 
                SUBJECTS S ON SS.SUBJECT_ID = S.ID
            LEFT JOIN 
                CLASS C ON SS.CLASS_ID = C.ID
            LEFT JOIN 
                ACADEMIC_SETTING A ON SS.ACADEMIC_ID = A.ID
            LEFT JOIN 
                SEMESTER SEM ON SS.SEMESTER_ID = SEM.ID
            WHERE 
                SS.ACADEMIC_ID = ?
            ORDER BY 
                U.NAME, S.NAME, SS.EXAM_DATE DESC;
            `
        const [rows] = await db.query(query, [academic_id]
        );
        return rows;
    }



    static async findAll() {
        const query = `
            SELECT 
                U.ID AS UserId,
                U.USER_CODE AS UserCode,
                U.NAME AS StudentName,
                S.ID AS SubjectId,
                S.CODE AS SubjectCode,
                S.NAME AS SubjectName,
                C.ID AS ClassId,
                C.CODE AS ClassCode,
                A.ID AS AcademicId,
                A.NAME AS AcademicName,
                SEM.ID AS SemesterId,
                SEM.NAME AS SemesterName,
                SS.SCORE AS SubjectScore,
                SS.RANKING AS Ranking,
                SS.EXAM_DATE AS ExamDate,
                SS.IS_EDITED AS IsEdited,
                SS.CREATED_DATE AS ScoreCreatedDate,
                SS.UPDATED_DATE AS ScoreUpdatedDate
            FROM 
                STUDENT_SCORE SS
            LEFT JOIN 
                USERS U ON SS.STUDENT_ID = U.ID
            LEFT JOIN 
                SUBJECTS S ON SS.SUBJECT_ID = S.ID
            LEFT JOIN 
                CLASS C ON SS.CLASS_ID = C.ID
            LEFT JOIN 
                ACADEMIC_SETTING A ON SS.ACADEMIC_ID = A.ID
            LEFT JOIN 
                SEMESTER SEM ON SS.SEMESTER_ID = SEM.ID
            ORDER BY 
                U.NAME, SS.EXAM_DATE DESC, S.NAME;
            `
        const [rows] = await db.query(query);
        return rows;
    }



    // Get ranked students by total score

    // Get ranked students by total score
    static async getRankedStudents(classId, subjectId, semesterId, academicId) {
        console.log('Fetching ranked students...');
        console.log('ClassId:', classId);
        console.log('SubjectId:', subjectId);
        console.log('AcademicId:', academicId);
        console.log('SemesterId:', semesterId);
        const query = `
        SELECT
            U.ID AS UserId,
            U.USER_CODE AS UserCode,
                U.NAME AS Name,
                    U.NAME_ENGLISH AS NameEnglish,
                        U.USERNAME AS Username,
                            U.EMAIL AS Email,
                                SS.SCORE AS SubjectScore,
                                    SS.SUBJECT_ID AS SubjectId,
                                        SS.CLASS_ID AS ClassId,
                                            SS.SEMESTER_ID AS SemesterId,
                                                SS.ACADEMIC_ID AS AcademicId
            FROM STUDENT_SCORE SS
            JOIN USERS U ON SS.STUDENT_ID = U.ID
            WHERE SS.CLASS_ID = ?
                        AND SS.SUBJECT_ID = ?
                            AND SS.SEMESTER_ID = ?
                                AND SS.ACADEMIC_ID = ?
                                    ORDER BY SS.SCORE DESC;


        `;

        const [results] = await db.query(query, [classId, subjectId, semesterId, academicId]);

        console.log('Query results:', results);
        // Add ranking position and update ranks in database
        const rankedStudents = results.map((student, index) => ({
            rank: index + 1,
            ...student
        }));

        // Update ranks in database
        await this.updateStudentRanks(rankedStudents, classId, semesterId, academicId);

        return rankedStudents;
    }



    // Get ranked students by subject
    static async getSubjectRanking(subjectId, semesterId, academicId) {
        const query = `
        SELECT
        U.ID AS UserId,
            U.USER_CODE AS UserCode,
                U.NAME AS Name,
                    U.NAME_ENGLISH AS NameEnglish,
                        U.USERNAME AS Username,
                            U.EMAIL AS Email,
                                C.NAME AS ClassName,
                                    SS.SCORE AS Score,
                                        RANK() OVER(ORDER BY SS.SCORE DESC) AS SubjectRank
    FROM STUDENT_SCORE SS
    JOIN USERS U ON SS.STUDENT_ID = U.ID
    JOIN CLASS C ON SS.CLASS_ID = C.ID
    WHERE SS.SUBJECT_ID = ?
            AND SS.SEMESTER = ?
                AND SS.ACADEMIC_ID = ?
                    ORDER BY SS.SCORE DESC
                        `;

        const [results] = await db.query(query, [subjectId, semesterId, academicId]);

        // Update subject ranks in database
        await this.updateSubjectRanks(results, subjectId, semesterId, academicId);

        return results;
    }

    // Update student ranks in database
    static async updateStudentRanks(rankedStudents, classId, semesterId, academicId) {
        const updatePromises = rankedStudents.map(async (student) => {
            await db.query(`
                    UPDATE STUDENT_SCORE 
                    SET RANKING = ?
            WHERE STUDENT_ID = ?
                AND CLASS_ID = ?
                    AND SEMESTER = ?
                        AND ACADEMIC_ID = ?
                            `, [student.rank, student.student_id, classId, semesterId, academicId]);
        });

        await Promise.all(updatePromises);
    }

    // Update subject ranks in database
    static async updateSubjectRanks(rankedStudents, subjectId, semesterId, academicId) {
        const updatePromises = rankedStudents.map(async (student) => {
            await db.query(`
                    UPDATE STUDENT_SCORE 
                    SET RANKING = ?
            WHERE STUDENT_ID = ?
                AND SUBJECT_ID = ?
                    AND SEMESTER = ?
                        AND ACADEMIC_ID = ?
                            `, [student.subject_rank, student.student_id, subjectId, semesterId, academicId]);
        });

        await Promise.all(updatePromises);
    }

    // Get student ranking summary
    static async getStudentRankingSummary(studentId, academicId) {
        const query = `
                SELECT
        ss.SEMESTER,
            sem.NAME AS semester_name,
                ss.CLASS_ID,
                c.NAME AS class_name,
                    ss.SUBJECT_ID,
                    subj.NAME AS subject_name,
                        ss.SCORE,
                        ss.RANKING,
                        COUNT(*) OVER(PARTITION BY ss.SEMESTER, ss.CLASS_ID) AS class_size,
                            ROUND((COUNT(*) OVER(PARTITION BY ss.SEMESTER, ss.CLASS_ID) - ss.RANKING + 1) /
                            COUNT(*) OVER(PARTITION BY ss.SEMESTER, ss.CLASS_ID) * 100, 2) AS percentile
                FROM STUDENT_SCORE ss
                JOIN SEMESTER sem ON ss.SEMESTER = sem.ID
                JOIN CLASS c ON ss.CLASS_ID = c.ID
                JOIN SUBJECTS subj ON ss.SUBJECT_ID = subj.ID
                WHERE ss.STUDENT_ID = ?
            AND ss.ACADEMIC_ID = ?
                ORDER BY ss.SEMESTER, ss.RANKING
                    `;

        const [results] = await db.query(query, [studentId, academicId]);
        return results;
    }

    // Get class ranking trends
    static async getClassRankingTrends(classId, academicId) {
        const query = `
        SELECT
        SS.SEMESTER,
            SEM.NAME AS SemesterName,
                U.ID AS UserId,
                    U.USER_CODE AS UserCode,
                        U.NAME AS Name,
                            U.NAME_ENGLISH AS NameEnglish,
                                U.USERNAME AS Username,
                                    U.EMAIL AS Email,
                                        SUM(SS.SCORE) AS TotalScore,
                                            RANK() OVER(PARTITION BY SS.SEMESTER ORDER BY SUM(SS.SCORE) DESC) AS SemesterRank
    FROM STUDENT_SCORE SS
    JOIN USERS U ON SS.STUDENT_ID = U.ID
    JOIN SEMESTER SEM ON SS.SEMESTER = SEM.ID
    WHERE SS.CLASS_ID = ?
            AND SS.ACADEMIC_ID = ?
                GROUP BY SS.SEMESTER, SEM.NAME, U.ID, U.USER_CODE, U.NAME, U.NAME_ENGLISH, U.USERNAME, U.EMAIL
    ORDER BY SS.SEMESTER, SemesterRank
            `;

        const [results] = await db.query(query, [classId, academicId]);
        return results;
    }
}

export default StudentScore;