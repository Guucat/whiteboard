import { FC, useRef } from 'react'
import { CanvasProps } from '@/type'
import { useLocation } from 'react-router-dom'
import CanvasBoard from '@/components/CanvasBoard'

const JoinBoard: FC<CanvasProps> = (props) => {
  const { width, height } = props
  const { state } = useLocation()
  const ws = useRef<WebSocket | null>(null)
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
