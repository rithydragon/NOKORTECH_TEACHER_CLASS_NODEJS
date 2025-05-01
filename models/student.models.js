import db from "../config/db.js";

class Student {
  // ✅ Get all students with pagination, search, and sorting
  static async getAll({ page = 1, limit = 10, search = "", sort = "s.CREATED_DATE", order = "DESC" }) {
    const offset = (page - 1) * limit;

    const sql = `
      SELECT 
        s.ID AS Id,
        s.CODE AS StudentCode,
        s.NAME AS StudentName,
        s.NAME_ENGLISH AS StudentNameEnglish,
        s.EMAIL AS StudentEmail,
        s.GENDER AS StudentGender,
        s.DOB AS StudentDOB,
        s.POD AS StudentPOD,
        s.ADDRESS AS StudentAddress,
        s.PHONE_NUMBER AS StudentPhoneNumber,
        s.STATUS AS StudentStatus,
        s.CREATED_DATE AS StudentCreatedDate,
        s.UPDATED_DATE AS StudentUpdatedDate,
        c.ID AS ClassID,
        c.NAME AS ClassName,
        co.ID AS CourseID,
        co.TITLE AS CourseName,
        d.ID AS DepartmentID,
        d.NAME AS DepartmentName,
        uc.ID AS CreatedByUserID,
        uc.USERNAME AS CreatedByUsername,
        uu.ID AS UpdatedByUserID,
        uu.USERNAME AS UpdatedByUsername
      FROM 
        STUDENTS s
      LEFT JOIN 
        CLASS c ON s.CLASS_ID = c.ID
      LEFT JOIN 
        COURSES co ON s.COURSE_ID = co.ID
      LEFT JOIN 
        DEPARTMENTS d ON s.DEPARTMENT_ID = d.ID
      LEFT JOIN 
        USERS uc ON s.CREATED_BY = uc.ID
      LEFT JOIN 
        USERS uu ON s.UPDATED_BY = uu.ID
      WHERE 
        s.NAME LIKE ? OR s.EMAIL LIKE ?
      ORDER BY 
        ${sort} ${order}
      LIMIT ? OFFSET ?
    `;

    const values = [`%${search}%`, `%${search}%`, Number(limit), Number(offset)];

    const [rows] = await db.query(sql, values);
    return rows;
  }

