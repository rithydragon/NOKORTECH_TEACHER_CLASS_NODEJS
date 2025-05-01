// permissions.js
export const routePermissionsMap = {
    '/create-course': {
        'admin': ['CREATE_COURSE', 'ADMIN_ACCESS'],
        'teacher': ['CREATE_COURSE'],
        // No permissions for student
    },
    '/view-course': {
        'user': ['VIEW_COURSE'],
        'teacher': ['VIEW_COURSE'],
        'student': ['VIEW_COURSE'],
    },
    '/edit-course': {
        'admin': ['EDIT_COURSE', 'ADMIN_ACCESS'],
        'teacher': ['EDIT_COURSE'],
        // No permissions for student
    },
    '/delete-course': {
        'admin': ['DELETE_COURSE', 'ADMIN_ACCESS'],
        // No permissions for teacher or student
    },
    // Add more routes as necessary...
};

// Utility function to get permissions for a specific route and role
export const getRequiredPermissionsForRoute = (route, role) => {
    if (routePermissionsMap[route]) {
        return routePermissionsMap[route][role] || [];
    }
    return [];
};
