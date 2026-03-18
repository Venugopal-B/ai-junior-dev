import { Router, Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, getUserById } from '../services/auth.service';
import { registerSchema, loginSchema } from '../validations/auth.validation';
import { sendSuccess, sendCreated, sendUnauthorized } from '../utils/apiResponse';
import { verifyToken } from '../utils/jwt';

const router = Router();

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body } = registerSchema.parse({ body: req.body });
    const result = await registerUser(body.name, body.email, body.password);
    sendCreated(res, result, 'Account created successfully');
  } catch (err) { next(err); }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body } = loginSchema.parse({ body: req.body });
    const result = await loginUser(body.email, body.password);
    sendSuccess(res, result, 200, 'Login successful');
  } catch (err) { next(err); }
});

router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) { sendUnauthorized(res); return; }
    const payload = verifyToken(authHeader.split(' ')[1]);
    const userId = payload.userId ?? payload.id;
    if (!userId) { sendUnauthorized(res, 'Invalid token payload'); return; }
    const user = await getUserById(userId);
    sendSuccess(res, user);
  } catch (err) { next(err); }
});

export default router;
