import { ClassAssignment } from "../models/classAssigned.models.js";

export const assignTeacher = async (req, res) => {
  try {
    const { teacherId, classId, assignedBy } = req.body;


    // // Validate required fields
    // if (!teacherId || !classId || !assignedBy) {
    //   return res.status(400).json({ error: "Teacher ID, Class ID, and Assigned By are required" });
    // }

    const insertId = await ClassAssignment.assignTeacher(teacherId, classId, assignedBy);
    res.status(201).json({ message: "Teacher assigned successfully", id: insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const assignments = await ClassAssignment.getAssignments();
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all teaching assignments with optional filters
export const getAllAssignments = async (req, res) => {
  try {
    // Extract filters from query parameters
    const { Subject, Room, Time } = req.query;
    const filters = { Subject, Room, Time };

    // Call the ClassAssignment method
    const assignments = await ClassAssignment.getAssignments(filters);

    // Return the assignments
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};