import { Request, Response } from 'express';
import Integration from '../models/Integration';
import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/crypto';

const getOwnerId = (req: Request): string | null => {
  return req.user?.companyId || req.user?.userId || null;
};

const maskApiKey = (encryptedValue?: string): string | undefined => {
  if (!encryptedValue) return undefined;
  try {
    const decrypted = decrypt(encryptedValue);
    if (decrypted.length <= 4) return '****';
    return '****' + decrypted.slice(-4);
  } catch {
    return '****';
  }
};

const maskIntegrationResponse = (integration: any) => {
  const obj = integration.toObject ? integration.toObject() : { ...integration };
  if (obj.config?.apiKey) {
    obj.config = { ...obj.config, apiKey: maskApiKey(obj.config.apiKey) };
  }
  return obj;
};

const encryptConfig = (config: any) => {
  const encrypted = { ...config };
  if (encrypted.password) encrypted.password = encrypt(encrypted.password);
  if (encrypted.apiKey) encrypted.apiKey = encrypt(encrypted.apiKey);
  if (encrypted.connectionString) encrypted.connectionString = encrypt(encrypted.connectionString);
  return encrypted;
};

const buildMongoUri = (config: any): string => {
  if (config.connectionString) {
    if (config.database) {
      const withoutScheme = config.connectionString.replace(/^mongodb(\+srv)?:\/\//, '');
      const pathPart = withoutScheme.split('?')[0];
      const hasDatabase = pathPart.includes('/') && pathPart.split('/').filter(Boolean).length > 1;
      if (!hasDatabase) {
        const qIndex = config.connectionString.indexOf('?');
        if (qIndex !== -1) {
          return config.connectionString.slice(0, qIndex) + '/' + config.database + config.connectionString.slice(qIndex);
        }
        return config.connectionString + '/' + config.database;
      }
    }
    return config.connectionString;
  }
  return `mongodb://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}?authSource=admin`;
};
export const getIntegrations = async (req: Request, res: Response) => {
  try {
    const ownerId = getOwnerId(req);
    if (!ownerId) {
      return res.status(400).json({ message: 'User ID not found' });
    }

    const integrations = await Integration.find({ companyId: new mongoose.Types.ObjectId(ownerId) }).select('-config.password');
    res.json({ integrations: integrations.map(i => {
      const obj = maskIntegrationResponse(i);
      // Ensure nested config fields are returned as plain objects
      if (obj.config && typeof obj.config.toObject === 'function') {
        obj.config = obj.config.toObject();
      }
      return obj;
    }) });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching integrations', error: error.message });
  }
};

export const getIntegration = async (req: Request, res: Response) => {
  try {
    const ownerId = getOwnerId(req);
    if (!ownerId) {
      return res.status(400).json({ message: 'User ID not found' });
    }
    const { id } = req.params;

    const integration = await Integration.findOne({ _id: id, companyId: new mongoose.Types.ObjectId(ownerId) }).select('-config.password');
    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    res.json({ integration: maskIntegrationResponse(integration) });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching integration', error: error.message });
  }
};

export const createIntegration = async (req: Request, res: Response) => {
  try {
    const ownerId = getOwnerId(req);
    if (!ownerId) {
      return res.status(400).json({ message: 'User ID not found' });
    }

    const { type, name, provider, config } = req.body;

    const existing = await Integration.findOne({
      companyId: new mongoose.Types.ObjectId(ownerId),
      type,
      provider,
    });

    if (existing) {
      existing.set({ name, config: encryptConfig(config), status: 'disconnected', lastTestedAt: undefined, lastTestedResult: undefined });
      existing.markModified('config');
      await existing.save();
      return res.json({ message: 'Integration updated', integration: existing });
    }

    const integration = new Integration({
      companyId: new mongoose.Types.ObjectId(ownerId),
      type,
      name,
      provider,
      config: encryptConfig(config),
      status: 'disconnected',
    });

    await integration.save();
    res.status(201).json({ message: 'Integration created', integration });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating integration', error: error.message });
  }
};

export const updateIntegration = async (req: Request, res: Response) => {
  try {
    const ownerId = getOwnerId(req);
    if (!ownerId) {
      return res.status(400).json({ message: 'User ID not found' });
    }
    const { id } = req.params;
    const { name, config } = req.body;

    const existing = await Integration.findOne({ _id: id, companyId: new mongoose.Types.ObjectId(ownerId) });
    if (!existing) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    // Keep existing encrypted values if not provided, don't double-encrypt
    const encryptedFields: any = {};
    if (!config.password) encryptedFields.password = existing.config.password;
    if (!config.connectionString) encryptedFields.connectionString = existing.config.connectionString;
    if (!config.apiKey) encryptedFields.apiKey = existing.config.apiKey;

    const encryptedConfig = { ...encryptConfig(config), ...encryptedFields };

    const updateFields: any = { config: encryptedConfig };
    if (name) updateFields.name = name;

    const integration = await Integration.findOneAndUpdate(
      { _id: id, companyId: new mongoose.Types.ObjectId(ownerId) },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Integration updated', integration });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating integration', error: error.message });
  }
};

