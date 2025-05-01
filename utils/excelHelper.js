// import xlsx from 'xlsx';
import Student from '../models/student.models.js';
import Score from '../models/score.models.js';
import Subject from '../models/subject.models.js';
import * as XLSX from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

class ExcelHelper {
    static async parseStudentData(filePath) {
        const workbook = xlsx.readFile(filePath);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = xlsx.utils.sheet_to_json(worksheet);
        
        // Transform raw data into structured format
        return rawData.map(row => ({
            student: {
                CODE: row['Student Code'],
                NAME: row['Student Name'],
                NAME_ENGLISH: row['English Name'] || '',
                EMAIL: row['Email'],
                GENDER: row['Gender'],
                DOB: row['Date of Birth'] ? new Date(row['Date of Birth']) : null,
                PHONE_NUMBER: row['Phone'] || '',
                CLASS_ID: row['Class ID'] || null,
                COURSE_ID: row['Course ID'] || null,
                DEPARTMENT_ID: row['Department ID'] || null,
                CREATED_BY: 1 // Default admin user
            },
            scores: Object.entries(row)
                .filter(([key, value]) => key.startsWith('Score_'))
                .map(([key, value]) => ({
                    subject_code: key.replace('Score_', ''),
                    score: value,
                    description: `Imported from Excel ${new Date().toLocaleDateString()}`,
                    created_by: 1
                }))
        }));
    }

    static async generateStudentReport(students) {
        const wb = xlsx.utils.book_new();
        
        // Student data worksheet
        const studentData = students.map(student => ({
            'Student ID': student.ID,
            'Student Code': student.CODE,
            'Name': student.NAME,
            'English Name': student.NAME_ENGLISH,
            'Email': student.EMAIL,
            'Gender': student.GENDER,
            'Date of Birth': student.DOB,
            'Class': student.class_name,
            'Course': student.course_name,
            'Department': student.department_name,
            'Status': student.STATUS ? 'Active' : 'Inactive'
        }));
        
        const wsStudents = xlsx.utils.json_to_sheet(studentData);
        xlsx.utils.book_append_sheet(wb, wsStudents, "Students");
        
        // Scores worksheet
        const scoreData = students.flatMap(student => 
            student.scores.map(score => ({
                'Student ID': student.ID,
                'Student Code': student.CODE,
                'Student Name': student.NAME,
                'Subject Code': score.subject_code,
                'Subject Name': score.subject_name,
                'Score': score.SCORE,
                'Description': score.DESCRIPTION,
                'Created Date': score.CREATED_DATE
            }))
        );
        
        const wsScores = xlsx.utils.json_to_sheet(scoreData);
        xlsx.utils.book_append_sheet(wb, wsScores, "Scores");
        
        return wb;
    }
}

export default ExcelHelper;