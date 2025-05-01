import db from "../config/db.js";

class Class {
    // Create a new class
    static async create(classData) {
        const [result] = await db.execute(
            `INSERT INTO CLASS (
                CODE, COURSE_ID, INSTRUCTOR_ID, ROOM, SEMESTER, YEAR, TIME, 
                SCHEDULE, MAX_ENROLLMENT, STATUS, CREATED_BY
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                classData.code,
                classData.courseId,
                classData.instructorId,
                classData.room,
                classData.semester,
                classData.year,
                classData.time,
                classData.schedule,
                classData.maxEnrollment,
                classData.status,
                classData.createdBy,
            ]
        );
        return result.insertId;
    }

    // SELECT cl.ID, cl.CODE, cl.ROOM, cl.YEAR, cl.SEMESTER, c.TITLE AS COURSE_NAME, u.NAME AS INSTRUCTOR_NAME
    // FROM CLASS cl
    // JOIN COURSES c ON cl.COURSE_ID = c.ID
    // LEFT JOIN USERS u ON cl.INSTRUCTOR_ID = u.ID;

    // Get all classes
    static async findAll() {
        const queryJoinAtClass = `
            SELECT 
            cl.ID AS Id,
            cl.CODE AS Code ,
            cl.ROOM AS Room,
            cl.SEMESTER AS Semester,
            cl.YEAR AS Year,
            cl.TIME AS Time,
            cl.SCHEDULE AS Schedule,
            cl.MAX_ENROLLMENT AS MaxEnrollment,
            cl.STATUS AS Status,
            cl.CREATED_DATE AS CreatedDate,
            cl.UPDATED_DATE AS UpdatedDate,

            -- Course Details
            c.CODE AS CourseCode,
            c.TITLE AS CourseTitle,
            c.TITLE AS CourseTitleEnglish,
            c.STATUS AS CourseStatus,

            -- Instructor Details
            creator.NAME AS InstructorName,
            creator.NAME_ENGLISH AS InstructorNameEnglish,

            -- Created By (User who created the class)
            creator.NAME AS CreatedBy

        FROM CLASS cl
        -- Join with Courses Table
        LEFT JOIN COURSES c ON cl.COURSE_ID = c.ID

        -- Join with Users Table for Created By
        LEFT JOIN USERS creator ON cl.CREATED_BY = creator.ID;

    `
        const [rows] = await db.execute(queryJoinAtClass);
        return rows;
    }

    // static async teachingData() {
    //     // const query = 
    //     // `
    //     // SELECT 
    //     //     t.ID AS TEACHING_ID,

    //     //     -- Class Details
    //     //     cl.ID AS CLASS_ID,
    //     //     cl.CODE AS CLASS_CODE,
    //     //     cl.ROOM,
    //     //     cl.SEMESTER,
    //     //     cl.YEAR,
    //     //     cl.TIME,
    //     //     cl.SCHEDULE,

    //     //     -- Course Details
    //     //     c.TITLE AS COURSE_TITLE,
    //     //     c.LEVEL AS COURSE_LEVEL,

    //     //     -- Instructor Details
    //     //     i.NAME AS INSTRUCTOR_NAME,

    //     //     -- Enrolled Students
    //     //     s.NAME AS STUDENT_NAME,
    //     //     s.EMAIL AS STUDENT_EMAIL,

    //     //     -- Created By
    //     //     creator.NAME AS CREATED_BY_NAME

    //     // FROM TEACHING t
    //     // LEFT JOIN CLASS cl ON t.CLASS_ID = cl.ID
    //     // LEFT JOIN COURSES c ON cl.COURSE_ID = c.ID
    //     // LEFT JOIN USERS i ON t.INSTRUCTOR_ID = i.ID
    //     // LEFT JOIN USERS creator ON cl.CREATED_BY = creator.ID
    //     // -- LEFT JOIN CLASS_STUDENTS cs ON cl.ID = cs.CLASS_ID
    //     // LEFT JOIN USERS s ON cs.STUDENT_ID = s.ID;
    //     // `
    //     const query = `

    //         -- Query 
    //         SELECT 
    //             t.ID AS TEACHING_ID,

    //             -- Class Information
    //             cl.ID AS CLASS_ID,
    //             cl.CODE AS CLASS_CODE,
    //             cl.ROOM,
    //             cl.SEMESTER,
    //             cl.YEAR,
    //             cl.TIME,
    //             cl.SCHEDULE,
    //             cl.Batch,

    //             -- Course Information (related through CLASS)
    //             c.ID AS COURSE_ID,
    //             c.CODE AS COURSE_CODE,
    //             c.TITLE AS COURSE_TITLE,
    //             c.TITLE_ENGLISH AS COURSE_TITLE_EN,
    //             c.DESCRIPTION AS COURSE_DESCRIPTION,
    //             c.COST AS COURSE_COST,
    //             c.STATUS AS COURSE_STATUS,
    //             c.PAY_STATUS AS COURSE_PAY_STATUS,
    //             c.LEVEL AS COURSE_LEVEL,
    //             c.START_DATE AS COURSE_START_DATE,
    //             c.END_DATE AS COURSE_END_DATE,

    //             -- Instructor Information
    //             instructor.ID AS INSTRUCTOR_ID,
    //             instructor.NAME AS INSTRUCTOR_NAME,
    //             instructor.NAME_ENGLISH AS INSTRUCTOR_NAME,
    //             instructor.EMAIL AS INSTRUCTOR_EMAIL

    //         FROM TEACHING t
    //         LEFT JOIN CLASS cl ON t.CLASS_ID = cl.ID  -- Join CLASS to relate with COURSE
    //         LEFT JOIN COURSES c ON cl.COURSE_ID = c.ID  -- Join COURSES via CLASS
    //         LEFT JOIN USERS instructor ON t.INSTRUCTOR_ID = instructor.ID;

    //     `
    //     const [ rowData ] = await db.execute((query))
    //     return rowData

    // }
    // SELECT DISTINCT u.ID, u.NAME
    // FROM USERS u
    // INNER JOIN TEACHING t ON u.ID = t.INSTRUCTOR_ID
    // INNER JOIN CLASS c ON t.CLASS_ID = c.ID
    // static async teachingData(filters) {
    //     let query = `
    //         SELECT 
    //             t.ID AS TEACHING_ID,
    
    //             -- Class Information
    //             cl.ID AS ClassId,
    //             cl.CODE AS ClassCode,
    //             cl.ROOM AS Room,
    //             cl.SEMESTER AS Semester,
    //             cl.YEAR AS Year,
    //             cl.TIME AS Time,
    //             cl.BATCH AS Batch,
    
    //             -- Course Information (related through CLASS)
    //             c.ID AS CourseId,
    //             c.CODE AS CourseCode,
    //             c.TITLE AS CourseTitle,
    //             c.TITLE_ENGLISH AS CourseTitleEnglish,
    
    //             -- Instructor Information
    //             instructor.ID AS InstructorId,
    //             instructor.NAME AS InstructorName,
    //             instructor.NAME_ENGLISH AS InstructorNameEnglish
    //         FROM TEACHING t
    //         LEFT JOIN CLASS cl ON t.CLASS_ID = cl.ID  -- Join CLASS to relate with COURSE
    //         LEFT JOIN COURSES c ON cl.COURSE_ID = c.ID  -- Join COURSES via CLASS
    //         LEFT JOIN USERS instructor ON t.INSTRUCTOR_ID = instructor.ID  -- Join USERS to get Instructor details
    //         WHERE 1 = 1
    //     `;

    //     // Parameters array
    //     const queryParams = [];

    //     // Apply filters dynamically
    //     if (filters.InstructorId) {
    //         query += ` AND instructor.ID = ?`;
    //         queryParams.push(filters.InstructorId);
    //     }

    //     if (filters.CourseId) {
    //         query += ` AND c.ID = ?`;
    //         queryParams.push(filters.CourseId);
    //     }

    //     if (filters.Time) {
    //         query += ` AND cl.TIME = ?`;
    //         queryParams.push(filters.Time);
    //     }

    //     if (filters.Batch) {
    //         query += ` AND cl.BATCH = ?`;
    //         queryParams.push(filters.Batch);
    //     }

    //     // Execute query
    //     const [rowData] = await db.execute(query, queryParams);
    //     return rowData;
    // }
    static async teachingData(filters) {
        let query = `
            SELECT 
                t.ID AS TEACHING_ID,
                -- Class Information
                cl.ID AS ClassId,
                cl.CODE AS ClassCode,
                cl.ROOM AS Room,
                cl.SEMESTER AS Semester,
                cl.YEAR AS Year,
                cl.TIME AS Time,
                cl.BATCH AS Batch,
    
                -- Course Information
                c.ID AS CourseId,
                c.CODE AS CourseCode,
                c.TITLE AS CourseTitle,
                c.TITLE_ENGLISH AS CourseTitleEnglish,
    
                -- Instructor Information (Automatically filtered)
                instructor.ID AS InstructorId,
                instructor.NAME AS InstructorName,
                instructor.NAME_ENGLISH AS InstructorNameEnglish
            FROM TEACHING t
            LEFT JOIN CLASS cl ON t.CLASS_ID = cl.ID  
            LEFT JOIN COURSES c ON cl.COURSE_ID = c.ID  
            LEFT JOIN USERS instructor ON t.INSTRUCTOR_ID = instructor.ID
            WHERE 1 = 1
        `;
    
        const queryParams = [];
    
        // Auto-filter by Instructor ID from TEACHING
        if (filters.InstructorId) {
            query += ` AND t.INSTRUCTOR_ID = ?`;
            queryParams.push(filters.InstructorId);
        }
    
        if (filters.CourseId) {
            query += ` AND c.ID = ?`;
            queryParams.push(filters.CourseId);
        }
    
        if (filters.Time) {
            query += ` AND cl.TIME = ?`;
            queryParams.push(filters.Time);
        }
    
        if (filters.Batch) {
            query += ` AND cl.BATCH = ?`;
            queryParams.push(filters.Batch);
        }
    
        // Execute query
        const [rowData] = await db.execute(query, queryParams);
        return rowData;
    }
    
    // Get a class by ID
    static async findById(id) {
        const [rows] = await db.execute("SELECT * FROM CLASS WHERE ID = ?", [id]);
        return rows[0];
    }

        static async create(classData) {
            const [result] = await db.execute(
                `INSERT INTO CLASS (
                    CODE, COURSE_ID, INSTRUCTOR_ID, ROOM, SEMESTER, YEAR, TIME, 
                    SCHEDULE, MAX_ENROLLMENT, STATUS, CREATED_BY
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    classData.code,
                    classData.courseId,
                    classData.instructorId,
                    classData.room,
                    classData.semester,
                    classData.year,
                    classData.time,
                    classData.schedule,
                    classData.maxEnrollment,
                    classData.status,
                    classData.createdBy, // CreatedBy field
                ]
            );
            return result.insertId;
        }
    
        static async update(id, classData) {
            await db.execute(
                `UPDATE CLASS SET 
                    CODE = ?, COURSE_ID = ?, INSTRUCTOR_ID = ?, ROOM = ?, SEMESTER = ?, 
                    YEAR = ?, TIME = ?, SCHEDULE = ?, MAX_ENROLLMENT = ?, STATUS = ?, 
                    UPDATED_BY = ?
                 WHERE ID = ?`,
                [
                    classData.code,
                    classData.courseId,
                    classData.instructorId,
                    classData.room,
                    classData.semester,
                    classData.year,
                    classData.time,
                    classData.schedule,
                    classData.maxEnrollment,
                    classData.status,
                    classData.updatedBy, // UpdatedBy field
                    id,
                ]
            );
        }

    // // Update a class
    // static async update(id, classData) {
    //     await db.execute(
    //         `UPDATE CLASS SET 
    //             CODE = ?, COURSE_ID = ?, INSTRUCTOR_ID = ?, ROOM = ?, SEMESTER = ?, 
    //             YEAR = ?, TIME = ?, SCHEDULE = ?, MAX_ENROLLMENT = ?, STATUS = ?, 
    //             UPDATED_BY = ?
    //          WHERE ID = ?`,
    //         [
    //             classData.code,
    //             classData.courseId,
    //             classData.instructorId,
    //             classData.room,
    //             classData.semester,
    //             classData.year,
    //             classData.time,
    //             classData.schedule,
    //             classData.maxEnrollment,
    //             classData.status,
    //             classData.updatedBy,
    //             id,
    //         ]
    //     );
    // }

    // Delete a class
    static async delete(id) {
        await db.execute("DELETE FROM CLASS WHERE ID = ?", [id]);
    }
}

export default Class;


// import db from "../config/db.js";

// class Class {
//     // Create a new class
//     static async create(classData) {
//         const [result] = await db.execute(
//             `INSERT INTO CLASS (
//                 CODE, COURSE_ID, INSTRUCTOR_ID, ROOM, SEMESTER, YEAR, TIME,
//                 SCHEDULE, MAX_ENROLLMENT, STATUS, CREATED_BY
//             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//             [
//                 classData.CODE,
//                 classData.COURSE_ID,
//                 classData.INSTRUCTOR_ID,
//                 classData.ROOM,
//                 classData.SEMESTER,
//                 classData.YEAR,
//                 classData.TIME,
//                 classData.SCHEDULE,
//                 classData.MAX_ENROLLMENT,
//                 classData.STATUS,
//                 classData.CREATED_BY,
//             ]
//         );
//         return result.insertId;
//     }

//     // Get all classes
//     static async findAll() {
//         const [rows] = await db.execute("SELECT * FROM CLASS");
//         return rows;
//     }

//     // Get a class by ID
//     static async findById(id) {
//         const [rows] = await db.execute("SELECT * FROM CLASS WHERE ID = ?", [id]);
//         return rows[0];
//     }

//     // Update a class
//     static async update(id, classData) {
//         await db.execute(
//             `UPDATE CLASS SET
//                 CODE = ?, COURSE_ID = ?, INSTRUCTOR_ID = ?, ROOM = ?, SEMESTER = ?,
//                 YEAR = ?, TIME = ?, SCHEDULE = ?, MAX_ENROLLMENT = ?, STATUS = ?,
//                 UPDATED_BY = ?
//              WHERE ID = ?`,
//             [
//                 classData.CODE,
//                 classData.COURSE_ID,
//                 classData.INSTRUCTOR_ID,
//                 classData.ROOM,
//                 classData.SEMESTER,
//                 classData.YEAR,
//                 classData.TIME,
//                 classData.SCHEDULE,
//                 classData.MAX_ENROLLMENT,
//                 classData.STATUS,
//                 classData.UPDATED_BY,
//                 id,
//             ]
//         );
//     }

//     // Delete a class
//     static async delete(id) {
//         await db.execute("DELETE FROM CLASS WHERE ID = ?", [id]);
//     }
// }

// export default Class;