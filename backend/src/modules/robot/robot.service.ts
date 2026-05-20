import axios, { AxiosError } from 'axios';
import { config } from '../../config';
import { getRedis } from '../../cache/redis';
import { cacheDelete } from '../../cache/cache';
import {
  ForbiddenException,
  ServiceUnavailableException,
} from '../../common/exceptions';
import type { UserHydrated } from '../../db/models/User';
import { createAuditLog } from '../audit-log/auditLog.service';

export type NavigationEnum = 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';

export interface RobotPosition {
  x: number;
  y: number;
}

const MAP_BOUNDARY = 20;

export function calculateNewPosition(
  position: RobotPosition,
  navigation: NavigationEnum,
): RobotPosition {
  switch (navigation) {
    case 'RIGHT':
      return { x: position.x < MAP_BOUNDARY ? position.x + 1 : position.x, y: position.y };
    case 'LEFT':
      return { x: position.x > 0 ? position.x - 1 : position.x, y: position.y };
    case 'UP':
      return { x: position.x, y: position.y > 0 ? position.y - 1 : position.y };
    case 'DOWN':
      return { x: position.x, y: position.y < MAP_BOUNDARY ? position.y + 1 : position.y };
    default:
      throw new Error(`Unhandled navigation direction: ${navigation as string}`);
  }
}

async function acquireRedisLock(name: string, holder: string): Promise<boolean> {
  const result = await getRedis().set(name, holder, 'EX', 30, 'NX');
  return result === 'OK';
}

function isServerError(err: unknown): boolean {
  return err instanceof AxiosError && (err.response?.status ?? 0) >= 500;
}

export async function moveRobot(user: UserHydrated, navigation: NavigationEnum): Promise<void> {
  if (user.role !== 'COMMANDER') {
    throw new ForbiddenException('Only COMMANDER role can move the robot');
  }

  const redis = getRedis();
  const locked = await acquireRedisLock('redis-robot-lock', user._id.toString());
  if (!locked) {
    throw new ServiceUnavailableException(
      'Robot is currently being operated, try again shortly',
    );
  }

  try {
    const statusResp = await axios.get<{ position: RobotPosition }>(
      `${config.baseRobotApiUrl}/api/status`,
      { timeout: 30_000 },
    );

    const newPosition = calculateNewPosition(statusResp.data.position, navigation);

    await axios.post(`${config.baseRobotApiUrl}/api/move`, newPosition, {
      timeout: 30_000,
    });
  } catch (err) {
    await redis.del('redis-robot-lock');
    if (isServerError(err)) {
      throw new ServiceUnavailableException(
        'Robot is temporarily unreachable, try again shortly',
      );
    }
    throw err;
  }

  await redis.del('redis-robot-lock');

  await createAuditLog(user._id.toString(), {
    action: 'COMMAND',
    navigation_direction: navigation,
  });
}

export async function resetRobot(user: UserHydrated): Promise<void> {
  if (user.role !== 'COMMANDER') {
    throw new ForbiddenException('Only COMMANDER role can reset the robot');
  }

  const redis = getRedis();
  const locked = await acquireRedisLock('redis-robot-reset-lock', user._id.toString());
  if (!locked) {
    throw new ServiceUnavailableException(
      'Robot is currently being reset, try again shortly',
    );
  }

  try {
    await axios.post(`${config.baseRobotApiUrl}/api/reset`, undefined, {
      timeout: 30_000,
    });
  } catch (err) {
    await redis.del('redis-robot-reset-lock');
    if (isServerError(err)) {
      throw new ServiceUnavailableException(
        'Robot is temporarily unreachable, try again shortly',
      );
    }
    throw err;
  }

  await cacheDelete('map_data');
  await redis.del('redis-robot-reset-lock');

  await createAuditLog(user._id.toString(), {
    action: 'RESET_ROBOT',
    navigation_direction: null,
  });
}
