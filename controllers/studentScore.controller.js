import StudentScore from '../models/studentScore.models.js';
import { RtyApiResponse } from '../utils/response.utils.js';

// Create Score
export const createStudentScore111 = async (req, res) => {
  const created_by = req.user.UserId;
  console.log('Received data:', req.body); // Debugging line
  try {
    const { StudentId, SubjectId, CourseId, ClassId, SemesterId, AcademicId, Score, Midterm, Final, Ranking, ExamDate, IsCreate, Note } = req.body;

    // Validate required fields
    if (!StudentId || !CourseId || Score === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields (StudentId, SubjectId, Score)'
      });
    }

    const insertId = await StudentScore.create(
      StudentId,
      SubjectId,
      CourseId,
      ClassId,
      SemesterId,
      AcademicId,
      Score,
      Midterm,
      Final,
      Ranking,
      ExamDate,
      IsCreate,
      Note || null,
      created_by
    );

    res.status(201).json({
      success: true,
      data: insertId
    });

  } catch (error) {
    console.error('Error creating score:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create score',
      message: error.message
    });
  }
}



export const createStudentScore = async (req, res) => {
  const created_by = req.user.UserId;
  const {
    StudentId, SubjectId, CourseId, ClassId, SemesterId, AcademicId,
    Score, Midterm, Final, Ranking, ExamDate, IsCreate, Note
  } = req.body;

  if (!StudentId || !CourseId || Score === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields (StudentId, SubjectId, Score)'
    });
  }

  try {
    const insertId = await StudentScore.create(
      StudentId,
      SubjectId,
      CourseId ?? null,
      ClassId ?? null,
      SemesterId ?? null,
      AcademicId ?? null,
      Score != null ? Number(Score) : null,
      Midterm != null ? Number(Midterm) : null,
      Final != null ? Number(Final) : null,
      Ranking ?? null,
      ExamDate ?? null,
      IsCreate === true || IsCreate === 'true',
      Note ?? null,
      created_by
    );

    res.status(201).json({ success: true, data: insertId });
  } catch (error) {
    console.error('Error creating score:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create score',
      message: error.message
    });
  }
};

