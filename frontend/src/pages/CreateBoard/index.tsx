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
      const canvas: HTMLCanvasElement = canvasRef.current!
      const inBoardPos = getPosition(e, canvas)
      if (inBoardPos) {
        switch (curTools) {
          case '箭头':
            break
          case '画笔':
            setIsPainting(true)
            setMousePosition(inBoardPos)
            break
          default:
            break
        }
      }
    },
    [curTools]
  )
  const [data, setData] = useState<MousePos[]>([])
  const paint = useCallback(
    (event: MouseEvent) => {
      const canvas: HTMLCanvasElement = canvasRef.current!
      if (isPainting) {
        const newMousePosition = getPosition(event, canvas)
        //  data.push(newMousePosition)
        // let newArr = []
        // newArr.push(newMousePosition)
        setData((state) => {
          return [...state, newMousePosition]
        })
        console.log(newMousePosition)

        if (mousePosition && newMousePosition) {
          const baseBoard = new BaseBoard(canvas)
          baseBoard.paintLine(mousePosition, newMousePosition)
          setMousePosition(newMousePosition)
        }
      }
    },
    [isPainting, mousePosition]
  )
  // console.log('xx', data)
  const ws = useRef<WebSocket | null>(null)
  const exitPaint = useCallback(() => {
    if (ws.current?.readyState === 1) {
      ws.current?.send(`11`)
    }

    setIsPainting(false)
  }, [ws])

  useEffect(() => {
    ws.current = new WebSocket('ws://114.55.132.72:8080/board/create', [
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6InRlc3QxIiwiZXhwIjoxNjY3MTAwNzQzLCJpc3MiOiJDUVVQVCJ9.2B2iOM0KQaUmGjy85LF86x15ypIorp4daNzJluSAWPw',
    ])
    ws.current.onopen = () => {
      console.log('websocket已建立连接')
    }
    ws.current.onmessage = (e) => {
      console.log('data', e.data)
    }
    return () => {
      ws.current?.close()
    }
  }, [ws])
  useEffect(() => {
    if (!canvasRef) return
    const canvas = canvasRef.current
    canvas?.addEventListener('mousedown', startPaint)
    return () => {
      canvas?.removeEventListener('mousedown', startPaint)
    }
  }, [startPaint])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    canvas.addEventListener('mousemove', paint)
    return () => {
      canvas.removeEventListener('mousemove', paint)
    }
  }, [paint])

  useEffect(() => {
    if (!canvasRef.current) {
      return
    }
    const canvas: HTMLCanvasElement = canvasRef.current
    canvas.addEventListener('mouseup', exitPaint)
    canvas.addEventListener('mouseleave', exitPaint)
    return () => {
      canvas.removeEventListener('mouseup', exitPaint)
      canvas.removeEventListener('mouseleave', exitPaint)
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
