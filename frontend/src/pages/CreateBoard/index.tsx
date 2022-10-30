import React, { FC, useRef, useEffect, useState, useCallback } from 'react'
import SelectBar from '@/components/SelectBar'
import { BaseBoard, getPosition } from '@/utils'
import { CanvasProps, MousePos } from '@/type'

const CreateBoard: FC<CanvasProps> = (props) => {
  const { width, height } = props
  const [curTools, setCurTools] = useState('箭头')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPainting, setIsPainting] = useState(false)
  const [mousePosition, setMousePosition] = useState<MousePos | undefined>(undefined)
  // 鼠标按下事件，在鼠标按下时判断选择的工具类型
  const startPaint = useCallback(
    (e: MouseEvent) => {
      console.log('startPoint')

      const canvas: HTMLCanvasElement = canvasRef.current!
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

      const canvas: HTMLCanvasElement = canvasRef.current!
      if (isPainting) {
        const newMousePosition = getPosition(event, canvas)
        setPonitData((state) => {
          return [...state, newMousePosition]
        })
        // console.log(newMousePosition)
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
  // console.log('xx', data)
  const ws = useRef<WebSocket | null>(null)
  const exitPaint = useCallback(() => {
    if (ws.current?.readyState === 1) {
      console.log(pointData)
      const dataStr = JSON.stringify(pointData)
      ws.current?.send(dataStr)
    }
    setIsPainting(false)
  }, [ws.current, pointData])

  useEffect(() => {
    console.log('useEffect，WS')

    const tokenstr = localStorage.getItem('token')
    // console.log(token)
    if (tokenstr) {
      const token = tokenstr.substring(1, tokenstr.length - 1)
      if (typeof WebSocket !== 'undefined') {
        ws.current = new WebSocket('ws://114.55.132.72:8080/board/create', [token!])
        ws.current.onopen = () => {
          console.log('websocket已建立连接')
        }
        ws.current.onmessage = (e) => {
          console.log('data', e.data)
        }
      } else {
        alert('当前浏览器 Not support websocket')
      }
    }
    return () => {
      ws.current?.close()
    }
  }, [ws])
  useEffect(() => {
    console.log('useEffect,StartPaint')

    if (!canvasRef) return
    const canvas = canvasRef.current
    canvas?.addEventListener('mousedown', startPaint)
    return () => {
      canvas?.removeEventListener('mousedown', startPaint)
    }
  }, [startPaint])

  useEffect(() => {
    console.log('useEffect,paint')
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    canvas.addEventListener('mousemove', paint)
    return () => {
      canvas.removeEventListener('mousemove', paint)
    }
  }, [paint])

  useEffect(() => {
    console.log('useEffect,exitPaint')
    if (!canvasRef.current) {
      return
    }
    const canvas: HTMLCanvasElement = canvasRef.current
    canvas.addEventListener('mouseup', exitPaint)
    // canvas.addEventListener('mouseleave', exitPaint)
    return () => {
      canvas.removeEventListener('mouseup', exitPaint)
      // canvas.removeEventListener('mouseleave', exitPaint)
    }
  }, [exitPaint])

  function getCurTools(value: string) {
    setCurTools(value)
  }
  return (
    <div>
      <SelectBar getActive={getCurTools}></SelectBar>
      <canvas width={width} height={height} ref={canvasRef}></canvas>
    </div>
  )
}
CreateBoard.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight,
}
export default CreateBoard
