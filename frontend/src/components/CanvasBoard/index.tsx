import { FC, useRef, useEffect, useState } from 'react'
import Header from '../Header'
import styles from './index.module.css'
import { BaseBoard } from '@/utils'
import { useRecoilState } from 'recoil'
import { CanvasBoardProps, Type1DataType } from '@/type'
import SelectBar from '../SelectBar'
import FooterBar from '../FooterBar'
import { ModalVisible, userLists } from '@/utils/data'
import { Message, Modal } from '@arco-design/web-react'
import './index.css'
import { useNavigate } from 'react-router-dom'
const CanvasBoard: FC<CanvasBoardProps> = (props) => {
  const { width, height } = props
  const [visibles, setVisibles] = useRecoilState(ModalVisible)
  const { type, boardId } = props
  const [curTools, setCurTools] = useState('select')
  const canvas = useRef<BaseBoard | null>(null)
  const [isSelect, setIsSelect] = useState(false)
  const [loading, setLoading] = useState(true)
  const ws = useRef<WebSocket | null>(null)
  const pickerColorRef = useRef<HTMLInputElement | null>(null)
  const [curUserList, setCurUserList] = useRecoilState(userLists)
  const navigate = useNavigate()
  const BaseBoardArr = useRef<BaseBoard[]>([])
  const [update, isUpdate] = useState(false)
  const receieveDataType = useRef(0)
  const [pageID, setPageId] = useState(-1)
  const [boardMode, setBoardMode] = useState(0)
  const type1Data = useRef<Type1DataType>({ curUser: '', ReboardId: 0, isOwner: true })
  /**
   * @des 初始化websocket
   */
  const receiveArr = useRef<any[]>([])
  const receieveFullArr = useRef<any[]>([])
  useEffect(() => {
    console.log('websocket')

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
        switch (data.type) {
          case 1:
            data.data.history.map((item: any, index: number) => {
              let x = JSON.parse(item)
              setPageId(index)
              receieveFullArr.current.push(x[index])
            })
            receieveDataType.current = data.type
            receiveArr.current = receieveFullArr.current.slice(1)
            type1Data.current!.curUser = data.data.userName
            type1Data.current!.ReboardId = data.data.boardId
            type1Data.current!.isOwner = data.data.isOwner
            break
          case 2:
            receieveFullArr.current.splice(data.data.pageId, data.data.pageId, data.data.seqData)
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
          case 5:
            receieveFullArr.current.push(data.data.seqData)
            receiveArr.current = receieveFullArr.current.slice(1)
            receieveDataType.current = data.type
            setPageId(data.data.pageId)
            break
          case 6:
            setBoardMode(data.data.newMode)
            break
          case 7:
            Message.success({
              content: `用户${data.data.user}${data.data.inOrOut == 1 ? '进入' : '离开'}了白板`,
              duration: 2000,
            })

            setCurUserList(data.data.users)
            break
          default:
            break
        }

        BaseBoardArr.current.map((item, index) => {
          item.canvas.loadFromJSON(receieveFullArr.current[index], () => {
            item.canvas.renderAll()
            item.stateArr.push(JSON.stringify(item.canvas))
            item.stateIdx++
          })
        })
        isUpdate(true)
        setTimeout(() => {
          isUpdate(false)
        }, 500)
      }
    }
  }, [ws])
  /**
   * @des 初始化白板类
   */
  useEffect(() => {
    console.log('初始化白板')

    canvas.current = new BaseBoard({ type, curTools, ws })
    BaseBoardArr.current.push(canvas.current)
    setVisibles(false)
    setLoading(false)
  }, [])
  useEffect(() => {
    console.log('新增一页数据')

    switch (receieveDataType.current) {
      case 1:
        if (receiveArr.current.length) {
          receiveArr.current.map((item, index) => {
            canvas.current = new BaseBoard({ type: `${index + 1}`, curTools, ws })
            BaseBoardArr.current.push(canvas.current)
          })
        }
        break
      case 5:
        canvas.current = new BaseBoard({ type: `${pageID}`, curTools, ws })
        BaseBoardArr.current.push(canvas.current)
        break
      default:
        break
    }
  }, [pageID])

  /**
   * @des 监听是否选中当前图形
   */

  useEffect(() => {
    console.log('监听选中图形')

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

  function updateCanvas(x: any) {
    isUpdate(true)
    setTimeout(() => {
      isUpdate(false)
    }, 500)
  }
  const canvasBoardRef = useRef<HTMLDivElement | null>(null)
  console.log('组件被渲染')

  return (
    <div className={styles['canvas-wrapper']}>
      {userLists && (
        <Header
          userList={curUserList}
          canvas={canvas}
          ws={ws}
          type1Data={type1Data.current!}
          curTools={curTools}
          canvasBoardRef={canvasBoardRef.current!}
          currentCanvas={updateCanvas}
          baseBoardArr={BaseBoardArr.current!}
          boardMode={boardMode}
        ></Header>
      )}

      {loading ? (
        <></>
      ) : (
        <>
          {' '}
          <SelectBar canvas={canvas.current!} boardMode={boardMode}></SelectBar>
          <FooterBar
            canvas={canvas}
            type1Data={type1Data.current!}
            curTools={curTools}
            currentCanvas={updateCanvas}
            ws={ws}
            canvasBoardRef={canvasBoardRef.current!}
            boardMode={boardMode}
          ></FooterBar>
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
        <canvas width={width} height={height} id={type}></canvas>
        {receiveArr.current.length != 0 ? (
          receiveArr.current.map((item, index) => {
            return <canvas width={width} height={height} id={`${index + 1}`} key={index}></canvas>
          })
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}
CanvasBoard.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight,
}
export default CanvasBoard
