import Student from "../models/student.models.js";
import Score from "../models/score.models.js";
import fs from 'fs';
import db from "../config/db.js";

// ✅ Get all students with pagination, filtering, and sorting
// ✅ Get all students with dynamic pagination, filtering, and sorting
export const getAllStudents11 = async (req, res) => {
  try {
    // Support both GET (query params) and POST (body)
    const params = req.method === 'GET' ? req.query : req.body;

    // Default values and destructuring with validation
    const {
      page = 1,
      limit = 10, // Default limit of 10, but can be overridden
      search = "",
      sort = "CREATED_DATE", // Default sort field
      order = "DESC" // Default sort order
    } = params;

    // Configuration constants
    const MAX_LIMIT = 100; // Prevent excessively large queries
    const VALID_SORT_COLUMNS = new Set([
      "CREATED_DATE",
      "NAME", 
      "EMAIL",
      "STUDENT_CODE",
      "DOB"
    ]);
    const VALID_ORDER_VALUES = new Set(["ASC", "DESC"]);

    // Sanitize and validate inputs
    const sanitizedPage = Math.max(1, parseInt(page)) || 1;
    const sanitizedLimit = Math.min(
      Math.max(1, parseInt(limit)) || 10, 
      MAX_LIMIT
    );
    const sanitizedSearch = typeof search === 'string' ? search.trim() : "";
    const sanitizedSort = VALID_SORT_COLUMNS.has(sort.toUpperCase()) 
      ? sort.toUpperCase() 
      : "CREATED_DATE";
    const sanitizedOrder = VALID_ORDER_VALUES.has(order.toUpperCase())
      ? order.toUpperCase()
      : "DESC";

    // Get results from model
    const students = await Student.getAll({
      page: sanitizedPage,
      limit: sanitizedLimit,
      search: sanitizedSearch,
      sort: `s.${sanitizedSort}`, // Add table alias
      order: sanitizedOrder,
    });

    // Enhanced response with pagination metadata
    res.json({
      success: true,
      data: students.data || [],
      pagination: {
        currentPage: sanitizedPage,
        perPage: sanitizedLimit,
        totalItems: students.total || 0,
        totalPages: Math.ceil((students.total || 0) / sanitizedLimit)
      },
      sort: {
        by: sanitizedSort,
        order: sanitizedOrder
      },
      search: sanitizedSearch
    });

  } catch (err) {
    console.error('Error in getAllStudents:', err);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: err.message 
    });
  }
};

// ✅ Get student by ID
export const getAllStudents118 = async (req, res) => {
  const studentId  = req.params.id; // Get studentId from the request body
  try {
    const student = await Student.getAllStudents();
    // const student = await Student.getById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.getAllStudents();
    
    res.json(
      students.map(student => ({
        ...student,
        // Add calculated average if needed
        averageScore: student.ScoreCount > 0 
          ? student.OverallTotal / student.ScoreCount 
          : 0
      }))
    );
    
  } catch (err) {
    console.error('Error fetching students with scores:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch student data',
      message: err.message 
    });
  }
};

// ✅ Create a new student
export const createStudent = async (req, res) => {
  try {
    const studentId = await Student.create(req.body);
    res.status(201).json({ message: "Student created", id: studentId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update student
export const updateStudent = async (req, res) => {
  try {
    await Student.update(req.params.id, req.body);
    res.json({ message: "Student updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete student
export const deleteStudent = async (req, res) => {
  try {
    await Student.delete(req.params.id);
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Bulk delete students by IDs
export const bulkDeleteStudents = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ message: "No student IDs provided" });

    await Student.bulkDelete(ids);
    res.json({ message: `${ids.length} students deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Count total students
export const countStudents = async (req, res) => {
  try {
    const total = await Student.count();
    res.json({ total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export async function create(req, res) {
  try {
    const studentId = await Student.create(req.body);
    res.status(201).json({ id: studentId, message: 'Student created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getById(req, res) {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function update(req, res) {
  try {
    await Student.update(req.params.id, req.body);
    res.status(200).json({ message: 'Student updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteStudents(req, res) {
  try {
    await Student.delete(req.params.id);
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}



export const getAllStudentData =  async (req, res, next) => {
  try {
      const students = await Student.getAll11();
      const studentsWithScores = await Promise.all(
          students.map(async student => {
              const scores = await Score.getByStudentId(student.ID);
              return { ...student, scores };
          })
      );
      res.json(studentsWithScores);
  } catch (error) {
      next(error);
  }
}

export const getStudentById =  async (req, res, next) => {
  console.log('getStudentById called with req.query:', req);
  const id = req.query.Id || req.body.Id; // Support both GET (query) and POST (body)
  if (!id) {
      return res.status(400).json({ message: 'Student ID is required' });
  }
  try {
      const student = await Student.getById(id);
      if (!student) {
          return res.status(404).json({ message: 'Student not found' });
      }
      const scores = await Score.getByStudentId(student.ID);
      res.json({ ...student, scores });
  } catch (error) {
      next(error);
  }
}

export const  importStudents = async(req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, error: 'No file uploaded' });
            }

            // Parse Excel data
            const importData = await ExcelHelper.parseStudentData(req.file.path);
            
            // Process each student and their scores
            for (const { student, scores } of importData) {
                try {
                    // Check if student exists
                    let studentId;
                    const [existing] = await db.query(
                        'SELECT ID FROM STUDENTS WHERE CODE = ? OR EMAIL = ?',
                        [student.CODE, student.EMAIL]
                    );

                    if (existing.length > 0) {
                        studentId = existing[0].ID;
                    } else {
                      // Create new student
                      const [result] = await db.query('INSERT INTO STUDENTS SET ?', student);
                      studentId = result.insertId;
                    }

                    // Process scores
                    const scoreRecords = await Promise.all(
                        scores.map(async score => {
                            const [subject] = await db.query(
                                'SELECT ID FROM SUBJECTS WHERE CODE = ?',
                                [score.subject_code]
                            );
                            if (subject.length > 0) {
                                return [
                                    studentId,
                                    subject[0].ID,
                                    score.score,
                                    score.description,
                                    '',
                                    score.created_by
                                ];
                            }
                            return null;
                        })
                    ).then(results => results.filter(Boolean));

                    // Bulk insert scores
                    if (scoreRecords.length > 0) {
                        await db.query(
                            `INSERT INTO SCORES 
                            (STUDENT_ID, SUBJECT_ID, SCORE, DESCRIPTION, NOTE, CREATED_BY) 
                            VALUES ?`,
                            [scoreRecords]
                        );
                    }
                } catch (error) {
                    console.error(`Error processing student ${student.CODE}:`, error);
                }
            }

            // Clean up uploaded file
            fs.unlinkSync(req.file.path);

            res.json({ success: true, message: 'Data imported successfully' });
        } catch (error) {
            next(error);
        }
    }
  
