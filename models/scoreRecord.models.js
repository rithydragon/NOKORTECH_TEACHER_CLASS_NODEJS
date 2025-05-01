import db from "../config/db.js";

class ScoreRecord {
  static async getAll() {
    const [rows] = await db.query(`
      SELECT s.*, st.FName, st.LName FROM ScoreRecord s
      JOIN Students st ON s.Student = st.Id ORDER BY s.Id`);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query(`
      SELECT s.*, st.FName, st.LName FROM ScoreRecord s
      JOIN Students st ON s.Student = st.Id WHERE s.Id = ?`, [id]);
    return rows[0] || null;
  }

  static async create(record) {
    const sql = `INSERT INTO ScoreRecord (MidTerm, Final, Total, Student, CreatedBy) VALUES (?, ?, ?, ?, ?)`;
    const values = [record.MidTerm, record.Final, record.Total, record.Student, record.CreatedBy];
    const [result] = await db.query(sql, values);
    return result.insertId;
  }

  static async update(id, record) {
    const sql = `UPDATE ScoreRecord SET MidTerm=?, Final=?, Total=?, Student=?, UpdatedBy=? WHERE Id=?`;
    const values = [record.MidTerm, record.Final, record.Total, record.Student, record.UpdatedBy, id];
    await db.query(sql, values);
  }

  static async delete(id) {
    await db.query("DELETE FROM ScoreRecord WHERE Id = ?", [id]);
  }
}

export default ScoreRecord;
