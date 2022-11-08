import { BaseBoard } from '@/utils'

export interface CanvasProps {
  width?: number
  height?: number
}
export interface MousePos {
  x: number
  y: number
}
export interface CanvasBoardProps {
  width?: number
  height?: number
  type: string
  boardId?: number
}

export interface SelectBarProps {
  canvas: BaseBoard
}

export interface BaseBoardProp {
  type: string
  curTools: string
  ws: React.MutableRefObject<WebSocket | null>
}
