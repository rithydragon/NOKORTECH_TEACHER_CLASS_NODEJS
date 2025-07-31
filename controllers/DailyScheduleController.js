import * as ScheduleModel from '../models/DailyScheduleModel.js';

export const getSchedules = async (req, res) => {
  try {
    const schedules = await ScheduleModel.getAllSchedules();
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ Message: 'Error retrieving schedules', Error: error.message });
  }
};

export const addSchedule = async (req, res) => {
  try {
    const result = await ScheduleModel.createSchedule(req.body);
    res.status(201).json({ Message: 'Schedule Created', ScheduleId: result.insertId });
  } catch (error) {
    res.status(500).json({ Message: 'Error creating schedule', Error: error.message });
  }
};

export const deleteSchedule = async (req, res) => {
  try {
    const scheduleId = req.query.Id;
    await ScheduleModel.deleteScheduleById(scheduleId);
    res.status(200).json({ Message: 'Schedule Deleted', ScheduleId: scheduleId });
  } catch (error) {
    res.status(500).json({ Message: 'Error deleting schedule', Error: error.message });
  }
};
