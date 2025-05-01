import db from '../config/db.js';
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { RtyApiResponse } from '../utils/response.utils.js';
class User {
    // static async create(user) {
    //     const [result] = await db.query(
    //         'INSERT INTO USERS (CODE, NAME, EMAIL, PASSWORD) VALUES (?, ?, ?, ?)',
    //         [user.userCode, user.name, user.email, user.password]
    //     );
    //     return result.insertId;
    // }

    static async findAllUsers22() {
        const queryUser = `
           SELECT 
                U.NAME AS Name,
                U.USERNAME AS Username,
                U.EMAIL AS Email,
                U.USER_CODE AS Code,
                U.GENDER AS Gender,
                U.USER_TYPE AS UserType,
                U.IS_ACTIVE AS UserActive,
                U.ID AS UserID,
                R.ROLE_NAME AS RoleName,
                R.DESCRIPTION AS RoleDescription,
                R.ID AS RoleID,
                PG.GROUP_NAME AS PermissionGroupName,
                PG.ID AS PermissionGroupID,
                P.PERMISSION_NAME AS PermissionName,
                P.DESCRIPTION AS PermissionDescription,
                P.MODULE_NAME AS ModuleName,
                P.ID AS PermissionID
            FROM USERS U
            -- Linking Users to Roles via USERROLES
            LEFT JOIN USERROLES UR ON U.ID = UR.USER_ID
            LEFT JOIN ROLES R ON UR.ROLE_ID = R.ID
            -- Linking Roles to Permission Groups via GROUPROLES
            LEFT JOIN GROUPROLES GR ON R.ID = GR.ROLE_ID
            LEFT JOIN PERMISSIONGROUPS PG ON GR.GROUP_ID = PG.ID
            -- Linking Roles to Permissions via ROLEPERMISSIONS
            LEFT JOIN ROLEPERMISSIONS RP ON R.ID = RP.ROLE_ID
            LEFT JOIN PERMISSIONS P ON RP.PERMISSION_ID = P.ID;

        `

        const queryUserSelect = `
            SELECT 
                U.ID AS UserId,
                U.USER_CODE AS UserCode,
                U.NAME AS Name,
                U.NAME_ENGLISH AS NameEnglish,
                U.USERNAME AS Username,
                U.EMAIL AS Email,
                U.PASSWORD AS Password,
                U.GENDER AS Gender,
                U.USER_TYPE AS UserType,
                U.DOB AS DateOfBirth,
                U.POB AS PlaceOfBirth,
                U.ADDRESS AS Address,
                U.PHONE_NUMBER AS PhoneNumber,
                U.LOGON_STATUS AS LogonStatus,
                U.IS_ACTIVE AS UserActive,
                U.LAST_LOGIN AS LastLogin,
                U.CREATED_BY AS CreatedBy,
                U.CREATED_AT AS CreatedAt,
                U.UPDATED_BY AS UpdatedBy,
                U.UPDATED_AT AS UpdatedAt,
                -- Get the name of the user who created this user
                COALESCE(CB.USERNAME, 'Unknown') AS CreatedBy,

                -- Get the name of the user who last updated this user
                COALESCE(UB.USERNAME, 'Unknown') AS UpdatedBy,

                -- Fetch Roles
                COALESCE(
                    (
                        SELECT JSON_ARRAYAGG(R.ROLE_NAME)
                        FROM (
                            SELECT DISTINCT R.ROLE_NAME
                            FROM USERROLES UR
                            JOIN ROLES R ON UR.ROLE_ID = R.ID
                            WHERE UR.USER_ID = U.ID
                        ) R
                    ), '[]'
                ) AS Roles,

                -- Fetch Permissions
                COALESCE(
                    (
                        SELECT JSON_ARRAYAGG(P.PERMISSION_NAME)
                        FROM (
                            SELECT DISTINCT P.PERMISSION_NAME
                            FROM USERROLES UR
                            JOIN ROLES R ON UR.ROLE_ID = R.ID
                            JOIN ROLEPERMISSIONS RP ON R.ID = RP.ROLE_ID
                            JOIN PERMISSIONS P ON RP.PERMISSION_ID = P.ID
                            WHERE UR.USER_ID = U.ID
                        ) P
                    ), '[]'
                ) AS Permissions,

                -- Fetch Groups
                COALESCE(
                    (
                        SELECT JSON_ARRAYAGG(PG.GROUP_NAME)
                        FROM (
                            SELECT DISTINCT PG.GROUP_NAME
                            FROM GROUPROLES GR
                            JOIN PERMISSIONGROUPS PG ON GR.GROUP_ID = PG.ID
                            JOIN USERROLES UR ON GR.ROLE_ID = UR.ROLE_ID
                            WHERE UR.USER_ID = U.ID
                        ) PG
                    ), '[]'
                ) AS \`Groups\`

            FROM USERS U
            LEFT JOIN USERS CB ON U.CREATED_BY = CB.ID  -- Join to get CreatedBy Username
            LEFT JOIN USERS UB ON U.UPDATED_BY = UB.ID  -- Join to get UpdatedBy Username

            GROUP BY U.ID, CB.NAME, UB.NAME;
        `;

        const [rows] = await db.query(queryUserSelect);
        return rows;
    }

    static async findAllUsers({
        page = 1,
        pageSize = 10,
        search = '',
        sortField = 'U.ID',
        sortOrder = 'ASC',
        getAll = false
    }) {
        try {
            // Base query with parameterized values
            let queryParams = [];
            let queryUserSelect = `
                SELECT 
                    U.ID AS UserId,
                    U.USER_CODE AS UserCode,
                    U.NAME AS Name,
                    U.NAME_ENGLISH AS NameEnglish,
                    U.USERNAME AS Username,
                    U.EMAIL AS Email,
                    U.PASSWORD AS Password,
                    U.GENDER AS Gender,
                    U.USER_TYPE AS UserType,
                    U.DOB AS DateOfBirth,
                    U.POB AS PlaceOfBirth,
                    U.ADDRESS AS Address,
                    U.PHONE_NUMBER AS PhoneNumber,
                    U.LOGON_STATUS AS LogonStatus,
                    U.IS_ACTIVE AS UserActive,
                    U.LAST_LOGIN AS LastLogin,
                    U.CREATED_BY AS CreatedBy,
                    U.CREATED_AT AS CreatedAt,
                    U.UPDATED_BY AS UpdatedBy,
                    U.UPDATED_AT AS UpdatedAt,
                    COALESCE(CB.USERNAME, '') AS CreatedBy,
                    COALESCE(UB.USERNAME, '') AS UpdatedBy,
                    COALESCE(
                        (
                            SELECT JSON_ARRAYAGG(R.ROLE_NAME)
                            FROM (
                                SELECT DISTINCT R.ROLE_NAME
                                FROM USERROLES UR
                                JOIN ROLES R ON UR.ROLE_ID = R.ID
                                WHERE UR.USER_ID = U.ID
                            ) R
                        ), '[]'
                    ) AS Roles,
                    COALESCE(
                        (
                            SELECT JSON_ARRAYAGG(P.PERMISSION_NAME)
                            FROM (
                                SELECT DISTINCT P.PERMISSION_NAME
                                FROM USERROLES UR
                                JOIN ROLES R ON UR.ROLE_ID = R.ID
                                JOIN ROLEPERMISSIONS RP ON R.ID = RP.ROLE_ID
                                JOIN PERMISSIONS P ON RP.PERMISSION_ID = P.ID
                                WHERE UR.USER_ID = U.ID
                            ) P
                        ), '[]'
                    ) AS Permissions,
                    COALESCE(
                        (
                            SELECT JSON_ARRAYAGG(PG.GROUP_NAME)
                            FROM (
                                SELECT DISTINCT PG.GROUP_NAME
                                FROM GROUPROLES GR
                                JOIN PERMISSIONGROUPS PG ON GR.GROUP_ID = PG.ID
                                JOIN USERROLES UR ON GR.ROLE_ID = UR.ROLE_ID
                                WHERE UR.USER_ID = U.ID
                            ) PG
                        ), '[]'
                    ) AS \`Groups\`
                FROM USERS U
                LEFT JOIN USERS CB ON U.CREATED_BY = CB.ID
                LEFT JOIN USERS UB ON U.UPDATED_BY = UB.ID
            `;

            // Add search conditions if search term is provided
            const searchConditions = [];
            if (search) {
                const searchTerm = `%${search}%`;
                searchConditions.push(
                    `(U.NAME LIKE ? OR 
                     U.NAME_ENGLISH LIKE ? OR 
                     U.USERNAME LIKE ? OR 
                     U.EMAIL LIKE ? OR 
                     U.PHONE_NUMBER LIKE ?)`
                );
                queryParams.push(...Array(5).fill(searchTerm));
            }

            if (searchConditions.length > 0) {
                queryUserSelect += ` WHERE ${searchConditions.join(' OR ')}`;
            }

            // Validate sort field to prevent SQL injection
            const validSortFields = ['U.ID', 'U.NAME', 'U.USERNAME', 'U.EMAIL', 'U.CREATED_AT'];
            const safeSortField = validSortFields.includes(sortField) ? sortField : 'U.ID';
            const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

            // Add sorting
            queryUserSelect += ` ORDER BY ${safeSortField} ${safeSortOrder}`;

            // Get total count for pagination metadata
            let countQuery = `SELECT COUNT(*) as total FROM USERS U`;
            if (searchConditions.length > 0) {
                countQuery += ` WHERE ${searchConditions.join(' OR ')}`;
            }

            const [[{ total }]] = await db.query(countQuery, queryParams);

            // Handle data retrieval
            if (!getAll) {
                // Paginated results
                queryUserSelect += ` LIMIT ? OFFSET ?`;
                queryParams.push(pageSize, (page - 1) * pageSize);

                const [rows] = await db.query(queryUserSelect, queryParams);

                return {
                    data: rows,
                    pagination: {
                        totalItems: parseInt(total),
                        totalPages: Math.ceil(total / pageSize),
                        currentPage: parseInt(page),
                        pageSize: parseInt(pageSize)
                    }
                };
            } else {
                // All results (no pagination)
                const [rows] = await db.query(queryUserSelect, queryParams);

                return {
                    data: rows,
                    pagination: null
                };
            }
        } catch (error) {
            console.error('Database error in findAllUsers:', error);
            throw error;
        }
    }

