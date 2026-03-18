import { Router } from 'express';
import { explain, analyze, generateTestsCtrl, suggestFixCtrl, runAll, runAllAsync } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.post('/run-all-async', runAllAsync);
router.post('/run-all', runAll);
router.post('/explain', explain);
router.post('/analyze', analyze);
router.post('/generate-tests', generateTestsCtrl);
router.post('/suggest-fix', suggestFixCtrl);

export default router;
