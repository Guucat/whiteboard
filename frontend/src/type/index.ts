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
  boardMode: any
}
export interface FooterBarProps {
  canvas: BaseBoard
  // boardId: number
  canvasCurrent: React.MutableRefObject<BaseBoard | null>
  baseBoardArr: BaseBoard[]
  canvasBoardRef: HTMLDivElement
  ws: React.MutableRefObject<WebSocket | null>
  curTools: string
  currentCanvas: any
  boardMode: any
  type1Data: Type1DataType
}
export interface Type1DataType {
  curUser: string
  ReboardId: number
  isOwner: boolean
}
export interface BaseBoardProp {
  type: string
  curTools: string
  ws: React.MutableRefObject<WebSocket | null>
}

export interface HeaderProps {
  canvas: React.MutableRefObject<BaseBoard | null>
  userList: string[]
  // curUser: string
  // boardId: number
  ws: React.MutableRefObject<WebSocket | null>
  // isOwner: boolean

  curTools: string
  canvasBoardRef: HTMLDivElement
  currentCanvas: any
  baseBoardArr: BaseBoard[]
  type1Data: Type1DataType
  boardMode: any
}
