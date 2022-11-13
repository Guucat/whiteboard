import { FC } from 'react'
import CanvasBoard from '@/components/CanvasBoard'

const CreateBoard: FC = () => {
  return (
    <div>
      <CanvasBoard type={'create'}></CanvasBoard>
    </div>
  )
}
export default CreateBoard
