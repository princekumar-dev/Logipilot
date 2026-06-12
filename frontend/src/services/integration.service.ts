import api from './api';

export interface DatabaseConfig {
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  ssl?: boolean;
  connectionString?: string;
  provider?: string;
  url?: string;
  trafficProvider?: string;
  [key: string]: unknown;
}

export interface Integration {
  _id: string;
  companyId: string;
  type: 'database' | 'api';
  name: string;
  provider: string;
  config: DatabaseConfig;
  status: 'connected' | 'disconnected' | 'error';
  lastTestedAt?: string;
  lastTestedResult?: { success: boolean; message: string };
  createdAt: string;
  updatedAt: string;
}

const integrationService = {
  getAll: async (): Promise<{ integrations: Integration[] }> => {
    const res = await api.get('/integrations');
    return res.data;
  },

  getById: async (id: string): Promise<{ integration: Integration }> => {
    const res = await api.get(`/integrations/${id}`);
    return res.data;
  },

  create: async (data: {
    type: string;
    name: string;
    provider: string;
    config: DatabaseConfig;
  }): Promise<{ message: string; integration: Integration }> => {
    const res = await api.post('/integrations', data);
    return res.data;
  },

  update: async (id: string, data: {
    name?: string;
    config?: DatabaseConfig;
  }): Promise<{ message: string; integration: Integration }> => {
    const res = await api.put(`/integrations/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const res = await api.delete(`/integrations/${id}`);
    return res.data;
  },

  testConnection: async (id: string): Promise<{ message: string; status: string; result: { success: boolean; message: string } }> => {
    const res = await api.post(`/integrations/${id}/test`);
    return res.data;
  },

  testApiKey: async (id: string): Promise<{ message: string; status: string; result: { success: boolean; message: string; status: string } }> => {
    const res = await api.post(`/integrations/${id}/test-api`);
    return res.data;
  },

  getApiKeys: async (): Promise<{ apiKeys: Record<string, string> }> => {
    const res = await api.get('/integrations/api-keys');
    return res.data;
  },
};

export default integrationService;
