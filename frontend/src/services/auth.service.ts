import api from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'dispatcher' | 'driver';
  companyId?: string;
  preferences?: {
    notifications?: { email: boolean; push: boolean; sms: boolean };
    appearance?: 'light' | 'dark' | 'system';
  };
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  register: async (name: string, email: string, password: string, role: string): Promise<AuthResponse> => {
    await api.post('/auth/register', { name, email, password, role });
    // Auto-login after successful registration
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },
  
  refresh: async (): Promise<string> => {
    const response = await api.post<{ accessToken: string }>('/auth/refresh');
    return response.data.accessToken;
  },
  
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  updateProfile: async (data: { name?: string; email?: string; preferences?: any }) => {
    const response = await api.put<{ message: string; user: AuthResponse['user'] }>('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await api.put<{ message: string }>('/auth/change-password', data);
    return response.data;
  }
};

export default authService;
