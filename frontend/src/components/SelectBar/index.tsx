import React, { useState } from 'react'
import style from './index.module.css'
import { tools } from './data'
export default function SelectBar(props: any) {
  const { getActive } = props
  const [activeIndex, setActiveIndex] = useState(0)
  function ClickTools(id: number, type: string) {
    setActiveIndex(id)
    getActive(type)
    if (type == '画笔') {
      let body = document.querySelector('body')!
      body.style.cursor = 'pointer'
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
