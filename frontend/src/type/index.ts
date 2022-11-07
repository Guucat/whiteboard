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
