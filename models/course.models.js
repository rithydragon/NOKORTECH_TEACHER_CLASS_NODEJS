import db from "../config/db.js";

class Course {
    // Fetch all course data
    static async getCourseData() {
        const query = `
        SELECT 
            ID AS Id,
            CODE AS Code,
            TITLE AS Title,
            TITLE_ENGLISH AS EnglishTitle,
            DESCRIPTION AS Description,
            COST AS Cost,
            STATUS AS Status,
            PAY_STATUS AS PayStatus,
            LEVEL AS Level,
            INSTRUCTOR_ID AS InstructorId,
            START_DATE AS StartDate,
            END_DATE AS EndDate,
            CREATED_BY AS CreatedBy,
            CREATED_DATE AS CreatedDate,
            UPDATED_BY AS UpdatedBy,
            UPDATED_DATE AS UpdatedDate
        FROM COURSES;
        `
        try {
            const [rows] = await db.execute(query);
            return rows;
        } catch (error) {
            console.error("Error fetching courses:", error);
            throw new Error("Failed to fetch course data.");
        }
    }
    
    static async getCourseDatabyId(Id) {
        const query = `SELECT * FROM COURSES WHERE ID = ?`;
    
        try {
            const [rows] = await db.execute(query, [Id]); // Pass [Id] as a parameter
            return rows.length > 0 ? rows[0] : null; // Return the first row if found, otherwise null
        } catch (error) {
            console.error("Error fetching course by ID:", error);
            throw new Error("Failed to fetch course data.");
        }
    }

    // static async create(course) {
    //     const sql = `INSERT INTO COURSES (CODE, TITLE, TITLE_ENGLISH, DESCRIPTION, COST,STATUS,PAY_STATUS,INSTRUCTOR_ID,CREATED_BY) VALUES (?, ?, ?, ?, ?,?, ?, ?, ?)`;
    //     const values = [course.Code, course.Title, course.TitleEnglish, course.Description,course.Cost,course.Status, course.Payment,course.Description,InstructorId,course.Description,course.CreatedBy,CreatedDate];
    //     const [result] = await db.query(sql, values);
    //     return result.insertId;
    //   }
    static async create(course) {
        const sql = `
            INSERT INTO COURSES 
                (CODE, TITLE, TITLE_ENGLISH, DESCRIPTION, COST, STATUS, PAY_STATUS, LEVEL, INSTRUCTOR_ID, START_DATE, END_DATE, CREATED_BY) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const values = [
            course.Code, 
            course.Title, 
            course.TitleEnglish, 
            course.Description, 
            course.Cost, 
            course.Status, 
            course.PayStatus, 
            course.Level, 
            course.InstructorId, 
            course.StartDate, 
            course.EndDate, 
            course.CreatedBy
        ];

        try {
            const [result] = await db.query(sql, values);
            return result.insertId;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

// CREATE TABLE COURSES (
//     ID INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
//     CODE VARCHAR(15) UNIQUE NOT NULL,
//     TITLE VARCHAR(200) NOT NULL,
//     TITLE_ENGLISH VARCHAR(200),
//     DESCRIPTION TEXT,
//     COST DECIMAL(10, 2),
//     STATUS ENUM('active', 'inactive') DEFAULT 'active',
//     PAY_STATUS ENUM('paid', 'unpaid') DEFAULT 'unpaid',
//     LEVEL ENUM('Beginner', 'Intermediate', 'Advanced'),
//     INSTRUCTOR_ID INT,
//     START_DATE DATE,
//     END_DATE DATE,
//     CREATED_BY INT NOT NULL,
//     CREATED_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     UPDATED_BY INT,
//     UPDATED_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     FOREIGN KEY (INSTRUCTOR_ID) REFERENCES USERS(ID) ON DELETE SET NULL,
//     FOREIGN KEY (CREATED_BY) REFERENCES USERS(ID) ON DELETE SET NULL,
//     FOREIGN KEY (UPDATED_BY) REFERENCES USERS(ID) ON DELETE SET NULL
// );

export default Course;
