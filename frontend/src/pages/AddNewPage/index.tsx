import CanvasBoard from '@/components/CanvasBoard'
import { CanvasProps } from '@/type'
import { FC } from 'react'
import { useLocation, useParams } from 'react-router-dom'
const AddNewPage: FC<CanvasProps> = (props) => {
  const { width, height } = props
  let { id } = useParams()
  console.log(id)

  const curPageId = id?.slice(1)
  console.log(curPageId)

  return <CanvasBoard width={width} height={height} type={curPageId!}></CanvasBoard>
}
AddNewPage.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight,
}
export default AddNewPage
