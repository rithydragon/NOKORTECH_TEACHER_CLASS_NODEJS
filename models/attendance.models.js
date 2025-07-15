import pool from '../config/db.js';

class Attendance {
  static async create(attendanceData) {
    const [result] = await pool.query(
      'INSERT INTO STUDENT_ATTENDANCE SET ?',
      attendanceData
    );
    return result.insertId;
  }

  static async update(id, attendanceData) {
    console.log("Updating attendance with ID:", id, "and data:", attendanceData);
    const [result] = await pool.query(
      'UPDATE STUDENT_ATTENDANCE SET ? WHERE ID = ?',
      [attendanceData, id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM STUDENT_ATTENDANCE WHERE ID = ?',
      [id]
    );
    return result.affectedRows;
  }

  static async findByStudent(studentId) {
    const [rows] = await pool.query(`
      SELECT sa.*, at.NAME as attendance_type, at.CODE as attendance_code
      FROM STUDENT_ATTENDANCE sa
      JOIN ATTENDANCE_TYPES at ON sa.ATTENDANCE_TYPE_ID = at.ID
      WHERE sa.STUDENT_ID = ?
      ORDER BY sa.ATTENDANCE_DATE DESC
    `, [studentId]);
    return rows;
  }

  static async findByDate(date) {
    const [rows] = await pool.query(`
SELECT 
    sa.ATTENDANCE_DATE AS AttendanceDate,
    st.ID AS StudentID,
    st.CODE AS StudentCode,
    st.NAME AS StudentName,
    cl.NAME AS ClassName,
    at.NAME AS AttendanceType,
    sa.NOTES AS AttendanceNotes
FROM 
    STUDENT_ATTENDANCE sa
JOIN 
    STUDENTS st ON sa.STUDENT_ID = st.ID
JOIN 
    ATTENDANCE_TYPES at ON sa.ATTENDANCE_TYPE_ID = at.ID
JOIN 
    CLASS cl ON st.CLASS_ID = cl.ID
WHERE 
    sa.ATTENDANCE_DATE BETWEEN ? AND ?
ORDER BY 
    sa.ATTENDANCE_DATE, st.NAME;
    `, [date]);
    return rows;
  }

  static async findAttendanceType() {
    const [rows] = await pool.query(`
      SELECT 
      AT.ID AS Id,
      AT.CODE AS Code
        AT.NAME AS Name,
        AT.DESCRIPTION AS Description,
        AT.IS_PRESENT AS IsPresent,
        AT.COLOR_CODE AS ColorCode
    `);
    return rows;
  }


}




export default Attendance;