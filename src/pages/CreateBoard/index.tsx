import React, { FC, useRef, useEffect, useState, useCallback } from 'react'
import SelectBar from '@/components/SelectBar'
import { BaseBoard, getPosition } from '@/utils'
import { CanvasProps, MousePos } from '@/type'

const CreateBoard: FC<CanvasProps> = (props) => {
  const { width, height } = props
  console.log(width)
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

  const paint = useCallback(
    (event: MouseEvent) => {
      const canvas: HTMLCanvasElement = canvasRef.current!
      if (isPainting) {
        const newMousePosition = getPosition(event, canvas)
        if (mousePosition && newMousePosition) {
          const baseBoard = new BaseBoard(canvas)
          baseBoard.paintLine(mousePosition, newMousePosition)
          setMousePosition(newMousePosition)
        }
      }
    },
    [isPainting, mousePosition]
  )
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
CreateBoard.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight,
}
export default CreateBoard
