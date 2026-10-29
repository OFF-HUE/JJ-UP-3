import { Router } from 'express';
import { z } from 'zod';
import { Job, User } from '../models.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const createJobSchema = z.object({
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(20).max(5000),
  category: z.string().trim().min(2).max(60),
  budget: z.coerce.number().finite().min(1).max(10000000)
});

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, Math.min(10000, Number.parseInt(req.query.page, 10) || 1));
    const limit = Math.max(1, Math.min(30, Number.parseInt(req.query.limit, 10) || 12));
    const filter = { status: 'open' };
    if (req.query.category && typeof req.query.category === 'string') filter.category = req.query.category.slice(0, 60);
    const [jobs, total] = await Promise.all([
      Job.find(filter).populate('owner', 'name headline').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Job.countDocuments(filter)
    ]);
    res.json({ jobs, page, limit, total });
  } catch (err) { next(err); }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const parsed = createJobSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Please check the job details and try again.' });
    const user = await User.findById(req.session.userId).select('role emailVerifiedAt');
    if (!user || !user.emailVerifiedAt) return res.status(403).json({ error: 'Verify your email before posting a job.' });
    if (user.role !== 'client') return res.status(403).json({ error: 'Only client accounts can post jobs.' });
    const job = await Job.create({ ...parsed.data, owner: user.id });
    res.status(201).json({ job });
  } catch (err) { next(err); }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId).select('role emailVerifiedAt');
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    if (!user || !user.emailVerifiedAt || String(job.owner) !== String(user.id)) {
      return res.status(403).json({ error: 'You cannot delete this job.' });
    }
    await job.deleteOne();
    res.status(204).end();
  } catch (err) { next(err); }
});
export default router;