// Update Score
export const updateStudentScore = async (req, res) => {
  const updated_by = req.user.UserId;
  const {
    Id, StudentId, SubjectId, CourseId, ClassId,
    SemesterId, AcademicId, Score, Midterm, Final,
    Ranking,ExamDate, Note
  } = req.body;

  if (!Id || !StudentId) return res.status(400).json({ error: 'Id and StudentId are required' });

  const score = Number(Score);
  const midterm = Midterm ? Number(Midterm) : null;
  const final = Final ? Number(Final) : null;

  if (isNaN(score)) return res.status(400).json({ error: 'Invalid Score' });
  if (Midterm && isNaN(midterm)) return res.status(400).json({ error: 'Invalid Midterm' });
  if (Final && isNaN(final)) return res.status(400).json({ error: 'Invalid Final' });

  try {
    const updated = await StudentScore.update(
      Id, StudentId, SubjectId, CourseId, ClassId,
      SemesterId, AcademicId, score, midterm, final,
      Ranking, ExamDate,Note, updated_by
    );

    if (!updated) return res.status(404).json({ error: 'Score not found' });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Delete (GET)
export const deleteStudentScore = async (req, res) => {
  const { Id: rowId } = req.query; // Get the authenticated user's ID
  console.log('Received data for delete:', rowId); // Debugging line
  try {
    const affectedRows = await StudentScore.delete(rowId);

    if (affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Score not found' });
    }

    res.json({ success: true, message: 'Score deleted successfully' });
  } catch (error) {
    console.error('Error in delete:', error);
    res.status(500).json({ success: false, error: 'Failed to delete score' });
  }
}


// Controller for bulk update of student scores
export const updateAllScores = async (req, res) => {
  const updated_by = req.user.UserId;
  const updates = req.body;

  if (!Array.isArray(updates)) {
    return res.status(400).json({ error: 'Expected an array of updates' });
  }

  try {
    const results = await Promise.all(
      updates.map(({
        Id, StudentId, SubjectId, CourseId, ClassId, SemesterId,
        AcademicId, Score, Midterm, Final, Ranking,ExamDate, Note
      }) =>
        StudentScore.update(
          Id,
          StudentId,
          SubjectId ?? null,
          CourseId ?? null,
          ClassId ?? null,
          SemesterId ?? null,
          AcademicId ?? null,
          Score != null ? Number(Score) : null,
          Midterm != null ? Number(Midterm) : null,
          Final != null ? Number(Final) : null,
          Ranking ?? null,
          ExamDate ?? null,
          Note ?? null,
          updated_by
        )
      )
    );

    const successCount = results.filter(Boolean).length;

    res.json({
      success: true,
      message: `Updated ${successCount} of ${updates.length} scores successfully`
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ error: 'Bulk update failed', message: error.message });
  }
};

// Controller for bulk create of student scores
export const createAllScores = async (req, res) => {
  const created_by = req.user?.UserId;
  const newScores = req.body;

  if (!Array.isArray(newScores)) {
    return res.status(400).json({ error: 'Expected an array of scores to create' });
  }

  try {
    const results = await Promise.all(
      newScores.map(({
        StudentId, SubjectId, CourseId, ClassId, SemesterId,
        AcademicId, Score, Midterm, Final, Ranking,ExamDate, Note,is_new
      }) =>
        StudentScore.create(
          StudentId,
          SubjectId ?? null,
          CourseId ?? null,
          ClassId ?? null,
          SemesterId ?? null,
          AcademicId ?? null,
          Score != null ? Number(Score) : null,
          Midterm != null ? Number(Midterm) : null,
          Final != null ? Number(Final) : null,
          Ranking ?? null,
          ExamDate ?? null,
          Note ?? '',
          is_new = true,
          created_by
        )
      )
    );

    const successCount = results.filter(Boolean).length;

    res.json({
      success: true,
      message: `Created ${successCount} of ${newScores.length} scores successfully`
    });
  } catch (error) {
    console.error('Bulk create error:', error);
    res.status(500).json({ error: 'Bulk create failed', message: error.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const results = await StudentScore.findAll();
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error in getAll:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch scores' });
  }
}

export const get = async (req, res) => {
  try {
    const { student_id, semester_id } = req.body;
    let results;

    if (student_id) {
      results = await StudentScore.findAllByStudent(student_id);
    } else if (semester_id) {
      results = await StudentScore.findAllBySemester(semester_id);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either student_id or semester_id is required'
      });
    }

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error in get:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch scores' });
  }
}
export const getAllByStudentId = async (req, res) => {
  console.log('Student ID from body ----:', req.body.StudentId);
  try {
    const { StudentId: studentId } = req.body;

    if (!studentId) {
      return RtyApiResponse(res, 400, false, 'StudentId is required', null);
    }

    const results = await StudentScore.findAllByStudent(studentId);

    if (!results || results.length === 0) {
      return RtyApiResponse(res, 404, false, 'No scores found for this student', []);
    }

    // Calculate total & average
    const totalScore = results.reduce((sum, score) => sum + (Number(score.Score) || 0), 0);
    const averageScore = results.length > 0 ? totalScore / results.length : 0;

    // Process each score
    const scoresWithDetails = results.map(score => ({
      ...score,
      Rank: calculateLetterGrade(score.Score),
      GPA: getPerformanceRating(score.Score),
      GradePoints: calculateGradePoints(score.Score),
      WeightedScore: score.Score * (score.CreditHours || 1),
    }));

    // Send clean array data
    return res.json({
      success: true,
      data: scoresWithDetails,
      summary: {
        totalScore,
        averageScore: averageScore.toFixed(2),
        numberOfSubjects: results.length,
      }
    });

  } catch (error) {
    console.error('Error in getAllByStudentId:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch scores' });
  }
};


export const getAllByStudentId111 = async (req, res) => {
  try {
    // Support both GET (query params) and POST (body)
    const studentId = req.method === 'GET' ? req.query.StudentId : req.body.StudentId;

    if (!studentId) {
      return RtyApiResponse(res, 400, false, 'Student ID is required', null);
    }

    // Convert to number and validate
    const numericStudentId = Number(studentId);
    if (isNaN(numericStudentId)) {
      return RtyApiResponse(res, 400, false, 'Invalid Student ID format', null);
    }

    console.log('Fetching scores for student ID:', numericStudentId); // Debugging

    // Get results from model
    const results = await StudentScore.findAllByStudent(numericStudentId);

    if (!results || results.length === 0) {
      return RtyApiResponse(res, 404, false, 'No scores found for this student', null);
    }

    console.log('Raw results from DB:', results); // Debugging

    // Calculate detailed analysis
    const analysis = calculateScoreAnalysis(results);

    // Enhance scores with additional calculations
    const scoresWithRanking = results.map(score => ({
      ...score,
      gradePoints: calculateGradePoints(score.Score),
      weightedScore: score.Score * (score.CreditHours || 1),
      Rank: calculateLetterGrade(score.Score),
      ...analysis
    }));

    return RtyApiResponse(res, 200, 'Scores fetched successfully', {
      studentId: numericStudentId,
      scores: scoresWithRanking,
      analysis
    });

  } catch (error) {
    console.error('Error in getAllByStudentId:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch scores',
      message: error.message
    });
  }
}

