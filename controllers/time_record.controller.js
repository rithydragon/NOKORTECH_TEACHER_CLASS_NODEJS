import ProfessorTeachingModel from '../models/time_record.models.js';

class ProfessorTeachingController {
  // Get professor teaching summary
  static async getTeachingSummary(req, res) {
    try {
        console.log("ddddd", req.body)
        const userId = req.user?.UserId
      const { ProfessorId = null,StartDate, EndDate } = req.body;

    //   if (!professorId || !startDate || !endDate) {
    //     return res.status(400).json({
    //       success: false,
    //       message: 'Professor ID, start date, and end date are required',
    //       code: 'MISSING_PARAMETERS'
    //     });
    //   }

      const professor = await ProfessorTeachingModel.getProfessorById(userId);
      if (!professor) {
        return res.status(404).json({
          success: false,
          message: 'Professor not found',
          code: 'PROFESSOR_NOT_FOUND'
        });
      }

      const records = await ProfessorTeachingModel.getTeachingRecords(userId, StartDate, EndDate);
      const totalHours = await ProfessorTeachingModel.getTotalHours(userId, StartDate, EndDate);

      res.json({
        success: true,
          professor,
          records,
          summary: {
            totalHours: totalHours.TotalHours || 0,
            totalRecords: totalHours.TotalRecords || 0
          }
      });
    } catch (error) {
      console.error('Error getting teaching summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get teaching summary',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        code: 'SERVER_ERROR'
      });
    }
  }

  // Create teaching record
  static async createRecord(req, res) {
    try {
      const recordData = {
        ...req.body,
        PROFESSOR_ID: req.params.professorId
      };

      const requiredFields = ['CLASS_ID', 'SUBJECT_ID', 'TEACHING_DATE', 'HOURS'];
      const missingFields = requiredFields.filter(field => !recordData[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
          code: 'MISSING_FIELDS'
        });
      }

      const recordId = await ProfessorTeachingModel.createTeachingRecord(recordData);

      res.status(201).json({
        success: true,
        data: {
          recordId
        },
        message: 'Teaching record created successfully'
      });
    } catch (error) {
      console.error('Error creating teaching record:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create teaching record',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        code: 'SERVER_ERROR'
      });
    }
  }

  // Update teaching record
  static async updateRecord(req, res) {
    try {
      const { recordId } = req.params;
      const recordData = req.body;

      const affectedRows = await ProfessorTeachingModel.updateTeachingRecord(recordId, recordData);

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Teaching record not found',
          code: 'RECORD_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        message: 'Teaching record updated successfully'
      });
    } catch (error) {
      console.error('Error updating teaching record:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update teaching record',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        code: 'SERVER_ERROR'
      });
    }
  }

  // Delete teaching record
  static async deleteRecord(req, res) {
    try {
      const { recordId } = req.params;

      const affectedRows = await ProfessorTeachingModel.deleteTeachingRecord(recordId);

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Teaching record not found',
          code: 'RECORD_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        message: 'Teaching record deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting teaching record:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete teaching record',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        code: 'SERVER_ERROR'
      });
    }
  }
}

export default ProfessorTeachingController;