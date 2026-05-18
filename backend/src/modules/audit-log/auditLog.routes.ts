import { Router } from 'express';
import { asyncHandler } from '../../common/asyncHandler';
import { httpResponse } from '../../common/response';
import { authBearer, requirePermission } from '../../middleware/auth';
import { parsePagination } from '../../common/paginator';
import { getAllAuditLogs } from './auditLog.service';

const router = Router();

router.get(
  '/',
  authBearer,
  requirePermission,
  asyncHandler(async (req, res) => {
    const { page, limit } = parsePagination(req.query as Record<string, string>);
    const data = await getAllAuditLogs(page, limit);
    res.status(200).json(httpResponse('Get all Audit Logs', data, 200));
  }),
);

export const auditLogRouter = router;
