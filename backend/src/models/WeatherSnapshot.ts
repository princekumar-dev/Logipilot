import mongoose, { Document, Schema } from 'mongoose';

export interface IWeatherSnapshot extends Document {
  location: { type: string; coordinates: number[] };
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection?: number;
  rainfall: number;
  visibility: number;
  condition: 'clear' | 'cloudy' | 'rain' | 'heavy_rain' | 'storm' | 'snow' | 'fog';
  severityScore: number;
  source: 'google_weather' | 'manual';
  timestamp: Date;
}

const weatherSnapshotSchema = new Schema<IWeatherSnapshot>(
  {
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true, min: 0, max: 100 },
    windSpeed: { type: Number, required: true },
    windDirection: { type: Number },
    rainfall: { type: Number, default: 0 },
    visibility: { type: Number, default: 10 },
    condition: {
      type: String,
      enum: ['clear', 'cloudy', 'rain', 'heavy_rain', 'storm', 'snow', 'fog'],
      default: 'clear',
    },
    severityScore: { type: Number, default: 0, min: 0, max: 100 },
    source: { type: String, enum: ['google_weather', 'manual'], default: 'google_weather' },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

weatherSnapshotSchema.index({ location: '2dsphere' });
weatherSnapshotSchema.index({ timestamp: -1 });

export default mongoose.model<IWeatherSnapshot>('WeatherSnapshot', weatherSnapshotSchema);
