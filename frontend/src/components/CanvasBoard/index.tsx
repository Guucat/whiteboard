import React, { FC, useRef, useEffect, useState } from 'react'
import Header from '../Header'
import style from './index.module.css'
import { BaseBoard } from '@/utils'
import { tools } from './data'
interface CanvasBoardProps {
  width?: number
  height?: number
  type: string
  CanvasRef?: React.RefObject<HTMLCanvasElement>
  ws?: React.MutableRefObject<WebSocket | null>
  boardId?: number
}
const CanvasBoard: FC<CanvasBoardProps> = (props) => {
  const { width, height, CanvasRef, type, boardId } = props
  const [curTools, setCurTools] = useState('line')
  const [activeIndex, setActiveIndex] = useState(1)
  const canvas = useRef<BaseBoard | null>(null)

  function ClickTools(id: number, tool: string, card: BaseBoard) {
    setActiveIndex(id)
    canvas.current!.selectTool = tool
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
    if (tool == 'brush') {
      // 如果用户选择的是画笔工具，直接初始化，无需等待用户进行鼠标操作
      console.log('画笔', card)
      card.initBrush()
    }
  }

  const undoRef = useRef<HTMLElement | null>(null)
  const redoRef = useRef<HTMLElement | null>(null)
  function handleUndoRedo(flag: number, e: any) {
    console.log('撤销重做触发了')
    const card = canvas.current!
    card.isRedoing = true
    let stateIdx = card.stateIdx + flag
    console.log('当前的index撤销重做', stateIdx)

    if (
      undoRef.current!.classList.contains(style['no-undo-redo']) ||
      redoRef.current!.classList.contains(style['no-undo-redo'])
    ) {
      undoRef.current!.classList.remove(style['no-undo-redo'])
      redoRef.current!.classList.remove(style['no-undo-redo'])
    }
    // 判断是否已经到了第一步操作
    if (stateIdx < 0) {
      undoRef.current!.classList.add(style['no-undo-redo'])
      return
    }
    // 判断是否已经到了最后一步操作
    if (stateIdx >= card.stateArr.length) {
      redoRef.current!.classList.add(style['no-undo-redo'])
      return
    }

    if (card.stateArr[stateIdx]) {
      e.target.classList.remove(style['no-undo-redo'])
      console.log('当前的画布渲染数组', card.stateArr[stateIdx])

      card.canvas.loadFromJSON(card.stateArr[stateIdx], () => {
        card.canvas.renderAll()
        card.isRedoing = false
      })
      card.ws.current?.send(card.stateArr[stateIdx])
      if (card.canvas.getObjects().length > 0) {
        card.canvas.getObjects().forEach((item: any) => {
          item.set('selectable', false)
        })
      }
      card.stateIdx = stateIdx
    }
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
    if (ws.current) {
      ws.current.onmessage = (e) => {
        console.log('传递过来的数据data', e.data)
        const data = JSON.parse(e.data)
        canvas.current!.canvas.loadFromJSON(data, () => {
          canvas.current!.canvas.renderAll()
        })
      }
    }
  }, [ws])
  useEffect(() => {
    canvas.current = new BaseBoard({ type, curTools, ws })
    canvas.current.initCanvas()
    canvas.current.initCanvasEvent()
    ClickTools(1, 'brush', canvas.current)
    document.onkeydown = (e) => {
      if (e.key == 'Backspace') {
        console.log('删除案件执行')

        canvas.current!.deleteSelectObj()
      }
    }
  }, [])
  // useEffect(() => {
  //   console.log('选中图形了')
  //   if (canvas.current?.selectedObj) {
  //   }
  // }, [canvas.current?.selectedObj])
  return (
    <div className={style['canvas-wrapper']}>
      <Header></Header>
      <div className={style['selectBar']}>
        <div className={style['tools']}>
          <div className={style['container']}>
            {tools.map((item) => (
              <button
                key={item.id}
                onClick={() => ClickTools(item.id, item.type, canvas.current!)}
                className={item.id == activeIndex ? style['active'] : style['']}
              >
                <i className={`iconfont ${item.value}`} />
              </button>
            ))}
          </div>
        </div>
        <div className={style['UndoRedo-wrapper']}>
          <div className={style['undo']} onClick={(e) => handleUndoRedo(-1, e)}>
            <i className={`iconfont icon-undo`} ref={undoRef} />
          </div>
          <div className={style['redo']} onClick={(e) => handleUndoRedo(1, e)}>
            <i className={`iconfont icon-redo`} ref={redoRef} />
          </div>
        </div>
      </div>
      <canvas width={width} height={height} ref={CanvasRef} id={type}></canvas>
    </div>
  )
}
CanvasBoard.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight,
}
export default CanvasBoard
