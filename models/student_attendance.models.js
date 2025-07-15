import db from '../config/db.js';

class StudentAttendanceModel {
  // static async create(attendanceData) {
  //   const [result] = await db.query(
  //     'INSERT INTO STUDENT_ATTENDANCE SET ?',
  //     attendanceData
  //   );
  //   return result.insertId;
  // }

  // static async update(id, attendanceData) {
  //   const [result] = await db.query(
  //     'UPDATE STUDENT_ATTENDANCE SET ? WHERE ID = ?',
  //     [attendanceData, id]
  //   );
  //   return result.affectedRows;
  // }
  // controllers/studentAttendance.controller.js

  static async createStudentAttendance(attendanceData) {
    try {
      const [result] = await db.query(
        `INSERT INTO STUDENT_ATTENDANCE 
        (STUDENT_ID, SCHEDULE_ID, ATTENDANCE_DATE, ATTENDANCE_TYPE_ID, NOTES, RECORDED_BY) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          attendanceData.student_id,
          attendanceData.schedule_id || null,
          attendanceData.attendance_date,
          attendanceData.attendance_type_id,
          attendanceData.notes,
          attendanceData.recorded_by || null
        ]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async updateAttendance(id, attendanceData) {
    try {
      const [result] = await db.query(
        `UPDATE STUDENT_ATTENDANCE SET 
        STUDENT_ID = ?,
        SCHEDULE_ID = ?,
        ATTENDANCE_DATE = ?,
        ATTENDANCE_TYPE_ID = ?,
        NOTES = ?,
        UPDATED_BY = ?,
        UPDATED_DATE = CURRENT_TIMESTAMP
        WHERE ID = ?`,
        [
          attendanceData.student_id,
          attendanceData.schedule_id || null,
          attendanceData.attendance_date,
          attendanceData.attendance_type_id,
          attendanceData.notes,
          attendanceData.updated_by || null,
          id
        ]
      );
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  static async checkExistingAttendance(studentId, scheduleId, date) {
    try {
      const [rows] = await db.query(
        `SELECT ID FROM STUDENT_ATTENDANCE 
        WHERE STUDENT_ID = ? 
        AND (SCHEDULE_ID = ? OR ? IS NULL)
        AND ATTENDANCE_DATE = ?`,
        [studentId, scheduleId, scheduleId, date]
      );
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    console.log("Delete attendance id model : : ", id)
    const [result] = await db.query(
      'DELETE FROM STUDENT_ATTENDANCE WHERE ID = ?',
      [id]
    );
    return result.affectedRows;
  }

  static async findByStudent(studentId) {
    const [rows] = await db.query(`
      SELECT sa.*, at.NAME as attendance_type, at.CODE as attendance_code
      FROM STUDENT_ATTENDANCE sa
      JOIN ATTENDANCE_TYPES at ON sa.ATTENDANCE_TYPE_ID = at.ID
      WHERE sa.STUDENT_ID = ?
      ORDER BY sa.ATTENDANCE_DATE DESC
    `, [studentId]);
    return rows;
  }

  static async findByDate(date) {
    const [rows] = await db.query(`
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
    const [rows] = await db.query(`
      SELECT 
        ID AS Id,
        CODE AS Code,
        NAME AS Name,
        DESCRIPTION AS Description,
        IS_PRESENT AS IsPresent,
        COLOR_CODE AS ColorCode
      FROM ATTENDANCE_TYPES;
    `);
    return rows;
  }


  // Get student basic information
  static async getStudentBasicInfo(studentId) {
    const [rows] = await db.query(`
      SELECT 
        st.ID AS StudentID,
        st.CODE AS StudentCode,
        st.NAME AS StudentName,
        st.NAME_ENGLISH AS StudentNameEnglish,
        st.EMAIL AS StudentEmail,
        st.GENDER AS StudentGender,
        st.DOB AS StudentDOB,
        st.POD AS StudentPOD,
        st.ADDRESS AS StudentAddress,
        st.PHONE_NUMBER AS StudentPhone,
        st.STATUS AS StudentStatus,
        cl.NAME AS ClassName,
        cr.NAME AS CourseName,
        d.NAME AS DepartmentName
      FROM 
        STUDENTS st
      LEFT JOIN 
        CLASS cl ON st.CLASS_ID = cl.ID
      LEFT JOIN 
        COURSES cr ON st.COURSE_ID = cr.ID
      LEFT JOIN 
        DEPARTMENTS d ON st.DEPARTMENT_ID = d.ID
      WHERE 
        st.ID = ?`, [studentId]);
    return rows[0];
  }

  // 3. Detailed Daily Attendance Query
  static async geAttendanceBasicInfo() {
    const [rows] = await db.query(`
   SELECT 
    sa.ID AS AttendanceID,
    st.ID AS StudentID,
    st.CODE AS StudentCode,
    st.NAME AS StudentName,
    sa.ATTENDANCE_DATE AS AttendanceDate,
    at.CODE AS AttendanceCode,
    at.NAME AS AttendanceType,
    sa.NOTES AS AttendanceNotes,
    cs.DAY_OF_WEEK AS ClassDay,
    cs.START_TIME AS ClassStartTime,
    cs.END_TIME AS ClassEndTime,
    sub.NAME AS SubjectName,
    t.NAME AS TeacherName
FROM 
    STUDENT_ATTENDANCE sa
JOIN 
    STUDENTS st ON sa.STUDENT_ID = st.ID
JOIN 
    ATTENDANCE_TYPES at ON sa.ATTENDANCE_TYPE_ID = at.ID
JOIN 
    CLASS_SCHEDULES cs ON sa.SCHEDULE_ID = cs.ID
JOIN 
    SUBJECTS sub ON cs.SUBJECT_ID = sub.ID
JOIN 
    TEACHERS t ON cs.TEACHER_ID = t.ID
WHERE 
    sa.ATTENDANCE_DATE = CURDATE();`);
    return rows;
  }

  // Get student attendance summary
  static async getStudentAttendanceSummary(studentId) {
    //     SELECT 
    //     cl.ID AS ClassID,
    //     cl.NAME AS ClassName,
    //     COUNT(DISTINCT st.ID) AS TotalStudents,
    //     COUNT(CASE WHEN at.CODE = 'P' THEN 1 END) AS PresentCount,
    //     COUNT(CASE WHEN at.CODE = 'A' THEN 1 END) AS AbsentCount,
    //     ROUND(COUNT(CASE WHEN at.CODE = 'P' THEN 1 END) * 100.0 / COUNT(*), 2) AS AttendancePercentage
    // FROM 
    //     CLASS cl
    // JOIN 
    //     STUDENTS st ON cl.ID = st.CLASS_ID
    // LEFT JOIN 
    //     STUDENT_ATTENDANCE sa ON st.ID = sa.STUDENT_ID
    // LEFT JOIN 
    //     ATTENDANCE_TYPES at ON sa.ATTENDANCE_TYPE_ID = at.ID
    // WHERE 
    //     sa.ATTENDANCE_DATE = CURDATE()
    // GROUP BY 
    //     cl.ID, cl.NAME;
    const [rows] = await db.query(`
      SELECT 
        COUNT(CASE WHEN at.CODE = 'P' THEN 1 END) AS PresentCount,
        COUNT(CASE WHEN at.CODE = 'A' THEN 1 END) AS AbsentCount,
        COUNT(CASE WHEN at.CODE = 'L' THEN 1 END) AS LateCount,
        COUNT(CASE WHEN at.CODE = 'E' THEN 1 END) AS ExcusedCount,
        COUNT(*) AS TotalAttendanceRecords
      FROM 
        STUDENT_ATTENDANCE sa
      JOIN 
        ATTENDANCE_TYPES at ON sa.ATTENDANCE_TYPE_ID = at.ID
      WHERE 
        sa.STUDENT_ID = ?`, [studentId]);
    return rows[0];
  }

  // 5. Student Attendance History Query
  static async getAttendanceHistory(studentId) {
    const [rows] = await db.query(`
        SELECT 
    sa.ATTENDANCE_DATE AS AttendanceDate,
    at.CODE AS AttendanceCode,
    at.NAME AS AttendanceType,
    sub.NAME AS SubjectName,
    cs.DAY_OF_WEEK AS ClassDay,
    CONCAT(TIME_FORMAT(cs.START_TIME, '%h:%i %p'), ' - ', TIME_FORMAT(cs.END_TIME, '%h:%i %p')) AS ClassTime,
    t.NAME AS TeacherName,
    sa.NOTES AS AttendanceNotes
FROM 
    STUDENT_ATTENDANCE sa
JOIN 
    ATTENDANCE_TYPES at ON sa.ATTENDANCE_TYPE_ID = at.ID
JOIN 
    CLASS_SCHEDULES cs ON sa.SCHEDULE_ID = cs.ID
JOIN 
    SUBJECTS sub ON cs.SUBJECT_ID = sub.ID
JOIN 
    TEACHERS t ON cs.TEACHER_ID = t.ID
WHERE 
    sa.STUDENT_ID = ?
ORDER BY 
    sa.ATTENDANCE_DATE DESC;`, [studentId]);
    return rows[0];
  }


  // Get detailed daily attendance
  // In your model file
  static async getDailyAttendance(date) {
    if (!date) throw new Error("Date is required");

    const [rows] = await db.query(`
   SELECT 
  sa.ID AS AttendanceId,
  st.ID AS StudentId,
  st.CODE AS StudentCode,
  st.NAME AS StudentName,
  st.NAME_ENGLISH AS StudentEnglishName,
  st.GENDER AS Gender,
  sa.ATTENDANCE_TYPE_ID AS AttendanceTypeId,
  sa.ATTENDANCE_DATE AS AttendanceDate,
  at.CODE AS AttendanceCode,
  at.NAME AS AttendanceType,
  sa.NOTES AS AttendanceNotes,
  cs.DAY_OF_WEEK AS ClassDay,
  cs.START_TIME AS ClassStartTime,
  cs.END_TIME AS ClassEndTime,
  cse.TITLE AS CourseTitle,
  cse.TITLE_ENGLISH AS CourseEnglishTitle,
  t.NAME AS TeacherName
FROM 
  STUDENT_ATTENDANCE sa
LEFT JOIN 
  STUDENTS st ON sa.STUDENT_ID = st.ID
LEFT JOIN 
  ATTENDANCE_TYPES at ON sa.ATTENDANCE_TYPE_ID = at.ID
LEFT JOIN  
  CLASS_SCHEDULES cs ON sa.SCHEDULE_ID = cs.ID
LEFT JOIN
  COURSES cse ON cs.COURSE_ID = cse.ID
LEFT JOIN 
  USERS t ON cs.TEACHER_ID = t.ID
WHERE 
  sa.ATTENDANCE_DATE = ?;
`, [date]);
    return rows;
  }

  // Get attendance by date range
  static async getAttendanceByDateRangev1(startDate, endDate) {
    const [rows] = await db.query(`
      SELECT 
        sa.ATTENDANCE_DATE AS AttendanceDate,
        st.ID AS StudentId,
        st.CODE AS StudentCode,
        st.NAME AS StudentName,
        cl.NAME AS ClassName,
        at.CODE AS AttendanceCode,
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
        sa.ATTENDANCE_DATE, st.NAME`, [startDate, endDate]);
    return rows;
  }
  static async getAttendanceByDateRangeNeeddate(startDate = null, endDate = null, classId = null, status = null) {
    let query = `
    SELECT
      sa.ID AS AttendanceId,
      sa.ATTENDANCE_DATE AS AttendanceDate,
      st.ID AS StudentId,
      st.CODE AS StudentCode,
      st.NAME AS StudentName,
      cl.ID AS ClassId,
      cl.NAME AS ClassName,
      at.CODE AS AttendanceCode,
      at.NAME AS AttendanceType,
      sa.NOTES AS AttendanceNotes,
      cs.SUBJECT_ID AS SubjectId,
      sub.NAME AS SubjectName,
      cs.TEACHER_ID AS TeacherId
    FROM 
      STUDENT_ATTENDANCE sa
    LEFT JOIN 
      STUDENTS st ON sa.STUDENT_ID = st.ID
    LEFT JOIN
      ATTENDANCE_TYPES at ON sa.ATTENDANCE_TYPE_ID = at.ID
    LEFT JOIN
      CLASS cl ON st.CLASS_ID = cl.ID
    LEFT JOIN
      CLASS_SCHEDULES cs ON sa.SCHEDULE_ID = cs.ID
    LEFT JOIN
      SUBJECTS sub ON cs.SUBJECT_ID = sub.ID
    WHERE 
      sa.ATTENDANCE_DATE BETWEEN ? AND ?
  `;
    const params = [startDate, endDate];

    if (classId) {
      query += ' AND cl.ID = ?';
      params.push(classId);
    }

    if (status) {
      query += ' AND at.NAME = ?';
      params.push(status);
    }

    query += ' ORDER BY sa.ATTENDANCE_DATE, st.NAME';

    const [rows] = await db.query(query, params);
    return rows;
  }

  static async getDisabledDaysFromDB1() {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1 // MySQL MONTH() is 1-based

    const [rows] = await db.query(`
      SELECT DISTINCT DAY(AttendanceDate) AS Day
    FROM STUDENT_ATTENDANCE
    WHERE MONTH(AttendanceDate) = ? AND YEAR(AttendanceDate) = ?
      AND AttendanceTypeId IS NULL;
  `, [month, year])

    return rows.map(r => r.Day)
  }

  static async getDisabledDaysFromDB(startDate = null, endDate = null) {
    let query = `
    SELECT DISTINCT DAY(ATTENDANCE_DATE) AS Day
    FROM STUDENT_ATTENDANCE
    WHERE ATTENDANCE_TYPE_ID IS NULL
  `
    const params = []

    if (startDate && endDate) {
      query += ' AND ATTENDANCE_DATE BETWEEN ? AND ?'
      params.push(startDate, endDate)
    } else if (startDate) {
      query += ' AND ATTENDANCE_DATE >= ?'
      params.push(startDate)
    } else if (endDate) {
      query += ' AND ATTENDANCE_DATE <= ?'
      params.push(endDate)
    }

    const [rows] = await db.query(query, params)
    return rows.map(r => r.Day)
  }


  static async getAttendanceByDateRange(startDate = null, endDate = null, classId = null, status = null) {
    let query = `
    SELECT
      sa.ID AS AttendanceId,
      sa.ATTENDANCE_DATE AS AttendanceDate,
      st.ID AS StudentId,
      st.CODE AS StudentCode,
      st.NAME AS StudentName,
      cl.ID AS ClassId,
      cl.NAME AS ClassName,
      at.CODE AS AttendanceCode,
      at.NAME AS AttendanceType,
      sa.NOTES AS AttendanceNotes,
      cs.SUBJECT_ID AS SubjectId,
      sub.NAME AS SubjectName,
      cs.TEACHER_ID AS TeacherId
    FROM 
      STUDENT_ATTENDANCE sa
    LEFT JOIN STUDENTS st ON sa.STUDENT_ID = st.ID
    LEFT JOIN ATTENDANCE_TYPES at ON sa.ATTENDANCE_TYPE_ID = at.ID
    LEFT JOIN CLASS cl ON st.CLASS_ID = cl.ID
    LEFT JOIN CLASS_SCHEDULES cs ON sa.SCHEDULE_ID = cs.ID
    LEFT JOIN SUBJECTS sub ON cs.SUBJECT_ID = sub.ID
    WHERE 1=1
  `;

    if ((startDate && isNaN(Date.parse(startDate))) || (endDate && isNaN(Date.parse(endDate)))) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const params = [];

    // ✅ Date Filters (safe & flexible)
    if (startDate && endDate) {
      query += ' AND sa.ATTENDANCE_DATE BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ' AND sa.ATTENDANCE_DATE >= ?';
      params.push(startDate);
    } else if (endDate) {
      query += ' AND sa.ATTENDANCE_DATE <= ?';
      params.push(endDate);
    }

    // ✅ Filter by Class ID
    if (classId) {
      query += ' AND cl.ID = ?';
      params.push(classId);
    }

    // ✅ Filter by Attendance Type (e.g., 'Present', 'Absent')
    if (status) {
      query += ' AND at.NAME = ?';
      params.push(status);
    }

    // ✅ Order results consistently
    query += ' ORDER BY sa.ATTENDANCE_DATE ASC, st.NAME ASC';

    //   if (status) {
    //   query += ' AND at.CODE = ?'; // More stable
    //   params.push(status);
    // }


    // 2. Add pagination (optional)
    // query += ' LIMIT ? OFFSET ?';
    // params.push(limit, offset);

    const [rows] = await db.query(query, params);
    return rows;
  }


  // 7. Teacher Attendance Report Query
  static async getTeacherAttendanceReportByDateRange(startDate, endDate) {
    const [rows] = await db.query(`
      SELECT 
    t.ID AS TeacherID,
    t.NAME AS TeacherName,
    sub.NAME AS SubjectName,
    cl.NAME AS ClassName,
    COUNT(DISTINCT sa.ID) AS AttendanceRecords,
    COUNT(DISTINCT sa.STUDENT_ID) AS StudentsPresent,
    MIN(sa.ATTENDANCE_DATE) AS FirstAttendanceDate,
    MAX(sa.ATTENDANCE_DATE) AS LastAttendanceDate
FROM 
    TEACHERS t
JOIN 
    CLASS_SCHEDULES cs ON t.ID = cs.TEACHER_ID
JOIN 
    STUDENT_ATTENDANCE sa ON cs.ID = sa.SCHEDULE_ID
JOIN 
    SUBJECTS sub ON cs.SUBJECT_ID = sub.ID
JOIN 
    CLASS cl ON cs.CLASS_ID = cl.ID
WHERE 
    sa.ATTENDANCE_DATE BETWEEN ? AND ?
GROUP BY 
    t.ID, t.NAME, sub.NAME, cl.NAME;`, [startDate, endDate]);
    return rows;
  }



  // Get class attendance summary
  static async getClassAttendanceSummary(date) {
    const [rows] = await db.query(`
      SELECT 
        cl.ID AS ClassID,
        cl.NAME AS ClassName,
        COUNT(DISTINCT st.ID) AS TotalStudents,
        COUNT(CASE WHEN at.CODE = 'P' THEN 1 END) AS PresentCount,
        COUNT(CASE WHEN at.CODE = 'A' THEN 1 END) AS AbsentCount,
        ROUND(COUNT(CASE WHEN at.CODE = 'P' THEN 1 END) * 100.0 / COUNT(*), 2) AS AttendancePercentage
      FROM 
        CLASS cl
      JOIN 
        STUDENTS st ON cl.ID = st.CLASS_ID
      LEFT JOIN 
        STUDENT_ATTENDANCE sa ON st.ID = sa.STUDENT_ID
      LEFT JOIN 
        ATTENDANCE_TYPES at ON sa.ATTENDANCE_TYPE_ID = at.ID
      WHERE 
        sa.ATTENDANCE_DATE = ?
      GROUP BY 
        cl.ID, cl.NAME`, [date]);
    return rows;
  }
}

export default StudentAttendanceModel;