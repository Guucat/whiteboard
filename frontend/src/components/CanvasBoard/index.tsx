import { FC, useRef, useEffect, useState } from 'react'
import Header from '../Header'
import styles from './index.module.css'
import { BaseBoard } from '@/utils'
import { color, tools } from '@/utils/data'
import { useRecoilState } from 'recoil'
import { ModalVisible } from '@/pages/Home'
import Modal from '../Modal'
import { CanvasBoardProps } from '@/type'
import SelectBar from '../SelectBar'

const CanvasBoard: FC<CanvasBoardProps> = (props) => {
  // 弹窗
  const [visibles, setVisible] = useRecoilState(ModalVisible)
  const [modalType, setModalType] = useState('')
  const { width, height, type, boardId } = props
  const [curTools, setCurTools] = useState('line')
  const canvas = useRef<BaseBoard | null>(null)
  const [isSelect, setIsSelect] = useState(false)
  const [loading, setLoading] = useState(true)
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
        const data = JSON.parse(e.data)
        console.log('接收到的数据是', data)
        // 有两种情况，type=1,得到最开始的历史记录  type=2,有人修改后传递过来的数据
        let canvasData
        if (data.type == 1) {
          canvasData = data.data.history[0]
          console.log('history', canvasData)
        } else {
          canvasData = data.data.seqData
        }
        //  = data.data.seqData
        canvas.current!.canvas.loadFromJSON(canvasData, () => {
          canvas.current!.canvas.renderAll()
        })
        canvas.current!.stateArr.push(JSON.stringify(canvas.current!.canvas))
        canvas.current!.stateIdx++
      }
    }
  }, [ws])
  useEffect(() => {
    canvas.current = new BaseBoard({ type, curTools, ws })
    setVisible(false)
    setLoading(false)
  }, [])
  useEffect(() => {
    // 监听选中对象
    const board = canvas.current!
    board.canvas.on('selection:created', (e) => {
      if (e.selected!.length == 1) {
        setIsSelect(true)
      }

      // // 选中图层事件触发时，动态更新赋值
      board.selectedObj = e.selected!
      document.onkeydown = (e) => {
        if (e.key == 'Backspace' && board.selectTool !== 'text') {
          board.deleteSelectObj()
        }
      }
    })

    board.canvas.on('selection:updated', (e) => {
      if (e.selected!.length == 1) {
        setIsSelect(true)
      }
      board.selectedObj = e.selected!
      document.onkeydown = (e) => {
        if (e.key == 'Backspace' && board.selectTool !== 'text') {
          board.deleteSelectObj()
        }
      }
    })

    board.canvas.on('selection:cleared', (e) => {
      setIsSelect(false)
      board.selectedObj = null
    })
  }, [isSelect])
  const pickerColorRef = useRef<HTMLInputElement | null>(null)
  function handlePicker(e: any, id: number) {
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
    canvas.current!.selectedObj![0].set(type, e.target.value)
    canvas.current!.canvas.renderAll()
  }
  const jsonData = useRef<string | null>(null)

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

      {loading ? <></> : <SelectBar canvas={canvas.current!}></SelectBar>}

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

      <canvas width={width} height={height} id={type}></canvas>
    </div>
  )
}
CanvasBoard.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight,
}
export default CanvasBoard
