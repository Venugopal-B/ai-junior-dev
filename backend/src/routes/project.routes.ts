import { Router } from 'express';
import { list, getById, create, remove } from '../controllers/project.controller';
import { authenticate } from '../middleware/auth.middleware';
import fileRouter from './file.routes';
import runRouter from './run.routes';

const router = Router();
router.use(authenticate);

router.get('/', list);
router.post('/', create);
router.get('/:id', getById);
router.delete('/:id', remove);
router.use('/:id/files', fileRouter);
router.use('/:id/runs', runRouter);

export default router;