export const deleteIntegration = async (req: Request, res: Response) => {
  try {
    const ownerId = getOwnerId(req);
    if (!ownerId) {
      return res.status(400).json({ message: 'User ID not found' });
    }
    const { id } = req.params;

    const integration = await Integration.findOneAndDelete({
      _id: id,
      companyId: new mongoose.Types.ObjectId(ownerId),
    });

    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    res.json({ message: 'Integration deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting integration', error: error.message });
  }
};

const testDatabaseConnection = async (provider: string, config: any): Promise<{ success: boolean; message: string }> => {
  try {
    if (provider === 'mongodb') {
      const mongoose = await import('mongoose');
      const uri = buildMongoUri(config);
      const conn = await mongoose.default.createConnection(uri, { serverSelectionTimeoutMS: 5000 }).asPromise();
      await conn.close();
      return { success: true, message: 'Connected to MongoDB successfully' };
    }

    if (provider === 'postgresql') {
      const { Client } = await import('pg');
      const client = new Client({
        host: config.host,
        port: config.port || 5432,
        database: config.database,
        user: config.username,
        password: config.password,
        ssl: config.ssl ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 5000,
      });
      await client.connect();
      await client.end();
      return { success: true, message: 'Connected to PostgreSQL successfully' };
    }

    if (provider === 'mysql') {
      const mysql = await import('mysql2/promise');
      const connection = await mysql.createConnection({
        host: config.host,
        port: config.port || 3306,
        database: config.database,
        user: config.username,
        password: config.password,
        connectTimeout: 5000,
      });
      await connection.end();
      return { success: true, message: 'Connected to MySQL successfully' };
    }

    if (provider === 'sqlserver') {
      const sql = await import('mssql');
      const pool = await sql.connect({
        server: config.host,
        port: config.port || 1433,
        database: config.database,
        user: config.username,
        password: config.password,
        options: {
          encrypt: config.ssl ?? true,
          trustServerCertificate: true,
          connectTimeout: 5000,
        },
      });
      await pool.close();
      return { success: true, message: 'Connected to SQL Server successfully' };
    }

    if (provider === 'redis') {
      const { createClient } = await import('redis');
      const client = createClient({
        url: config.connectionString || `redis://:${config.password || ''}@${config.host}:${config.port || 6379}`,
      });
      await client.connect();
      await client.disconnect();
      return { success: true, message: 'Connected to Redis successfully' };
    }

    return { success: false, message: `Unsupported provider: ${provider}` };
  } catch (error: any) {
    return { success: false, message: error.message || 'Connection failed' };
  }
};

export const testConnection = async (req: Request, res: Response) => {
  try {
    const ownerId = getOwnerId(req);
    if (!ownerId) {
      return res.status(400).json({ message: 'User ID not found' });
    }
    const { id } = req.params;

    const integration = await Integration.findOne({
      _id: id,
      companyId: new mongoose.Types.ObjectId(ownerId),
    });

    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    const result = await testDatabaseConnection(integration.provider, {
      ...integration.config,
      password: integration.config.password ? decrypt(integration.config.password) : undefined,
      connectionString: integration.config.connectionString ? decrypt(integration.config.connectionString) : undefined,
      apiKey: integration.config.apiKey ? decrypt(integration.config.apiKey) : undefined,
    });

    integration.status = result.success ? 'connected' : 'error';
    integration.lastTestedAt = new Date();
    integration.lastTestedResult = result;
    await integration.save();

    res.json({ message: result.message, status: integration.status, result });
  } catch (error: any) {
    res.status(500).json({ message: 'Error testing connection', error: error.message });
  }
};

const ORS_BASE_URL = process.env.ORS_BASE_URL || 'http://localhost:8080/ors/v2';

const testApiKeyStatus = async (provider: string, apiKey: string): Promise<{ success: boolean; message: string; status: 'active' | 'quota_exhausted' | 'invalid_key' | 'error' }> => {
  try {
    if (provider === 'openrouteservice') {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKey) {
        headers['Authorization'] = apiKey;
      }

      const response = await fetch(
        `${ORS_BASE_URL}/directions/driving-car`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            coordinates: [
              [-74.0060, 40.7128],
              [-73.9855, 40.7580],
            ],
          }),
        }
      );

      if (response.ok) {
        return { success: true, message: 'API key is active and working', status: 'active' };
      }

      const data = await response.json() as any;

      if (response.status === 401 || response.status === 403) {
        return { success: false, message: 'API key is invalid', status: 'invalid_key' };
      }
      if (response.status === 429) {
        return { success: false, message: 'API quota exhausted', status: 'quota_exhausted' };
      }
      if (data?.error?.message) {
        return { success: false, message: data.error.message, status: 'error' };
      }

      return { success: true, message: 'API key is active', status: 'active' };
    }
    return { success: false, message: `Status check not supported for ${provider}`, status: 'error' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to check API status', status: 'error' };
  }
};

