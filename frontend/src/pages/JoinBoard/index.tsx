import { FC } from 'react'
import { CanvasProps } from '@/type'
import { useLocation } from 'react-router-dom'
import CanvasBoard from '@/components/CanvasBoard'

const JoinBoard: FC<CanvasProps> = (props) => {
  const { width, height } = props
  const { state } = useLocation()
  const BoardId = state ? state.boardId : null

  return (
    <div>
      <CanvasBoard width={width} height={height} type={'join'} boardId={BoardId}></CanvasBoard>
    </div>
  )
}
JoinBoard.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight,
}
export default JoinBoard
