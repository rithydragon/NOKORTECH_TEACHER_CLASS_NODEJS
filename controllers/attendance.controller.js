import Attendance from '../models/attendance.models.js';

class AttendanceController {
  static async createAttendance(req, res) {
    try {
      const attendanceData = {
        ...req.body,
        RECORDED_BY: req.user.id // Assuming you have user authentication
      };
      const id = await Attendance.create(attendanceData);
      res.status(201).json({ id, message: 'Attendance recorded successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }


  static async updateAttendance(req, res) {
    try {
      const affectedRows = await Attendance.update(req.params.id, req.body);
      if (affectedRows === 0) {
        return res.status(404).json({ message: 'Attendance record not found' });
      }
      res.json({ message: 'Attendance updated successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteAttendance(req, res) {
    try {
      const affectedRows = await Attendance.delete(req.params.id);
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
      const attendance = await Attendance.findByStudent(req.params.studentId);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAttendanceByDate(req, res) { 
    console.log("33333333333333333333333333 ---------------------------------- ", req.body)
    try {
      const attendance = await Attendance.findByDate(req.body.CurrentDate);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  
  static async getAttendanceType(req, res) { 
    try {
      const attendance = await Attendance.findAttendanceType();
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default AttendanceController;