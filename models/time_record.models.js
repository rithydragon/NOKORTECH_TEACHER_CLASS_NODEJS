import pool from '../config/db.js';

class ProfessorTeachingModel {
  // Get professor information
  static async getProfessorById(id) {
    const [rows] = await pool.query('SELECT * FROM USERS WHERE ID = ?', [id]);
    // const [rows] = await pool.query('SELECT * FROM PROFESSORS WHERE ID = ?', [id]);
    return rows[0];
  }

  // Get teaching records for a professor in date range
  static async getTeachingRecords(professorId, startDate, endDate) {
    console.log("Record teacher time record:", professorId, startDate, endDate);
    
    // Base query
    let query = `
        SELECT 
            u.NAME AS ProfessorName,
            u.NAME_ENGLISH AS ProfessorEnglishName,
            u.CODE AS ProfessorCode,
            c.NAME AS ClassName,
            c.BATCH,
            c.SEMESTER,
            s.NAME AS SubjectName,
            pth.TEACHING_DATE,
            pth.HOURS,
            pth.LESSON_CONTENT,
            pth.ATTENDANCE,
            pth.NOTES
        FROM 
            PROFESSOR_TEACHING_HOURS pth
        LEFT JOIN
            USERS u ON pth.USER_ID = u.ID
        LEFT JOIN
            PROFESSORS p ON pth.PROFESSOR_ID = p.ID
        LEFT JOIN
            CLASS c ON pth.CLASS_ID = c.ID
        LEFT JOIN 
            SUBJECTS s ON pth.SUBJECT_ID = s.ID
        WHERE
            pth.USER_ID = ?`;
    
    // Parameters array
    const params = [professorId];
    
    // Add date condition only if both start and end dates are provided
    if (startDate && endDate) {
        query += ` AND pth.TEACHING_DATE BETWEEN ? AND ?`;
        params.push(startDate, endDate);
    }
    
    // Add ordering
    query += ` ORDER BY pth.TEACHING_DATE`;
    
    // Execute query
    const [rows] = await pool.query(query, params);
    return rows;
}

  // Create teaching record
  static async createTeachingRecord(recordData) {
    const [result] = await pool.query('INSERT INTO PROFESSOR_TEACHING_HOURS SET ?', [recordData]);
    return result.insertId;
  }

  // Update teaching record
  static async updateTeachingRecord(id, recordData) {
    const [result] = await pool.query('UPDATE PROFESSOR_TEACHING_HOURS SET ? WHERE ID = ?', [recordData, id]);
    return result.affectedRows;
  }

  // Delete teaching record
  static async deleteTeachingRecord(id) {
    const [result] = await pool.query('DELETE FROM PROFESSOR_TEACHING_HOURS WHERE ID = ?', [id]);
    return result.affectedRows;
  }

  // Get total hours for professor in date range
  static async getTotalHours(professorId, startDate, endDate) {
    // Validate professorId
    if (!professorId) {
        throw new Error('Professor ID is required');
    }

    // Base query
    let query = `
        SELECT 
            SUM(COALESCE(HOURS, 0)) AS TotalHours,
            COUNT(*) AS TotalRecords
        FROM 
            PROFESSOR_TEACHING_HOURS
        WHERE 
            USER_ID = ?`;
    
    const params = [professorId];

    // Add date condition only if both dates are provided
    if (startDate && endDate) {
        // Format dates properly
        const formattedStart = new Date(startDate).toISOString().split('T')[0];
        const formattedEnd = new Date(endDate).toISOString().split('T')[0];
        
        query += ` AND TEACHING_DATE BETWEEN ? AND ?`;
        params.push(formattedStart, formattedEnd);
    } else if (startDate || endDate) {
        // Only one date provided - throw error or handle differently
        throw new Error('Both start and end dates must be provided, or neither');
    }

    // Execute query
    const [rows] = await pool.query(query, params);
    return rows[0] || { TotalHours: 0, TotalRecords: 0 }; // Ensure we always return an object
}}

export default ProfessorTeachingModel;