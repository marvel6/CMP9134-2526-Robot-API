import { Router } from 'express';
import { httpResponse } from '../../common/response';

const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json(httpResponse('Health check', null, 200));
});

router.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

export const healthRouter = router;