    //     . Security Considerations
    // SQL Injection Protection:

    // Use parameterized queries or prepared statements instead of string concatenation

    // Sanitize all input parameters

    // Whitelist allowed sort fields

    // Improved Version with Parameterization:

    static async findAllUser111({ page = 1, pageSize = 10, search = '', sortField = 'U.ID', sortOrder = 'ASC' }) {
        const offset = (page - 1) * pageSize;

        // Whitelist allowed sort fields
        const allowedSortFields = ['U.ID', 'U.NAME', 'U.USERNAME', 'U.EMAIL', 'U.CREATED_AT'];
        const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'U.ID';
        const safeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        let queryUserSelect = `...`; // Your base query

        const searchConditions = [];
        const params = [];

        if (search) {
            searchConditions.push(
                `(U.NAME LIKE ? OR 
                 U.NAME_ENGLISH LIKE ? OR 
                 U.USERNAME LIKE ? OR 
                 U.EMAIL LIKE ? OR 
                 U.PHONE_NUMBER LIKE ?)`
            );
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
        }

        if (searchConditions.length > 0) {
            queryUserSelect += ` WHERE ${searchConditions.join(' OR ')}`;
        }

        queryUserSelect += ` ORDER BY ${safeSortField} ${safeSortOrder}`;
        queryUserSelect += ` LIMIT ? OFFSET ?`;
        params.push(pageSize, offset);

        let countQuery = `SELECT COUNT(*) as total FROM USERS U`;
        if (searchConditions.length > 0) {
            countQuery += ` WHERE ${searchConditions.join(' OR ')}`;
        }

        const [rows] = await db.query(queryUserSelect, params);
        const [[{ total }]] = await db.query(countQuery, params.slice(0, -2)); // Remove LIMIT and OFFSET params

        return {
            data: rows,
            pagination: {
                totalItems: total,
                totalPages: Math.ceil(total / pageSize),
                currentPage: page,
                pageSize: pageSize
            }
        };
    }

    static async findByEmail(email) {

        const [rows] = await db.query('SELECT * FROM USERS WHERE EMAIL = ?', [email]);
        return rows[0];
    }
    static async findOneByUserId(id) {
        console.log("User id in user model : ", id)
        const queryUserSelect = `
            SELECT 
                ID AS UserId,
                USER_CODE AS UserCode,
                NAME AS Name,
                NAME_ENGLISH AS NameEnglish,
                USERNAME AS Username,
                EMAIL AS Email,
                PASSWORD AS Password,
                GENDER AS Gender,
                USER_TYPE AS UserType,
                DOB AS DateOfBirth,
                POB AS PlaceOfBirth,
                ADDRESS AS Address,
                PHONE_NUMBER AS PhoneNumber,
                LOGON_STATUS AS LogonStatus,
                IS_ACTIVE AS UserActive,
                LAST_LOGIN AS LastLogin,
                CREATED_AT AS CreatedAt,
                UPDATED_AT AS UpdatedAt
            FROM USERS
            WHERE ID = ?;
        `
        const [rows] = await db.query(queryUserSelect, [id]);
        return rows[0];
    }


