import db from '../config/db.js';
import dayjs from 'dayjs'; // optional for better formatting

export const getAllSchedules = async () => {
  const [rows] = await db.execute(`
    SELECT 
      ds.SCHEDULE_ID AS Id,
      
      ds.CLASS_ID AS ClassId,
      c.NAME AS ClassName,

      ds.SUBJECT_ID AS SubjectId,
      s.NAME AS SubjectName,
      s.NAME_ENGLISH AS SubjectEnglishName,

      ds.TEACHER_ID AS TeacherId,
      --CONCAT(u.NAME_ENGLISH, ' / ', u.NAME) AS TeacherName,
      u.NAME_ENGLISH AS TeacherName,
      u.NAME AS TeacherName,

      ds.ROOM_ID AS RoomId,
      r.ROOM_NAME AS RoomName,

      ds.START_TIME AS StartTime,
      ds.END_TIME AS EndTime,
      ds.DAY_OF_WEEK AS DayOfWeek,
      ds.STATUS AS Status,

      ds.CREATED_BY AS CreatedBy,
      ds.CREATED_AT AS CreatedAt,
      ds.UPDATED_BY AS UpdatedBy,
      ds.UPDATED_DATE AS UpdatedAt

    FROM DAILY_SCHEDULES ds

    LEFT JOIN CLASS c ON ds.CLASS_ID = c.ID
    LEFT JOIN SUBJECTS s ON ds.SUBJECT_ID = s.ID
    LEFT JOIN USERS u ON ds.TEACHER_ID = u.ID
    LEFT JOIN ROOM r ON ds.ROOM_ID = r.ID
  `);

  return rows;
};


export const createSchedule = async (data) => {
  let { ClassId, SubjectId, TeacherId,RoomId, StartTime, EndTime, DayOfWeek, Status} = data;

    // If StartTime or EndTime not provided, generate them
  const now = new Date();

  // Format current local time as "HH:mm:ss"
  const pad = (n) => n.toString().padStart(2, '0');
  const formattedNow = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const formattedOneHourLater = `${pad((now.getHours() + 1) % 24)}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

   // assign default values if missing
  if (!StartTime) StartTime = dayjs().format('HH:mm:ss');
  if (!EndTime) EndTime = dayjs().add(1, 'hour').format('HH:mm:ss');
  if (!DayOfWeek) DayOfWeek = dayjs().format('dddd');

  StartTime = StartTime ?? formattedNow;
  EndTime = EndTime ?? formattedOneHourLater;
  DayOfWeek = DayOfWeek ?? now.toLocaleString('en-US', { weekday: 'long' });

  const [result] = await db.execute(`
    INSERT INTO DAILY_SCHEDULES (
      CLASS_ID, SUBJECT_ID, TEACHER_ID,ROOM_ID,
      START_TIME, END_TIME, DAY_OF_WEEK, STATUS
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [ClassId ?? null, SubjectId ?? null, TeacherId ?? null,RoomId ?? null, StartTime ?? null, EndTime ?? null, DayOfWeek ?? null, Status ?? null]);
  return result;
};

export const deleteScheduleById = async (scheduleId) => {
  const [result] = await db.execute(`
    DELETE FROM DAILY_SCHEDULES
    WHERE SCHEDULE_ID = ?
  `, [scheduleId]);
  return result;
};

// Optional: Get schedule by ID
export const getScheduleById = async (id) => {
  const [rows] = await db.execute(`
    SELECT * FROM DAILY_SCHEDULES WHERE SCHEDULE_ID = ?
  `, [id]);

  return rows[0];
};

// Optional: Update a schedule
export const updateSchedule = async (id, data) => {
  const {
    ClassId,
    SubjectId,
    TeacherId,
    RoomId,
    StartTime,
    EndTime,
    DayOfWeek,
    UpdatedBy
  } = data;

  const [result] = await db.execute(`
    UPDATE DAILY_SCHEDULES SET
      CLASS_ID = ?,
      SUBJECT_ID = ?,
      TEACHER_ID = ?,
      ROOM_ID = ?,
      START_TIME = ?,
      END_TIME = ?,
      DAY_OF_WEEK = ?,
      UPDATED_BY = ?,
      UPDATED_DATE = CURRENT_TIMESTAMP
    WHERE SCHEDULE_ID = ?
  `, [
    ClassId,
    SubjectId,
    TeacherId,
    RoomId,
    StartTime,
    EndTime,
    DayOfWeek,
    UpdatedBy,
    id
  ]);

  return result;
};