import { FC, useRef, useEffect, useState } from 'react'
import Header from '../Header'
import styles from './index.module.css'
import { BaseBoard } from '@/utils'
import { useRecoilState } from 'recoil'
import { CanvasBoardProps } from '@/type'
import SelectBar from '../SelectBar'
import FooterBar from '../FooterBar'
import { ModalVisible } from '@/utils/data'

const CanvasBoard: FC<CanvasBoardProps> = (props) => {
  const [visibles, setVisibles] = useRecoilState(ModalVisible)
  const { width, height, type, boardId } = props
  const [curTools, setCurTools] = useState('select')
  const canvas = useRef<BaseBoard | null>(null)
  const [isSelect, setIsSelect] = useState(false)
  const [loading, setLoading] = useState(true)
  const ws = useRef<WebSocket | null>(null)
  const pickerColorRef = useRef<HTMLInputElement | null>(null)
  /**
   * @des 初始化websocket
   */
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
  /**
   * @des 初始化白板类
   */
  useEffect(() => {
    canvas.current = new BaseBoard({ type, curTools, ws })
    setVisibles(false)
    setLoading(false)
  }, [])
  /**
   * @des 监听是否选中当前图形
   */
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

  function editObj(type: any, e: React.ChangeEvent<HTMLInputElement>) {
    canvas.current!.selectedObj![0].set(type, e.target.value)
    canvas.current!.canvas.renderAll()
  }

  return (
    <div className={styles['canvas-wrapper']}>
      <Header></Header>

      {loading ? (
        <></>
      ) : (
        <>
          {' '}
          <SelectBar canvas={canvas.current!}></SelectBar>
          <FooterBar canvas={canvas.current!}></FooterBar>
        </>
      )}

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

      <canvas width={width} height={height} id={type}></canvas>
    </div>
  )
}
CanvasBoard.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight,
}
export default CanvasBoard
