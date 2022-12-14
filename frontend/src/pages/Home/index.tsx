import Modal from '@/components/Modal'
import { FC, useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { useNavigate } from 'react-router-dom'
import style from './index.module.css'
import { ModalVisible } from '@/utils/data'

const Home: FC = () => {
  const [visible, setVisible] = useRecoilState(ModalVisible)
  const [modalType, setModalType] = useState('')
  const navigate = useNavigate()

  function handleCreate() {
    const token = localStorage.getItem('token')
    if (token) {
      navigate('/createBoard')
    } else {
      setVisible(true)
      setModalType('login')
    }
  }
  function handleJoin() {
    setVisible(true)
    setModalType('joinBoard')
  }
  function handleLogin() {
    navigate('/login')
  }
  function handleRegister() {
    navigate('/register')
  }
  useEffect(() => {
    setVisible(false)
  }, [])
  return (
    <div className={style['container']}>
      <div className={style['top-wrapper']}>
        <button className={style['login']} onClick={handleLogin}>
          Login
        </button>
        <button className={style['register']} onClick={handleRegister}>
          Register
        </button>
      </div>
      <div className={style['welcome-wrapper']}>
        <div className={style['welcome-text']}>
          <span style={{ fontSize: '75px' }}>Welcome to</span> Collaboration Whiteboard
        </div>
        <div className={style['brief-intro']}>This is a real-time collaborative drawing whiteboard, let's join it</div>
      </div>
      <div className={style['board-btn-box']}>
        <button className={style['join-board']} onClick={handleJoin}>
          <span style={{ fontSize: '25px' }}>Join </span> Board
        </button>
        <button className={style['create-board']} onClick={handleCreate}>
          <span style={{ fontSize: '25px' }}>Create</span> Board
        </button>
      </div>

      <Modal visible={visible} describe={modalType}></Modal>
    </div>
  )
}
export default Home
