import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  phone: { type: String, trim: true, maxlength: 30, default: '' },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['client', 'freelancer'], required: true },
  headline: { type: String, trim: true, maxlength: 120, default: '' },
  skills: { type: [String], default: [] },
  emailVerifiedAt: { type: Date, default: null }
}, { timestamps: true, strict: 'throw' });

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 5000 },
  category: { type: String, required: true, trim: true, maxlength: 60 },
  budget: { type: Number, required: true, min: 1, max: 10000000 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['open', 'in_progress', 'completed', 'cancelled'], default: 'open', index: true }
}, { timestamps: true, strict: 'throw' });

export const User = mongoose.model('User', userSchema);
export const Job = mongoose.model('Job', jobSchema);
