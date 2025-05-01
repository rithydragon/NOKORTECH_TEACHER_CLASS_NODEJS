import pool from '../config/db.js';

const TelegramStore = {
  async create(linkData) {
    const [result] = await pool.execute(
      `INSERT INTO TELEGRAM_STORE 
      (link_type, telegram_link, link_title, link_description, is_active, is_official,
       course_id, class_id, academic_id, department_id, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        linkData.linkType,
        linkData.telegramLink,
        linkData.linkTitle,
        linkData.linkDescription,
        linkData.isActive ?? true,
        linkData.isOfficial ?? false,
        linkData.courseId,
        linkData.classId,
        linkData.academicId,
        linkData.departmentId,
        linkData.createdBy
      ]
    );
    return this.getById(result.insertId);
  },

  async getAll(filters = {}) {
    let query = `
      SELECT ts.*, 
        c.title AS course_title, c.code AS course_code,
        cl.name AS class_name, cl.code AS class_code,
        a.name AS academic_name, a.code AS academic_code,
        d.name AS department_name,
        uc.username AS created_by_username, uc.email AS created_by_email,
        uu.username AS updated_by_username, uu.email AS updated_by_email
      FROM TELEGRAM_STORE ts
      LEFT JOIN COURSES c ON ts.course_id = c.id
      LEFT JOIN CLASS cl ON ts.class_id = cl.id
      LEFT JOIN ACADEMIC_SETTING a ON ts.academic_id = a.id
      LEFT JOIN DEPARTMENTS d ON ts.department_id = d.id
      LEFT JOIN USERS uc ON ts.created_by = uc.id
      LEFT JOIN USERS uu ON ts.updated_by = uu.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.courseId) {
      query += ' AND ts.course_id = ?';
      params.push(filters.courseId);
    }
    if (filters.classId) {
      query += ' AND ts.class_id = ?';
      params.push(filters.classId);
    }
    if (filters.academicId) {
      query += ' AND ts.academic_id = ?';
      params.push(filters.academicId);
    }
    if (filters.departmentId) {
      query += ' AND ts.department_id = ?';
      params.push(filters.departmentId);
    }
    if (filters.isActive !== undefined) {
      query += ' AND ts.is_active = ?';
      params.push(filters.isActive);
    }
    if (filters.linkType) {
      query += ' AND ts.link_type = ?';
      params.push(filters.linkType);
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.execute(
      `SELECT ts.*, 
        c.title AS course_title, c.code AS course_code,
        cl.name AS class_name, cl.code AS class_code,
        a.name AS academic_name, a.code AS academic_code,
        d.name AS department_name,
        uc.username AS created_by_username, uc.email AS created_by_email,
        uu.username AS updated_by_username, uu.email AS updated_by_email
      FROM TELEGRAM_STORE ts
      LEFT JOIN COURSES c ON ts.course_id = c.id
      LEFT JOIN CLASS cl ON ts.class_id = cl.id
      LEFT JOIN ACADEMIC_SETTING a ON ts.academic_id = a.id
      LEFT JOIN DEPARTMENTS d ON ts.department_id = d.id
      LEFT JOIN USERS uc ON ts.created_by = uc.id
      LEFT JOIN USERS uu ON ts.updated_by = uu.id
      WHERE ts.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async update(id, updateData) {
    await pool.execute(
      `UPDATE TELEGRAM_STORE SET
        link_type = ?,
        telegram_link = ?,
        link_title = ?,
        link_description = ?,
        is_active = ?,
        is_official = ?,
        course_id = ?,
        class_id = ?,
        academic_id = ?,
        department_id = ?,
        updated_by = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        updateData.linkType,
        updateData.telegramLink,
        updateData.linkTitle,
        updateData.linkDescription,
        updateData.isActive,
        updateData.isOfficial,
        updateData.courseId,
        updateData.classId,
        updateData.academicId,
        updateData.departmentId,
        updateData.updatedBy,
        id
      ]
    );
    return this.getById(id);
  },

  async deactivate(id, userId) {
    await pool.execute(
      `UPDATE TELEGRAM_STORE SET
        is_active = FALSE,
        updated_by = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [userId, id]
    );
    return this.getById(id);
  },

  async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM TELEGRAM_STORE WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
};

export default TelegramStore;