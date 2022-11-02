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
  // useEffect(() => {
  //   // canvas.current = new BaseBoard({ type, curTools, ws })
  //   console.log('useEffect，WS')

  //   if (typeof WebSocket !== 'undefined') {
  //     ws.current = new WebSocket(`ws://114.55.132.72:8080/board/enter?boardId=${BoardId}`)
  //     ws.current.onopen = () => {
  //       console.log('websocket已建立连接')
  //     }
  //     // ws.current.onmessage = (e) => {
  //     //   console.log('得到的数据啊啊啊啊啊data', e.data)
  //     //   const data = JSON.parse(e.data)
  //     //   // 组件一挂载建立webSocket连接，获取boardId的数据并绘制出来
  //     //   const canvas = getCanvasRef.current
  //     //   if (canvas) {
  //     //     // canvas.drawImage(e.data)
  //     //     // const baseBoard = new BaseBoard(canvas)
  //     //     // if(typeof(e.data)==)
  //     //     // baseBoard.cxt.drawImage(data, 0, 0)
  //     //     console.log(Array.isArray(JSON.parse(e.data)))
  //     //     const pointDataArr = JSON.parse(e.data)
  //     //     Array.isArray(pointDataArr) &&
  //     //       pointDataArr.length !== 0 &&
  //     //       pointDataArr.map((_item: { x: number; y: number }, index: number, data: { x: number; y: number }[]) => {
  //     //         // return index < data.length - 1 && baseBoard.paintLine(data[index], data[index + 1])
  //     //       })
  //     //   }
  //     // }
  //   } else {
  //     alert('当前浏览器 Not support websocket')
  //   }

  //   return () => {
  //     ws.current?.close()
  //   }
  // }, [ws])
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
