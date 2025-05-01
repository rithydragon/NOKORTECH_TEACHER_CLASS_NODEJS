// models/roomModel.js
import db from '../config/db.js';

// Function to fetch all room data
export const getRooms = async () => {
  const query = 'SELECT * FROM ROOM';
  const [rows] = await db.execute(query);
  return rows; // Return fetched rooms data
};
