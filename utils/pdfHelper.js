// To:
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import moment from 'moment';

// Register PDF fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs;

class PDFHelper {
    static generateStudentReport(students) {
        // Define document structure
        const docDefinition = {
            pageSize: 'A4',
            pageMargins: [40, 60, 40, 60],
            header: {
                text: 'Student Academic Report',
                style: 'header',
                margin: [40, 20, 40, 10]
            },
            footer: function(currentPage, pageCount) {
                return {
                    text: `Page ${currentPage.toString()} of ${pageCount}`,
                    alignment: 'center',
                    margin: [40, 10, 40, 20]
                };
            },
            content: [
                this._createStudentSummaryTable(students),
                { text: '\n\n' },
                this._createDetailedScoresSection(students)
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    alignment: 'center'
                },
                subheader: {
                    fontSize: 14,
                    bold: true,
                    margin: [0, 10, 0, 5]
                },
                tableHeader: {
                    bold: true,
                    fontSize: 11,
                    fillColor: '#f2f2f2'
                },
                highlight: {
                    bold: true,
                    color: '#3366ff'
                }
            },
            defaultStyle: {
                fontSize: 10,
                lineHeight: 1.3
            }
        };

        return pdfMake.createPdf(docDefinition);
    }

    static _createStudentSummaryTable(students) {
        return {
            style: 'table',
            table: {
                headerRows: 1,
                widths: ['*', '*', '*', '*', '*'],
                body: [
                    [
                        { text: 'Student Code', style: 'tableHeader' },
                        { text: 'Name', style: 'tableHeader' },
                        { text: 'Class', style: 'tableHeader' },
                        { text: 'Course', style: 'tableHeader' },
                        { text: 'Status', style: 'tableHeader' }
                    ],
                    ...students.map(student => [
                        student.CODE,
                        student.NAME,
                        student.class_name || '-',
                        student.course_name || '-',
                        { 
                            text: student.STATUS ? 'Active' : 'Inactive',
                            color: student.STATUS ? 'green' : 'red'
                        }
                    ])
                ]
            },
            layout: {
                fillColor: function(rowIndex) {
                    return (rowIndex % 2 === 0) ? '#f9f9f9' : null;
                }
            }
        };
    }

    static _createDetailedScoresSection(students) {
        const studentSections = students.map(student => {
            const scoreRows = student.scores.map(score => [
                score.subject_code,
                score.subject_name,
                { 
                    text: score.SCORE.toString(),
                    alignment: 'center'
                },
                moment(score.CREATED_DATE).format('YYYY-MM-DD'),
                score.DESCRIPTION || '-'
            ]);

            return [
                { 
                    text: `${student.CODE} - ${student.NAME}`,
                    style: 'subheader',
                    margin: [0, 15, 0, 5]
                },
                {
                    style: 'table',
                    table: {
                        headerRows: 1,
                        widths: ['auto', '*', 'auto', 'auto', '*'],
                        body: [
                            [
                                { text: 'Code', style: 'tableHeader' },
                                { text: 'Subject', style: 'tableHeader' },
                                { text: 'Score', style: 'tableHeader' },
                                { text: 'Date', style: 'tableHeader' },
                                { text: 'Notes', style: 'tableHeader' }
                            ],
                            ...scoreRows
                        ]
                    },
                    layout: {
                        fillColor: function(rowIndex) {
                            return (rowIndex % 2 === 0) ? '#f9f9f9' : null;
                        }
                    }
                }
            ];
        });

        return [
            { text: 'Detailed Scores', style: 'header', pageBreak: 'before' },
            ...studentSections.flat()
        ];
    }

    static async generateStudentTranscript(student) {
        // Custom implementation for individual student transcripts
        const docDefinition = {
            content: [
                { text: 'OFFICIAL TRANSCRIPT', style: 'header' },
                { text: '\n\n' },
                this._createStudentInfoSection(student),
                { text: '\n\n' },
                this._createTranscriptTable(student)
            ],
            // Reuse styles from generateStudentReport
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    alignment: 'center'
                },
                // ... other styles
            }
        };

        return pdfMake.createPdf(docDefinition);
    }

    static _createStudentInfoSection(student) {
        return {
            columns: [
                {
                    width: '*',
                    text: [
                        { text: 'Student ID: ', bold: true },
                        student.CODE + '\n',
                        { text: 'Name: ', bold: true },
                        student.NAME + '\n',
                        { text: 'Email: ', bold: true },
                        student.EMAIL + '\n'
                    ]
                },
                {
                    width: '*',
                    text: [
                        { text: 'Class: ', bold: true },
                        (student.class_name || 'N/A') + '\n',
                        { text: 'Course: ', bold: true },
                        (student.course_name || 'N/A') + '\n',
                        { text: 'Status: ', bold: true },
                        { 
                            text: student.STATUS ? 'Active' : 'Inactive',
                            color: student.STATUS ? 'green' : 'red'
                        }
                    ],
                    alignment: 'right'
                }
            ]
        };
    }

    static _createTranscriptTable(student) {
        return {
            style: 'table',
            table: {
                headerRows: 1,
                widths: ['auto', '*', 'auto', 'auto'],
                body: [
                    [
                        { text: 'Code', style: 'tableHeader' },
                        { text: 'Subject', style: 'tableHeader' },
                        { text: 'Score', style: 'tableHeader' },
                        { text: 'Date', style: 'tableHeader' }
                    ],
                    ...student.scores.map(score => [
                        score.subject_code,
                        score.subject_name,
                        { 
                            text: score.SCORE.toString(),
                            alignment: 'center'
                        },
                        moment(score.CREATED_DATE).format('YYYY-MM-DD')
                    ])
                ]
            },
            layout: {
                fillColor: function(rowIndex) {
                    return (rowIndex % 2 === 0) ? '#f9f9f9' : null;
                }
            }
        };
    }
}

export default PDFHelper;