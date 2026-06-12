import mongoose from 'mongoose';
import Integration from '../models/Integration';
import { decrypt } from '../utils/crypto';

let companyConnection: mongoose.Connection | null = null;
let companyConnectionPromise: Promise<mongoose.Connection> | null = null;

export const getCompanyConnection = async (): Promise<mongoose.Connection> => {
  if (companyConnection && companyConnection.readyState === 1) {
    return companyConnection;
  }

  if (companyConnectionPromise) {
    return companyConnectionPromise;
  }

  companyConnectionPromise = connectToCompanyDB();
  return companyConnectionPromise;
};

function buildCompanyUri(config: any): { uri: string; dbName: string } {
  const dbName = config.database || 'logistics_ops';

  if (config.connectionString) {
    let rawUri = decrypt(config.connectionString);

    // Parse the URI to extract components
    const schemeMatch = rawUri.match(/^(mongodb(?:\+srv)?):\/\//);
    const scheme = schemeMatch ? schemeMatch[1] : 'mongodb';

    // Remove scheme for parsing
    const withoutScheme = rawUri.slice(scheme.length + 3); // +3 for "://"

    // Split at '?' to separate authority+path from query
    const questionIdx = withoutScheme.indexOf('?');
    const authorityPath = questionIdx !== -1 ? withoutScheme.slice(0, questionIdx) : withoutScheme;
    const queryString = questionIdx !== -1 ? withoutScheme.slice(questionIdx + 1) : '';

    // Split authority from path: authority is before the first / in the path
    // In SRV URIs: user:pass@host or user:pass@host/dbname
    const atIndex = authorityPath.lastIndexOf('@');
    const hostPart = atIndex !== -1 ? authorityPath.slice(0, atIndex) : authorityPath;
    const afterAt = atIndex !== -1 ? authorityPath.slice(atIndex + 1) : authorityPath;

    // Find path (after host)
    const slashIdx = afterAt.indexOf('/');
    const host = slashIdx !== -1 ? afterAt.slice(0, slashIdx) : afterAt;
    const pathPart = slashIdx !== -1 ? afterAt.slice(slashIdx + 1) : '';

    // Rebuild URI with correct database name
    let finalUri = `${scheme}://${hostPart}@${host}/${dbName}`;
    if (queryString) {
      finalUri += `?${queryString}`;
    }

    return { uri: finalUri, dbName };
  }

  // Build from individual fields
  const host = config.host || 'localhost';
  const port = config.port || '27017';
  const username = decrypt(config.username || '');
  const password = decrypt(config.password || '');

  let uri: string;
  if (username && password) {
    uri = `mongodb://${username}:${password}@${host}:${port}/${dbName}?authSource=admin`;
  } else {
    uri = `mongodb://${host}:${port}/${dbName}`;
  }

  return { uri, dbName };
}

async function connectToCompanyDB(): Promise<mongoose.Connection> {
  try {
    const integration = await Integration.findOne({ type: 'database', provider: 'mongodb', status: 'connected' })
      .sort({ updatedAt: -1 });

    if (!integration) {
      throw new Error('No connected MongoDB integration found. Please configure a database connection in Settings.');
    }

    const { uri, dbName } = buildCompanyUri(integration.config);

    const maskedUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log(`Connecting to company DB: ${dbName} (${maskedUri})`);

    companyConnection = await mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }).asPromise();

    console.log(`Connected to company database: ${dbName}`);

    companyConnection.on('error', (err) => {
      console.error('Company DB connection error:', err.message);
      companyConnection = null;
      companyConnectionPromise = null;
    });

    companyConnection.on('disconnected', () => {
      console.warn('Company DB disconnected. Will reconnect on next request.');
      companyConnection = null;
      companyConnectionPromise = null;
    });

    return companyConnection;
  } catch (error: any) {
    companyConnection = null;
    companyConnectionPromise = null;
    console.error('Failed to connect to company database:', error.message);
    throw error;
  }
}

export const resetCompanyConnection = () => {
  if (companyConnection) {
    companyConnection.close();
    companyConnection = null;
    companyConnectionPromise = null;
  }
};
