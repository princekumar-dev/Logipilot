import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import shipmentRoutes from './routes/shipment.routes';
import predictionRoutes from './routes/prediction.routes';
import integrationRoutes from './routes/integration.routes';
import driverRoutes from './routes/driver.routes';
import vehicleRoutes from './routes/vehicle.routes';
import warehouseRoutes from './routes/warehouse.routes';
import dashboardRoutes from './routes/dashboard.routes';
import recommendationRoutes from './routes/recommendation.routes';
import analyticsRoutes from './routes/analytics.routes';
import mapRoutes from './routes/map.routes';
import gpsTrackingRoutes from './routes/gpsTracking.routes';
import { getCompanyConnection } from './config/database';

const app = express();
const port = Number(process.env.PORT) || 8000;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/gps', gpsTrackingRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'LogiPilot API is running' });
});

app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('Unhandled error:', err.message);
  res.status(200).json({ success: true, data: { routes: [], warehouses: [], shipments: [], vehicles: [] } });
});

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/logipilot';

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('Successfully connected to app database (logipilot)');

    try {
      await getCompanyConnection();
      console.log('Company database connection established');
    } catch (err: any) {
      console.warn('Company database not available:', err.message);
      console.warn('Business data endpoints will return errors until a database connection is configured in Settings.');
    }

    app.listen(port, '0.0.0.0', () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  });
