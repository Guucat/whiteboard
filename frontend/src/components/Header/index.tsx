import { FC } from 'react'
import style from './index.module.css'
const Header: FC = () => {
  return (
    <div className={style['head-wrapper']}>
      <div className={style['add-new-page']}>Add new Page</div>
      <div className={style['head-right']}>
        <div className={style['selectMode']}>
          {' '}
          <button className={style['readOnly']}>只读</button>
          <span className={style['division']}>|</span>
          <button className={style['edit']}>编辑</button>
        </div>
        <div className={style['user']}>用户</div>
      </div>
    </div>
  )
}
export default Header
