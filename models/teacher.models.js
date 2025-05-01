import db from "../config/db.js";

export class Teacher {
  // Get all teachers
  static async getAll() {
    try {
      const [rows] = await db.query("SELECT * FROM Teachers");
      return rows;
    } catch (error) {
      throw new Error("Database Error: " + error.message);
    }
  }

  // Get a teacher by ID
  static async getById(id) {
    try {
      const [rows] = await db.query("SELECT * FROM Teachers WHERE Id = ?", [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error("Database Error: " + error.message);
    }
  }

  // Create a new teacher
  static async create(name, email, createdBy) {
    try {
      const [result] = await db.query(
        "INSERT INTO Teachers (Name, Email, CreatedBy) VALUES (?, ?, ?)",
        [name, email, createdBy]
      );
      return result.insertId;
    } catch (error) {
      throw new Error("Database Error: " + error.message);
    }
  }

  // Update a teacher
  static async update(id, name, email, updatedBy) {
    try {
      await db.query(
        "UPDATE Teachers SET Name = ?, Email = ?, UpdatedBy = ? WHERE Id = ?",
        [name, email, updatedBy, id]
      );
      return true;
    } catch (error) {
      throw new Error("Database Error: " + error.message);
    }
  }

  // Delete a teacher
  static async delete(id) {
    try {
      await db.query("DELETE FROM Teachers WHERE Id = ?", [id]);
      return true;
    } catch (error) {
      throw new Error("Database Error: " + error.message);
    }
  }
}