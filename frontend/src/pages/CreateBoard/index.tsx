import React, { FC, useRef, useEffect, useState, useCallback } from 'react'
import SelectBar from '@/components/SelectBar'
// import { BaseBoard, getPosition } from '@/utils'
import { CanvasProps, MousePos } from '@/type'
import CanvasBoard from '@/components/CanvasBoard'

const CreateBoard: FC<CanvasProps> = (props) => {
  const { width, height } = props

  const canvasRef = useRef<HTMLCanvasElement>(null)

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
