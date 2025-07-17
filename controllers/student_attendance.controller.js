import StudentAttendanceModel from '../models/student_attendance.models.js';
import Student from '../models/student.models.js'
class StudentAttendanceController {
  // static async createAttendance(req, res) {
  //   try {
  //     const attendanceData = {
  //       ...req.body,
  //       RECORDED_BY: req.user.UserId // Assuming you have user authentication
  //     };
  //     const id = await StudentAttendanceModel.create(attendanceData);
  //     res.status(201).json({ id, message: 'Attendance recorded successfully' });
  //   } catch (error) {
  //     res.status(400).json({ error: error.message });
  //   }
  // }
  // // const { studentId, date, typeId, notes } = req.body;

  // // await pool.query(
  // //   `INSERT INTO student_attendance (student_id, attendance_date, attendance_type_id, notes) VALUES (?, ?, ?, ?)`,
  // //   [studentId, date, typeId, notes]
  // // );


  // static async updateAttendance(req, res) {
  //   try {
  //     const affectedRows = await StudentAttendanceModel.update(req.body.Id, req.body);
  //     if (affectedRows === 0) {
  //       return res.status(404).json({ message: 'Attendance record not found' });
  //     }
  //     res.json({ message: 'Attendance updated successfully' });
  //   } catch (error) {
  //     res.status(400).json({ error: error.message });
  //   }
  // }
  // controllers/studentAttendance.controller.js

