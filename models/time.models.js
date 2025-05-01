// models/timeModel.js
import db from '../config/db.js';

// Function to fetch all time slot data
export const getTimeSlots = async () => {
  const query = 'SELECT * FROM TIME';
  const [rows] = await db.execute(query);
  return rows; // Return fetched time slot data
};
