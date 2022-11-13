import { FC } from 'react'
import { CanvasProps } from '@/type'
import CanvasBoard from '@/components/CanvasBoard'

const CreateBoard: FC<CanvasProps> = (props) => {
  const { width, height } = props

  return (
    <div>
      <CanvasBoard width={width} height={height} type={'create'}></CanvasBoard>
    </div>
  )
}
CreateBoard.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight,
}
export default CreateBoard
