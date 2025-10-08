export class ApiResponse<T> {
  public success: boolean;
  public message: string;
  public data?: T;
  public pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };

  constructor(
    message: string,
    data?: T,
    pagination?: { page: number; limit: number; total: number; pages: number }
  ) {
    this.success = true;
    this.message = message;
    this.data = data;
    this.pagination = pagination;
  }

  static success<T>(message: string, data?: T, pagination?: any) {
    return new ApiResponse(message, data, pagination);
  }
}