// Grade calculation helpers
function calculateLetterGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'E';
}

function calculateGradePoints(score) {
  if (score >= 90) return 4.0;
  if (score >= 80) return 3.0;
  if (score >= 70) return 2.0;
  if (score >= 60) return 1.0;
  return 0.0;
}

function getPerformanceRating(d) {
  let gpa = calculateGradePoints(d);
  if (gpa >= 3.5) return 'Excellent';
  if (gpa >= 3.0) return 'Very Good';
  if (gpa >= 2.5) return 'Good';
  if (gpa >= 2.0) return 'Satisfactory';
  return 'Needs Improvement';
}


// Calculate comprehensive score analysis
function calculateScoreAnalysis(scores) {
  // Group by semester if needed
  const bySemester = scores.reduce((acc, score) => {
    const semesterId = score.SemesterId;
    if (!acc[semesterId]) {
      acc[semesterId] = {
        semesterName: score.SemesterName,
        subjects: [],
        totalCreditHours: 0,
        totalWeightedScore: 0
      };
    }

    const creditHours = score.CreditHours || 1;
    const weightedScore = score.Score * creditHours;

    acc[semesterId].subjects.push({
      subjectName: score.SubjectName,
      score: score.Score,
      creditHours,
      weightedScore,
      grade: calculateLetterGrade(score.Score)
    });

    acc[semesterId].totalCreditHours += creditHours;
    acc[semesterId].totalWeightedScore += weightedScore;

    return acc;
  }, {});

  // Calculate overall totals
  const allCreditHours = Object.values(bySemester).reduce((sum, semester) => sum + semester.totalCreditHours, 0);
  const allWeightedScore = Object.values(bySemester).reduce((sum, semester) => sum + semester.totalWeightedScore, 0);
  const gpa = allCreditHours > 0 ? allWeightedScore / allCreditHours : 0;

  return {
    bySemester: Object.entries(bySemester).map(([id, data]) => ({
      semesterId: id,
      semesterName: data.semesterName,
      averageScore: data.totalCreditHours > 0 ? data.totalWeightedScore / data.totalCreditHours : 0,
      ...data
    })),
    overall: {
      totalSubjects: scores.length,
      totalCreditHours: allCreditHours,
      totalScore: allWeightedScore,
      averageScore: allCreditHours > 0 ? allWeightedScore / allCreditHours : 0,
      gpa: gpa,
      finalGrade: calculateLetterGrade(gpa),
      performanceRating: getPerformanceRating(gpa)
    }
  };
}


