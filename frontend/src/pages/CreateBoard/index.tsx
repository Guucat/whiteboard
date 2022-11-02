import React, { FC, useRef, useEffect, useState, useCallback } from 'react'
import SelectBar from '@/components/SelectBar'
// import { BaseBoard, getPosition } from '@/utils'
import { CanvasProps, MousePos } from '@/type'
import CanvasBoard from '@/components/CanvasBoard'

const CreateBoard: FC<CanvasProps> = (props) => {
  const { width, height } = props

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const ws = useRef<WebSocket | null>(null)

  // useEffect(() => {
  //   console.log('useEffect，WS')

  //   const tokenstr = localStorage.getItem('token')
  //   // console.log(token)
  //   if (tokenstr) {
  //     const token = tokenstr.substring(1, tokenstr.length - 1)
  //     if (typeof WebSocket !== 'undefined') {
  //       ws.current = new WebSocket('ws://114.55.132.72:8080/board/create', [token!])
  //       ws.current.onopen = () => {
  //         console.log('websocket已建立连接')
  //       }
  //       ws.current.onmessage = (e) => {
  //         console.log('传递过来的数据data', e.data)
  //         const canvas = canvasRef.current
  //         if (canvas) {
  //           // const baseBoard = new BaseBoard(canvas)
  //           console.log(Array.isArray(JSON.parse(e.data)))
  //           const pointDataArr = JSON.parse(e.data)
  //           Array.isArray(pointDataArr) &&
  //             pointDataArr.length !== 0 &&
  //             pointDataArr.map((_item: { x: number; y: number }, index: number, data: { x: number; y: number }[]) => {
  //               // return index < data.length - 1 && baseBoard.paintLine(data[index], data[index + 1])
  //             })
  //         }
  //       }
  //     } else {
  //       alert('当前浏览器 Not support websocket')
  //     }
  //   }
  //   return () => {
  //     ws.current?.close()
  //   }
  // }, [ws])

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
