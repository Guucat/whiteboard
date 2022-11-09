import { FC, useRef, useEffect, useState } from 'react'
import Header from '../Header'
import styles from './index.module.css'
import { BaseBoard } from '@/utils'
import { useRecoilState } from 'recoil'
import { CanvasBoardProps } from '@/type'
import SelectBar from '../SelectBar'
import FooterBar from '../FooterBar'
import { boardSize, ModalVisible, userLists } from '@/utils/data'
import { Message, Modal } from '@arco-design/web-react'
import './index.css'
import { useNavigate } from 'react-router-dom'
const CanvasBoard: FC<CanvasBoardProps> = (props) => {
  const [visibles, setVisibles] = useRecoilState(ModalVisible)
  const { type, boardId } = props
  const [curTools, setCurTools] = useState('select')
  const canvas = useRef<BaseBoard | null>(null)
  const [isSelect, setIsSelect] = useState(false)
  const [loading, setLoading] = useState(true)
  const ws = useRef<WebSocket | null>(null)
  const pickerColorRef = useRef<HTMLInputElement | null>(null)
  const canvasData = useRef<string | null>(null)
  const [curUserList, setCurUserList] = useRecoilState(userLists)
  const curUser = useRef(null)
  const ReboardId = useRef(null)
  const [isOwner, setIsOwner] = useState(false)
  const isCreate = useRef(null)
  const [boardsize, setBoardsize] = useRecoilState(boardSize)
  const navigate = useNavigate()
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
        console.log('llll', data.data.seqData)
        console.log('shibuhi', data.isOwner)
        // 有两种情况，type=1,得到最开始的历史记录  type=2,有人修改后传递过来的数据
        // let canvasData

        switch (data.type) {
          case 1:
            canvasData.current = data.data.history[0]
            console.log('history', canvasData)
            curUser.current = data.data.userName
            ReboardId.current = data.data.boardId
            setIsOwner(data.isOwner)
            isCreate.current = data.isOwner
            break
          case 2:
            canvasData.current = data.data.seqData
            break
          case 4:
            data.isOwner
              ? null
              : Modal.info({
                  title: '退出白板',
                  content: '创建者解散了该白板，点击确认返回首页',
                  onOk: () => {
                    navigate('/home')
                  },
                })
            break
          case 7:
            console.log('isOwner', isCreate.current)

            Message.success({
              content: `用户${data.data.user}${
                data.data.inOrOut == 1 ? (isCreate.current ? '创建' : '进入') : '离开'
              }了白板`,
              duration: 2000,
            })
            setCurUserList(data.data.users)
            break
          default:
            break
        }

        canvas.current!.canvas.loadFromJSON(canvasData.current, () => {
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
    console.log('loading')
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
  const [update, isUpdate] = useState(false)
  function updateCanvas(x: any) {
    canvas.current = x
    isUpdate(true)
  }
  const canvasBoardRef = useRef<HTMLDivElement | null>(null)
  return (
    <div className={styles['canvas-wrapper']}>
      {userLists && (
        <Header
          userList={curUserList}
          canvas={canvas}
          curUser={curUser.current!}
          boardId={ReboardId.current!}
          ws={ws}
          isOwner={isOwner}
          curTools={curTools}
          type={type}
          canvasBoardRef={canvasBoardRef.current!}
          currentCanvas={updateCanvas}
        ></Header>
      )}

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
      <div className={styles['canvasBoard']} ref={canvasBoardRef}>
        {}
        <canvas width={boardsize.width} height={boardsize.height} id={type}></canvas>
      </div>
    </div>
  )
}
// CanvasBoard.defaultProps = {
//   width: window.innerWidth,
//   height: window.innerHeight,
// }
export default CanvasBoard
