/**
 * Typed error classes for service layer
 */

export class AuthRequiredError extends Error {
  code = 'AUTH_REQUIRED';
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthRequiredError';
  }
}

export class PermissionDeniedError extends Error {
  code = 'PERMISSION_DENIED';
  constructor(message = 'Permission denied') {
    super(message);
    this.name = 'PermissionDeniedError';
  }
}

export class NotFoundError extends Error {
  code = 'NOT_FOUND';
  constructor(resource: string, id?: string) {
    super(id ? `${resource} not found: ${id}` : `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  code = 'VALIDATION_ERROR';
  constructor(message: string, field?: string) {
    super(field ? `${field}: ${message}` : message);
    this.name = 'ValidationError';
  }
}

export class ConflictError extends Error {
  code = 'CONFLICT';
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}
