import Enrollment from "../models/enrollment.models.js";
import { successResponse, errorResponse } from "../utils/response.utils.js";

const codePrefix = "ENR";

const generateCode = () => `${codePrefix}-${Date.now()}`;

const toDate = (value) => {
  if (value) return String(value).slice(0, 10);
  return new Date().toISOString().slice(0, 10);
};

// POST /api/enrollment/list  { page, size?, pageSize?, search?, status? }
export const list = async (req, res) => {
  try {
    const page = Number(req.body.page || req.query.page || 1);
    const limit = Number(req.body.size || req.body.pageSize || req.query.size || req.query.pageSize || 10);
    const search = req.body.search || req.query.search || "";
    const status = req.body.status || req.query.status || "";

    const { rows, total } = await Enrollment.getAll({ page, limit, search, status });

    return res.json({
      success: true,
      data: rows,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Error listing enrollments:", error);
    return errorResponse(res, 500, error.message);
  }
};

// GET /api/enrollment/info?Id=  |  POST /api/enrollment/info { Id }
export const info = async (req, res) => {
  try {
    const id = req.body.Id || req.body.id || req.query.Id || req.query.id;
    if (!id) {
      return res.status(400).json({ success: false, message: "Enrollment ID is required" });
    }
    const enrollment = await Enrollment.getById(id);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    }
    return successResponse(res, "Enrollment fetched successfully", enrollment);
  } catch (error) {
    console.error("Error fetching enrollment:", error);
    return errorResponse(res, 500, error.message);
  }
};

// POST /api/enrollment/options
export const options = async (req, res) => {
  try {
    const [students, classes, courses] = await Promise.all([
      Enrollment.getStudentOptions(),
      Enrollment.getClassOptions(),
      Enrollment.getCourseOptions(),
    ]);
    return res.json({ success: true, students, classes, courses });
  } catch (error) {
    console.error("Error loading enrollment options:", error);
    return errorResponse(res, 500, error.message);
  }
};

// POST /api/enrollment/create  { StudentId, ClassId, CourseId, EnrolledDate?, Status?, Note? }
export const create = async (req, res) => {
  const createdBy = req.user?.UserId || req.user?.id;
  try {
    const { StudentId, ClassId, CourseId } = req.body;

    if (!StudentId || !ClassId || !CourseId) {
      return res.status(400).json({ success: false, message: "Student, Class and Course are required" });
    }

    const duplicate = await Enrollment.findDuplicate({ StudentId, ClassId, CourseId });
    if (duplicate) {
      return res.status(400).json({ success: false, message: "Enrollment already exists for this student-class-course" });
    }

    const enrollmentId = await Enrollment.create({
      Code: generateCode(),
      StudentId,
      ClassId,
      CourseId,
      EnrolledDate: toDate(req.body.EnrolledDate),
      Status: req.body.Status || "Enrolled",
      Note: req.body.Note || null,
      CreatedBy: createdBy,
    });

    return res.status(201).json({ success: true, message: "Enrollment created successfully", id: enrollmentId });
  } catch (error) {
    console.error("Error creating enrollment:", error);
    return errorResponse(res, 500, error.message);
  }
};

// POST /api/enrollment/update  { Id, StudentId, ClassId, CourseId, EnrolledDate?, Status?, Note? }
export const update = async (req, res) => {
  const updatedBy = req.user?.UserId || req.user?.id;
  try {
    const id = req.body.Id || req.body.id;
    if (!id) {
      return res.status(400).json({ success: false, message: "Enrollment ID is required" });
    }

    const existing = await Enrollment.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    }

    const { StudentId, ClassId, CourseId } = req.body;
    if (!StudentId || !ClassId || !CourseId) {
      return res.status(400).json({ success: false, message: "Student, Class and Course are required" });
    }

    const duplicate = await Enrollment.findDuplicate({ StudentId, ClassId, CourseId, excludeId: id });
    if (duplicate) {
      return res.status(400).json({ success: false, message: "Enrollment already exists for this student-class-course" });
    }

    await Enrollment.update(id, {
      StudentId,
      ClassId,
      CourseId,
      EnrolledDate: toDate(req.body.EnrolledDate),
      Status: req.body.Status || existing.Status || "Enrolled",
      Note: req.body.Note || null,
      UpdatedBy: updatedBy,
    });

    return res.json({ success: true, message: "Enrollment updated successfully" });
  } catch (error) {
    console.error("Error updating enrollment:", error);
    return errorResponse(res, 500, error.message);
  }
};

// GET /api/enrollment/delete?Id=  |  POST /api/enrollment/delete { Id }
export const remove = async (req, res) => {
  try {
    const id = req.body?.Id || req.body?.id || req.query.Id || req.query.id;
    if (!id) {
      return res.status(400).json({ success: false, message: "Enrollment ID is required" });
    }

    const existing = await Enrollment.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    }

    await Enrollment.delete(id);
    return res.json({ success: true, message: "Enrollment deleted successfully" });
  } catch (error) {
    console.error("Error deleting enrollment:", error);
    return errorResponse(res, 500, error.message);
  }
};