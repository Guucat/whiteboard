import { FC, useRef } from 'react'
import { CanvasProps } from '@/type'
import CanvasBoard from '@/components/CanvasBoard'

const CreateBoard: FC<CanvasProps> = (props) => {
  const { width, height } = props

  const ws = useRef<WebSocket | null>(null)

  return (
    <div>
      <CanvasBoard width={width} height={height} ws={ws} type={'create'}></CanvasBoard>
    </div>
  )
}
CreateBoard.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight,
}
export default CreateBoard
