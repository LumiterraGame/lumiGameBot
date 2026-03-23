export class HttpError extends Error {
  readonly statusCode: number;
  readonly code?: string;
  readonly details?: Record<string, unknown>;

  constructor(statusCode: number, message: string, options?: { code?: string; details?: Record<string, unknown> }) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.code = options?.code;
    this.details = options?.details;
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(400, message);
  }
}

export class MethodNotAllowedError extends HttpError {
  constructor(message = "Method not allowed") {
    super(405, message);
  }
}

export class UpstreamServiceError extends HttpError {
  constructor(statusCode: number, message: string, options?: { code?: string; details?: Record<string, unknown> }) {
    super(statusCode, message, options);
  }
}
