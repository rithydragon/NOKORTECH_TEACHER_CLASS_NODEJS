import pool from '../config/db.js';

class Department {
  static async create(department) {
    const [result] = await pool.query('INSERT INTO DEPARTMENTS SET ?', [department]);
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM DEPARTMENTS WHERE ID = ?', [id]);
    return rows[0];
  }

  static async update(id, updates) {
    await pool.query('UPDATE DEPARTMENTS SET ? WHERE ID = ?', [updates, id]);
  }

  static async delete(id) {
    await pool.query('DELETE FROM DEPARTMENTS WHERE ID = ?', [id]);
  }

  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM DEPARTMENTS');
    return rows;
  }
}

export default Department;