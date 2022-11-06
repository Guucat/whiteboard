import { FC, useRef, useEffect, useState } from 'react'
import { CanvasProps } from '@/type'
import { useLocation } from 'react-router-dom'
import { BaseBoard } from '@/utils'
import CanvasBoard from '@/components/CanvasBoard'

const JoinBoard: FC<CanvasProps> = (props) => {
  const { width, height } = props
  const getCanvasRef = useRef<HTMLCanvasElement>(null)
  const { state } = useLocation()
  const ws = useRef<WebSocket | null>(null)
  const canvas = useRef<BaseBoard | null>(null)
  const [curTools, setCurTools] = useState('画笔')
  const BoardId = state ? state.boardId : null
  console.log(BoardId)

  return (
    <div>
      <CanvasBoard width={width} height={height} type={'join'} ws={ws} boardId={BoardId}></CanvasBoard>
    </div>
  )
}
JoinBoard.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight,
}
export default JoinBoard
