class AppError extends Error {
    constructor (message, statusCode)  {
        super(message); // Pass the error message to the constructor of the built in Error class
        this.statusCode = statusCode;
        // Convert the statusCode into a string and check if it starts with a 4 in the next line of code
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // If it returns true, fail is selected and likewise
        this.isOperational = true;

        // Remove the errors here from the stack trace for cleaner debugging
        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;