import Score from '../models/score.models.js';

export const getAllScores = async (req, res) => {
    try {
        const scores = await Score.getAll();
        res.status(200).json(scores);
    } catch (error) {
        console.error('Error in getAllScores:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to fetch scores' });
    }
};
// // / Fetch scores by student ID
export const getScoreByStudentId = async (req, res) => {
    // const { studentId } = req.params; // Get studentId from request parameters
    const {Id:studentId} = req.body; // Get studentId from request body
    console.log('Student ID:', studentId);

    try {
        // Fetch scores using the Score model
        const scores = await Score.findByStudentId(studentId);

        // Return the scores as a JSON response
        res.status(200).json(scores);
    } catch (error) {
        console.error('Error in getScoresByStudentId:', error);

        // Return an error response
        res.status(500).json({ success: false, message: error.message || 'Failed to fetch scores' });
    }
};

// Fetch scores by student ID
// export const getScoreByStudentId = async (req, res) => {
//     const { studentId } = req.body; // Get studentId from the request body
//     console.log('Student ID:', studentId);

//     if (!studentId) {
//         return res.status(400).json({ success: false, message: 'studentId is required' });
//     }

//     try {
//         // Fetch scores using the Score model
//         const scores = await Score.findByStudentId(studentId);

//         // Return the scores as a JSON response
//         res.status(200).json(scores);
//     } catch (error) {
//         console.error('Error in getScoreByStudentId:', error);

//         // Return an error response
//         res.status(500).json({ success: false, message: error.message || 'Failed to fetch scores' });
//     }
// };

// export const getScoreByStudentId = async (req, res) => {
//     const  studentId  = req.query; // Extract studentId from query parameters
  
//     if (!studentId) {
//       return res.status(400).json({ success: false, message: 'studentId is required' });
//     }
  
//     try {
//       // Fetch scores using the Score model
//       const scores = await Score.findByStudentId(studentId);
  
//       // Return the scores as a JSON response
//       res.status(200).json(scores);
//     } catch (error) {
//       console.error('Error in getScoreByStudentId:', error);
  
//       // Return an error response
//       res.status(500).json({ success: false, message: error.message || 'Failed to fetch scores' });
//     }
//   };
  
// Create a new score record
export const createScore = async (req, res) => {
    const { studentId, subjectId, score, description, note } = req.body;
    const createdBy = req.user.UserId; // Get the authenticated user's ID
    console.log('User ID:', createdBy);

    try {
        const newScoreId = await Score.create({ studentId, subjectId, score, description, note, createdBy });
        res.status(201).json({ message: 'Score created successfully', scoreId: newScoreId });
    } catch (error) {
        res.status(500).json({ message: 'Error creating score', error });
    }
};

// Update an existing score record
export const updateScore = async (req, res) => {
    const scoreId = req.params.id;
    const { score, description, note } = req.body;
    const updatedBy = req.user.UserId; // Get the authenticated user's ID

    try {
        const isUpdated = await Score.update(scoreId, { score, description, note, updatedBy });
        if (isUpdated) {
            res.status(200).json({ message: 'Score updated successfully' });
        } else {
            res.status(404).json({ message: 'Score not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating score', error });
    }


};

// Delete a score by ID
export const deleteScore = async (req, res) => {
    const { scoreId } = req.params;

    try {
        const success = await Score.delete(scoreId);

        if (success) {
            res.status(200).json({ success: true, message: 'Score deleted successfully' });
        }
    } catch (error) {
        console.error('Error in deleteScore:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to delete score' });
    }
};

// Search scores
export const searchScores = async (req, res) => {
    const { studentId, subjectId, minScore, maxScore } = req.query;

    try {
        const scores = await Score.search({ studentId, subjectId, minScore, maxScore });
        res.status(200).json({ success: true, data: scores });
    } catch (error) {
        console.error('Error in searchScores:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to search scores' });
    }
};