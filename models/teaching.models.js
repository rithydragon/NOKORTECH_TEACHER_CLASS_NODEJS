import db from "../config/db.js"; // Import MySQL connection pool

// Get all teachings (without pagination)
export const getAllTeachings = async () => {
  try {
    const [rows] = await db.query("SELECT * FROM Teachings");
    return rows;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get all teachings with pagination
export const getAllTeachings1 = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    // Query to get paginated teaching records with CreatedBy and UpdatedBy details
    const query = `
      SELECT t.Id, t.Subject, t.Room, t.Date, t.Time, t.Week, t.Sessions, 
        u.Name AS CreatedBy, t.CreatedDate, 
        u2.Name AS UpdatedBy, t.UpdatedDate
      FROM Teachings t
      LEFT JOIN Users u ON t.CreatedBy = u.Id
      LEFT JOIN Users u2 ON t.UpdatedBy = u2.Id
      ORDER BY t.CreatedDate DESC
      LIMIT ? OFFSET ?;
    `;

    const countQuery = `SELECT COUNT(*) AS total FROM Teachings;`;

    // Execute count query to get total records
    const [countResult] = await db.query(countQuery);
    const totalRecords = countResult[0].total;
    const totalPages = Math.ceil(totalRecords / limit);

    // Execute paginated query
    const [results] = await db.query(query, [limit, offset]);

    return {
      page,
      limit,
      totalPages,
      totalRecords,
      data: results,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get teaching by ID
export const getTeachingById = async (id) => {
  try {
    const [rows] = await db.query("SELECT * FROM Teachings WHERE Id = ?", [id]);
    return rows[0]; // Return the first row (since Id is unique)
  } catch (error) {
    throw new Error(error.message);
  }
};

// Create a new teaching
export const createTeaching = async (data) => {
  try {
    const { subject, room, date, time, week, sessions, createdBy } = data;
    const [result] = await db.query(
      "INSERT INTO Teachings (Subject, Room, Date, Time, Week, Sessions, CreatedBy) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [subject, room, date, time, week, sessions, createdBy]
    );
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update a teaching record
export const updateTeaching = async (id, data) => {
  try {
    const { subject, room, date, time, week, sessions, updatedBy } = data;

    const sql = `
      UPDATE Teachings 
      SET Subject = ?, Room = ?, Date = ?, Time = ?, Week = ?, Sessions = ?, UpdatedBy = ?, UpdatedDate = CURRENT_TIMESTAMP 
      WHERE Id = ?
    `;

    const [result] = await db.query(sql, [
      subject,
      room,
      date,
      time,
      week,
      sessions,
      updatedBy,
      id,
    ]);
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Delete a teaching by ID
export const deleteTeaching = async (id) => {
  try {
    const [result] = await db.query("DELETE FROM Teachings WHERE Id = ?", [id]);
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update multiple teaching records
export const updateAllTeachings = async (updates) => {
  try {
    const updatePromises = updates.map((row) => {
      return db.query(
        `UPDATE Teachings SET Subject=?, Room=?, Date=?, Time=?, Week=?, Sessions=? WHERE Id=?`,
        [row.subject, row.room, row.date, row.time, row.week, row.sessions, row.id]
      );
    });

    await Promise.all(updatePromises);
    return { success: true, message: "All teaching records updated successfully" };
  } catch (error) {
    throw new Error(error.message);
  }
};



// // models/teachingModel.js
// const db = require('../config/db'); // Assuming you have a db config file with mysql2

// const updateTeaching = async (teachingId, roomId, courseId, timeId, teacherId, description) => {
//     const [rows] = await db.execute(
//         `UPDATE TEACHING
//         SET ROOM_ID = ?, COURSE_ID = ?, TIME_ID = ?, TEACHER_ID = ?, DESCRIPTION = ?
//         WHERE TEACHING_ID = ?`,
//         [roomId, courseId, timeId, teacherId, description, teachingId]
//     );
//     return rows;
// };

// module.exports = { updateTeaching };



// Function to fetch teaching data with filters
export const getTeachingDataqqqq = async (roomId, courseId, timeId) => {
  const query = `
    SELECT t.TEACHING_ID, r.ROOM_NAME, c.TITLE AS COURSE_TITLE, tm.TIME_SLOT, t.TEACHER_ID, t.DESCRIPTION
    FROM TEACHING t
    JOIN ROOM r ON t.ROOM_ID = r.ROOM_ID
    JOIN COURSES c ON t.COURSE_ID = c.COURSE_ID
    JOIN TIME tm ON t.TIME_ID = tm.TIME_ID
    WHERE 1=1
      AND (t.ROOM_ID = ? OR ? IS NULL)
      AND (t.COURSE_ID = ? OR ? IS NULL)
      AND (t.TIME_ID = ? OR ? IS NULL);
  `;

  const [rows] = await db.execute(query, [
    roomId, roomId,
    courseId, courseId,
    timeId, timeId
  ]);

  return rows;  // Return the result of the query
};


// Function to fetch teaching data with filters
export const getTeachingData = async (roomId, courseId, timeId) => {
  // Convert undefined to null for proper SQL handling
  console.log(roomId,courseId,timeId)
  const filters = [
    roomId !== undefined ? roomId : null,
    courseId !== undefined ? courseId : null,
    timeId !== undefined ? timeId : null
  ];

  const query = `
    SELECT 
      t.TEACHING_ID AS Id,
      t.DESCRIPTION AS Description,
      t.TEACHER_ID AS TeacherId,
      t.CREATED_BY AS CreatedBy,
      t.UPDATED_BY AS UpdatedBy,

      -- ROOM details
      r.ID AS RoomId,
      r.ROOM_NAME AS RoomName,
      r.ROOM_TYPE AS RoomType,
      r.FLOOR AS RoomFloor,

      -- COURSE details
      c.ID AS CourseId,
      c.CODE AS CourseCode,
      c.TITLE AS CourseTitle,
      c.DESCRIPTION AS CourseDescription,

      -- TIME details
      tm.ID AS TimeId,
      tm.TIME_SLOT AS TimeSlot,
      tm.START_TIME AS TimeStart,
      tm.END_TIME AS TimeEnd,
      tm.DAY_OF_WEEK AS TimeDayOfWeek,

      -- BATCH details (keeping the joins but not filtering by them)
      b.ID AS BatchId,
      b.BATCH_NAME AS BatchName,
      b.BATCH_ENGLISH_NAME AS BatchEnglishName,
      b.START_DATE AS BatchStartDate,
      b.END_DATE AS BatchEndDate,

      -- ACADEMIC details
      a.ID AS AcademicId,
      a.CODE AS AcademicCode,
      a.NAME AS AcademicName,
      a.ENGLISH_NAME AS AcademicEnglishName,

      -- SEMESTER details
      s.ID AS SemesterId,
      s.NAME AS SemesterName,
      s.DESCRIPTION AS SemesterDescription

    FROM 
      TEACHING t
    JOIN ROOM r ON t.ROOM_ID = r.ID
    JOIN COURSES c ON t.COURSE_ID = c.ID
    JOIN TIME tm ON t.TIME_ID = tm.ID
    LEFT JOIN BATCH b ON t.BATCH_ID = b.ID
    LEFT JOIN ACADEMIC_SETTING a ON b.ACADEMIC_ID = a.ID
    LEFT JOIN SEMESTER s ON a.SEMESTER_ID = s.ID

    WHERE 
      (? IS NULL OR t.ROOM_ID = ?)
      AND (? IS NULL OR t.COURSE_ID = ?)
      AND (? IS NULL OR t.TIME_ID = ?)
  `;

  // Flatten filters array to match parameter placeholders
  const params = filters.flatMap(filter => [filter, filter]);
  
  const [rows] = await db.execute(query, params);
  return rows;
};
