import Class from "../models/class.models.js";
import { successResponse, errorResponse } from "../utils/response.utils.js";

// Create a new class
export const createClass = async (req, res) => {
    const createdBy = req.user.UserId; // Get the authenticated user's ID
    console.log('User ID:', createdBy);
    try {
        const classData = req.body;
        const classId = await Class.create(classData);
        successResponse(res, "Class created successfully", { classId });

    } catch (error) {
        errorResponse(res, error.message);
    }
};

// Get all classes
export const getAllClasses = async (req, res) => {
    try {
        const classes = await Class.findAll();
        successResponse(res, "Classes fetched successfully!", classes);
        res.json(classes);
    } catch (error) {
        errorResponse(res, error.message);
    }
};

// export const getTeachingClass = async (req, res ) => {
//     try {
//         const teaching = await Class.teachingData();
//         // successResponse(res,"Data get successfully!",teaching)
//         res.json(teaching);
//     } catch (error) {
//         errorResponse(res, error.message)
//     }
// }

// export const getTeachingClass = {
//     async getTeachingData(req, res) {
//         try {
//             const { instructorId } = req.body;

//             if (!instructorId) {
//                 return res.status(400).json({ error: 'Instructor ID is required' });
//             }

//             const data = await TeachingModel.teachingData(instructorId);
//             return res.status(200).json(data);
//         } catch (error) {
//             console.error('Error fetching teaching data:', error);
//             return res.status(500).json({ error: 'Internal Server Error' });
//         }
//     }
// };

// export const getTeachingClass = async (req, res) => {
//     try {
//         const { InstructorId, CourseId, Time, Batch } = req.body;

//         // Check if at least one filter is provided
//         if (!InstructorId && !CourseId && !Time && !Batch) {
//             return res.status(400).json({ error: 'At least one filter is required' });
//         }

//         // Prepare filter object
//         const filters = { InstructorId, CourseId, Time, Batch };

//         // Fetch filtered teaching data
//         const data = await Class.teachingData(filters);
//         console.log('Filtered Data:', data);

//         return res.status(200).json(data);
//     } catch (error) {
//         console.error('Error fetching teaching data:', error);
//         return res.status(500).json({ error: 'Internal Server Error' });
//     }
// };
export const getTeachingClass = async (req, res) => {
    try {
        const { InstructorId, CourseId, Time, Batch } = req.body;

        // Prepare filter object
        const filters = { InstructorId, CourseId, Time, Batch };

        // Fetch filtered teaching data
        const data = await Class.teachingData(filters);
        console.log('Filtered Data:', data);

        return res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching teaching data:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getAll = async (req, res) => {
    try {
        const assignments = await Class.findAll();
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Get a class by ID
export const getClassById = async (req, res) => {
    try {
        const classId = req.params.id;
        const classData = await Class.findById(classId);
        if (!classData) {
            return errorResponse(res, "Class not found", 404);
        }
        successResponse(res, "Class fetched successfully", classData);
    } catch (error) {
        errorResponse(res, error.message);
    }
};

// Update a class
export const updateClass = async (req, res) => {
    try {
        const classId = req.params.id;
        const classData = req.body;
        await Class.update(classId, classData);
        successResponse(res, "Class updated successfully");
    } catch (error) {
        errorResponse(res, error.message);
    }
};

// Delete a class
export const deleteClass = async (req, res) => {
    try {
        const classId = req.params.id;
        await Class.delete(classId);
        successResponse(res, "Class deleted successfully");
    } catch (error) {
        errorResponse(res, error.message);
    }
};