import db from '../config/db.js';

class Subject {
    // Find all subjects
    static async findAll() {
        let query = `
            SELECT 
            S.ID AS SubjectId,
            S.CODE AS SubjectCode,
            S.NAME AS SubjectName,
            S.NAME_ENGLISH AS SubjectNameEnglish,
            S.DESCRIPTION AS SubjectDescription,
            S.CREATED_BY AS CreatedBy,
            S.CREATED_DATE AS CreatedDate,
            S.UPDATED_BY AS UpdatedBy,
            S.UPDATED_DATE AS UpdatedDate,
            (SELECT U.USER_CODE FROM USERS U WHERE U.ID = S.CREATED_BY) AS UserCode,
            (SELECT U.NAME FROM USERS U WHERE U.ID = S.CREATED_BY) AS UserName,
            (SELECT U.NAME_ENGLISH FROM USERS U WHERE U.ID = S.CREATED_BY) AS UserNameEnglish
        FROM 
            SUBJECTS S;
        `
        const [rows] = await db.query(query);
        return rows;
    }

    // Find a subject by ID
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM SUBJECTS WHERE ID = ?', [id]);
        return rows[0];
    }

    // Create a new subject
    static async create(subjectData) {
        const { code, name, nameEnglish, description, createdBy } = subjectData;
        const [result] = await db.query(
            'INSERT INTO SUBJECTS (CODE, NAME, NAME_ENGLISH, DESCRIPTION, CREATED_BY) VALUES (?, ?, ?, ?, ?)',
            [code, name, nameEnglish, description, createdBy]
        );
        return result.insertId;
    }

    // Update an existing subject
    static async update(id, subjectData) {
        const { code, name, nameEnglish, description, updatedBy } = subjectData;
        const [result] = await db.query(
            'UPDATE SUBJECTS SET CODE = ?, NAME = ?, NAME_ENGLISH = ?, DESCRIPTION = ?, UPDATED_BY = ?, UPDATED_DATE = CURRENT_TIMESTAMP WHERE ID = ?',
            [code, name, nameEnglish, description, updatedBy, id]
        );
        return result.affectedRows > 0;
    }

    // Delete a subject by ID
    static async delete(id) {
        const [result] = await db.query('DELETE FROM SUBJECTS WHERE ID = ?', [id]);
        return result.affectedRows > 0;
    }

    // Search subjects by name or code
    static async search(query) {
        const [rows] = await db.query(
            'SELECT * FROM SUBJECTS WHERE NAME LIKE ? OR CODE LIKE ?',
            [`%${query}%`, `%${query}%`]
        );
        return rows;
    }
}

export default Subject;