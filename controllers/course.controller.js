import Course from "../models/course.models.js";
import { errorResponse,successResponse } from "../utils/response.utils.js"
export const getAllCourse = async (req, res) => {
    try {
        const courses = await Course.getCourseData();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ Message: error.message });
    }
};

export const getAllDataById = async (req, res) => {
    try {
        const courseId = req.params.id;
        const course= await Course.getCourseDatabyId(courseId);
        res.json(course);
        console.log(course)
        if (!course) {
            return errorResponse(res, "Class not found", 404);
        }
    } catch (error) {
        errorResponse(res, error.Message)
    }
}

export const createCourse = async (req, res) => {
    const createdBy = req.user.UserId; // Get the authenticated user's ID
    console.log('User ID:', createdBy);
    try {
        if (Action !== "CREATE") {
            return res.status(403).json({ message: "Forbidden: Not authorized to create a course" });
        }
        const { UserId, Role ,Permission,Action } = req.user; // Get user details from authentication middleware
        console.log('User ID:', UserId);

        const {
            Code,
            Title,
            TitleEnglish,
            Description,
            Cost,
            Status,
            PayStatus,
            Level,
            InstructorId,
            StartDate,
            EndDate
        } = req.body;

        // Check if the InstructorId belongs to a user with the role 'Instructor'
        const [instructor] = await db.query(
            "SELECT ID FROM USERS WHERE ID = ? AND ROLE = 'Instructor'", 
            [InstructorId]
        );

        if (instructor.length === 0) {
            return errorResponse(res, "Invalid Instructor ID. User must have 'Instructor' role.");
        }

        // Create the course
        const courseId = await Course.create({
            Code,
            Title,
            TitleEnglish,
            Description,
            Cost,
            Status,
            PayStatus,
            Level,
            InstructorId,
            StartDate,
            EndDate,
            CreatedBy: UserId, // Set CreatedBy from authenticated user
        });

        console.log(`Course ID ${courseId} created successfully!`);
        return successResponse(res, "Course created successfully", { courseId });

    } catch (error) {
        console.error("Error creating course:", error);
        return errorResponse(res, error.message);
    }
};


// export const createCourse = async (req, res) => {
//     try {
//         const courseData = req.body;
//         const courseId = await Course.create(courseData);
//         if(courseId) console.log(courseId, "Successfully!")
//         successResponse(res, "Class created successfully", { courseId });

//     } catch (error) {
//         errorResponse(res, error.message);
//     }
// };


