import { Router } from 'express';
import { listByProject, create, remove, updateContent } from '../controllers/file.controller';

const router = Router({ mergeParams: true });

router.get('/', listByProject);
router.post('/', create);
router.put('/:fileId', updateContent);
router.delete('/:fileId', remove);

export default router;
