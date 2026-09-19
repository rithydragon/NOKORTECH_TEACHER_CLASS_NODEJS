import db from "../config/db.js";

class Enrollment {
  // Get a paginated list of enrollments joined with student/class/course/users
  static async getAll({ page = 1, limit = 10, search = "", status = "" }) {
    const offset = (page - 1) * limit;
    let where = "";
    const values = [];

    if (status) {
      where += " WHERE e.STATUS = ?";
      values.push(status);
    }

    if (search) {
      where += (where ? " AND" : " WHERE") +
        " (e.CODE LIKE ? OR s.NAME LIKE ? OR s.CODE LIKE ?)";
      values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const sql = `
      SELECT
        e.ID AS Id,
        e.CODE AS EnrollmentCode,
        e.STUDENT_ID AS StudentId,
        s.CODE AS StudentCode,
        s.NAME AS StudentName,
        e.CLASS_ID AS ClassId,
        c.CODE AS ClassCode,
        e.COURSE_ID AS CourseId,
        co.CODE AS CourseCode,
        co.TITLE AS CourseTitle,
        e.ENROLLED_DATE AS EnrolledDate,
        e.STATUS AS Status,
        e.NOTE AS Note,
        e.CREATED_DATE AS CreatedDate,
        e.UPDATED_DATE AS UpdatedDate,
        u.NAME AS CreatedBy,
        uu.NAME AS UpdatedBy
      FROM ENROLLMENTS e
      LEFT JOIN STUDENTS s ON e.STUDENT_ID = s.ID
      LEFT JOIN CLASS c ON e.CLASS_ID = c.ID
      LEFT JOIN COURSES co ON e.COURSE_ID = co.ID
      LEFT JOIN USERS u ON e.CREATED_BY = u.ID
      LEFT JOIN USERS uu ON e.UPDATED_BY = uu.ID
      ${where}
      ORDER BY e.CREATED_DATE DESC, e.ID DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(sql, [...values, Number(limit), Number(offset)]);

    const countSQL = `
      SELECT COUNT(*) AS total
      FROM ENROLLMENTS e
      LEFT JOIN STUDENTS s ON e.STUDENT_ID = s.ID
      ${where}
    `;
    const [[{ total }]] = await db.query(countSQL, values);

    return { rows, total };
  }

  // Get a single enrollment by ID
  static async getById(id) {
    const sql = `
      SELECT
        e.ID AS Id,
        e.CODE AS EnrollmentCode,
        e.STUDENT_ID AS StudentId,
        s.CODE AS StudentCode,
        s.NAME AS StudentName,
        e.CLASS_ID AS ClassId,
        c.CODE AS ClassCode,
        e.COURSE_ID AS CourseId,
        co.CODE AS CourseCode,
        co.TITLE AS CourseTitle,
        e.ENROLLED_DATE AS EnrolledDate,
        e.STATUS AS Status,
        e.NOTE AS Note,
        e.CREATED_DATE AS CreatedDate,
        e.UPDATED_DATE AS UpdatedDate,
        u.NAME AS CreatedBy,
        uu.NAME AS UpdatedBy
      FROM ENROLLMENTS e
      LEFT JOIN STUDENTS s ON e.STUDENT_ID = s.ID
      LEFT JOIN CLASS c ON e.CLASS_ID = c.ID
      LEFT JOIN COURSES co ON e.COURSE_ID = co.ID
      LEFT JOIN USERS u ON e.CREATED_BY = u.ID
      LEFT JOIN USERS uu ON e.UPDATED_BY = uu.ID
      WHERE e.ID = ?
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  }

  // Check for duplicate enrollment (same student + class + course)
  static async findDuplicate({ StudentId, ClassId, CourseId, excludeId }) {
    let sql = `
      SELECT ID FROM ENROLLMENTS
      WHERE STUDENT_ID = ? AND CLASS_ID = ? AND COURSE_ID = ?
    `;
    const values = [StudentId, ClassId, CourseId];
    if (excludeId) {
      sql += " AND ID <> ?";
      values.push(excludeId);
    }
    sql += " LIMIT 1";
    const [rows] = await db.query(sql, values);
    return rows[0] || null;
  }

  // Create an enrollment and synchronize STUDENTS.CLASS_ID / COURSE_ID
  static async create(enrollment) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.query(
        `INSERT INTO ENROLLMENTS
          (CODE, STUDENT_ID, CLASS_ID, COURSE_ID, ENROLLED_DATE, STATUS, NOTE, CREATED_BY)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          enrollment.Code,
          enrollment.StudentId,
          enrollment.ClassId,
          enrollment.CourseId,
          enrollment.EnrolledDate,
          enrollment.Status,
          enrollment.Note || null,
          enrollment.CreatedBy,
        ]
      );

      await conn.query(
        "UPDATE STUDENTS SET CLASS_ID = ?, COURSE_ID = ? WHERE ID = ?",
        [enrollment.ClassId, enrollment.CourseId, enrollment.StudentId]
      );

      await conn.commit();
      return result.insertId;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  // Update an enrollment and re-synchronize STUDENTS.CLASS_ID / COURSE_ID
  static async update(id, enrollment) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query(
        `UPDATE ENROLLMENTS
         SET CLASS_ID = ?, COURSE_ID = ?, ENROLLED_DATE = ?, STATUS = ?, NOTE = ?, UPDATED_BY = ?
         WHERE ID = ?`,
        [
          enrollment.ClassId,
          enrollment.CourseId,
          enrollment.EnrolledDate,
          enrollment.Status,
          enrollment.Note || null,
          enrollment.UpdatedBy,
          id,
        ]
      );

      await conn.query(
        "UPDATE STUDENTS SET CLASS_ID = ?, COURSE_ID = ? WHERE ID = ?",
        [enrollment.ClassId, enrollment.CourseId, enrollment.StudentId]
      );

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  // Delete an enrollment and restore the student's class/course from their latest remaining enrollment
  static async delete(id) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [rows] = await conn.query(
        "SELECT STUDENT_ID FROM ENROLLMENTS WHERE ID = ?",
        [id]
      );
      const current = rows[0];

      await conn.query("DELETE FROM ENROLLMENTS WHERE ID = ?", [id]);

      if (current) {
        const [latest] = await conn.query(
          `SELECT CLASS_ID, COURSE_ID FROM ENROLLMENTS
           WHERE STUDENT_ID = ? ORDER BY CREATED_DATE DESC, ID DESC LIMIT 1`,
          [current.STUDENT_ID]
        );
        if (latest[0]) {
          await conn.query(
            "UPDATE STUDENTS SET CLASS_ID = ?, COURSE_ID = ? WHERE ID = ?",
            [latest[0].CLASS_ID, latest[0].COURSE_ID, current.STUDENT_ID]
          );
        } else {
          await conn.query(
            "UPDATE STUDENTS SET CLASS_ID = NULL, COURSE_ID = NULL WHERE ID = ?",
            [current.STUDENT_ID]
          );
        }
      }

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  // Options (dropdown sources)
  static async getStudentOptions() {
    const [rows] = await db.query(
      `SELECT ID AS Id, CODE AS StudentCode, NAME AS StudentName
       FROM STUDENTS
       WHERE STATUS = TRUE
       ORDER BY NAME`
    );
    return rows;
  }

  static async getClassOptions() {
    const [rows] = await db.query(
      `SELECT
        c.ID AS Id,
        c.CODE AS Code,
        c.ROOM AS Room,
        c.COURSE_ID AS CourseId,
        co.TITLE AS CourseTitle
       FROM CLASS c
       LEFT JOIN COURSES co ON c.COURSE_ID = co.ID
       WHERE c.STATUS = 'Enable'
       ORDER BY c.CODE`
    );
    return rows;
  }

  static async getCourseOptions() {
    const [rows] = await db.query(
      `SELECT ID AS Id, CODE AS Code, TITLE AS Title
       FROM COURSES
       WHERE STATUS = 'active'
       ORDER BY TITLE`
    );
    return rows;
  }
}

export default Enrollment;