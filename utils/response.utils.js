export const successResponse = (res, message, data = null, statusCode = 200) => {
    res.status(statusCode).json({ success: true, message: message, data });
};

export const errorResponse00 = (res, error, statusCode = 500) => {
    res.status(statusCode).json({ success: false, error });
};

// You might want to standardize your API responses
export const apiResponse1 = (res, status, Message, data = {}) => {
    return res.status(status).json({
        status: status < 400 ? 'success' : 'error',
        Message,
        data
    });
}

export const apiResponse2 = (res, status, message, data = null) => {
    const response = {
        status: status < 400 ? 'success' : 'error',
        message,
        data: Array.isArray(data) ? data : (data || {})
    };

    // For empty arrays, you might want to still return them as arrays
    if (Array.isArray(data) && data.length === 0) {
        response.data = [];
    }

    return res.status(status).json(response);
}

export const RtyApiResponse = (res, status, message, data = null) => {
    const isArray = Array.isArray(data);
    const isObject = typeof data === 'object' && data !== null && !isArray;

    const response = {
        Success: status < 400 ? true : false,
        Status: status < 400 ? 'Success' : 'Error',
        Message: message,
        Data: isArray ? data : isObject ? data : data == null ? {} : { data }   
    };

    // Ensure empty array is returned correctly
    if (isArray && data.length === 0) {
        response.Data = [];
    }

    return res.status(status).json(response);
};


export const errorResponse = (res, statusCode, message) => {
    // Ensure valid status code and message
    const code = statusCode || 500;
    const msg = message || 'Internal Server Error';

    return res.status(code).json({ success: false, error: msg });
};


export const response = (res, statusCode, message, isSuccess = false) => {
    // Ensure valid status code and message
    if (!statusCode) statusCode = isSuccess ? 200 : 500; // Default to 200 for success, 500 for errors
    if (!message) message = isSuccess ? 'Success' : 'Internal Server Error'; // Default message

    // Response structure for success and error
    const responseBody = {
        success: isSuccess,
        Message: message
    };

    // If it's an error, include the error details
    if (!isSuccess) {
        responseBody.error = message;
    }

    return res.status(statusCode).json(responseBody);
};

// response(res, 200, 'Data fetched successfully', true);
// response(res, 500, 'Internal Server Error', false);
// 