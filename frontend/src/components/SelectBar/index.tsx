import React, { useState } from 'react'
import style from './index.module.css'
import { tools } from './data'
export default function SelectBar(props: any) {
  const { getActive } = props
  const [activeIndex, setActiveIndex] = useState(0)
  function ClickTools(id: number, value: string) {
    setActiveIndex(id)
    getActive(value)
  }
  return (
    <div className={style['selectBar']}>
      <div className={style['tools']}>
        <div className={style['container']}>
          {tools.map((item) => (
            <button
              key={item.id}
              onClick={() => ClickTools(item.id, item.value)}
              className={item.id == activeIndex ? style['active'] : style['']}
            >
              {item.value}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
