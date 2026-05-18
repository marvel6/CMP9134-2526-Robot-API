import { api } from '../client'

export const NavigationEnumV1 = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  UP: 'UP',
  DOWN: 'DOWN',
} as const

export type NavigationV1 = (typeof NavigationEnumV1)[keyof typeof NavigationEnumV1]

export interface MoveRobotRequestV1 {
  navigation: NavigationV1
}

export function moveRobotV1(navigation: NavigationV1): Promise<null> {
  return api.post<null>('/v1/robot/move/', { navigation })
}

export function resetRobotV1(): Promise<null> {
  return api.post<null>('/v1/robot/reset/')
}
