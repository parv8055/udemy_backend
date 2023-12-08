class ApiError extends Error {
  constructor(
    statusCode,
    errors = [],
    message = 'something went wrong🚨🚨',
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.data = null;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports=ApiError;
