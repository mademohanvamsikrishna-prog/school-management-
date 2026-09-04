export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'teacher' | 'student' | 'parent' | 'staff';
    permissions: string[];
    avatarUrl?: string;
  };
}
