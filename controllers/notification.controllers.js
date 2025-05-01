import db from '../config/db.js';

// Base query for fetching notifications
const notification_getData = `
  SELECT 
    n.ID AS Notification_ID,
    n.CODE AS Notification_Code,
    n.TITLE AS Notification_Title,
    n.BODY AS Notification_Body,
    n.TYPE AS Notification_Type,
    n.STATUS AS Notification_Status,
    n.READ_STATUS AS Read_Status,
    n.PRIORITY AS Notification_Priority,



































































































































































































    
    n.TIME AS Notification_Time,

    u.ID AS User_ID,
    u.CODE AS U_Code,
    u.USER_CODE AS User_Code,
    u.USERNAME AS U_Username,
    CONCAT(u.F_NAME_KHMER, ' ', u.L_NAME_KHMER) AS User_Name,
    CONCAT(u.F_NAME_ENGLISH, ' ', u.L_NAME_ENGLISH) AS User_Name_English,
    u.EMAIL AS User_Email,

    c.ID AS Course_ID,
    c.CODE AS C_Code,
    c.COURSE_CODE AS Course_CODE,
    c.TITLE AS Course_Name,
    c.TITLE_ENGLISH AS Course_Name_English,
    c.DESCRIPTION AS Course_Description,

    ui.IMAGE_PATH AS User_Image_Path
  FROM 
    NOTIFICATIONS n
  LEFT JOIN 
    USERS u ON n.USER_ID = u.ID
  LEFT JOIN 
    COURSES c ON n.COURSE_ID = c.ID
  LEFT JOIN 
    UIMAGE ui ON u.ID = ui.USER_ID
`;

// 🚀 **Fetch Notifications with Filters**
export const getNotifications = async (req, res) => {
  try {
    const { read_status, user_id, notification_type, course_id } = req.query;
    
    let query = notification_getData;
    const conditions = [];
    const values = [];

    if (read_status !== undefined) {
      conditions.push(`n.READ_STATUS = ?`);
      values.push(read_status);
    }
    if (user_id !== undefined) {
      conditions.push(`u.ID = ?`);
      values.push(user_id);
    }
    if (notification_type !== undefined) {
      conditions.push(`n.TYPE = ?`);
      values.push(notification_type);
    }
    if (course_id !== undefined) {
      conditions.push(`c.ID = ?`);
      values.push(course_id);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    query += ` ORDER BY n.TIME DESC`;

    const [results] = await db.query(query, values);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🚀 **Fetch Notifications by Type**
export const getNotificationsByType = async (req, res) => {
  try {
    const { notification_type } = req.query;
    let query = `
      SELECT 
        n.ID AS Notification_ID,
        n.CODE AS Notification_Code,
        n.TITLE AS Notification_Title,
        n.BODY AS Notification_Body,
        n.TYPE AS Notification_Type,
        n.STATUS AS Notification_Status,
        n.READ_STATUS AS Read_Status,
        n.PRIORITY AS Notification_Priority,
        n.TIME AS Notification_Time,
        u.ID AS User_ID,
        CONCAT(u.F_NAME_KHMER, ' ', u.L_NAME_KHMER) AS User_Name,
        CONCAT(u.F_NAME_ENGLISH, ' ', u.L_NAME_ENGLISH) AS User_Name_English,
        u.EMAIL AS User_Email,
        c.TITLE_ENGLISH AS Course_Name_English
      FROM 
        NOTIFICATIONS n
      LEFT JOIN USERS u ON n.USER_ID = u.ID
      LEFT JOIN COURSES c ON n.COURSE_ID = c.ID
    `;

    const values = [];
    if (notification_type) {
      query += ` WHERE n.TYPE = ?`;
      values.push(notification_type);
    }

    query += ` ORDER BY n.TIME DESC`;

    const [results] = await db.query(query, values);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🚀 **Mark All Notifications as Read**
export const markAllNotificationsRead = async (req, res) => {
  try {
    const [result] = await db.query(`UPDATE NOTIFICATIONS SET READ_STATUS = 1 WHERE READ_STATUS = 0`);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: `All notifications marked as read. ${result.affectedRows} notifications updated.` });
    } else {
      res.status(200).json({ message: 'No unread notifications' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 🚀 **Clear All Notifications**
export const clearAllNotifications = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM NOTIFICATIONS');
    res.json({ message: `All notifications cleared. ${result.affectedRows} notifications deleted.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 🚀 **Clear a Specific Notification by ID**
export const clearNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!Number.isInteger(Number(id))) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const [result] = await db.query('DELETE FROM NOTIFICATIONS WHERE ID = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: `Notification with ID ${id} cleared` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};