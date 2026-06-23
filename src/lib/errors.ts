export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly isOperational: boolean = true,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ApiError extends AppError {
  constructor(status: number, body: any) {
    super(
      body?.detail || body?.message || `API error ${status}`,
      `API_${status}`,
      status,
    );
    this.name = 'ApiError';
  }
}

export class NetworkError extends AppError {
  constructor() {
    super('Cannot connect to server. Check your internet connection.', 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.statusCode) {
      case 401: return 'Please log in to continue.';
      case 403: return 'You don\'t have permission to do this.';
      case 404: return 'Not found.';
      case 429: return 'Too many requests. Please wait a moment.';
      case 422: return 'Please check your input.';
      default: return 'Something went wrong. Please try again.';
    }
  }
  if (error instanceof NetworkError) return error.message;
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return 'Cannot connect to server.';
  }
  return 'An unexpected error occurred.';
}