  static createAttendance = async (req, res) => {
    try {
      const { studentId, scheduleId, date, typeId, notes, recordedBy } = req.body;

      // Validate required fields
      if (!studentId || !date || !typeId) {
        return res.status(400).json({ error: 'Missing required fields (studentId, date, typeId)' });
      }

      // Check for existing attendance
      const exists = await StudentAttendanceModel.checkExistingAttendance(studentId, scheduleId, date);
      if (exists) {
        return res.status(409).json({ error: 'Attendance record already exists for this student on this date' });
      }

      const attendanceData = {
        student_id: studentId,
        schedule_id: scheduleId || null,
        attendance_date: date,
        attendance_type_id: typeId,
        notes: notes || null,
        recorded_by: recordedBy || null
      };

      const insertedId = await StudentAttendanceModel.createStudentAttendance(attendanceData);

      res.status(201).json({
        success: true,
        id: insertedId,
        message: 'Attendance record created successfully'
      });
    } catch (error) {
      console.error('Create error:', error);
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ error: 'Invalid reference (student, schedule, or type not found)' });
      }
      res.status(500).json({ error: 'Failed to create student attendance' });
    }
  };

  static updateStudentAttendanceType = async (req, res) => {
    try {
      const { AttendanceTypeId, StudentId, ScheduleId, Date, TypeId, Notes } = req.body;
      console.log("Update Student Attendance Type Body: ", req.body);
      const UpdatedBy = req.user.UserId || null; // Assuming you have user authentication

      // Validate required fields
      if (!AttendanceTypeId) {
        return res.status(400).json({ error: 'AttendanceTypeId is required' });
      }

      const attendanceData = {
        student_id: StudentId,
        schedule_id: ScheduleId || null,
        attendance_date: Date,
        notes: Notes || null,
      };

      const affectedRows = await StudentAttendanceModel.updateStudentAttendanceType(AttendanceTypeId, StudentId, attendanceData,UpdatedBy);

      if (affectedRows === 0) {
        return res.status(404).json({ error: 'Attendance record not found' });
      }

      res.status(200).json({
        success: true,
        updated: affectedRows,
        message: 'Attendance record updated successfully'
      });
    } catch (error) {
      console.error('Update error:', error);
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ error: 'Invalid reference (student, schedule, or type not found)' });
      }
      res.status(500).json({ error: 'Failed to update student attendance' });
    }
  };

  static updateAttendance = async (req, res) => {
    try {
      const { id, studentId, scheduleId, date, typeId, notes, updatedBy } = req.body;

      // Validate required fields
      if (!id) {
        return res.status(400).json({ error: 'Attendance record ID is required' });
      }

      const attendanceData = {
        student_id: studentId,
        schedule_id: scheduleId || null,
        attendance_date: date,
        attendance_type_id: typeId,
        notes: notes || null,
        updated_by: updatedBy || null
      };

      const affectedRows = await StudentAttendanceModel.updateAttendance(id, attendanceData);

      if (affectedRows === 0) {
        return res.status(404).json({ error: 'Attendance record not found' });
      }

      res.status(200).json({
        success: true,
        updated: affectedRows,
        message: 'Attendance record updated successfully'
      });
    } catch (error) {
      console.error('Update error:', error);
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ error: 'Invalid reference (student, schedule, or type not found)' });
      }
      res.status(500).json({ error: 'Failed to update student attendance' });
    }
  };

  // Controller
  static async updateStudentAttendance2(req, res) {
    const { id, studentId, typeId, notes, scheduleId, attendanceDate } = req.body;
    if (!id) return res.status(400).json({ error: "Attendance ID is required for update" });

    try {
      await pool.query(`
      UPDATE STUDENT_ATTENDANCE
      SET STUDENT_ID = ?, ATTENDANCE_TYPE_ID = ?, NOTES = ?, SCHEDULE_ID = ?, ATTENDANCE_DATE = ?
      WHERE ID = ?
    `, [studentId, typeId, notes, scheduleId, attendanceDate, id]);

      res.json({ message: "Attendance updated successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error during update" });
    }
  }

  static async deleteAttendance(req, res) {
    const { Id } = req.query
    console.log("Student attendance id delete : :", Id)
    try {
      const affectedRows = await StudentAttendanceModel.delete(Id);
      if (affectedRows === 0) {
        return res.status(404).json({ message: 'Attendance record not found' });
      }
      res.json({ message: 'Attendance deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAttendanceByStudent(req, res) {
    try {
      const attendance = await StudentAttendanceModel.findByStudent(req.params.studentId);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAttendanceByDate(req, res) {
    try {
      const attendance = await StudentAttendanceModel.findAttendanceType();
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAttendanceType(req, res) {
    try {
      const attendance = await StudentAttendanceModel.findAttendanceType();
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get student comprehensive information
  static async getStudentComprehensiveInfo(req, res) {
    try {
      const studentId = req.body.StudentId;

      const basicInfo = await StudentAttendanceModel.getStudentBasicInfo(studentId);
      if (!basicInfo) {
        return res.status(404).json({ message: 'Student not found' });
      }

      const attendanceSummary = await StudentAttendanceModel.getStudentAttendanceSummary(studentId);

      res.json({
        StudentInfo: basicInfo,
        AttendanceSummary: attendanceSummary
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get daily attendance
  // Get daily attendance
  static async getDailyAttendance(req, res) {
    console.log("Daily Attendance Record Body: ", req.body);

    try {
      // Destructure and fallback if not provided
      const { date } = req.body;
      const attendanceDate = date || new Date().toISOString().split('T')[0];

      const attendance = await StudentAttendanceModel.getDailyAttendance(attendanceDate);

      res.json({
        attendance,
        attendanceDate,
      });
    } catch (error) {
      console.error("Error getting daily attendance:", error.message);
      res.status(500).json({ error: error.message });
    }
  }

  // Get attendance by date range
  static async getAttendanceByDateRangev1(req, res) {
    console.log("Att range by query : ", req.query)
    console.log("Att range by body : ", req.body)
    try {
      const { StartDate, endDate } = req.query;

      if (!StartDate || !endDate) {
        return res.status(400).json({ message: 'Both StartDate and endDate parameters are required' });
      }

      const attendance = await StudentAttendanceModel.getAttendanceByDateRange(StartDate, endDate);

      res.json({
        StartDate: StartDate,
        EndDate: endDate,
        AttendanceRecords: attendance
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAttendanceByDateRange1(req, res) {
    console.log("Get att by date range --------- : ", req.body)
    try {
      const { StartDate, EndDate, ClassId, Status } = req.body;
      console.log("Start Date  : ", StartDate)
      console.log("End Date  : ", EndDate)

      // if (!StartDate || EndDate) {
      //   return res.status(400).json({ 
      //     success: false,
      //     message: 'Both StartDate and endDate parameters are required',
      //     code: 'MISSING_DATE_RANGE'
      //   });
      // }

      // // Validate date format (optional)
      // if (StartDate || !isValidDate(StartDate)) {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'Invalid date format. Please use YYYY-MM-DD',
      //     code: 'INVALID_DATE_FORMAT'
      //   });
      // }
      // if (EndDate && !isValidDate(EndDate)) {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'Invalid end date format. Please use YYYY-MM-DD',
      //     code: 'INVALID_DATE_FORMAT'
      //   });
      // }

      const attendance = await StudentAttendanceModel.getAttendanceByDateRange(
        StartDate || null,
        EndDate || null,
        ClassId || null,
        Status || null
      );

      const studentList = await Student.getAllStudents()

      // Calculate summary statistics
      const presentCount = attendance.filter(a => a.AttendanceType === 'Present').length;
      const absentCount = attendance.filter(a => a.AttendanceType === 'Absent').length;
      const attendanceRate = attendance.length > 0
        ? Math.round((presentCount / attendance.length) * 100)
        : 0;

      res.json({
        success: true,
        meta: {
          StartDate: StartDate || 'All dates',
          EndDate: EndDate || 'All dates',
          totalRecords: attendance.length,
          presentCount,
          absentCount,
          attendanceRate
        },
        student: studentList,
        records: attendance,
        classes: [...new Set(attendance.map(a => ({
          ClassId: a.ClassId,
          ClassName: a.ClassName
        })))]
      });
    } catch (error) {
      console.error('Error fetching attendance by date range:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch attendance records',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        code: 'SERVER_ERROR'
      });
    }
  }

  static async getAttendanceByDateRange(req, res) {
    try {
      const { StartDate, EndDate, ClassId, Status } = req.body;

      // Optional validation (recommended)
      if ((StartDate && isNaN(Date.parse(StartDate))) || (EndDate && isNaN(Date.parse(EndDate)))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD',
          code: 'INVALID_DATE_FORMAT'
        });
      }

      // Fetch attendance records with optional filters
      const attendance = await StudentAttendanceModel.getAttendanceByDateRange(
        StartDate || null,
        EndDate || null,
        ClassId || null,
        Status || null
      );

      const studentList = await Student.getAllStudents();

      // Summary stats
      const presentCount = attendance.filter(a => a.AttendanceType === 'Present').length;
      const absentCount = attendance.filter(a => a.AttendanceType === 'Absent').length;
      const attendanceRate = attendance.length > 0
        ? Math.round((presentCount / attendance.length) * 100)
        : 0;

      // Respond with detailed data
      res.json({
        success: true,
        meta: {
          StartDate: StartDate || 'All Dates',
          EndDate: EndDate || 'All Dates',
          totalRecords: attendance.length,
          presentCount,
          absentCount,
          attendanceRate
        },
        student: studentList,
        records: attendance,
        classes: [...new Map(attendance.map(a => [`${a.ClassId}`, {
          ClassId: a.ClassId,
          ClassName: a.ClassName
        }])).values()]
      });
    } catch (error) {
      console.error('Error fetching attendance by date range:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch attendance records',
        code: 'SERVER_ERROR',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async getDisabledDays(req, res) {
    try {
      let { StartDate, EndDate } = req.body || {}

      // Optional fallback to current month if nothing passed
      if (!StartDate && !EndDate) {
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth()
        StartDate = new Date(year, month, 1).toISOString().split('T')[0]
        EndDate = new Date(year, month + 1, 0).toISOString().split('T')[0]
      }

      const disabledDays = await StudentAttendanceModel.getDisabledDaysFromDB(StartDate, EndDate)

      res.json({
        success: true,
        data: disabledDays
      })
    } catch (error) {
      console.error('Error fetching disabled days:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to load disabled days',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  // Get class attendance summary
  static async getClassAttendanceSummary(req, res) {
    try {
      const date = req.params.date || new Date().toISOString().split('T')[0];
      const summary = await StudentAttendanceModel.getClassAttendanceSummary(date);

      res.json({
        Date: date,
        ClassAttendanceSummary: summary
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const data = await StudentAttendanceModel.findAttendanceType();
      res.json(data);
    } catch (err) {
      res.status(500).json({ Message: err.message });
    }
  };

  static async create(req, res) {
    try {
      const insertId = await createAttendanceType(req.body);
      res.status(201).json({ Message: 'Created successfully', InsertId: insertId });
    } catch (err) {
      res.status(500).json({ Message: err.message });
    }
  };

  static async update(req, res) {
    try {
      const updated = await StudentAttendanceModel.updateAttendanceType(req.query.id, req.body);
      res.json({ Message: updated ? 'Updated successfully' : 'No changes made' });
    } catch (err) {
      res.status(500).json({ Message: err.message });
    }
  };

  static async remove(req, res) {
    try {
      const deleted = await StudentAttendanceModel.deleteAttendanceType(req.params.id);
      res.json({ Message: deleted ? 'Deleted successfully' : 'Record not found' });
    } catch (err) {
      res.status(500).json({ Message: err.message });
    }
  };
}
// Helper function
function isValidDate(dateString) {
  return !isNaN(Date.parse(dateString));
}

export default StudentAttendanceController;
