import { FC } from 'react'
import { useLocation } from 'react-router-dom'
import CanvasBoard from '@/components/CanvasBoard'

const JoinBoard: FC = () => {
  const { state } = useLocation()
  const BoardId = state ? state.boardId : null

  return (
    <div>
      <CanvasBoard type={'join'} boardId={BoardId}></CanvasBoard>
    </div>
  )
}
export default JoinBoard
