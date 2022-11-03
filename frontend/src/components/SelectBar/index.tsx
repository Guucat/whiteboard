import React, { useState } from 'react'
import style from './index.module.css'
import { tools } from '../CanvasBoard/data'
import { fabric } from 'fabric'
export default function SelectBar(props: any) {
  const { getActive, card } = props
  const [activeIndex, setActiveIndex] = useState(1)
  function resetObj() {
    // card.selectable = false
    card.selection = false
    card.skipTargetFind = true
    //清除文字对象
    // if(this.textboxObj) {
    // this.textboxObj.exitEditing();
    // this.textboxObj = null;
    // }
  }
  function ClickTools(id: number, type: string) {
    setActiveIndex(id)
    getActive(type)
    card.isDrawingMode = false
    resetObj()
    // if (type == '画笔') {
    //   let body = document.querySelector('body')!
    //   body.style.cursor = 'pointer'
    // }
    switch (type) {
      case '箭头':
        let body = document.querySelector('body')!
        body.style.cursor = 'pointer'
        return
      case '画笔':
        console.log('huabi')
        card.isDrawingMode = true
        card.freeDrawingBrush = new fabric.PencilBrush(card)
        card.freeDrawingBrush.color = '#000000'
        card.freeDrawingBrush.width = 4
        // setIsPainting(true)
        console.log('设置为空')
        // setPonitData([])
        // setMousePosition(e.pointer)
        // return
        return
      default:
        return
    }
  }
  return (
    <>
      <div className={style['selectBar']}>
        <div className={style['tools']}>
          <div className={style['container']}>
            {tools.map((item) => (
              <button
                key={item.id}
                onClick={() => ClickTools(item.id, item.type)}
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
    </>
  )
}
