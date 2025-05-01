import { Teacher } from "../models/teacher.models.js";

export const getAll = async (req, res) => {
  try {
    const teachers = await Teacher.getAll();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.getById(id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const { name, email, createdBy } = req.body;
    const insertId = await Teacher.create(name, email, createdBy);
    res.status(201).json({ message: "Teacher created", id: insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, updatedBy } = req.body;
    await Teacher.update(id, name, email, updatedBy);
    res.json({ message: "Teacher updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    await Teacher.delete(id);
    res.json({ message: "Teacher deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
