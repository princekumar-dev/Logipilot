import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Warehouse from './models/Warehouse';
import Driver from './models/Driver';
import Vehicle from './models/Vehicle';
import Shipment from './models/Shipment';
import ShipmentFeature from './models/ShipmentFeature';

dotenv.config();

const argUri = process.argv.find((a) => a.startsWith('--uri='));
const MONGODB_URI = argUri
  ? argUri.split('=')[1]
  : process.env.SEED_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/logipilot';

console.log(`Target: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);

const indianCities = [
  { name: 'Mumbai', code: 'MUM', lat: 19.076, lng: 72.8777 },
  { name: 'Delhi', code: 'DEL', lat: 28.7041, lng: 77.1025 },
  { name: 'Bangalore', code: 'BLR', lat: 12.9716, lng: 77.5946 },
  { name: 'Chennai', code: 'CHN', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata', code: 'KOL', lat: 22.5726, lng: 88.3639 },
  { name: 'Hyderabad', code: 'HYD', lat: 17.385, lng: 78.4867 },
  { name: 'Pune', code: 'PUN', lat: 18.5204, lng: 73.8567 },
  { name: 'Ahmedabad', code: 'AMD', lat: 23.0225, lng: 72.5714 },
  { name: 'Jaipur', code: 'JAI', lat: 26.9124, lng: 75.7873 },
  { name: 'Lucknow', code: 'LKO', lat: 26.8467, lng: 80.9462 },
];

const driverNames = [
  'Rajesh Kumar', 'Amit Singh', 'Priya Patel', 'Vikram Sharma', 'Suresh Reddy',
  'Anjali Nair', 'Deepak Verma', 'Sanjay Gupta', 'Ravi Teja', 'Kavita Joshi',
  'Manoj Tiwari', 'Pooja Mehta', 'Arun Prasad', 'Neha Kapoor', 'Rahul Yadav',
  'Sunita Devi', 'Vijay Malhotra', 'Asha Rani', 'Kiran Bhat', 'Meena Kumari',
];

const vehicleTypes: Array<'truck' | 'van' | 'bike' | 'container'> = ['truck', 'van', 'bike', 'container'];
const fuelTypes: Array<'diesel' | 'petrol' | 'electric' | 'cng'> = ['diesel', 'petrol', 'electric', 'cng'];
const priorities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
const roadTypes: Array<'highway' | 'urban' | 'rural' | 'mixed'> = ['highway', 'urban', 'rural', 'mixed'];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.\n');

  // Clear existing data
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Warehouse.deleteMany({}),
    Driver.deleteMany({}),
    Vehicle.deleteMany({}),
    Shipment.deleteMany({}),
    ShipmentFeature.deleteMany({}),
  ]);
  console.log('Cleared.\n');

  // Create a default company user
  console.log('Creating user...');
  const user = await User.create({
    name: 'Admin User',
    email: 'admin@logipilot.com',
    passwordHash: 'admin123',
    role: 'admin',
    status: 'active',
  });
  console.log(`  User: ${user.email}`);

  // Create warehouses
  console.log('\nCreating warehouses...');
  const warehouses = await Warehouse.insertMany(
    indianCities.map((city) => ({
      companyId: user._id,
      name: `${city.name} Warehouse`,
      code: city.code,
      address: `${city.name}, India`,
      location: { type: 'Point', coordinates: [city.lng, city.lat] },
      capacity: randomInt(500, 2000),
      currentOccupancy: randomInt(100, 800),
      contactPhone: `+91${randomInt(70000, 99999)}${randomInt(10000, 99999)}`,
      operatingHours: { open: '06:00', close: '22:00' },
      status: 'active',
    }))
  );
  console.log(`  Warehouses: ${warehouses.length}`);

  // Create drivers
  console.log('Creating drivers...');
  const drivers = await Driver.insertMany(
    driverNames.map((name, i) => ({
      companyId: user._id,
      name,
      phone: `+91${randomInt(70000, 99999)}${randomInt(10000, 99999)}`,
      email: `${name.toLowerCase().replace(/\s/g, '.')}@example.com`,
      licenseNumber: `DL-${randomInt(10, 99)}-${randomInt(100000, 999999)}`,
      rating: randomFloat(2.5, 5.0),
      onTimeRate: randomFloat(0.6, 0.98),
      totalDeliveries: randomInt(50, 500),
      totalDelays: randomInt(2, 50),
      yearsExperience: randomInt(1, 15),
      status: 'active',
    }))
  );
  console.log(`  Drivers: ${drivers.length}`);

  // Create vehicles
  console.log('Creating vehicles...');
  const vehicles = await Vehicle.insertMany(
    Array.from({ length: 20 }, (_, i) => ({
      companyId: user._id,
      vehicleNumber: `MH${randomInt(10, 99)}${String.fromCharCode(65 + randomInt(0, 5))}${randomInt(1000, 9999)}`,
      type: randomElement(vehicleTypes),
      capacityKg: randomInt(500, 10000),
      healthScore: randomInt(60, 100),
      fuelType: randomElement(fuelTypes),
      lastServiceDate: new Date(Date.now() - randomInt(10, 90) * 86400000),
      nextServiceDate: new Date(Date.now() + randomInt(10, 60) * 86400000),
      status: randomElement(['available', 'available', 'available', 'in_use']),
    }))
  );
  console.log(`  Vehicles: ${vehicles.length}`);

  // Create shipments with realistic data
  console.log('\nCreating shipments...');
  const shipmentCount = 300;
  const shipments: any[] = [];

  for (let i = 0; i < shipmentCount; i++) {
    const origin = randomElement(warehouses);
    let dest = randomElement(warehouses);
    while (dest._id.toString() === origin._id.toString()) {
      dest = randomElement(warehouses);
    }

    const originIdx = indianCities.findIndex((c) => c.code === origin.code);
    const destIdx = indianCities.findIndex((c) => c.code === dest.code);
    const distance = getDistanceKm(
      indianCities[originIdx].lat, indianCities[originIdx].lng,
      indianCities[destIdx].lat, indianCities[destIdx].lng
    );

    const dispatchDate = new Date(Date.now() - randomInt(0, 30) * 86400000 + randomInt(0, 86400000));
    const plannedDurationHours = distance / randomInt(30, 80);
    const plannedDelivery = new Date(dispatchDate.getTime() + plannedDurationHours * 3600000);

    const isDelayed = Math.random() < 0.25;
    const delayMins = isDelayed ? randomInt(15, 180) : 0;
    const statusRoll = Math.random();
    let status: 'pending' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled';
    if (statusRoll < 0.1) status = 'pending';
    else if (statusRoll < 0.3) status = 'in_transit';
    else if (statusRoll < 0.55) status = 'delivered';
    else if (statusRoll < 0.75) status = 'delayed';
    else status = 'cancelled';

    if (status === 'delivered') {
      const actualDelivery = new Date(plannedDelivery.getTime() + delayMins * 60000);
      shipments.push({
        trackingNumber: `LP${String(100001 + i)}`,
        companyId: user._id,
        originWarehouseId: origin._id,
        destinationWarehouseId: dest._id,
        destinationAddress: `${indianCities[destIdx].name}, India`,
        destinationLocation: { type: 'Point', coordinates: [indianCities[destIdx].lng, indianCities[destIdx].lat] },
        driverId: randomElement(drivers)._id,
        vehicleId: randomElement(vehicles)._id,
        status,
        priority: randomElement(priorities),
        distanceKm: distance,
        weightKg: randomInt(10, 5000),
        packageCount: randomInt(1, 200),
        plannedDispatchTime: dispatchDate,
        actualDispatchTime: new Date(dispatchDate.getTime() + randomInt(0, 30) * 60000),
        plannedDeliveryTime: plannedDelivery,
        actualDeliveryTime: actualDelivery,
        riskScore: randomInt(0, 100),
        predictedDelay: delayMins,
        eta: actualDelivery,
        predictedETA: actualDelivery,
        lisScore: randomInt(40, 100),
      });
    } else if (status === 'delayed') {
      shipments.push({
        trackingNumber: `LP${String(100001 + i)}`,
        companyId: user._id,
        originWarehouseId: origin._id,
        destinationWarehouseId: dest._id,
        destinationAddress: `${indianCities[destIdx].name}, India`,
        destinationLocation: { type: 'Point', coordinates: [indianCities[destIdx].lng, indianCities[destIdx].lat] },
        driverId: randomElement(drivers)._id,
        vehicleId: randomElement(vehicles)._id,
        status,
        priority: randomElement(priorities),
        distanceKm: distance,
        weightKg: randomInt(10, 5000),
        packageCount: randomInt(1, 200),
        plannedDispatchTime: dispatchDate,
        actualDispatchTime: dispatchDate,
        plannedDeliveryTime: plannedDelivery,
        riskScore: randomInt(50, 100),
        predictedDelay: delayMins,
        eta: new Date(Date.now() + randomInt(1, 24) * 3600000),
        predictedETA: new Date(Date.now() + randomInt(1, 24) * 3600000),
        lisScore: randomInt(20, 60),
      });
    } else {
      shipments.push({
        trackingNumber: `LP${String(100001 + i)}`,
        companyId: user._id,
        originWarehouseId: origin._id,
        destinationWarehouseId: dest._id,
        destinationAddress: `${indianCities[destIdx].name}, India`,
        destinationLocation: { type: 'Point', coordinates: [indianCities[destIdx].lng, indianCities[destIdx].lat] },
        driverId: randomElement(drivers)._id,
        vehicleId: randomElement(vehicles)._id,
        status,
        priority: randomElement(priorities),
        distanceKm: distance,
        weightKg: randomInt(10, 5000),
        packageCount: randomInt(1, 200),
        plannedDispatchTime: dispatchDate,
        riskScore: randomInt(0, 80),
        eta: plannedDelivery,
        predictedETA: plannedDelivery,
        lisScore: randomInt(50, 100),
      });
    }
  }

  const createdShipments = await Shipment.insertMany(shipments);
  console.log(`  Shipments: ${createdShipments.length}`);

  // Create feature store entries for delivered/delayed shipments
  console.log('Creating shipment features...');
  const features = createdShipments
    .filter((s) => s.status === 'delivered' || s.status === 'delayed')
    .map((s) => {
      const dispatchDate = s.plannedDispatchTime || s.createdAt;
      const wasDelayed = s.status === 'delayed';
      return {
        shipmentId: s._id,
        companyId: user._id,
        trafficScore: randomInt(20, 95),
        weatherScore: randomInt(10, 80),
        distanceKm: s.distanceKm || 0,
        driverScore: randomInt(50, 100),
        vehicleScore: randomInt(60, 100),
        warehouseCongestionScore: randomInt(10, 80),
        historicalDelayRate: randomFloat(0.05, 0.4),
        roadType: randomElement(roadTypes),
        dispatchHour: dispatchDate.getHours(),
        dayOfWeek: dispatchDate.getDay(),
        month: dispatchDate.getMonth() + 1,
        isHoliday: Math.random() < 0.1,
        isPeakHour: dispatchDate.getHours() >= 8 && dispatchDate.getHours() <= 10 || dispatchDate.getHours() >= 17 && dispatchDate.getHours() <= 19,
        weightKg: s.weightKg || 0,
        packageCount: s.packageCount || 1,
        actualDelayMinutes: wasDelayed ? randomInt(15, 180) : 0,
        wasDelayed,
        generatedAt: new Date(),
      };
    });

  if (features.length > 0) {
    await ShipmentFeature.insertMany(features);
    console.log(`  Features: ${features.length}`);
  }

  // Summary
  const statusCounts = await Shipment.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  console.log('\n--- Shipment Status Summary ---');
  statusCounts.forEach((s: any) => console.log(`  ${s._id}: ${s.count}`));

  const priorityCounts = await Shipment.aggregate([
    { $group: { _id: '$priority', count: { $sum: 1 } } },
  ]);
  console.log('\n--- Priority Distribution ---');
  priorityCounts.forEach((p: any) => console.log(`  ${p._id}: ${p.count}`));

  const avgDistance = await Shipment.aggregate([
    { $group: { _id: null, avg: { $avg: '$distanceKm' }, min: { $min: '$distanceKm' }, max: { $max: '$distanceKm' } } },
  ]);
  if (avgDistance[0]) {
    console.log(`\n--- Distance Stats ---`);
    console.log(`  Avg: ${avgDistance[0].avg.toFixed(0)} km | Min: ${avgDistance[0].min} km | Max: ${avgDistance[0].max} km`);
  }

  const delayedCount = createdShipments.filter((s) => s.status === 'delayed').length;
  const totalDeliveredOrDelayed = createdShipments.filter((s) => s.status === 'delivered' || s.status === 'delayed').length;
  console.log(`\n--- Delay Rate ---`);
  console.log(`  ${delayedCount} delayed out of ${totalDeliveredOrDelayed} completed = ${((delayedCount / totalDeliveredOrDelayed) * 100).toFixed(1)}%`);

  console.log('\nSeeding complete!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