  static async getAllStudents() {
    const queryData22 = `
      SELECT 
          s.ID AS Id,
          s.CODE AS StudentCode,
          s.NAME AS StudentName,
          s.NAME_ENGLISH AS StudentNameEnglish,
          s.EMAIL AS StudentEmail,
          s.GENDER AS StudentGender,
          s.DOB AS StudentDOB,
          s.POD AS StudentPOD,
          s.ADDRESS AS StudentAddress,
          s.PHONE_NUMBER AS StudentPhoneNumber,
          s.STATUS AS StudentStatus,
          s.CREATED_DATE AS StudentCreatedDate,
          s.UPDATED_DATE AS StudentUpdatedDate,
          
          c.ID AS ClassId,
          c.NAME AS ClassName,
    
          co.ID AS CourseId,
          co.TITLE AS CourseName,
    
          d.ID AS DepartmentId,
          d.NAME AS DepartmentName,
    
          acad.ID AS AcademicId,
          acad.NAME AS AcademicName,
    
          sm.ID AS SemesterId,
          
          uc.ID AS CreatedByUserId,
          uc.USERNAME AS CreatedByUsername,
    
          uu.ID AS UpdatedByUserId,
          uu.USERNAME AS UpdatedByUsername
    
      FROM STUDENTS s
      LEFT JOIN CLASS c ON s.CLASS_ID = c.ID
      LEFT JOIN COURSES co ON s.COURSE_ID = co.ID
      LEFT JOIN DEPARTMENTS d ON s.DEPARTMENT_ID = d.ID
      LEFT JOIN ACADEMIC_SETTING acad ON s.ACADEMIC_ID = acad.ID
      LEFT JOIN SEMESTER sm ON s.SEMESTER_ID = sm.ID
      LEFT JOIN USERS uc ON s.CREATED_BY = uc.ID
      LEFT JOIN USERS uu ON s.UPDATED_BY = uu.ID
    `;
    const queryData = `
  SELECT 
    s.ID AS Id,
    s.CODE AS StudentCode,
    s.NAME AS StudentName,
    s.NAME_ENGLISH AS StudentNameEnglish,
    s.EMAIL AS StudentEmail,
    s.GENDER AS Gender,
    s.DOB AS DOB,
    s.POD AS POD,
    s.ADDRESS AS StudentAddress,
    s.PHONE_NUMBER AS StudentPhoneNumber,
    s.STATUS AS StudentStatus,
    s.CREATED_DATE AS StudentCreatedDate,
    s.UPDATED_DATE AS StudentUpdatedDate,
    
    GROUP_CONCAT(DISTINCT at.NAME) as AttendanceType,
    GROUP_CONCAT(DISTINCT sa.ATTENDANCE_DATE) as AttendanceDate,

    -- Class/Course info
    c.ID AS ClassId,
    c.NAME AS ClassName,
    co.ID AS CourseId,
    co.TITLE AS CourseName,
    
    -- Department/Academic info
    d.ID AS DepartmentId,
    d.NAME AS DepartmentName,
    acad.ID AS AcademicId,
    acad.NAME AS AcademicName,
    
    -- Semester info
    sm.ID AS SemesterId,
    sm.NAME AS SemesterName,
    
    -- User info
    uc.ID AS CreatedByUserId,
    uc.USERNAME AS CreatedByUsername,
    uu.ID AS UpdatedByUserId,
    uu.USERNAME AS UpdatedByUsername,
    
    -- Score aggregates
    COALESCE(SUM(CASE 
        WHEN ss.COURSE_ID IN (1, 3, 5) THEN ss.SCORE 
        ELSE 0 
    END), 0) AS MidtermTotal,
    
    COALESCE(SUM(CASE 
        WHEN ss.COURSE_ID IN (2, 4, 6) THEN ss.SCORE 
        ELSE 0 
    END), 0) AS FinalTotal,
    
    COALESCE(SUM(ss.SCORE), 0) AS OverallTotal,
    COUNT(ss.ID) AS ScoreCount
    
FROM STUDENTS s
-- Original joins
LEFT JOIN CLASS c ON s.CLASS_ID = c.ID
LEFT JOIN COURSES co ON s.COURSE_ID = co.ID
LEFT JOIN DEPARTMENTS d ON s.DEPARTMENT_ID = d.ID
LEFT JOIN ACADEMIC_SETTING acad ON s.ACADEMIC_ID = acad.ID
LEFT JOIN SEMESTER sm ON s.SEMESTER_ID = sm.ID
LEFT JOIN USERS uc ON s.CREATED_BY = uc.ID
LEFT JOIN USERS uu ON s.UPDATED_BY = uu.ID
LEFT JOIN STUDENT_ATTENDANCE sa ON s.ID = sa.STUDENT_ID
LEFT JOIN ATTENDANCE_TYPES at ON sa.ATTENDANCE_TYPE_ID = at.ID

-- Add score join
LEFT JOIN STUDENT_SCORE ss ON s.ID = ss.STUDENT_ID

GROUP BY 
    s.ID, s.CODE, s.NAME, s.NAME_ENGLISH, s.EMAIL, s.GENDER, s.DOB, s.POD,
    s.ADDRESS, s.PHONE_NUMBER, s.STATUS, s.CREATED_DATE, s.UPDATED_DATE,
    c.ID, c.NAME, co.ID, co.TITLE, d.ID, d.NAME, acad.ID, acad.NAME,
    sm.ID, sm.NAME, uc.ID, uc.USERNAME, uu.ID, uu.USERNAME

ORDER BY s.NAME;
  `;
    const [rows] = await db.query(queryData);
    return rows;
  }

  // ✅ Get student by ID
  static async getById(id) {
    const query = `
        SELECT 
        s.ID AS StudentID,
        s.CODE AS StudentCode,
        s.NAME AS StudentName,
        s.NAME_ENGLISH AS StudentNameEnglish,
        s.EMAIL AS StudentEmail,
        s.GENDER AS StudentGender,
        s.DOB AS StudentDOB,
        s.POD AS StudentPOD,
        s.ADDRESS AS StudentAddress,
        s.PHONE_NUMBER AS StudentPhoneNumber,
        s.STATUS AS StudentStatus,
        s.CREATED_DATE AS StudentCreatedDate,
        s.UPDATED_DATE AS StudentUpdatedDate,
        c.ID AS ClassID,
        c.ID AS ClassName,
        co.ID AS CourseID,
        co.TITLE AS CourseTitle,
        d.ID AS DepartmentID,
        d.NAME AS DepartmentName,
        uc.ID AS CreatedByUserID,
        uc.USERNAME AS CreatedByUsername,
        uu.ID AS UpdatedByUserID,
        uu.USERNAME AS UpdatedByUsername
      FROM 
        STUDENTS s
      LEFT JOIN 
        CLASS c ON s.CLASS_ID = c.ID
      LEFT JOIN 
        COURSES co ON s.COURSE_ID = co.ID
      LEFT JOIN 
        DEPARTMENTS d ON s.DEPARTMENT_ID = d.ID
      LEFT JOIN 
        USERS uc ON s.CREATED_BY = uc.ID
      LEFT JOIN 
        USERS uu ON s.UPDATED_BY = uu.ID
      WHERE 
        s.ID = ?;
    `
    console.log("Student ID: ", id);
    const [rows] = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    return rows[0] || null;
  }

