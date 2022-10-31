import SelectBar from '@/components/SelectBar'
import { FC, useState, useRef, useEffect } from 'react'
import { CanvasProps } from '@/type'
import { useLocation } from 'react-router-dom'
import { BaseBoard } from '@/utils'
const JoinBoard: FC<CanvasProps> = (props) => {
  const { width, height } = props
  const getCanvasRef = useRef<HTMLCanvasElement>(null)
  const [curTools, setCurTools] = useState('箭头')
  function getCurTools(value: string) {
    setCurTools(value)
  }
  const { state } = useLocation()
  const ws = useRef<WebSocket | null>(null)
  useEffect(() => {
    console.log('useEffect，WS')
    const BoardId = state ? state.boardId : null
    console.log(BoardId)

    if (typeof WebSocket !== 'undefined') {
      ws.current = new WebSocket(`ws://114.55.132.72:8080/board/enter?boardId=${BoardId}`)
      ws.current.onopen = () => {
        console.log('websocket已建立连接')
      }
      ws.current.onmessage = (e) => {
        console.log('data', e.data)
        const canvas = getCanvasRef.current
        if (canvas) {
          console.log('1111')

          const baseBoard = new BaseBoard(canvas)
          console.log(Array.isArray(JSON.parse(e.data)))
          const pointDataArr = JSON.parse(e.data)
          Array.isArray(pointDataArr) &&
            pointDataArr.length !== 0 &&
            pointDataArr.map((_item: { x: number; y: number }, index: number, data: { x: number; y: number }[]) => {
              console.log('print')

              return index < data.length - 1 && baseBoard.paintLine(data[index], data[index + 1])
            })
        }
      }
    } else {
      alert('当前浏览器 Not support websocket')
    }

    return () => {
      ws.current?.close()
    }
  }, [ws])
  useEffect(() => {}, [])
  return (
    <div>
      <SelectBar getActive={getCurTools}></SelectBar>
      <canvas width={width} height={height} ref={getCanvasRef}></canvas>
    </div>
  )
}
JoinBoard.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight,
}
export default JoinBoard
