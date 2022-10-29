import React, { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import style from './index.module.css'
const Home: FC = () => {
  const [visible, setVisible] = React.useState(false)
  const navigate = useNavigate()
  function handleCreate() {
    navigate('/createBoard')
    // setVisible(true)
  }
  function handleCancle() {
    setVisible(false)
  }
  function handleLogin() {
    navigate('/login')
  }
  return (
    <div className={style['container']}>
      <div className={style['welcome-wrapper']}>
        <div className={style['welcome-text']}>
          <span style={{ fontSize: '75px' }}>Welcome to</span> Collaboration Whiteboard
        </div>
        <div className={style['brief-intro']}>This is a real-time collaborative drawing whiteboard, let's join it</div>
      </div>
      <div className={style['board-btn-box']}>
        <button className={style['join-board']}>
          <span style={{ fontSize: '25px' }}>Join </span> Board
        </button>
        <button className={style['create-board']}>
          <span style={{ fontSize: '25px' }} onClick={handleCreate}>
            Create
          </span>{' '}
          Board
        </button>
      </div>
      <div className={style['modal']} style={visible ? { display: 'block' } : { display: 'none' }}>
        <div className={style['modal-avatar']}></div>
        <div className={style['modal-delete']} onClick={handleCancle}>
          ×
        </div>
        <div className={style['modal-title']}>你还没有登录哦</div>
        <div className={style['modal-des']}>
          <strong>登录了才可以创建画板哦，你现在要去登录吗</strong>
        </div>

        <div className={style['login-wrap']}>
          <button className={`${style['go-login']}`} onClick={handleLogin}>
            前往登录
          </button>
        </div>
        <div>
          <button className={style['modal-cancle']} onClick={handleCancle}>
            不了，谢谢
          </button>
        </div>
      </div>
    </div>
  )
}
export default Home
