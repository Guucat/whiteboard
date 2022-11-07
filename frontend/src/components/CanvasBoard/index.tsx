import React, { FC, useRef, useEffect, useState } from 'react'
import Header from '../Header'
import styles from './index.module.css'
import { BaseBoard } from '@/utils'
import { color, size, tools } from './data'
import { fabric } from 'fabric'
import { useRecoilState } from 'recoil'
import { ModalVisible } from '@/pages/Home'
import Modal from '../Modal'
import { Message, Popconfirm } from '@arco-design/web-react'
interface CanvasBoardProps {
  width?: number
  height?: number
  type: string
  CanvasRef?: React.RefObject<HTMLCanvasElement>
  ws?: React.MutableRefObject<WebSocket | null>
  boardId?: number
}
const CanvasBoard: FC<CanvasBoardProps> = (props) => {
  // 弹窗
  const [visibles, setVisible] = useRecoilState(ModalVisible)
  const [modalType, setModalType] = useState('')
  const { width, height, CanvasRef, type, boardId } = props
  const [curTools, setCurTools] = useState('line')
  const [activeIndex, setActiveIndex] = useState(1)
  const canvas = useRef<BaseBoard | null>(null)
  const [isSelect, setIsSelect] = useState(false)
  function ClickTools(id: number, tool: string, card: BaseBoard) {
    setActiveIndex(id)
    canvas.current!.selectTool = tool
    // 禁用画笔模式
    card.canvas.isDrawingMode = false
    // 禁止图形选择编辑
    let drawObjects = card.canvas.getObjects()
    // if (drawObjects.length > 0) {
    //   drawObjects.map((item: any) => {
    //     item.set('selectable', false)
    //   })
    // }
    console.log('画笔模式', card.canvas.isDrawingMode)
    switch (tool) {
      case 'brush':
        card.canvas.selection = false
        // 如果用户选择的是画笔工具，直接初始化，无需等待用户进行鼠标操作
        console.log('画笔', card)
        card.initBrush()
        break
      case 'select':
        card.canvas.selection = true
        break
      case 'clear':
        card.canvas.selection = false
        card.clearCanvas()
        break
      default:
        card.canvas.selection = false
        break
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
      undoRef.current!.classList.contains(styles['no-undo-redo']) ||
      redoRef.current!.classList.contains(styles['no-undo-redo'])
    ) {
      undoRef.current!.classList.remove(styles['no-undo-redo'])
      redoRef.current!.classList.remove(styles['no-undo-redo'])
    }
    // 判断是否已经到了第一步操作
    if (stateIdx < 0) {
      undoRef.current!.classList.add(styles['no-undo-redo'])

      return
    }
    // 判断是否已经到了最后一步操作
    if (stateIdx >= card.stateArr.length) {
      redoRef.current!.classList.add(styles['no-undo-redo'])

      return
    }

    if (card.stateArr[stateIdx]) {
      e.target.classList.remove(styles['no-undo-redo'])
      console.log('当前的画布渲染数组', card.stateArr[stateIdx])

      card.canvas.loadFromJSON(card.stateArr[stateIdx], () => {
        card.canvas.renderAll()
        card.isRedoing = false
      })
      let obj = { pageId: 0, seqData: card.stateArr[stateIdx] }
      let sendObj = JSON.stringify(obj)
      console.log('啦啦啦啦啦', sendObj)

      card.ws.current?.send(sendObj)
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
        console.log(e.data)
        const data = JSON.parse(e.data)
        console.log('hhhhh', data.data.seqData)

        // if (data.seqData) {
        //   const data1 = JSON.parse(data.seqData)
        //   console.log('传递过来的数据data', data1)
        // }

        canvas.current!.canvas.loadFromJSON(data, () => {
          canvas.current!.canvas.renderAll()
        })
        canvas.current!.stateArr.push(JSON.stringify(canvas.current!.canvas))
        canvas.current!.stateIdx++
      }
    }
  }, [ws])
  useEffect(() => {
    canvas.current = new BaseBoard({ type, curTools, ws })
    canvas.current.initCanvas()
    canvas.current.initCanvasEvent()
    ClickTools(1, 'brush', canvas.current)
  }, [])
  useEffect(() => {
    // 监听选中对象
    const board = canvas.current!
    board.canvas.on('selection:created', (e) => {
      console.log('点击当前元素', e.selected!)
      if (e.selected!.length == 1) {
        setIsSelect(true)
      }

      // // 选中图层事件触发时，动态更新赋值
      board.selectedObj = e.selected!
      console.log('当前选中对象是', board.selectedObj)
      document.onkeydown = (e) => {
        if (e.key == 'Backspace' && board.selectTool !== 'text') {
          console.log('删除案件执行', board.textObject)

          board.deleteSelectObj()
        }
      }
    })

    board.canvas.on('selection:updated', (e) => {
      console.log('点击其他画布元素')
      if (e.selected!.length == 1) {
        setIsSelect(true)
      }
      board.selectedObj = e.selected!
      document.onkeydown = (e) => {
        if (e.key == 'Backspace' && board.selectTool !== 'text') {
          console.log('删除案件执行', board.textObject)

          board.deleteSelectObj()
        }
      }
    })

    board.canvas.on('selection:cleared', (e) => {
      console.log('点击其他空白区域')
      setIsSelect(false)
      board.selectedObj = null
    })
  }, [isSelect])
  const pickerColorRef = useRef<HTMLInputElement | null>(null)
  function handlePicker(e: any, id: number) {
    console.log(e.target.value)
    console.log(id)

    switch (id) {
      case 0:
        canvas.current!.strokeColor = e.target.value
        canvas.current!.canvas.renderAll()
        break
      case 1:
        canvas.current!.fillColor = e.target.value
        canvas.current!.canvas.renderAll()
        break
      case 2:
        canvas.current!.canvas.backgroundColor = e.target.value

        canvas.current!.canvas.renderAll()
        break
      default:
        break
    }
  }
  function handleSize(e: any) {
    canvas.current!.fontSize = e.target.value
    canvas.current!.canvas.renderAll()
  }
  function editObj(type: any, e: any) {
    console.log('type', type)
    console.log('e', e)

    console.log('hhhh', canvas.current!.selectedObj![0].stroke)
    canvas.current!.selectedObj![0].set(type, e.target.value)
    canvas.current!.canvas.renderAll()
  }
  const jsonData = useRef<string | null>(null)
  function handleDownLoad() {
    let card = canvas.current!
    // const dataURL = card.canvas.toDataURL({
    //   format: 'png',
    //   multiplier: card.canvas.getZoom(),
    //   left: 0,
    //   top: 0,
    //   width,
    //   height,
    // })
    // const link = document.createElement('a')
    // link.download = 'canvas.png'
    // link.href = dataURL
    // document.body.appendChild(link)
    // link.click()
    // document.body.removeChild(link)

    // JSON
    // jsonData.current = card.canvas.toJSON()
    // setModalType('jsonModal')
    // setVisible(true)

    // console.log(jsonData.current)

    // })

    setModalType('downloadType')
    setVisible(true)
  }
  function handleCancle() {
    setIsDownload(false)
  }
  const [isDownload, setIsDownload] = useState(false)
  function showDownload() {
    setIsDownload(true)
  }
  function downloadPic() {
    setIsDownload(false)
    let card = canvas.current!
    const dataURL = card.canvas.toDataURL({
      format: 'png',
      multiplier: card.canvas.getZoom(),
      left: 0,
      top: 0,
      width,
      height,
    })
    const link = document.createElement('a')
    link.download = 'canvas.png'
    link.href = dataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  function downloadJson() {
    setIsDownload(false)
    let card = canvas.current!
    jsonData.current = card.canvas.toJSON()
    setModalType('jsonModal')
    setVisible(true)
  }
  return (
    <div className={styles['canvas-wrapper']}>
      <Header></Header>
      <div className={styles['selectBar']}>
        <div className={styles['tools']}>
          <div className={styles['container']}>
            {tools.map((item) => (
              <button
                key={item.id}
                onClick={() => ClickTools(item.id, item.type, canvas.current!)}
                className={item.id == activeIndex ? styles['active'] : styles['']}
              >
                <i className={`iconfont ${item.value}`} />
              </button>
            ))}
          </div>
        </div>
        <div className={styles['UndoRedo-wrapper']}>
          <div className={styles['undo']} onClick={(e) => handleUndoRedo(-1, e)}>
            <i className={`iconfont icon-undo`} ref={undoRef} />
          </div>
          <div className={styles['redo']} onClick={(e) => handleUndoRedo(1, e)}>
            <i className={`iconfont icon-redo`} ref={redoRef} />
          </div>
        </div>
      </div>
      <div className={styles['footer-wrapper']}>
        <div className={styles['footer-container']}>
          {color.map((item, index) => {
            return (
              <div className={styles['btn-color-wrapper']} key={index}>
                <span className={styles['color-label']}>{item}</span>
                <input
                  type="color"
                  className={styles['color-picker']}
                  ref={pickerColorRef}
                  onChange={(e) => handlePicker(e, index)}
                ></input>
              </div>
            )
          })}

          <div className={styles['btn-size-wrapper']}>
            <span className={styles['color-label']}>fontSize</span>
            <input
              type="range"
              className={styles['size-picekr']}
              ref={pickerColorRef}
              onChange={(e) => handleSize(e)}
              min="10"
              max="40"
            ></input>
          </div>
          <div className={styles['btn-size-wrapper']}>
            <i className={`iconfont icon-shangchuan1`} />
          </div>
          <div className={`${styles['btn-size-wrapper']} ${styles['download']}`}>
            <i className={`iconfont icon-xiazai2`} onClick={showDownload} />
            <div className={styles['download-type']} style={isDownload ? { display: 'block' } : { display: 'none' }}>
              <div className={styles['modal-delete']} onClick={handleCancle}>
                ×
              </div>
              <p onClick={downloadPic}>导出为图片</p>
              <p onClick={downloadJson}>导出为json</p>
            </div>
          </div>
        </div>
      </div>
      <div className={styles['select-edit-wrapper']}>
        <div className={styles['select-edit-container']} style={isSelect ? { display: 'block' } : { display: 'none' }}>
          <div className={styles['select-item-wrapper']}>
            <div className={styles['select-item-title']}>描边</div>
            <div className={styles['select-item-desc']}>
              <input
                type="color"
                className={styles['select-color']}
                onChange={(e) => {
                  editObj('stroke', e)
                }}
              />
              <div className={styles['show-color']}>
                <div className={styles['detail-color-title']}>颜色</div>
                <div className={styles['detail-color']}>#ffffff</div>
              </div>
            </div>
          </div>
          <div className={styles['select-item-wrapper']}>
            <div className={styles['select-item-title']}>填充</div>
            <div className={styles['select-item-desc']}>
              <input
                type="color"
                className={styles['select-color']}
                onChange={(e) => {
                  editObj('fill', e)
                }}
              />
              <div className={styles['show-color']}>
                <div className={styles['detail-color-title']}>颜色</div>
                <div className={styles['detail-color']}>#ffffff</div>
              </div>
            </div>
          </div>
          <div className={styles['select-item-wrapper']}>
            <div className={styles['select-item-title']}>边框样式</div>
            <div className={styles['select-item-desc']}>
              <div className={styles['show-line']}>
                <div className={styles['detail-line']}>实线</div>
                <div className={styles['detail-line1']}>大虚线</div>
                <div className={styles['detail-line2']}>小虚线</div>
              </div>
            </div>
          </div>
          <div className={styles['select-item-wrapper']}>
            <div className={styles['select-item-title']}>透明度</div>
            <input
              type="range"
              className={styles['size-width']}
              ref={pickerColorRef}
              onChange={(e) => {
                editObj('opacity', e)
              }}
              min="0"
              max="1"
              step="0.01"
            ></input>
          </div>
          <div className={styles['select-item-wrapper']}>
            <div className={styles['select-item-title']}>角度 </div>
            <input
              type="range"
              className={styles['size-width']}
              ref={pickerColorRef}
              onChange={(e) => {
                editObj('angle', e)
              }}
            ></input>
          </div>
        </div>
      </div>
      <Modal visible={visibles} describe={modalType} jsonData={jsonData.current}></Modal>

      <canvas width={width} height={height} ref={CanvasRef} id={type}></canvas>
    </div>
  )
}
CanvasBoard.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight,
}
export default CanvasBoard
