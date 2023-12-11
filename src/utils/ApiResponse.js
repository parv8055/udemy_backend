class ApiResponse {
  constructor(statusCode, data, message = '🙊Success🙊') {
    this.statusCode = statusCode;
    this.results = data?.length;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }
}

module.exports = ApiResponse;
