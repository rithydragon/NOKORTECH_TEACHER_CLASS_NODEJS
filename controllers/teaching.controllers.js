import * as TeachingModel from "../models/teaching.models.js";

// Get all teachings
// export const getAllTeachings = async (req, res) => {
//   try {
//     const teachings = await TeachingModel.getAllTeachings();
//     res.status(200).json(teachings);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching teachings", error });
//   }
// };

export const getAllTeachings = async (req, res) => {
  console.log("req.body ---------------------", req.body);
  let { page, limit } = req.body;


  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  try {
    const data = await TeachingModel.getAllTeachings(page, limit);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get teaching by ID
export const getTeachingById = async (req, res) => {
  try {
    const { id } = req.params;
    const teaching = await TeachingModel.getTeachingById(id);
    if (!teaching) {
      return res.status(404).json({ message: "Teaching not found" });
    }
    res.status(200).json(teaching);
  } catch (error) {
    res.status(500).json({ message: "Error fetching teaching", error });
  }
};

// Create a new teaching
export const createTeaching = async (req, res) => {
  try {
    const data = req.body;
    const result = await TeachingModel.createTeaching(data);
    res.status(201).json({ message: "Teaching created successfully", id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: "Error creating teaching", error });
  }
};

// // Update an existing teaching
// export const updateTeaching = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const data = req.body;
//     const result = await TeachingModel.updateTeaching(id, data);
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "Teaching not found or no changes made" });
//     }
//     res.status(200).json({ message: "Teaching updated successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Error updating teaching", error });
//   }
// };

// // Delete a teaching
// export const deleteTeaching = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const result = await TeachingModel.deleteTeaching(id);
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "Teaching not found" });
//     }
//     res.status(200).json({ message: "Teaching deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting teaching", error });
//   }
// };
// Update a teaching record
export const updateTeaching = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  if (!id) {
    return res.status(400).json({ Message: "Teaching ID is required!!!!!!!!!!!" });
  }

  try {
    const result = await updateTeaching(id, data);
    res.status(200).json({ message: "Teaching updated successfully", result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a teaching record by ID
export const deleteTeaching = async (req, res) => {
  const { id } = req.params;

  try {
    const teaching = await getTeachingById(id);
    if (!teaching) {
      return res.status(404).json({ message: "Teaching not found" });
    }
    res.status(200).json(teaching);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a teaching record
export const deleteTeachingController = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Teaching ID is required" });
  }

  try {
    const result = await deleteTeaching(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Teaching not found" });
    }
    res.status(200).json({ message: "Teaching deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAllTeachingsController = async (req, res) => {
  try {
    const updates = req.body; // Array of updated rows
    const result = await TeachingModel.updateAllTeachings(updates);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// // controllers/teachingController.js
// const teachingModel = require('../models/teachingModel');

// const updateTeachingData = async (req, res) => {
//     const { teachingId, roomId, courseId, timeId, teacherId, description } = req.body;

//     if (!teachingId || !roomId || !courseId || !timeId || !teacherId) {
//         return res.status(400).json({ message: 'Missing required fields' });
//     }

//     try {
//         const result = await teachingModel.updateTeaching(
//             teachingId,
//             roomId,
//             courseId,
//             timeId,
//             teacherId,
//             description
//         );

//         if (result.affectedRows > 0) {
//             return res.status(200).json({ message: 'Teaching record updated successfully' });
//         } else {
//             return res.status(404).json({ message: 'Teaching record not found' });
//         }
//     } catch (error) {
//         console.error('Error updating teaching record:', error);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// };

// module.exports = { updateTeachingData };


// controllers/teachingController.js
import { getTeachingData } from '../models/teaching.models.js';

export const getTeachingList = async (req, res) => {
  const { Room: roomId, Course: courseId, Time: timeId } = req.body;

  console.log( "Req : ", req.body)
  
  try {
    const teachingData = await getTeachingData(roomId, courseId, timeId);

    const resultData = teachingData.map((row) => {
      const start = new Date(`1970-01-01T${row.TimeStart}Z`);
      const end = new Date(`1970-01-01T${row.TimeEnd}Z`);
      const diffMs = end - start;
      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      return {
        ...row,
        Duration: `${hours}h ${minutes}m`,
      };
    });

    res.json(resultData);
  } catch (err) {
    console.error('Error fetching teaching data:', err);
    res.status(500).json({ 
      error: 'An error occurred while fetching teaching data',
      details: err.message 
    });
  }
};


// controllers/teachingController.js
import { getRooms } from '../models/room.models.js';
import { getTimeSlots } from '../models/time.models.js';

// Controller to fetch room and time data
export const getRoomData = async (req, res) => {
  try {
    const rooms = await getRooms(); // Fetch rooms
    res.status(200).json(rooms); // Send rooms data as JSON response
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room data', error });
  }
};

export const getTimeData = async (req, res) => {
  try {
    const timeSlots = await getTimeSlots(); // Fetch time slots
    res.status(200).json(timeSlots); // Send time slot data as JSON response
  } catch (error) {
    res.status(500).json({ message: 'Error fetching time slot data', error });
  }
};
