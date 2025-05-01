import db from "../config/db.js";

// Base query for fetching teaching assignments
const teachingQueryData = `
  SELECT 
    t.Id AS TeachingId,
    t.Subject,
    t.Room,
    t.Date,
    t.Time,
    t.Week,
    t.Sessions,
    t.Year,
    t.Semester,
    t.CreatedBy AS TeachingCreatedBy,
    t.CreatedDate AS TeachingCreatedDate,
    t.UpdatedBy AS TeachingUpdatedBy,
    t.UpdatedDate AS TeachingUpdatedDate,

    tc.Id AS TeacherId,
    tc.Name AS TeacherName,
    tc.Email AS TeacherEmail,
    tc.CreatedBy AS TeacherCreatedBy,
    tc.CreatedDate AS TeacherCreatedDate,
    tc.UpdatedBy AS TeacherUpdatedBy,
    tc.UpdatedDate AS TeacherUpdatedDate,

    ca.Id AS ClassAssignId,
    ca.AssignedAt AS ClassAssignedDate,

    u1.Id AS AssignedById,
    u1.Name AS AssignedByAdmin,
    u1.Email AS AssignedByEmail,
    u1.Role AS AssignedByRole
  FROM Teachings t
  JOIN ClassAssign ca ON t.Id = ca.ClassId
  JOIN Teachers tc ON ca.TeacherId = tc.Id
  JOIN Users u1 ON ca.AssignedBy = u1.Id
`;

export class ClassAssignment {
  // Assign a teacher to a class
  static async assignTeacher(teacherId, classId, assignedBy) {
    try {
      // Validate inputs
      if (!teacherId || !classId || !assignedBy) {
        throw new Error("Teacher ID, Class ID, and Assigned By are required");
      }

      // Insert the assignment
      const [result] = await db.query(
        "INSERT INTO ClassAssign (TeacherId, ClassId, AssignedBy) VALUES (?, ?, ?)",
        [teacherId, classId, assignedBy]
      );

      return { id: result.insertId, teacherId, classId, assignedBy };
    } catch (error) {
      throw new Error("Database Error: " + error.message);
    }
  }

  //   // Get all teaching assignments with optional filters
  //   static async getAssignments(filters = {}) {
  //     try {
  //       let query = teachingQueryData;
  //       const conditions = [];
  //       const values = [];

  //       // Apply filters if provided
  //       if (filters.subject) {
  //         conditions.push("t.Subject LIKE ?");
  //         values.push(`%${filters.subject}%`);
  //       }
  //       if (filters.room) {
  //         conditions.push("t.Room = ?");
  //         values.push(filters.room);
  //       }
  //       if (filters.time) {
  //         conditions.push("t.Time = ?");
  //         values.push(filters.time);
  //       }

  //       // Add WHERE clause if filters are applied
  //       if (conditions.length > 0) {
  //         query += ` WHERE ${conditions.join(" AND ")}`;
  //       }

  //       // Execute the query
  //       const [results] = await db.query(query, values);
  //       return results;
  //     } catch (error) {
  //       throw new Error("Database Error: " + error.message);
  //     }
  //   }
  // }


  static async getAssignments(filters = {}) {
    try {
      let query = teachingQueryData;
      const conditions = [];
      const values = [];

      // Apply filters if provided
      if (filters.subject) {
        conditions.push("t.Subject LIKE ?");
        values.push(`%${filters.Subject}%`); // Add wildcards for partial matching
      }
      if (filters.room) {
        conditions.push("t.Room = ?");
        values.push(filters.Room.trim()); // Trim to remove extra spaces
      }
      if (filters.time) {
        conditions.push("t.Time = ?");
        values.push(filters.time.trim()); // Trim to remove extra spaces
      }

      // Add WHERE clause if filters are applied
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
      }

      // Execute the query
      const [results] = await db.query(query, values);
      return results;
    } catch (error) {
      throw new Error("Database Error: " + error.message);
    }
  }
}