import React, { FC, useRef, useEffect, useState, useCallback } from 'react'
import SelectBar from '@/components/SelectBar'
// import { BaseBoard, getPosition } from '@/utils'
import { CanvasProps, MousePos } from '@/type'
import Header from '../Header'
import style from './index.module.css'
import { fabric } from 'fabric'
import { IEvent } from 'fabric/fabric-impl'
import { BaseBoard } from '@/utils'
import { tools } from './data'
interface CanvasBoardProps {
  width?: number
  height?: number
  type: string
  CanvasRef?: React.RefObject<HTMLCanvasElement>
  ws?: React.MutableRefObject<WebSocket | null>
  boardId?: any
}
const CanvasBoard: FC<CanvasBoardProps> = (props) => {
  const { width, height, CanvasRef, type, boardId } = props
  const [curTools, setCurTools] = useState('画笔')
  const [isPainting, setIsPainting] = useState(false)
  const [activeIndex, setActiveIndex] = useState(1)
  const [mousePosition, setMousePosition] = useState<MousePos | undefined>(undefined)
  const canvas = useRef<BaseBoard | null>(null)
  // const card = new fabric.Canvas(type)
  function getCurTools(value: string) {
    setCurTools(value)
  }
  function ClickTools(id: number, type: string, card: any) {
    setActiveIndex(id)
    console.log('id', id)

    // if (curTools == type) return
    // 保存当前选中的绘图工具
    setCurTools(type)
    // this.selectTool = tool;
    // 选择任何工具前进行一些重置工作
    // 禁用画笔模式
    card.canvas.isDrawingMode = false
    // 禁止图形选择编辑
    let drawObjects = card.canvas.getObjects()
    if (drawObjects.length > 0) {
      drawObjects.map((item: any) => {
        item.set('selectable', false)
      })
    }
    console.log('画笔模式', card.canvas.isDrawingMode)
    console.log(type)

    if (type == '画笔') {
      // 如果用户选择的是画笔工具，直接初始化，无需等待用户进行鼠标操作
      console.log('画笔', card)

      card.initBruch()
    }
    // else if (type == 'eraser') {
    //   // 如果用户选择的是橡皮擦工具，直接初始化，无需等待用户进行鼠标操作
    //   card.initEraser()
    // }
  }
  const ws = useRef<WebSocket | null>(null)
  useEffect(() => {
    const tokenstr = localStorage.getItem('token')
    if (typeof WebSocket !== 'undefined') {
      if (type == 'create') {
        if (tokenstr) {
          const token = tokenstr.substring(1, tokenstr.length - 1)
          ws.current = new WebSocket('ws://114.55.132.72:8080/board/create', [token])
        }
      } else {
        ws.current = new WebSocket(`ws://114.55.132.72:8080/board/enter?boardId=${boardId}`)
      }
    } else {
      alert('当前浏览器 Not support websocket')
    }

    // ws.onmessage = (e) => {
    //   console.log('得到的数据啊啊啊啊啊data', e.data)
    //   const data = JSON.parse(e.data)
    //   // 组件一挂载建立webSocket连接，获取boardId的数据并绘制出来
    //   const canvas = getCanvasRef.current
    //   if (canvas) {
    //     // canvas.drawImage(e.data)
    //     // const baseBoard = new BaseBoard(canvas)
    //     // if(typeof(e.data)==)
    //     // baseBoard.cxt.drawImage(data, 0, 0)
    //     console.log(Array.isArray(JSON.parse(e.data)))
    //     const pointDataArr = JSON.parse(e.data)
    //     Array.isArray(pointDataArr) &&
    //       pointDataArr.length !== 0 &&
    //       pointDataArr.map((_item: { x: number; y: number }, index: number, data: { x: number; y: number }[]) => {
    //         // return index < data.length - 1 && baseBoard.paintLine(data[index], data[index + 1])
    //       })
    //   }
    // }
    canvas.current = new BaseBoard({ type, curTools, ws })
    ClickTools(1, '画笔', canvas.current)
  }, [ws])
  return (
    <div className={style['canvas-wrapper']}>
      <Header></Header>
      <div className={style['selectBar']}>
        <div className={style['tools']}>
          <div className={style['container']}>
            {tools.map((item) => (
              <button
                key={item.id}
                onClick={() => ClickTools(item.id, item.type, canvas.current)}
                className={item.id == activeIndex ? style['active'] : style['']}
              >
                <i className={`iconfont ${item.value}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={style['UndoRedo-wrapper']}>
        <div className={style['undo']}>
          <i className={`iconfont icon-undo`} />
        </div>
        <div className={style['redo']}>
          <i className={`iconfont icon-redo`} />
        </div>
      </div>
      {/* <SelectBar getActive={getCurTools} card={card}></SelectBar> */}
      <canvas width={width} height={height} ref={CanvasRef} id={type}></canvas>
    </div>
  )
}
CanvasBoard.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight,
}
export default CanvasBoard
