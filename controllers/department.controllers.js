
import Department from '../models/department.models.js';

class DepartmentController {
  static async createDepartment(req, res) {
    try {
      const departmentId = await Department.create(req.body);
      res.status(201).json({ id: departmentId, message: 'Department created successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getDepartment(req, res) {
    try {
      const department = await Department.findById(req.params.id);
      if (!department) {
        return res.status(404).json({ message: 'Department not found' });
      }
      res.status(200).json(department);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateDepartment(req, res) {
    try {
      await Department.update(req.params.id, req.body);
      res.status(200).json({ message: 'Department updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteDepartment(req, res) {
    try {
      await Department.delete(req.params.id);
      res.status(200).json({ message: 'Department deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAllDepartments(req, res) {
    try {
      const departments = await Department.findAll();
      res.status(200).json(departments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default DepartmentController;