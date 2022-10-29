import React, { FC, useRef, useEffect, useState, useCallback } from 'react'
import SelectBar from '../SelectBar'
interface CanvasProps {
  width?: number
  height?: number
}
interface MousePos {
  x: number
  y: number
}
const CanvasBoard: FC<CanvasProps> = (props) => {
  const { width, height } = props
  console.log(width)
  const [curTools, setCurTools] = useState('箭头')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPainting, setIsPainting] = useState(false)
  const [mousePosition, setMousePosition] = useState<MousePos | undefined>(undefined)
  const startPaint = useCallback(
    (e: MouseEvent) => {
      const inBoardPos = getPosition(e)
      if (inBoardPos) {
        // setIsPainting(true)
        // setMousePosition(inBoardPos)
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
  const getPosition = (e: MouseEvent): MousePos | undefined => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    return { x: e.pageX - canvas.offsetLeft, y: e.pageY - canvas.offsetTop }
  }

  const paint = useCallback(
    (event: MouseEvent) => {
      if (isPainting) {
        const newMousePosition = getPosition(event)
        if (mousePosition && newMousePosition) {
          drawLine(mousePosition, newMousePosition)
          setMousePosition(newMousePosition)
        }
      }
    },
    [isPainting, mousePosition]
  )
  const drawLine = (originalMousePosition: MousePos, newMousePosition: MousePos) => {
    if (!canvasRef.current) {
      return
    }
    const canvas: HTMLCanvasElement = canvasRef.current
    const context = canvas.getContext('2d')
    if (context) {
      context.strokeStyle = 'red'
      context.lineJoin = 'round'
      context.lineWidth = 5

      context.beginPath()
      context.moveTo(originalMousePosition.x, originalMousePosition.y)
      context.lineTo(newMousePosition.x, newMousePosition.y)
      context.closePath()
      console.log(newMousePosition.x, newMousePosition.y)

      context.stroke()
    }
  }
  const exitPaint = useCallback(() => {
    setIsPainting(false)
  }, [])
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
CanvasBoard.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight,
}
export default CanvasBoard
