import { api } from '../client'

export interface MapDataV1 {
  width: number
  height: number
  grid: number[][]
}

export async function getMapV1(): Promise<MapDataV1> {
  const data = await api.get<MapDataV1>(`/v1/map/?_=${Date.now()}`)
  if (!data?.grid || !Array.isArray(data.grid)) {
    throw new Error('Map data missing grid')
  }
  return data
}
