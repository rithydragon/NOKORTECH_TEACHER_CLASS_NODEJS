import Subject from '../models/subject.models.js';

// Get all subjects
export const getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.findAll();
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subjects', error });
    }
};

// Get a subject by ID
export const getSubjectById = async (req, res) => {
    const subjectId = req.params.id;
    try {
        const subject = await Subject.findById(subjectId);
        if (subject) {
            res.status(200).json(subject);
        } else {
            res.status(404).json({ message: 'Subject not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subject', error });
    }
};

// Create a new subject
export const createSubject = async (req, res) => {
    const { code, name, nameEnglish, description } = req.body;
    const createdBy = req.user.UserId; // Get the authenticated user's ID

    try {
        const newSubjectId = await Subject.create({ code, name, nameEnglish, description, createdBy });
        res.status(201).json({ message: 'Subject created successfully', subjectId: newSubjectId });
    } catch (error) {
        res.status(500).json({ message: 'Error creating subject', error });
    }
};

// Update an existing subject
export const updateSubject = async (req, res) => {
    const subjectId = req.params.id;
    const { code, name, nameEnglish, description } = req.body;
    const updatedBy = req.user.UserId; // Get the authenticated user's ID

    try {
        const isUpdated = await Subject.update(subjectId, { code, name, nameEnglish, description, updatedBy });
        if (isUpdated) {
            res.status(200).json({ message: 'Subject updated successfully' });
        } else {
            res.status(404).json({ message: 'Subject not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating subject', error });
    }
};

// Delete a subject
export const deleteSubject = async (req, res) => {
    const subjectId = req.params.id;
    try {
        const isDeleted = await Subject.delete(subjectId);
        if (isDeleted) {
            res.status(200).json({ message: 'Subject deleted successfully' });
        } else {
            res.status(404).json({ message: 'Subject not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting subject', error });
    }
};

// Search subjects by name or code
export const searchSubjects = async (req, res) => {
    const query = req.query.q; // Get the search query from the request
    try {
        const results = await Subject.search(query);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error searching subjects', error });
    }
};