// Get ranked students with quartile information
// async function getRankingWithQuartiles(classId, semester, academicYear) 
export const studentScore = async (req, res) => {
  const { ClassId, SubjectId, AcademicId, SemesterId } = req.body;
  console.log('ClassId:', ClassId);
  console.log('SubjectId:', SubjectId);
  console.log('AcademicId:', AcademicId);
  console.log('SemesterId:', SemesterId);
  const students = await StudentScore.getRankedStudents(ClassId, SubjectId, AcademicId, SemesterId);
  const totalStudents = students.length;

  const q1Index = Math.floor(totalStudents * 0.25);
  const q2Index = Math.floor(totalStudents * 0.5);
  const q3Index = Math.floor(totalStudents * 0.75);

  const q1Score = students[q1Index]?.total_score || 0;
  const q2Score = students[q2Index]?.total_score || 0;
  const q3Score = students[q3Index]?.total_score || 0;

  return {
    quartiles: {
      q1: q1Score,
      q2: q2Score,
      q3: q3Score
    },
    students: students.map(student => {
      let quartile;
      if (student.total_score >= q3Score) quartile = 4;
      else if (student.total_score >= q2Score) quartile = 3;
      else if (student.total_score >= q1Score) quartile = 2;
      else quartile = 1;

      return {
        ...student,
        quartile
      };
    })
  };
}

export const studentScore11 = async (req, res) => {
  try {
    console.log("Fetching ranked students...");
    const { ClassId, SubjectId, AcademicId, SemesterId } = req.body;
    console.log('ClassId:', ClassId);
    console.log('SubjectId:', SubjectId);
    console.log('AcademicId:', AcademicId);
    console.log('SemesterId:', SemesterId);

    const students = await StudentScore.getRankedStudents(ClassId, SubjectId, AcademicId, SemesterId);
    console.log("Fetched students:", students.length);
    const totalStudents = students.length;

    const q1Index = Math.floor(totalStudents * 0.25);
    const q2Index = Math.floor(totalStudents * 0.5);
    const q3Index = Math.floor(totalStudents * 0.75);

    const q1Score = students[q1Index]?.total_score || 0;
    const q2Score = students[q2Index]?.total_score || 0;
    const q3Score = students[q3Index]?.total_score || 0;

    const updatePromises = students.map(async (student) => {
      let quartile;
      if (student.total_score >= q3Score) quartile = 4;
      else if (student.total_score >= q2Score) quartile = 3;
      else if (student.total_score >= q1Score) quartile = 2;
      else quartile = 1;

      // Assign grades based on quartile (or you can use score ranges instead)
      let grade;
      switch (quartile) {
        case 4: grade = 'A'; break;
        case 3: grade = 'B'; break;
        case 2: grade = 'C'; break;
        case 1: grade = 'D'; break;
        default: grade = 'E';
      }

      // Update grade (RANKING column) in STUDENT_SCORE for all this student's records
      await pool.query(
        `UPDATE STUDENT_SCORE 
         SET RANKING = ? 
         WHERE STUDENT_ID = ? 
           AND CLASS_ID = ? 
           AND SEMESTER = ? 
           AND ACADEMIC_ID = ?`,
        [grade, student.student_id, classId, semester_id, academic_id]
      );

      return {
        ...student,
        quartile,
        grade
      };
    });

    const updatedStudents = await Promise.all(updatePromises);

    return res.status(200).json({
      quartiles: { q1: q1Score, q2: q2Score, q3: q3Score },
      students: updatedStudents
    });
  } catch (error) {
    console.error('Error updating student scores:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