    // Find user by ID
    static async findById(id) {
        console.log("User id in user model : ", id)
        const queryUserSelect = `
            SELECT 
                U.ID AS UserId,
                U.USER_CODE AS UserCode,
                U.NAME AS Name,
                U.NAME_ENGLISH AS NameEnglish,
                U.USERNAME AS Username,
                U.EMAIL AS Email,
                U.PASSWORD AS Password,
                U.GENDER AS Gender,
                U.USER_TYPE AS UserType,
                U.DOB AS DateOfBirth,
                U.POB AS PlaceOfBirth,
                U.ADDRESS AS Address,
                U.PHONE_NUMBER AS PhoneNumber,
                U.LOGON_STATUS AS LogonStatus,
                U.IS_ACTIVE AS UserActive,
                U.LAST_LOGIN AS LastLogin,
                --U.CREATED_AT AS CreatedAt,
                --U.UPDATED_AT AS UpdatedAt,
                COALESCE(U.USERNAME, 'Unknown') AS CreatedBy,
                COALESCE(U.USERNAME, 'Unknown') AS UpdatedBy,
                COALESCE(
                    (
                        SELECT JSON_ARRAYAGG(R.ROLE_NAME)
                        FROM (
                            SELECT DISTINCT R.ROLENAME AS RoleName
                            FROM USERROLES UR
                            JOIN ROLES R ON UR.ROLE_ID = R.ID
                            WHERE UR.USER_ID = U.ID
                        ) R
                    ), '[]'
                ) AS Roles,
                COALESCE(
                    (
                        SELECT JSON_ARRAYAGG(P.PERMISSION_NAME)
                        FROM (
                            SELECT DISTINCT P.PERMISSION_NAME As PermissionName
                            FROM USERROLES UR
                            JOIN ROLES R ON UR.ROLE_ID = R.ID
                            JOIN ROLEPERMISSIONS RP ON R.ID = RP.ROLE_ID
                            JOIN PERMISSIONS P ON RP.PERMISSION_ID = P.ID
                            WHERE UR.USER_ID = U.ID
                        ) P
                    ), '[]'
                ) AS Permissions,
                COALESCE(
                    (
                        SELECT JSON_ARRAYAGG(PG.GROUP_NAME)
                        FROM (
                            SELECT DISTINCT PG.GROUP_NAME
                            FROM GROUPROLES GR
                            JOIN PERMISSIONGROUPS PG ON GR.GROUP_ID = PG.ID
                            JOIN USERROLES UR ON GR.ROLE_ID = UR.ROLE_ID
                            WHERE UR.USER_ID = U.ID
                        ) PG
                    ), '[]'
                ) AS \`Groups\`
            FROM USERS U
            WHERE U.ID = ?;
        `;
        const query = `
            SELECT 
    -- User Basic Information
    U.ID AS UserId,
    U.USER_CODE AS UserCode,
    U.NAME AS Name,
    U.NAME_ENGLISH AS NameEnglish,
    U.USERNAME AS Username,
    U.EMAIL AS Email,
    U.GENDER AS Gender,
    U.USER_TYPE AS UserType,
    U.DOB AS DateOfBirth,
    U.POB AS PlaceOfBirth,
    U.ADDRESS AS Address,
    U.PHONE_NUMBER AS PhoneNumber,
    U.LOGON_STATUS AS LogonStatus,
    U.IS_ACTIVE AS UserActive,
    U.LAST_LOGIN AS LastLogin,
    U.CREATED_BY AS CreatedBy,
    U.CREATED_AT AS CreatedAt,
    U.UPDATED_BY AS UpdatedBy,
    U.UPDATED_AT AS UpdatedAt,

    -- User Roles, Permissions, and Groups
    COALESCE(
        (
            SELECT JSON_ARRAYAGG(R.ROLE_NAME)
            FROM (
                SELECT DISTINCT R.ROLE_NAME
                FROM USERROLES UR
                JOIN ROLES R ON UR.ROLE_ID = R.ID
                WHERE UR.USER_ID = U.ID
            ) R
        ), '[]'
    ) AS Roles,
    COALESCE(
        (
            SELECT JSON_ARRAYAGG(P.PERMISSION_NAME)
            FROM (
                SELECT DISTINCT P.PERMISSION_NAME
                FROM USERROLES UR
                JOIN ROLES R ON UR.ROLE_ID = R.ID
                JOIN ROLEPERMISSIONS RP ON R.ID = RP.ROLE_ID
                JOIN PERMISSIONS P ON RP.PERMISSION_ID = P.ID
                WHERE UR.USER_ID = U.ID
            ) P
        ), '[]'
    ) AS Permissions,
    COALESCE(
        (
            SELECT JSON_ARRAYAGG(PG.GROUP_NAME)
            FROM (
                SELECT DISTINCT PG.GROUP_NAME
                FROM GROUPROLES GR
                JOIN PERMISSIONGROUPS PG ON GR.GROUP_ID = PG.ID
                JOIN USERROLES UR ON GR.ROLE_ID = UR.ROLE_ID
                WHERE UR.USER_ID = U.ID
            ) PG
        ), '[]'
    ) AS \`Groups\`,

    -- User Image
    UI.IMAGEPATH AS ImagePath,
    UI.FILE_TYPE AS FileType,

    -- User Details
    UD.NATIONALITY AS Nationality,
    UD.RELIGION AS Religion,
    UD.MARITAL_STATUS AS MaritalStatus,
    UD.OCCUPATION AS Occupation,
    UD.COMPANY_NAME AS CompanyName,
    UD.COMPANY_ADDRESS AS CompanyAddress,
    UD.JOB_TITLE AS JobTitle,
    UD.EMPLOYMENT_TYPE AS EmploymentType,
    UD.SALARY AS Salary,
    UD.WORK_EMAIL AS WorkEmail,
    UD.WORK_PHONE_NUMBER AS WorkPhoneNumber,
    UD.PASSPORT_NUMBER AS PassportNumber,
    UD.NATIONAL_ID AS NationalID,
    UD.DRIVING_LICENSE_NUMBER AS DrivingLicenseNumber,
    UD.TAX_ID AS TaxID,
    UD.SOCIAL_SECURITY_NUMBER AS SocialSecurityNumber,
    UD.BLOOD_TYPE AS BloodType,
    UD.DISABILITIES AS Disabilities,
    UD.ALLERGIES AS Allergies,
    UD.MEDICAL_CONDITIONS AS MedicalConditions,
    UD.EMERGENCY_CONTACT_NAME AS EmergencyContactName,
    UD.EMERGENCY_CONTACT_PHONE AS EmergencyContactPhone,
    UD.EMERGENCY_CONTACT_RELATIONSHIP AS EmergencyContactRelationship,

    -- Parent's Information
    P.FATHER_NAME AS FatherName,
    P.FATHER_DOB AS FatherDOB,
    P.FATHER_OCCUPATION AS FatherOccupation,
    P.FATHER_COMPANY_NAME AS FatherCompanyName,
    P.FATHER_COMPANY_ADDRESS AS FatherCompanyAddress,
    P.FATHER_PHONE_NUMBER AS FatherPhoneNumber,
    P.FATHER_EMAIL AS FatherEmail,
    P.FATHER_NATIONALITY AS FatherNationality,
    P.FATHER_RELIGION AS FatherReligion,
    P.FATHER_EDUCATION_LEVEL AS FatherEducationLevel,
    P.MOTHER_NAME AS MotherName,
    P.MOTHER_DOB AS MotherDOB,
    P.MOTHER_OCCUPATION AS MotherOccupation,
    P.MOTHER_COMPANY_NAME AS MotherCompanyName,
    P.MOTHER_COMPANY_ADDRESS AS MotherCompanyAddress,
    P.MOTHER_PHONE_NUMBER AS MotherPhoneNumber,
    P.MOTHER_EMAIL AS MotherEmail,
    P.MOTHER_NATIONALITY AS MotherNationality,
    P.MOTHER_RELIGION AS MotherReligion,
    P.MOTHER_EDUCATION_LEVEL AS MotherEducationLevel,
    P.PARENTS_MARITAL_STATUS AS ParentsMaritalStatus,
    P.PARENTS_ADDRESS AS ParentsAddress,
    P.PARENTS_ANNUAL_INCOME AS ParentsAnnualIncome,

    -- Guardian's Information
    G.GUARDIAN_NAME AS GuardianName,
    G.GUARDIAN_DOB AS GuardianDOB,
    G.GUARDIAN_RELATIONSHIP AS GuardianRelationship,
    G.GUARDIAN_OCCUPATION AS GuardianOccupation,
    G.GUARDIAN_COMPANY_NAME AS GuardianCompanyName,
    G.GUARDIAN_COMPANY_ADDRESS AS GuardianCompanyAddress,
    G.GUARDIAN_PHONE_NUMBER AS GuardianPhoneNumber,
    G.GUARDIAN_EMAIL AS GuardianEmail,
    G.GUARDIAN_NATIONALITY AS GuardianNationality,
    G.GUARDIAN_RELIGION AS GuardianReligion,
    G.GUARDIAN_EDUCATION_LEVEL AS GuardianEducationLevel,
    G.GUARDIAN_ADDRESS AS GuardianAddress,
    G.GUARDIAN_ANNUAL_INCOME AS GuardianAnnualIncome,
    G.IS_PRIMARY_GUARDIAN AS IsPrimaryGuardian,

    -- User History (Latest Event)
    (
        SELECT JSON_OBJECT(
            'EventType', UH.EVENT_TYPE,
            'EventDescription', UH.EVENT_DESCRIPTION,
            'EventDate', UH.EVENT_DATE,
            'IPAddress', UH.IP_ADDRESS,
            'DeviceType', UH.DEVICE_TYPE,
            'Browser', UH.BROWSER,
            'OperatingSystem', UH.OPERATING_SYSTEM,
            'Location', UH.LOCATION
        )
        FROM USER_HISTORY UH
        WHERE UH.USER_ID = U.ID
        ORDER BY UH.EVENT_DATE DESC
        LIMIT 1
    ) AS LatestHistoryEvent,

    -- User Documents (Aggregated)
    COALESCE(
        (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'DocumentType', UD.DOCUMENT_TYPE,
                    'DocumentName', UD.DOCUMENT_NAME,
                    'DocumentPath', UD.DOCUMENT_PATH,
                    'DocumentSize', UD.DOCUMENT_SIZE,
                    'FileType', UD.FILE_TYPE,
                    'UploadedAt', UD.UPLOADED_AT,
                    'ExpiryDate', UD.EXPIRY_DATE,
                    'IsVerified', UD.IS_VERIFIED,
                    'VerifiedBy', UD.VERIFIED_BY,
                    'VerifiedAt', UD.VERIFIED_AT
                )
            )
            FROM USER_DOCUMENTS UD
            WHERE UD.USER_ID = U.ID
        ), '[]'
    ) AS Documents,

    -- User Education (Aggregated)
    COALESCE(
        (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'InstitutionName', UE.INSTITUTION_NAME,
                    'DegreeType', UE.DEGREE_TYPE,
                    'FieldOfStudy', UE.FIELD_OF_STUDY,
                    'StartDate', UE.START_DATE,
                    'EndDate', UE.END_DATE,
                    'GraduationDate', UE.GRADUATION_DATE,
                    'GPA', UE.GPA,
                    'DocumentPath', UE.DOCUMENT_PATH
                )
            )
            FROM USER_EDUCATION UE
            WHERE UE.USER_ID = U.ID
        ), '[]'
    ) AS Education,

    -- User Employment (Aggregated)
    COALESCE(
        (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'CompanyName', UEM.COMPANY_NAME,
                    'JobTitle', UEM.JOB_TITLE,
                    'EmploymentType', UEM.EMPLOYMENT_TYPE,
                    'StartDate', UEM.START_DATE,
                    'EndDate', UEM.END_DATE,
                    'Salary', UEM.SALARY,
                    'JobDescription', UEM.JOB_DESCRIPTION,
                    'ReferenceName', UEM.REFERENCE_NAME,
                    'ReferencePhone', UEM.REFERENCE_PHONE,
                    'ReferenceEmail', UEM.REFERENCE_EMAIL,
                    'DocumentPath', UEM.DOCUMENT_PATH
                )
            )
            FROM USER_EMPLOYMENT UEM
            WHERE UEM.USER_ID = U.ID
        ), '[]'
    ) AS Employment,

    -- User Skills (Aggregated)
    COALESCE(
        (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'SkillName', US.SKILL_NAME,
                    'SkillLevel', US.SKILL_LEVEL,
                    'CertificationName', US.CERTIFICATION_NAME,
                    'CertificationPath', US.CERTIFICATION_PATH
                )
            )
            FROM USER_SKILLS US
            WHERE US.USER_ID = U.ID
        ), '[]'
    ) AS Skills,

    -- User Social Media (Aggregated)
    COALESCE(
        (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'Platform', USM.PLATFORM,
                    'ProfileUrl', USM.PROFILE_URL
                )
            )
            FROM USER_SOCIAL_MEDIA USM
            WHERE USM.USER_ID = U.ID
        ), '[]'
    ) AS SocialMedia,

    -- User Preferences
    UP.LANGUAGE AS Language,
    UP.THEME AS Theme,
    UP.NOTIFICATION_EMAIL AS NotificationEmail,
    UP.NOTIFICATION_SMS AS NotificationSMS,
    UP.NOTIFICATION_PUSH AS NotificationPush

FROM USERS U
LEFT JOIN UIMAGE UI ON U.ID = UI.USER_ID
LEFT JOIN USER_DETAILS UD ON U.ID = UD.USER_ID
LEFT JOIN PARENTS P ON U.ID = P.USER_ID
LEFT JOIN GUARDIANS G ON U.ID = G.USER_ID
LEFT JOIN USER_PREFERENCES UP ON U.ID = UP.USER_ID
WHERE U.ID = ?;
            
            
            `
        try {
            const [rows] = await db.query(query, [id]);
            return rows.length ? rows[0] : null;
        } catch (error) {
            console.error("Database Error:", error);
            throw new Error("Failed to fetch user");
        }
    }

