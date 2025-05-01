import express from 'express';
import DepartmentController from '../controllers/department.controllers.js';

const router = express.Router();

// CRUD Routes
router.post('/api/department/create', DepartmentController.createDepartment);
router.get('/api/department/:id', DepartmentController.getDepartment);
router.put('/api/department/update/:id', DepartmentController.updateDepartment);
router.delete('/api/department/delete:id', DepartmentController.deleteDepartment);
router.get('/api/department/list', DepartmentController.getAllDepartments);

export default router;