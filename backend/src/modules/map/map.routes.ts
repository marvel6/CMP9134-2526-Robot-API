import axios from 'axios';
import { Router } from 'express';
import { config } from '../../config';
import { asyncHandler } from '../../common/asyncHandler';
import { httpResponse } from '../../common/response';
import { authBearer } from '../../middleware/auth';
import { cacheGet, cacheSet } from '../../cache/cache';

const router = Router();

interface MapResponse {
  width: number;
  height: number;
  grid: number[][];
}

router.get(
  '/',
  authBearer,
  asyncHandler(async (_req, res) => {
    const cached = await cacheGet('map_data');
    if (cached) {
      const data = JSON.parse(cached) as MapResponse;
      res.status(200).json(httpResponse('Get Map', data, 200));
      return;
    }

    const upstream = await axios.get<MapResponse>(`${config.baseRobotApiUrl}/api/map`, {
      timeout: 30_000,
    });

    await cacheSet('map_data', JSON.stringify(upstream.data));
    res.status(200).json(httpResponse('Get Map', upstream.data, 200));
  }),
);

export const mapRouter = router;
