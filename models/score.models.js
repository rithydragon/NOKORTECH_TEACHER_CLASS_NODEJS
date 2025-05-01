import pool from '../config/db.js';

class Score {
    // Find scores by student ID
    static async getAll() {
        // const query = `SELECT   
        //     st.ID AS StudentID,
        //     st.NAME AS StudentName,
        //     st.NAME_ENGLISH AS StudentNameEnglish,
        //     st.EMAIL AS StudentEmail,
        //     GROUP_CONCAT(
        //         CONCAT(
        //             sub.NAME, ': ', sc.SCORE, ' (', sc.DESCRIPTION, ')'
        //         ) 
        //         SEPARATOR '; '
        //     ) AS ScoresAndSubjects,  -- Concatenate scores and subject names
        //     GROUP_CONCAT(
        //         CONCAT(
        //             'Created By: ', u.Username, ' on ', DATE_FORMAT(sc.CREATED_DATE, '%Y-%m-%d')
        //         ) 
        //         SEPARATOR '; '
        //     ) AS ScoreCreationDetails  -- Concatenate user creation info
        // FROM STUDENTS st
        // LEFT JOIN SCORES sc ON sc.STUDENT_ID = st.ID
        // LEFT JOIN SUBJECTS sub ON sc.SUBJECT_ID = sub.ID
        // LEFT JOIN USERS u ON sc.CREATED_BY = u.ID
        // GROUP BY st.ID
        // ORDER BY st.ID;
        //     `
        const query = `
        SELECT 
            st.ID AS StudentID,
            st.NAME AS StudentName,
            st.NAME_ENGLISH AS StudentNameEnglish,
            st.EMAIL AS StudentEmail,
            sub.ID AS SubjectID,
            sub.NAME AS SubjectName,
            sub.NAME_ENGLISH AS SubjectNameEnglish,
            sc.SCORE,
            sc.DESCRIPTION,
            sc.NOTE,
            sc.CREATED_DATE,
            u.Username AS CreatedBy
        FROM STUDENTS st
        LEFT JOIN SCORES sc ON sc.STUDENT_ID = st.ID
        LEFT JOIN SUBJECTS sub ON sc.SUBJECT_ID = sub.ID
        LEFT JOIN USERS u ON sc.CREATED_BY = u.ID
        ORDER BY st.ID, sub.ID, sc.CREATED_DATE;
        `;
        const [rows] = await pool.query(query);
        return rows;
    }

    static async findByStudentId(studentId) {
        try {
            console.log('Fetching scores for student ID:', studentId);
            const query = `
            SELECT 
              sc.ID AS ScoreId,
              sc.SCORE AS Score,
              sc.DESCRIPTION AS ScoreDescription,
              sc.NOTE AS Note,
              sc.CREATED_DATE AS ScoreCreatedDate,
              
              st.ID AS StudentId,
              st.CODE AS StudentCode,
              st.NAME AS StudentName,
              st.NAME_ENGLISH AS StudentNameEnglish,
              st.EMAIL AS StudentEmail,
              st.GENDER AS StudentGender,
              st.DOB AS StudentDob,
              st.PHONE_NUMBER AS StudentPhoneNumber,
    
              sb.ID AS SubjectId,
              sb.CODE AS SubjectCode,
              sb.NAME AS SubjectName,
              sb.NAME_ENGLISH AS SubjectNameEnglish
    
            FROM SCORES sc
            LEFT JOIN STUDENTS st ON sc.STUDENT_ID = st.ID
            LEFT JOIN SUBJECTS sb ON sc.SUBJECT_ID = sb.ID
            WHERE sc.STUDENT_ID = ?;
          `;

            // Execute the SQL query
            const [rows] = await pool.query(query, [studentId]);

            // Return the rows
            return rows;
        } catch (error) {
            throw new Error('Failed to fetch scores by student ID');
        }
    }

    // Create a new score record
    static async create(scoreData) {
        const { studentId, subjectId, score, description, note, createdBy } = scoreData;
        const [result] = await pool.query(
            'INSERT INTO SCORES (STUDENT_ID, SUBJECT_ID, SCORE, DESCRIPTION, NOTE, CREATED_BY) VALUES (?, ?, ?, ?, ?, ?)',
            [studentId, subjectId, score, description, note, createdBy]
        );
        return result.insertId;
    }

    // Update an existing score record
    static async update(scoreId, scoreData) {
        const { score, description, note, updatedBy } = scoreData;
        const [result] = await pool.query(
            'UPDATE SCORES SET SCORE = ?, DESCRIPTION = ?, NOTE = ?, UPDATED_BY = ?, UPDATED_DATE = CURRENT_TIMESTAMP WHERE ID = ?',
            [score, description, note, updatedBy, scoreId]
        );
        return result.affectedRows > 0;
    }


    // Delete a score by ID
    static async delete(scoreId) {
        try {
            const [result] = await pool.query('DELETE FROM SCORES WHERE ID = ?', [scoreId]);

            if (result.affectedRows === 0) {
                throw new Error('Score not found');
            }

            return true; // Indicate success
        } catch (error) {
            console.error('Error deleting score:', error);
            throw new Error('Failed to delete score');
        }
    }

    // Search scores
    static async search(query) {
        try {
            const { studentId, subjectId, minScore, maxScore } = query;

            let sql = 'SELECT * FROM SCORES WHERE 1=1';
            const params = [];

            if (studentId) {
                sql += ' AND STUDENT_ID = ?';
                params.push(studentId);
            }

            if (subjectId) {
                sql += ' AND SUBJECT_ID = ?';
                params.push(subjectId);
            }

            if (minScore) {
                sql += ' AND SCORE >= ?';
                params.push(minScore);
            }

            if (maxScore) {
                sql += ' AND SCORE <= ?';
                params.push(maxScore);
            }

            const [rows] = await pool.query(sql, params);
            return rows;
        } catch (error) {
            console.error('Error searching scores:', error);
            throw new Error('Failed to search scores');
        }
    }



    static async getByStudentId(studentId) {
        const [rows] = await pool.query(`
                SELECT sc.*, sub.CODE as subject_code, sub.NAME as subject_name
                FROM SCORES sc
                JOIN SUBJECTS sub ON sc.SUBJECT_ID = sub.ID
                WHERE sc.STUDENT_ID = ?
            `, [studentId]);
        return rows;
    }

    static async create(scoreData) {
        const [result] = await pool.query('INSERT INTO SCORES SET ?', scoreData);
        return result.insertId;
    }

    static async importScores(scores) {
        await pool.query('INSERT INTO SCORES (STUDENT_ID, SUBJECT_ID, SCORE, DESCRIPTION, NOTE, CREATED_BY) VALUES ?',
            [scores.map(s => [s.student_id, s.subject_id, s.score, s.description, s.note, s.created_by])]);
    }
}


export default Score;