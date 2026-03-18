import { Router } from 'express';
import { listByProject, getById } from '../controllers/run.controller';

const router = Router({ mergeParams: true });

router.get('/', listByProject);
router.get('/:runId', getById);

export default router;
