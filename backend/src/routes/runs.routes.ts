import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { listAll, getById } from '../controllers/run.controller';

const router = Router();

router.use(authenticate);
router.get('/', listAll);
router.get('/:runId', getById);

export default router;
