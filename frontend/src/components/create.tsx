import React, { FC, useRef, useEffect, useState, useCallback } from 'react'
import SelectBar from '@/components/SelectBar'
// import { BaseBoard, getPosition } from '@/utils'
import { CanvasProps, MousePos } from '@/type'
// import Header from '../Header'
import style from './index.module.css'
import { fabric } from 'fabric'
import { IEvent } from 'fabric/fabric-impl'
interface CanvasBoardProps {
  width?: number
  height?: number
  type: string
  CanvasRef?: React.RefObject<HTMLCanvasElement>
  ws: React.MutableRefObject<WebSocket | null>
}
const CanvasBoard: FC<CanvasBoardProps> = (props) => {
  const { width, height, CanvasRef, ws, type } = props
  const [curTools, setCurTools] = useState('画笔')
  const [isPainting, setIsPainting] = useState(false)
  const [mousePosition, setMousePosition] = useState<MousePos | undefined>(undefined)
  //   let card = useRef(null)
  //   console.log('执行了')

  //   useEffect(() => {
  //     card = new fabric.Canvas(type, {
  //       isDrawingMode: true, // 开启画笔
  //       selection: false,
  //     })
  //   }, [])
  //   console.log(card)

  //   const { ws } = useWebsocket({
  //     url: 'ws://114.55.132.72:8080/board/create', // 此参数为websocket地址
  //     token, // 此参数控制是否有权限，请求该方法
  //   })

  // 鼠标按下事件，在鼠标按下时判断选择的工具类型
  // const startPaint = useCallback(
  //   (e: IEvent<MouseEvent>) => {
  //     console.log('startPoint')
  //     console.log(e)

  //     // const canvas: HTMLCanvasElement = CanvasRef.current!
  //     // // const inBoardPos = getPosition(e.e, card)
  //     // if (e.pointer) {
  //     //   switch (curTools) {
  //     //     case '箭头':
  //     //       card.isDrawingMode = false
  //     //       return
  //     //     case '画笔':
  //     //       console.log('huabi')
  //     //       card.isDrawingMode = true
  //     //       card.freeDrawingBrush = new fabric.PencilBrush(card)
  //     //       card.freeDrawingBrush.color = '#000000'
  //     //       card.freeDrawingBrush.width = 4
  //     //       setIsPainting(true)
  //     //       console.log('设置为空')
  //     //       // setPonitData([])
  //     //       setMousePosition(e.pointer)
  //     //       return
  //     //     default:
  //     //       return
  //     //   }
  //     // }
  //   },
  //   [curTools, isPainting]
  // )
  // const card = new fabric.Canvas(type)
  // console.log('dayin', isPainting)
  // useEffect(()=>{

  // })
  // const [pointData, setPonitData] = useState<MousePos[]>([])
  // const paint = (event: IEvent<MouseEvent>) => {
  //   // console.log('paint', event)
  //   console.log(isPainting)

  //   // const canvas: HTMLCanvasElement = CanvasRef.current!
  //   if (isPainting) {
  //     const newMousePosition = event.pointer!
  //     setPonitData((state) => {
  //       return [...state, newMousePosition]
  //     })
  //     console.log('移动的dada', pointData)

  //     // if (mousePosition && newMousePosition) {
  //     //   const baseBoard = new BaseBoard(card)
  //     //   baseBoard.paintLine(mousePosition, newMousePosition)
  //     //   setMousePosition(newMousePosition)
  //     // }
  //   }
  // }

  // const exitPaint = useCallback(() => {
  //   if (ws.current?.readyState === 1) {
  //     console.log('发送的数据', pointData)
  //     const dataStr = JSON.stringify(pointData)
  //     // const data = CanvasRef.current!.toDataURL()
  //     // console.log('快照数据', data)

  //     ws.current?.send(dataStr)
  //   }
  //   setIsPainting(false)
  // }, [ws.current, pointData])
  // useEffect(() => {
  //   console.log('useEffect,StartPaint')

  //   if (!CanvasRef) return
  //   const canvas = CanvasRef.current
  //   canvas?.addEventListener('mousedown', startPaint)
  //   return () => {
  //     canvas?.removeEventListener('mousedown', startPaint)
  //   }
  // }, [startPaint])

  // useEffect(() => {
  //   console.log('useEffect,paint')
  //   if (!CanvasRef.current) return
  //   const canvas = CanvasRef.current
  //   card.addEventListener('mousemove', paint)
  //   return () => {
  //     canvas.removeEventListener('mousemove', paint)
  //   }
  // }, [paint])

  // useEffect(() => {
  //   console.log('useEffect,exitPaint')
  //   if (!CanvasRef.current) {
  //     return
  //   }
  //   const canvas: HTMLCanvasElement = CanvasRef.current
  //   canvas.addEventListener('mouseup', exitPaint)
  //   return () => {
  //     canvas.removeEventListener('mouseup', exitPaint)
  //   }
  // }, [exitPaint])
  // useEffect(() => {
  //   card.on('mouse:down', startPaint)
  //   return () => {
  //     card.off('mouse:down')
  //   }
  // }, [startPaint])
  // useEffect(() => {
  //   card.on('mouse:move', paint)
  //   return () => {
  //     card.off('mouse:move')
  //   }
  // })
  function getCurTools(value: string) {
    setCurTools(value)
  }
  return (
    <div className={style['canvas-wrapper']}>
      {/* <Header></Header>
      <SelectBar getActive={getCurTools} card={card}></SelectBar> */}
      <canvas width={width} height={height} ref={CanvasRef} id={type}></canvas>
    </div>
  )
}
CanvasBoard.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight,
}
export default CanvasBoard