    static async getUserById(id) {
        try {
            const sql = 'SELECT ID, NAME, EMAIL FROM USERS WHERE ID = ?';
            const [rows] = await db.execute(sql, [id]);
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Find user by username
    static async findByUsername(username) {
        const query = `
            SELECT 
                U.ID AS UserId,
                U.USER_CODE AS UserCode,
                U.NAME AS Name,
                U.NAME_ENGLISH AS EnglishName,
                U.USERNAME AS Username,
                U.EMAIL AS Email,
                U.PASSWORD AS Password,
                U.GENDER AS Gender,
                U.USER_TYPE AS UserType,
                U.DOB AS DateOfBirth,
                U.POB AS PlaceOfBirth,
                U.ADDRESS AS Address,
                U.PHONE_NUMBER AS PhoneNumber,
                U.LOGON_STATUS AS LogonStatus,
                U.IS_ACTIVE AS IsActive,
                U.LAST_LOGIN AS LastLogin,
                U.CREATED_BY AS CreatedBy,
                U.CREATED_AT AS CreatedAt,
                U.UPDATED_BY AS UpdatedBy,
                U.UPDATED_AT AS UpdatedAt,
                R.ID AS RoleId,
                R.ROLE_NAME AS RoleName,
                R.DESCRIPTION AS RoleDescription,
                R.CREATED_AT AS RoleCreatedAt,
                A.DEVICE_ID AS DeviceId,         -- From AUTHS table
                P.ID AS PermissionId,
                P.PERMISSION_NAME AS PermissionName,
                P.DESCRIPTION AS PermissionDescription,
                P.MODULE_NAME AS ModuleName,
                P.CREATED_AT AS PermissionCreatedAt
            FROM USERS U
            LEFT JOIN USERROLES UR ON U.ID = UR.USER_ID
            LEFT JOIN ROLES R ON UR.ROLE_ID = R.ID
            LEFT JOIN AUTHS A ON U.ID = A.USER_ID
            LEFT JOIN ROLEPERMISSIONS RP ON R.ID = RP.ROLE_ID
            LEFT JOIN PERMISSIONS P ON RP.PERMISSION_ID = P.ID
            WHERE U.USERNAME = ?;
        `;
        const [rows] = await db.query(query, [username]);
        return rows[0];
    }

    static async findByUsernameDeviceId(username, deviceId) {
        const query = `
            SELECT 
                U.ID AS UserId,
                U.USER_CODE AS UserCode,
                U.NAME AS Name,
                U.NAME_ENGLISH AS EnglishName,
                U.USERNAME AS Username,
                U.EMAIL AS Email,
                U.PASSWORD AS Password,
                U.GENDER AS Gender,
                U.USER_TYPE AS UserType,
                U.DOB AS DateOfBirth,
                U.POB AS PlaceOfBirth,
                U.ADDRESS AS Address,
                U.PHONE_NUMBER AS PhoneNumber,
                U.LOGON_STATUS AS LogonStatus,
                U.IS_ACTIVE AS IsActive,
                U.LAST_LOGIN AS LastLogin,
                U.CREATED_BY AS CreatedBy,
                U.CREATED_AT AS CreatedAt,
                U.UPDATED_BY AS UpdatedBy,
                U.UPDATED_AT AS UpdatedAt,
                R.ID AS RoleId,
                R.ROLE_NAME AS RoleName,
                R.DESCRIPTION AS RoleDescription,
                R.CREATED_AT AS RoleCreatedAt,
                A.DEVICE_ID AS DeviceId,
                P.ID AS PermissionId,
                P.PERMISSION_NAME AS PermissionName,
                P.DESCRIPTION AS PermissionDescription,
                P.MODULE_NAME AS ModuleName,
                P.CREATED_AT AS PermissionCreatedAt
            FROM USERS U
            LEFT JOIN USERROLES UR ON U.ID = UR.USER_ID
            LEFT JOIN ROLES R ON UR.ROLE_ID = R.ID
            LEFT JOIN AUTHS A ON U.ID = A.USER_ID AND A.DEVICE_ID = ?
            LEFT JOIN ROLEPERMISSIONS RP ON R.ID = RP.ROLE_ID
            LEFT JOIN PERMISSIONS P ON RP.PERMISSION_ID = P.ID
            WHERE U.USERNAME = ?;
        `;
        const [rows] = await db.execute(query, [deviceId ?? null, username ?? null]);
        return rows;
    }
    
    static async userRole(userId) {
        console.log("Model user role : ", userId)

        const query = `
        SELECT 
            R.ID AS RoleId,
            R.ROLE_NAME AS RoleName,
            R.DESCRIPTION AS RoleDescription,
            R.CREATED_AT AS RoleCreatedAt
        FROM USERROLES UR
        JOIN ROLES R ON UR.ROLE_ID = R.ID
        WHERE UR.USER_ID = ?;
        `;
        const [rows] = await db.execute(query, [userId]);
        return rows[0];
    }

    static async userPermission(userId) {
        console.log("Model user permission : ", userId)

        const query = `
        SELECT 
            P.ID AS PermissionId,
            P.PERMISSION_NAME AS PermissionName,
            P.DESCRIPTION AS PermissionDescription,
            P.MODULE_NAME AS ModuleName,
            P.CREATED_AT AS PermissionCreatedAt
        FROM USERROLES UR
        JOIN ROLEPERMISSIONS RP ON UR.ROLE_ID = RP.ROLE_ID
        JOIN PERMISSIONS P ON RP.PERMISSION_ID = P.ID
        WHERE UR.USER_ID = ?;
        `;
        const [rows] = await db.execute(query, [userId]);
        return rows[0];
    }

    //with only image
    static async getUserProfile(userId) {
        try {
            const queryUserProfile = `
                SELECT 
                    U.ID AS UserId,
                    U.USER_CODE AS UserCode,
                    U.NAME AS Name,
                    U.NAME_ENGLISH AS NameEnglish,
                    U.USERNAME AS Username,
                    U.EMAIL AS Email,
                    U.GENDER AS Gender,
                    U.USER_TYPE AS UserType,
                    U.DOB AS DateOfBirth,
                    U.POB AS PlaceOfBirth,
                    U.ADDRESS AS Address,
                    U.PHONE_NUMBER AS PhoneNumber,
                    U.LOGON_STATUS AS LogonStatus,
                    U.IS_ACTIVE AS UserActive,
                    U.LAST_LOGIN AS LastLogin,
                    U.CREATED_BY AS CreatedBy,
                    U.CREATED_AT AS CreatedAt,
                    U.UPDATED_BY AS UpdatedBy,
                    U.UPDATED_AT AS UpdatedAt,
                    COALESCE(U.USERNAME, 'Unknown') AS CreatedBy,
                    COALESCE(U.USERNAME, 'Unknown') AS UpdatedBy,
                    COALESCE(
                        (
                            SELECT JSON_ARRAYAGG(R.ROLE_NAME)
                            FROM (
                                SELECT DISTINCT R.ROLE_NAME
                                FROM USERROLES UR
                                JOIN ROLES R ON UR.ROLE_ID = R.ID
                                WHERE UR.USER_ID = U.ID
                            ) R
                        ), '[]'
                    ) AS Roles,
                    COALESCE(
                        (
                            SELECT JSON_ARRAYAGG(P.PERMISSION_NAME)
                            FROM (
                                SELECT DISTINCT P.PERMISSION_NAME
                                FROM USERROLES UR
                                JOIN ROLES R ON UR.ROLE_ID = R.ID
                                JOIN ROLEPERMISSIONS RP ON R.ID = RP.ROLE_ID
                                JOIN PERMISSIONS P ON RP.PERMISSION_ID = P.ID
                                WHERE UR.USER_ID = U.ID
                            ) P
                        ), '[]'
                    ) AS Permissions,
                    COALESCE(
                        (
                            SELECT JSON_ARRAYAGG(PG.GROUP_NAME)
                            FROM (
                                SELECT DISTINCT PG.GROUP_NAME
                                FROM GROUPROLES GR
                                JOIN PERMISSIONGROUPS PG ON GR.GROUP_ID = PG.ID
                                JOIN USERROLES UR ON GR.ROLE_ID = UR.ROLE_ID
                                WHERE UR.USER_ID = U.ID
                            ) PG
                        ), '[]'
                    ) AS \`Groups\`,
                    UI.IMAGEPATH AS ImagePath, -- Add image path from UIMAGE table
                    UI.FILE_TYPE AS FileType -- Add file type from UIMAGE table
                FROM USERS U
                LEFT JOIN UIMAGE UI ON U.ID = UI.USER_ID -- Join UIMAGE table
                WHERE U.ID = ?;
            `;

            const query = `
                SELECT 
                    -- User Basic Information
                    U.ID AS UserId,
                    U.USER_CODE AS UserCode,
                    U.NAME AS Name,
                    U.NAME_ENGLISH AS NameEnglish,
                    U.USERNAME AS Username,
                    U.EMAIL AS Email,
                    U.GENDER AS Gender,
                    U.USER_TYPE AS UserType,
                    U.DOB AS DateOfBirth,
                    U.POB AS PlaceOfBirth,
                    U.ADDRESS AS Address,
                    U.PHONE_NUMBER AS PhoneNumber,
                    U.LOGON_STATUS AS LogonStatus,
                    U.IS_ACTIVE AS UserActive,
                    U.LAST_LOGIN AS LastLogin,
                    U.CREATED_BY AS CreatedBy,
                    U.CREATED_AT AS CreatedAt,
                    U.UPDATED_BY AS UpdatedBy,
                    U.UPDATED_AT AS UpdatedAt,

                    -- User Roles, Permissions, and Groups
                    COALESCE(
                        (
                            SELECT JSON_ARRAYAGG(R.ROLE_NAME)
                            FROM (
                                SELECT DISTINCT R.ROLE_NAME
                                FROM USERROLES UR
                                JOIN ROLES R ON UR.ROLE_ID = R.ID
                                WHERE UR.USER_ID = U.ID
                            ) R
                        ), '[]'
                    ) AS Roles,
                    COALESCE(
                        (
                            SELECT JSON_ARRAYAGG(P.PERMISSION_NAME)
                            FROM (
                                SELECT DISTINCT P.PERMISSION_NAME
                                FROM USERROLES UR
                                JOIN ROLES R ON UR.ROLE_ID = R.ID
                                JOIN ROLEPERMISSIONS RP ON R.ID = RP.ROLE_ID
                                JOIN PERMISSIONS P ON RP.PERMISSION_ID = P.ID
                                WHERE UR.USER_ID = U.ID
                            ) P
                        ), '[]'
                    ) AS Permissions,
                    COALESCE(
                        (
                            SELECT JSON_ARRAYAGG(PG.GROUP_NAME)
                            FROM (
                                SELECT DISTINCT PG.GROUP_NAME
                                FROM GROUPROLES GR
                                JOIN PERMISSIONGROUPS PG ON GR.GROUP_ID = PG.ID
                                JOIN USERROLES UR ON GR.ROLE_ID = UR.ROLE_ID
                                WHERE UR.USER_ID = U.ID
                            ) PG
                        ), '[]'
                    ) AS \`Groups\`,

                    -- User Image
                    UI.IMAGEPATH AS ImagePath,
                    UI.FILE_TYPE AS FileType,

                    -- User Details
                    UD.NATIONALITY AS Nationality,
                    UD.RELIGION AS Religion,
                    UD.MARITAL_STATUS AS MaritalStatus,
                    UD.OCCUPATION AS Occupation,
                    UD.COMPANY_NAME AS CompanyName,
                    UD.COMPANY_ADDRESS AS CompanyAddress,
                    UD.JOB_TITLE AS JobTitle,
                    UD.EMPLOYMENT_TYPE AS EmploymentType,
                    UD.SALARY AS Salary,
                    UD.WORK_EMAIL AS WorkEmail,
                    UD.WORK_PHONE_NUMBER AS WorkPhoneNumber,
                    UD.PASSPORT_NUMBER AS PassportNumber,
                    UD.NATIONAL_ID AS NationalID,
                    UD.DRIVING_LICENSE_NUMBER AS DrivingLicenseNumber,
                    UD.TAX_ID AS TaxID,
                    UD.SOCIAL_SECURITY_NUMBER AS SocialSecurityNumber,
                    UD.BLOOD_TYPE AS BloodType,
                    UD.DISABILITIES AS Disabilities,
                    UD.ALLERGIES AS Allergies,
                    UD.MEDICAL_CONDITIONS AS MedicalConditions,
                    UD.EMERGENCY_CONTACT_NAME AS EmergencyContactName,
                    UD.EMERGENCY_CONTACT_PHONE AS EmergencyContactPhone,
                    UD.EMERGENCY_CONTACT_RELATIONSHIP AS EmergencyContactRelationship,

                    -- Parent's Information
                    P.FATHER_NAME AS FatherName,
                    P.FATHER_DOB AS FatherDOB,
                    P.FATHER_OCCUPATION AS FatherOccupation,
                    P.FATHER_COMPANY_NAME AS FatherCompanyName,
                    P.FATHER_COMPANY_ADDRESS AS FatherCompanyAddress,
                    P.FATHER_PHONE_NUMBER AS FatherPhoneNumber,
                    P.FATHER_EMAIL AS FatherEmail,
                    P.FATHER_NATIONALITY AS FatherNationality,
                    P.FATHER_RELIGION AS FatherReligion,
                    P.FATHER_EDUCATION_LEVEL AS FatherEducationLevel,
                    P.MOTHER_NAME AS MotherName,
                    P.MOTHER_DOB AS MotherDOB,
                    P.MOTHER_OCCUPATION AS MotherOccupation,
                    P.MOTHER_COMPANY_NAME AS MotherCompanyName,
                    P.MOTHER_COMPANY_ADDRESS AS MotherCompanyAddress,
                    P.MOTHER_PHONE_NUMBER AS MotherPhoneNumber,
                    P.MOTHER_EMAIL AS MotherEmail,
                    P.MOTHER_NATIONALITY AS MotherNationality,
                    P.MOTHER_RELIGION AS MotherReligion,
                    P.MOTHER_EDUCATION_LEVEL AS MotherEducationLevel,
                    P.PARENTS_MARITAL_STATUS AS ParentsMaritalStatus,
                    P.PARENTS_ADDRESS AS ParentsAddress,
                    P.PARENTS_ANNUAL_INCOME AS ParentsAnnualIncome,

                    -- Guardian's Information
                    G.GUARDIAN_NAME AS GuardianName,
                    G.GUARDIAN_DOB AS GuardianDOB,
                    G.GUARDIAN_RELATIONSHIP AS GuardianRelationship,
                    G.GUARDIAN_OCCUPATION AS GuardianOccupation,
                    G.GUARDIAN_COMPANY_NAME AS GuardianCompanyName,
                    G.GUARDIAN_COMPANY_ADDRESS AS GuardianCompanyAddress,
                    G.GUARDIAN_PHONE_NUMBER AS GuardianPhoneNumber,
                    G.GUARDIAN_EMAIL AS GuardianEmail,
                    G.GUARDIAN_NATIONALITY AS GuardianNationality,
                    G.GUARDIAN_RELIGION AS GuardianReligion,
                    G.GUARDIAN_EDUCATION_LEVEL AS GuardianEducationLevel,
                    G.GUARDIAN_ADDRESS AS GuardianAddress,
                    G.GUARDIAN_ANNUAL_INCOME AS GuardianAnnualIncome,
                    G.IS_PRIMARY_GUARDIAN AS IsPrimaryGuardian,

                    -- User History (Latest Event)
                    (
                        SELECT JSON_OBJECT(
                            'EventType', UH.EVENT_TYPE,
                            'EventDescription', UH.EVENT_DESCRIPTION,
                            'EventDate', UH.EVENT_DATE,
                            'IPAddress', UH.IP_ADDRESS,
                            'DeviceType', UH.DEVICE_TYPE,
                            'Browser', UH.BROWSER,
                            'OperatingSystem', UH.OPERATING_SYSTEM,
                            'Location', UH.LOCATION
                        )
                        FROM USER_HISTORY UH
                        WHERE UH.USER_ID = U.ID
                        ORDER BY UH.EVENT_DATE DESC
                        LIMIT 1
                    ) AS LatestHistoryEvent,

                    -- User Documents (Aggregated)
                    COALESCE(
                        (
                            SELECT JSON_ARRAYAGG(
                                JSON_OBJECT(
                                    'DocumentType', UD.DOCUMENT_TYPE,
                                    'DocumentName', UD.DOCUMENT_NAME,
                                    'DocumentPath', UD.DOCUMENT_PATH,
                                    'DocumentSize', UD.DOCUMENT_SIZE,
                                    'FileType', UD.FILE_TYPE,
                                    'UploadedAt', UD.UPLOADED_AT,
                                    'ExpiryDate', UD.EXPIRY_DATE,
                                    'IsVerified', UD.IS_VERIFIED,
                                    'VerifiedBy', UD.VERIFIED_BY,
                                    'VerifiedAt', UD.VERIFIED_AT
                                )
                            )
                            FROM USER_DOCUMENTS UD
                            WHERE UD.USER_ID = U.ID
                        ), '[]'
                    ) AS Documents,

                    -- User Education (Aggregated)
                    COALESCE(
                        (
                            SELECT JSON_ARRAYAGG(
                                JSON_OBJECT(
                                    'InstitutionName', UE.INSTITUTION_NAME,
                                    'DegreeType', UE.DEGREE_TYPE,
                                    'FieldOfStudy', UE.FIELD_OF_STUDY,
                                    'StartDate', UE.START_DATE,
                                    'EndDate', UE.END_DATE,
                                    'GraduationDate', UE.GRADUATION_DATE,
                                    'GPA', UE.GPA,
                                    'DocumentPath', UE.DOCUMENT_PATH
                                )
                            )
                            FROM USER_EDUCATION UE
                            WHERE UE.USER_ID = U.ID
                        ), '[]'
                    ) AS Education,

                    -- User Employment (Aggregated)
                    COALESCE(
                        (
                            SELECT JSON_ARRAYAGG(
                                JSON_OBJECT(
                                    'CompanyName', UEM.COMPANY_NAME,
                                    'JobTitle', UEM.JOB_TITLE,
                                    'EmploymentType', UEM.EMPLOYMENT_TYPE,
                                    'StartDate', UEM.START_DATE,
                                    'EndDate', UEM.END_DATE,
                                    'Salary', UEM.SALARY,
                                    'JobDescription', UEM.JOB_DESCRIPTION,
                                    'ReferenceName', UEM.REFERENCE_NAME,
                                    'ReferencePhone', UEM.REFERENCE_PHONE,
                                    'ReferenceEmail', UEM.REFERENCE_EMAIL,
                                    'DocumentPath', UEM.DOCUMENT_PATH
                                )
                            )
                            FROM USER_EMPLOYMENT UEM
                            WHERE UEM.USER_ID = U.ID
                        ), '[]'
                    ) AS Employment,

                    -- User Skills (Aggregated)
                    COALESCE(
                        (
                            SELECT JSON_ARRAYAGG(
                                JSON_OBJECT(
                                    'SkillName', US.SKILL_NAME,
                                    'SkillLevel', US.SKILL_LEVEL,
                                    'CertificationName', US.CERTIFICATION_NAME,
                                    'CertificationPath', US.CERTIFICATION_PATH
                                )
                            )
                            FROM USER_SKILLS US
                            WHERE US.USER_ID = U.ID
                        ), '[]'
                    ) AS Skills,

                    -- User Social Media (Aggregated)
                    COALESCE(
                        (
                            SELECT JSON_ARRAYAGG(
                                JSON_OBJECT(
                                    'Platform', USM.PLATFORM,
                                    'ProfileUrl', USM.PROFILE_URL
                                )
                            )
                            FROM USER_SOCIAL_MEDIA USM
                            WHERE USM.USER_ID = U.ID
                        ), '[]'
                    ) AS SocialMedia,

                    -- User Preferences
                    UP.LANGUAGE AS Language,
                    UP.THEME AS Theme,
                    UP.NOTIFICATION_EMAIL AS NotificationEmail,
                    UP.NOTIFICATION_SMS AS NotificationSMS,
                    UP.NOTIFICATION_PUSH AS NotificationPush

                FROM USERS U
                LEFT JOIN UIMAGE UI ON U.ID = UI.USER_ID
                LEFT JOIN USER_DETAILS UD ON U.ID = UD.USER_ID
                LEFT JOIN PARENTS P ON U.ID = P.USER_ID
                LEFT JOIN GUARDIANS G ON U.ID = G.USER_ID
                LEFT JOIN USER_PREFERENCES UP ON U.ID = UP.USER_ID
                WHERE U.ID = ?;
            `
            const [rows] = await db.query(query, [userId]);

            if (rows.length === 0) {
                throw new Error('User not found');
            }

            return rows[0]; // Return user profile
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw new Error('Failed to retrieve user profile');
        }
    }


    //with muitiple image
    static async getUserProfile1(userId) {
        try {
            const queryUserProfile = `
                SELECT 
                    U.ID AS UserId,
                    U.USER_CODE AS UserCode,
                    U.NAME AS Name,
                    U.NAME_ENGLISH AS NameEnglish,
                    U.USERNAME AS Username,
                    U.EMAIL AS Email,
                    U.GENDER AS Gender,
                    U.USER_TYPE AS UserType,
                    U.DOB AS DateOfBirth,
                    U.POB AS PlaceOfBirth,
                    U.ADDRESS AS Address,
                    U.PHONE_NUMBER AS PhoneNumber,
                    U.LOGON_STATUS AS LogonStatus,
                    U.IS_ACTIVE AS UserActive,
                    U.LAST_LOGIN AS LastLogin,
                    U.CREATED_BY AS CreatedBy,
                    U.CREATED_AT AS CreatedAt,
                    U.UPDATED_BY AS UpdatedBy,
                    U.UPDATED_AT AS UpdatedAt,
                    COALESCE(
                        (
                            SELECT JSON_ARRAYAGG(R.ROLE_NAME)
                            FROM (
                                SELECT DISTINCT R.ROLE_NAME
                                FROM USERROLES UR
                                JOIN ROLES R ON UR.ROLE_ID = R.ID
                                WHERE UR.USER_ID = U.ID
                            ) R
                        ), '[]'
                    ) AS Roles,
                    COALESCE(
                        (
                            SELECT JSON_ARRAYAGG(P.PERMISSION_NAME)
                            FROM (
                                SELECT DISTINCT P.PERMISSION_NAME
                                FROM USERROLES UR
                                JOIN ROLES R ON UR.ROLE_ID = R.ID
                                JOIN ROLEPERMISSIONS RP ON R.ID = RP.ROLE_ID
                                JOIN PERMISSIONS P ON RP.PERMISSION_ID = P.ID
                                WHERE UR.USER_ID = U.ID
                            ) P
                        ), '[]'
                    ) AS Permissions,
                    COALESCE(
                        (
                            SELECT JSON_ARRAYAGG(PG.GROUP_NAME)
                            FROM (
                                SELECT DISTINCT PG.GROUP_NAME
                                FROM GROUPROLES GR
                                JOIN PERMISSIONGROUPS PG ON GR.GROUP_ID = PG.ID
                                JOIN USERROLES UR ON GR.ROLE_ID = UR.ROLE_ID
                                WHERE UR.USER_ID = U.ID
                            ) PG
                        ), '[]'
                    ) AS \`Groups\`,
                    COALESCE(
                        (
                            SELECT JSON_ARRAYAGG(
                                JSON_OBJECT(
                                    'ImagePath', UI.IMAGEPATH,
                                    'FileType', UI.FILE_TYPE
                                )
                            )
                            FROM UIMAGE UI
                            WHERE UI.USER_ID = U.ID
                        ), '[]'
                    ) AS Images -- Array of image objects
                FROM USERS U
                WHERE U.ID = ?;
            `;

            const [rows] = await db.query(queryUserProfile, [userId]);

            if (rows.length === 0) {
                throw new Error('User not found');
            }

            return rows[0]; // Return user profile
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw new Error('Failed to retrieve user profile');
        }
    }
    // static async getUserProfile(userId) {
    //     try {
    //         const queryUserProfile = `
    //             SELECT 
    //                 U.ID AS UserId,
    //                 U.USER_CODE AS UserCode,
    //                 U.NAME AS Name,
    //                 U.NAME_ENGLISH AS NameEnglish,
    //                 U.USERNAME AS Username,
    //                 U.EMAIL AS Email,
    //                 U.GENDER AS Gender,
    //                 U.USER_TYPE AS UserType,
    //                 U.DOB AS DateOfBirth,
    //                 U.POB AS PlaceOfBirth,
    //                 U.ADDRESS AS Address,
    //                 U.PHONE_NUMBER AS PhoneNumber,
    //                 U.LOGON_STATUS AS LogonStatus,
    //                 U.IS_ACTIVE AS UserActive,
    //                 U.LAST_LOGIN AS LastLogin,
    //                 U.CREATED_BY AS CreatedBy,
    //                 U.CREATED_AT AS CreatedAt,
    //                 U.UPDATED_BY AS UpdatedBy,
    //                 U.UPDATED_AT AS UpdatedAt,
    //                 COALESCE(
    //                     (
    //                         SELECT JSON_ARRAYAGG(R.ROLE_NAME)
    //                         FROM (
    //                             SELECT DISTINCT R.ROLE_NAME
    //                             FROM USERROLES UR
    //                             JOIN ROLES R ON UR.ROLE_ID = R.ID
    //                             WHERE UR.USER_ID = U.ID
    //                         ) R
    //                     ), '[]'
    //                 ) AS Roles,
    //                 COALESCE(
    //                     (
    //                         SELECT JSON_ARRAYAGG(P.PERMISSION_NAME)
    //                         FROM (
    //                             SELECT DISTINCT P.PERMISSION_NAME
    //                             FROM USERROLES UR
    //                             JOIN ROLES R ON UR.ROLE_ID = R.ID
    //                             JOIN ROLEPERMISSIONS RP ON R.ID = RP.ROLE_ID
    //                             JOIN PERMISSIONS P ON RP.PERMISSION_ID = P.ID
    //                             WHERE UR.USER_ID = U.ID
    //                         ) P
    //                     ), '[]'
    //                 ) AS Permissions,
    //                 COALESCE(
    //                     (
    //                         SELECT JSON_ARRAYAGG(PG.GROUP_NAME)
    //                         FROM (
    //                             SELECT DISTINCT PG.GROUP_NAME
    //                             FROM GROUPROLES GR
    //                             JOIN PERMISSIONGROUPS PG ON GR.GROUP_ID = PG.ID
    //                             JOIN USERROLES UR ON GR.ROLE_ID = UR.ROLE_ID
    //                             WHERE UR.USER_ID = U.ID
    //                         ) PG
    //                     ), '[]'
    //                 ) AS \`Groups\`
    //             FROM USERS U
    //             WHERE U.ID = ?;
    //         `;

    //         const [rows] = await db.query(queryUserProfile, [userId]);

    //         if (rows.length === 0) {
    //             throw new Error('User not found');
    //         }

    //         return rows[0]; // Return user profile
    //     } catch (error) {
    //         console.error('Error fetching user profile:', error);
    //         throw new Error('Failed to retrieve user profile');
    //     }
    // }

    // // Update user data
    // static async update(id, userData) {
    //     let { name, nameEnglish, username, email, password, gender, userType, dob, pob, address, phoneNumber, updatedBy } = userData;

    //     // Fetch existing user to retain old password if not updating
    //     const existingUser = await this.findById(id);
    //     if (!existingUser) return null;

    //     let hashedPassword = existingUser.PASSWORD; // Keep old password if not updating
    //     if (password) {
    //         hashedPassword = await bcrypt.hash(password, 10);
    //     }

    //     // Execute SQL query to update user
    //     const [result] = await db.query(
    //         `UPDATE USERS 
    //          SET NAME = ?, NAME_ENGLISH = ?, USERNAME = ?, EMAIL = ?, PASSWORD = ?, 
    //              GENDER = ?, USER_TYPE = ?, DOB = ?, POB = ?, 
    //              ADDRESS = ?, PHONE_NUMBER = ?, UPDATED_BY = ?, UPDATED_AT = NOW() 
    //          WHERE ID = ?`,
    //         [
    //             name, nameEnglish, username, email, hashedPassword,
    //             gender, userType, roleId, dob, pob, address,
    //             phoneNumber, updatedBy, id,
    //         ]
    //     );

    //     return result.affectedRows > 0;
    // }


    // static async findByEmail(email) {
    //     const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    //     return rows[0];
    // }

    static async updateLastLogin(userId) {
        await db.execute("UPDATE USERS SET LAST_LOGIN = NOW() WHERE ID = ?", [userId]);
    }

    // // Update last login timestamp
    // static async updateLastLogin(userId) {
    //     await db.query("UPDATE USERS SET LAST_LOGIN = NOW() WHERE ID = ?", [userId]);
    // }

    static async findByEmail(email) {
        const [rows] = await db.execute("SELECT * FROM USERS WHERE EMAIL = ?", [email]);
        return rows[0];
    }



    static async getUsersWithRoleAndPermission(roleName, permissionName) {
        const query = `
            SELECT 
                U.ID AS USER_ID,
                U.USERNAME,
                U.EMAIL,
                R.ROLE_NAME,
                P.NAME AS PERMISSION
            FROM 
                USERS U
            JOIN 
                USERROLES UR ON U.ID = UR.USER_ID
            JOIN 
                ROLES R ON UR.ROLE_ID = R.ID
            JOIN 
                ROLEPERMISSIONS RP ON R.ID = RP.ROLE_ID
            JOIN 
                PERMISSIONS P ON RP.PERMISSION_ID = P.ID
            WHERE 
                R.ROLE_NAME = ?
                AND P.NAME = ?
        `;

        try {
            const [rows] = await db.execute(query, [roleName, permissionName]);
            return rows;
        } catch (error) {
            console.error("Error fetching users with role and permission:", error);
            throw new Error("Failed to fetch users with role and permission.");
        }
    }
    static async incrementFailedAttempts(userId) {
        await db.execute(
            'UPDATE users SET failed_attempts = failed_attempts + 1 WHERE id = ?',
            [userId]
        );

        // Check if account should be locked
        const [result] = await db.execute(
            'UPDATE users SET account_locked = 1 WHERE id = ? AND failed_attempts >= 5',
            [userId]
        );

        return result.affectedRows > 0;
    }

    static async resetFailedAttempts(userId) {
        await db.execute(
            'UPDATE users SET failed_attempts = 0 WHERE id = ?',
            [userId]
        );
    }

    static async deleteUser(id) {
        console.log("User delete : _", id)
        try {
            const sql = 'DELETE FROM USERS WHERE ID = ?';
            const [result] = await db.execute(sql, [id]);
            return result.affectedRows;
        } catch (error) {
            throw error;
        }

    }

    static async assignRole(UserId, RoleId, CreatedBy) {
        const sql = `INSERT INTO USER_ROLES (USER_ID, ROLE_ID, ASSIGNED_BY) VALUES (?, ?, ?)`;
        await db.execute(sql, [UserId, RoleId, CreatedBy]);
    }

    static async storeUserImage(UserId, ImagePath, CreatedBy) {
        const sql = `INSERT INTO UIMAGE (USER_ID, IMAGEPATH, CREATED_BY) VALUES (?, ?, ?)`;
        await db.execute(sql, [UserId, ImagePath, CreatedBy]);
    }

    // Create a new user
    static async createUser({
        UserCode, Name, NameEnglish, Username, Email, Password, Gender,
        UserType, DateOfBirth, PlaceOfBirth, Address, PhoneNumber, CreatedBy
    }) {
        // Hash the password before inserting into the database
        const passwordHash = Password ? await bcrypt.hash(Password, 10) : null;

        // Format the DateOfBirth to ensure it's in a valid format for MySQL (YYYY-MM-DD)
        const formattedDob = DateOfBirth ? new Date(DateOfBirth).toISOString().split('T')[0] : null;

        // SQL query to insert a new user into the USERS table
        const sql = `
            INSERT INTO USERS (
                USER_CODE, NAME, NAME_ENGLISH, USERNAME, EMAIL, PASSWORD, GENDER, USER_TYPE, DOB, POB, 
                ADDRESS, PHONE_NUMBER, CREATED_BY
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Execute the SQL query with the data from the request
        const [result] = await db.execute(sql, [
            UserCode, Name, NameEnglish, Username, Email, passwordHash, Gender, UserType,
            formattedDob, PlaceOfBirth, Address, PhoneNumber, CreatedBy
        ]);

        // Return the ID of the newly created user
        return result.insertId;
    }

    // Assign a role to the user
    static async assignRole(UserId, RoleId, CreatedBy) {
        const sql = `INSERT INTO USER_ROLES (USER_ID, ROLE_ID, CREATED_BY) VALUES (?, ?, ?)`;
        await db.execute(sql, [UserId, RoleId, CreatedBy]);
    }

    // Store user image
    static async storeUserImage(UserId, ImagePath, FileType, CreatedBy) {
        const sql = `INSERT INTO UIMAGE (USER_ID, IMAGEPATH, FILE_TYPE, CREATED_BY) VALUES (?, ?, ?, ?)`;
        await db.execute(sql, [UserId, ImagePath, FileType, CreatedBy]);
    }


    static async findByPk(userId) {
        console.log("Finding user by ID:", userId);
        try {
            // 1. Validate input
            if (!userId || isNaN(userId)) {
                throw new Error('Invalid user ID');
            }
            const query = `
              SELECT 
                    U.ID AS UserId,
                    U.USER_CODE AS UserCode,
                    U.NAME AS Name,
                    U.NAME_ENGLISH AS NameEnglish,
                    U.USERNAME AS Username,
                    U.EMAIL AS Email,
                    U.GENDER AS Gender,
                    U.USER_TYPE AS UserType,
                    U.DOB AS DateOfBirth,
                    U.POB AS PlaceOfBirth,
                    U.ADDRESS AS Address,
                    U.PHONE_NUMBER AS PhoneNumber,
                    U.LOGON_STATUS AS LogonStatus,
                    U.IS_ACTIVE AS UserActive,
                    U.LAST_LOGIN AS LastLogin,
                    U.CREATED_BY AS CreatedBy,
                    U.CREATED_AT AS CreatedAt,
                    U.UPDATED_BY AS UpdatedBy,
                    U.UPDATED_AT AS UpdatedAt,
                    UL.LOGIN_TIME AS LastLoginTime,  -- From USER_LOG table
                    UL.IP_ADDRESS AS LastLoginIP,   -- From USER_LOG table
                    UL.USER_AGENT AS LastLoginAgent, -- From USER_LOG table
                    A.DEVICE_ID AS DeviceId,         -- From AUTHS table
                    A.REFRESH_TOKEN AS RefreshToken, -- From AUTHS table
                    A.REFRESH_TOKEN_EXPIRES AS RefreshTokenExpiresIn, -- From AUTHS table
                    A.ACCESS_TOKEN AS AccessToken,   -- From AUTHS table
                    A.TOKEN_EXPIRES_AT AS TokenExpiresAt, -- From AUTHS table
                    A.FAILED_LOGIN_ATTEMPTS AS FailedLoginAttempts, -- From AUTHS table
                    A.LAST_LOGIN_AT AS LastAuthLoginAt, -- From AUTHS table
                    A.ACCOUNT_LOCKED_UNTIL AS AccountLockedUntil -- From AUTHS table
                FROM USERS U
                LEFT JOIN USER_LOG UL ON U.ID = UL.USER_ID
                LEFT JOIN AUTHS A ON U.ID = A.USER_ID
                WHERE U.ID = ?;
            `;


            // 2. Use parameterized query
            const [rows] = await db.execute(query, [userId]);

            // 3. Handle empty results
            if (!rows || rows.length === 0) {
                return null;
            }

            // 4. Return first match
            return rows[0];
        } catch (error) {
            console.error("Error finding user by ID:", error);

            // More specific error messages
            if (error.code === 'ER_NO_SUCH_TABLE') {
                throw new Error('Users table does not exist');
            }
            if (error.code === 'ECONNREFUSED') {
                throw new Error('Database connection refused');
            }

            throw new Error(`Database error: ${error.message}`);
        }
    }


    static async resetPassword(Username, UpdatedBy, hashedPassword) {
        const sql = `
            UPDATE USERS 
            SET PASSWORD = ?, UPDATED_BY = ?, UPDATED_AT = NOW() 
            WHERE USERNAME = ?
        `;

        console.log("Executing SQL query:", sql);
        console.log("With parameters:", [hashedPassword, UpdatedBy, Username]);

        const [result] = await db.execute(sql, [hashedPassword, UpdatedBy, Username]);

        console.log("SQL execution result:", result);
        return result.affectedRows > 0; // If rows are updated successfully
    }


    static async updateUser(id, userData, authUserId) {

        const {
            Name, NameEnglish, Username, Email, Password,
            Gender, UserType, DateOfBirth, PlaceOfBirth,
            Address, PhoneNumber
        } = userData;

        // Fetch existing user to check for changes
        const existingUser = await this.findById(id);
        if (!existingUser) return null;

        let hashedPassword = existingUser.PASSWORD; // Keep old password if not updating
        if (Password) {
            hashedPassword = await bcrypt.hash(Password, 10);
        }

        // Check if any data has changed before updating
        const hasChanges =
            Name !== existingUser.NAME ||
            NameEnglish !== existingUser.NAME_ENGLISH ||
            Username !== existingUser.USERNAME ||
            Email !== existingUser.EMAIL ||
            hashedPassword !== existingUser.PASSWORD ||
            Gender !== existingUser.GENDER ||
            UserType !== existingUser.USER_TYPE ||
            new Date(DateOfBirth).toISOString() !== new Date(existingUser.DOB).toISOString() ||
            PlaceOfBirth !== existingUser.POB ||
            Address !== existingUser.ADDRESS ||
            PhoneNumber !== existingUser.PHONE_NUMBER;


        if (!hasChanges) {
            return { message: "No changes detected", updated: false };
        }

        // Execute SQL query to update user only if changes exist
        const [result] = await db.query(
            `UPDATE USERS 
             SET NAME = ?, NAME_ENGLISH = ?, USERNAME = ?, EMAIL = ?, PASSWORD = ?, 
                 GENDER = ?, USER_TYPE = ?, DOB = ?, POB = ?, 
                 ADDRESS = ?, PHONE_NUMBER = ?, UPDATED_BY = ?, UPDATED_AT = NOW() 
             WHERE ID = ?`,
            [
                Name, NameEnglish, Username, Email, hashedPassword,
                Gender, UserType, DateOfBirth, PlaceOfBirth,
                Address, PhoneNumber, authUserId, id,
            ]
        );
        console.log("Update result:", result);

        return {
            message: "User updated successfully",
            updated: result.affectedRows > 0
        };
    }

    // const insertImages = async () => {
    //     const query = `
    //       INSERT INTO UIMAGE (USER_ID, IMAGEPATH, FILE_TYPE, CREATED_BY)
    //       VALUES
    //       (128, '/uploads/users/RITHY_PHOTO_PROFILE4X6.jpg', 'image/jpeg', 1),
    //       (141, '/uploads/users/MEALEA_SMALL.png', 'image/png', 1),
    //       (139, '/uploads/users/SOPHEAP_OUN.JPG', 'image/jpeg', 1);
    //     `;

    //     try {
    //       const [result] = await db.query(query);
    //       console.log('Images inserted successfully:', result);
    //     } catch (error) {
    //       console.error('Error inserting images:', error);
    //     }
    //   };

    // import { DataTypes } from 'sequelize';
    // import sequelize from '../config/database'; // Adjust the path to your database configuration

    // const UIMAGE = sequelize.define('UIMAGE', {
    //   USER_ID: {
    //     type: DataTypes.INTEGER,
    //     allowNull: false,
    //     primaryKey: true,
    //   },
    //   IMAGEPATH: {
    //     type: DataTypes.STRING,
    //     allowNull: false,
    //   },
    //   FILE_TYPE: {
    //     type: DataTypes.STRING,
    //     allowNull: false,
    //   },
    //   CREATED_BY: {
    //     type: DataTypes.INTEGER,
    //     allowNull: false,
    //   },
    // }, {
    //   tableName: 'UIMAGE', // Ensure this matches your table name
    //   timestamps: false, // Disable timestamps if not needed
    // });

    // export default UIMAGE;
}

export default User;