  // ✅ Create a new student
  static async create(student) {
    const sql = `INSERT INTO Students (Code, StudentCode, FName, LName, Email, Gender, dob, CreatedBy) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      student.Code, student.StudentCode, student.FName, student.LName,
      student.Email, student.Gender, student.dob, student.CreatedBy
    ];
    const [result] = await db.query(sql, values);
    return result.insertId;
  }

  // ✅ Update student
  static async update(id, student) {
    const sql = `UPDATE Students 
                 SET Code=?, StudentCode=?, FName=?, LName=?, Email=?, Gender=?, dob=?, UpdatedBy=? 
                 WHERE Id=?`;
    const values = [
      student.Code, student.StudentCode, student.FName, student.LName,
      student.Email, student.Gender, student.dob, student.UpdatedBy, id
    ];
    await db.query(sql, values);
  }

  // ✅ Delete student
  static async delete(id) {
    await db.query("DELETE FROM Students WHERE Id = ?", [id]);
  }

  // ✅ Bulk delete students
  static async bulkDelete(ids) {
    const placeholders = ids.map(() => "?").join(",");
    const sql = `DELETE FROM Students WHERE Id IN (${placeholders})`;
    await db.query(sql, ids);
  }

  // ✅ Count total students
  static async count() {
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM Students");
    return rows[0].total;
  }

  static async create(student) {
    const [result] = await db.query('INSERT INTO STUDENTS SET ?', [student]);
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM STUDENTS WHERE ID = ?', [id]);
    return rows[0];
  }

  static async update(id, updates) {
    await db.query('UPDATE STUDENTS SET ? WHERE ID = ?', [updates, id]);
  }

  static async delete(id) {
    await db.query('DELETE FROM STUDENTS WHERE ID = ?', [id]);
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM STUDENTS');
    return rows;
  }

  static async getAll11() {
    const sql = `
        SELECT 
          s.ID AS Id,
          s.CODE AS StudentCode,
          s.NAME AS StudentName,
          s.NAME_ENGLISH AS StudentNameEnglish,
          s.EMAIL AS StudentEmail,
          s.GENDER AS StudentGender,
          s.DOB AS StudentDOB,
          s.POD AS StudentPOD,
          s.ADDRESS AS StudentAddress,
          s.PHONE_NUMBER AS StudentPhoneNumber,
          s.STATUS AS StudentStatus,
          s.CREATED_DATE AS StudentCreatedDate,
          s.UPDATED_DATE AS StudentUpdatedDate,
          c.ID AS ClassID,
          c.NAME AS ClassName,
          co.ID AS CourseID,
          co.TITLE AS CourseName,
          d.ID AS DepartmentID,
          d.NAME AS DepartmentName,
          uc.ID AS CreatedByUserID,
          uc.USERNAME AS CreatedByUsername,
          uu.ID AS UpdatedByUserID,
          uu.USERNAME AS UpdatedByUsername
        FROM 
          STUDENTS s
        LEFT JOIN 
          CLASS c ON s.CLASS_ID = c.ID
        LEFT JOIN 
          COURSES co ON s.COURSE_ID = co.ID
        LEFT JOIN 
          DEPARTMENTS d ON s.DEPARTMENT_ID = d.ID
        LEFT JOIN 
          USERS uc ON s.CREATED_BY = uc.ID
        LEFT JOIN 
          USERS uu ON s.UPDATED_BY = uu.ID
      `;

    const [rows] = await db.query(sql);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM STUDENTS WHERE ID = ?', [id]);
    return rows[0];
  }

  static async create(studentData) {
    const [result] = await db.query('INSERT INTO STUDENTS SET ?', studentData);
    return result.insertId;
  }

  static async update(id, studentData) {
    await db.query('UPDATE STUDENTS SET ? WHERE ID = ?', [studentData, id]);
  }

  static async delete(id) {
    await db.query('DELETE FROM STUDENTS WHERE ID = ?', [id]);
  }
}



export default Student;