const testWeatherApiKey = async (apiKey: string): Promise<{ success: boolean; message: string; status: 'active' | 'quota_exhausted' | 'invalid_key' | 'error' }> => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=Delhi&appid=${apiKey}&units=metric`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (response.ok) return { success: true, message: 'OpenWeather API key is active', status: 'active' };
    if (response.status === 401) return { success: false, message: 'API key is invalid', status: 'invalid_key' };
    if (response.status === 429) return { success: false, message: 'API quota exhausted', status: 'quota_exhausted' };
    return { success: false, message: `OpenWeather returned status ${response.status}`, status: 'error' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to reach OpenWeather', status: 'error' };
  }
};

const testTrafficApiKey = async (provider: string, apiKey: string): Promise<{ success: boolean; message: string; status: 'active' | 'quota_exhausted' | 'invalid_key' | 'error' }> => {
  try {
    let url = '';
    if (provider === 'tomtom') {
      url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${apiKey}&point=28.7041,77.1025`;
    } else if (provider === 'here') {
      url = `https://traffic.ls.hereapi.com/traffic/6.3_flow.json?apiKey=${apiKey}&bbox=28.6,77.0,28.8,77.2`;
    } else if (provider === 'mapbox') {
      url = `https://api.mapbox.com/directions/v5/mapbox/driving/77.1025,28.7041;77.2090,28.5272?access_token=${apiKey}`;
    } else {
      return { success: false, message: `Unsupported traffic provider: ${provider}`, status: 'error' };
    }
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (response.ok) return { success: true, message: `${provider} API key is active`, status: 'active' };
    if (response.status === 401 || response.status === 403) return { success: false, message: 'API key is invalid', status: 'invalid_key' };
    if (response.status === 429) return { success: false, message: 'API quota exhausted', status: 'quota_exhausted' };
    return { success: false, message: `${provider} returned status ${response.status}`, status: 'error' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to reach traffic API', status: 'error' };
  }
};

export const testApiKey = async (req: Request, res: Response) => {
  try {
    const ownerId = getOwnerId(req);
    if (!ownerId) {
      return res.status(400).json({ message: 'User ID not found' });
    }
    const { id } = req.params;

    const integration = await Integration.findOne({
      _id: id,
      companyId: new mongoose.Types.ObjectId(ownerId),
    });

    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    // Handle routing provider specially — test OSRM endpoint
    if (integration.provider === 'routing') {
      const cfg: any = integration.config?.toObject ? integration.config.toObject() : integration.config || {};
      const routeProvider = cfg.provider || 'public';
      const baseUrl = routeProvider === 'local' && cfg.url
        ? cfg.url.replace(/\/+$/, '')
        : 'https://router.project-osrm.org';

      try {
        const response = await fetch(
          `${baseUrl}/route/v1/driving/77.1025,28.7041;77.2090,28.5272?overview=false`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (response.ok) {
          const result = { success: true, message: 'OSRM server is reachable', status: 'active' as const };
          integration.status = 'connected';
          integration.lastTestedAt = new Date();
          integration.lastTestedResult = result;
          await integration.save();
          return res.json({ message: result.message, status: integration.status, result });
        }
        const result = { success: false, message: `OSRM returned status ${response.status}`, status: 'error' as const };
        integration.status = 'error';
        integration.lastTestedAt = new Date();
        integration.lastTestedResult = result;
        await integration.save();
        return res.json({ message: result.message, status: integration.status, result });
      } catch {
        const result = { success: false, message: 'Cannot reach OSRM server', status: 'error' as const };
        integration.status = 'error';
        integration.lastTestedAt = new Date();
        integration.lastTestedResult = result;
        await integration.save();
        return res.json({ message: result.message, status: integration.status, result });
      }
    }

    if (integration.type !== 'api' || !integration.config.apiKey) {
      return res.status(400).json({ message: 'No API key found for this integration' });
    }

    const decryptedKey = decrypt(integration.config.apiKey);

    let result;
    if (integration.provider === 'openweather') {
      result = await testWeatherApiKey(decryptedKey);
    } else if (integration.provider === 'traffic') {
      const trafficProvider = (integration.config as any).trafficProvider || 'tomtom';
      result = await testTrafficApiKey(trafficProvider, decryptedKey);
    } else {
      result = await testApiKeyStatus(integration.provider, decryptedKey);
    }

    integration.status = result.success ? 'connected' : 'error';
    integration.lastTestedAt = new Date();
    integration.lastTestedResult = result;
    await integration.save();

    res.json({ message: result.message, status: integration.status, result });
  } catch (error: any) {
    res.status(500).json({ message: 'Error testing API key', error: error.message });
  }
};

export const getApiKeys = async (req: Request, res: Response) => {
  try {
    const ownerId = getOwnerId(req);
    if (!ownerId) {
      return res.status(400).json({ message: 'User ID not found' });
    }

    const integrations = await Integration.find({
      companyId: new mongoose.Types.ObjectId(ownerId),
      type: 'api',
    });

    const apiKeys: Record<string, string> = {};
    for (const integration of integrations) {
      if (integration.config.apiKey) {
        try {
          apiKeys[integration.provider] = decrypt(integration.config.apiKey);
        } catch {
          // skip unparseable keys
        }
      }
    }

    res.json({ apiKeys });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching API keys', error: error.message });
  }
};
