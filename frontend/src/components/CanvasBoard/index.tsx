import React, { FC, useRef, useEffect, useState, useCallback } from 'react'
import SelectBar from '@/components/SelectBar'
import { BaseBoard, getPosition } from '@/utils'
import { CanvasProps, MousePos } from '@/type'
interface CanvasBoardProps {
  width?: number
  height?: number
  type?: string
  CanvasRef: React.RefObject<HTMLCanvasElement>
  ws: React.MutableRefObject<WebSocket | null>
}
const CanvasBoard: FC<CanvasBoardProps> = (props) => {
  const { width, height, CanvasRef, ws } = props
  const [curTools, setCurTools] = useState('箭头')
  const [isPainting, setIsPainting] = useState(false)
  const [mousePosition, setMousePosition] = useState<MousePos | undefined>(undefined)
  //   const { ws } = useWebsocket({
  //     url: 'ws://114.55.132.72:8080/board/create', // 此参数为websocket地址
  //     token, // 此参数控制是否有权限，请求该方法
  //   })

  // 鼠标按下事件，在鼠标按下时判断选择的工具类型
  const startPaint = useCallback(
    (e: MouseEvent) => {
      console.log('startPoint')

      const canvas: HTMLCanvasElement = CanvasRef.current!
      const inBoardPos = getPosition(e, canvas)
      if (inBoardPos) {
        switch (curTools) {
          case '箭头':
            return
          case '画笔':
            setIsPainting(true)
            console.log('设置为空')
            setPonitData([])
            setMousePosition(inBoardPos)
            return
          default:
            return
        }
      }
    },
    [curTools, isPainting]
  )
  const [pointData, setPonitData] = useState<MousePos[]>([])
  const paint = useCallback(
    (event: MouseEvent) => {
      console.log('paint')

      const canvas: HTMLCanvasElement = CanvasRef.current!
      if (isPainting) {
        const newMousePosition = getPosition(event, canvas)
        setPonitData((state) => {
          return [...state, newMousePosition]
        })
        console.log('移动的dada', pointData)

        if (mousePosition && newMousePosition) {
          const baseBoard = new BaseBoard(canvas)
          baseBoard.paintLine(mousePosition, newMousePosition)
          setMousePosition(newMousePosition)
        }
      }
    },
    [mousePosition, isPainting]
  )

  const exitPaint = useCallback(() => {
    if (ws.current?.readyState === 1) {
      console.log('发送的数据', pointData)
      const dataStr = JSON.stringify(pointData)
      const data = CanvasRef.current!.toDataURL()
      console.log('快照数据', data)

      ws.current?.send(data)
    }
    setIsPainting(false)
  }, [ws.current, pointData])
  useEffect(() => {
    console.log('useEffect,StartPaint')

    if (!CanvasRef) return
    const canvas = CanvasRef.current
    canvas?.addEventListener('mousedown', startPaint)
    return () => {
      canvas?.removeEventListener('mousedown', startPaint)
    }
  }, [startPaint])

  useEffect(() => {
    console.log('useEffect,paint')
    if (!CanvasRef.current) return
    const canvas = CanvasRef.current
    canvas.addEventListener('mousemove', paint)
    return () => {
      canvas.removeEventListener('mousemove', paint)
    }
  }, [paint])

  useEffect(() => {
    console.log('useEffect,exitPaint')
    if (!CanvasRef.current) {
      return
    }
    const canvas: HTMLCanvasElement = CanvasRef.current
    canvas.addEventListener('mouseup', exitPaint)
    return () => {
      canvas.removeEventListener('mouseup', exitPaint)
    }
  }, [exitPaint])

  function getCurTools(value: string) {
    setCurTools(value)
  }
  return (
    <div>
      <SelectBar getActive={getCurTools}></SelectBar>
      <canvas width={width} height={height} ref={CanvasRef}></canvas>
    </div>
  )
}
CanvasBoard.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight,
}
export default CanvasBoard
