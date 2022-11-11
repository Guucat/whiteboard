import FooterBar from '@/components/FooterBar'
import { instance } from '@/service/service'
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
export interface FooterBarProps {
  canvas: React.MutableRefObject<BaseBoard | null>
  boardId: number
  canvasBoardRef: HTMLDivElement
  ws: React.MutableRefObject<WebSocket | null>
  curTools: string
  currentCanvas: any
}

export interface BaseBoardProp {
  type: string
  curTools: string
  ws: React.MutableRefObject<WebSocket | null>
}

export interface HeaderProps {
  canvas: React.MutableRefObject<BaseBoard | null>
  userList: string[]
  curUser: string
  boardId: number
  ws: React.MutableRefObject<WebSocket | null>
  isOwner: boolean
  type: string
  curTools: string
  canvasBoardRef: HTMLDivElement
  currentCanvas: any
  baseBoardArr: BaseBoard[]
  receiveArr: any
}
