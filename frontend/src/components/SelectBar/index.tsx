import { SelectBarProps } from '@/type'
import { BaseBoard } from '@/utils'
import { tools } from '@/utils/data'
import { FC, useEffect, useRef, useState } from 'react'
import styles from './index.module.css'

const SelectBar: FC<SelectBarProps> = (props) => {
  const { canvas } = props
  const [activeIndex, setActiveIndex] = useState(1)
  console.log('侧边栏接收到的canvas', canvas)
  /**
   * @param id 画板工具的唯一id
   * @param tool 画板工具名称
   * @param card 白板类
   */
  function ClickTools(id: number, tool: string, card: BaseBoard) {
    setActiveIndex(id)
    canvas.selectTool = tool
    // 禁用画笔模式
    console.log('当前的工具', canvas.selectTool)

    card.canvas.isDrawingMode = false
    // 禁止图形选择编辑
    switch (tool) {
      case 'brush':
        card.canvas.selection = false
        // 如果用户选择的是画笔工具，直接初始化，无需等待用户进行鼠标操作
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
    const card = canvas
    card.isRedoing = true
    let stateIdx = card.stateIdx + flag

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
      card.canvas.loadFromJSON(card.stateArr[stateIdx], () => {
        card.canvas.renderAll()
        card.isRedoing = false
      })
      let obj = { pageId: 0, seqData: card.stateArr[stateIdx] }
      let sendObj = JSON.stringify(obj)
      card.ws.current?.send(sendObj)
      if (card.canvas.getObjects().length > 0) {
        card.canvas.getObjects().forEach((item: any) => {
          item.set('selectable', false)
        })
      }
      card.stateIdx = stateIdx
    }
  }
  useEffect(() => {
    ClickTools(1, 'brush', canvas)
  }, [])
  return (
    <div className={styles['selectBar']}>
      <div className={styles['tools']}>
        <div className={styles['container']}>
          {tools.map((item) => (
            <button
              key={item.id}
              onClick={() => ClickTools(item.id, item.type, canvas)}
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
  )
}
export default SelectBar
