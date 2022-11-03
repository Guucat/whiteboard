import { FC, useRef, useState } from 'react'
import style from './index.module.css'
import { useNavigate } from 'react-router-dom'
import { ModalVisible } from '@/pages/Home'
import { useRecoilState } from 'recoil'
interface ModalProps {
  visible: boolean
  describe: string
}
const Modal: FC<ModalProps> = (ModalProps) => {
  //  const [visible, setVisible] = useState(false)
  const { visible, describe } = ModalProps
  const [visibles, setVisible] = useRecoilState(ModalVisible)
  const BoardIdRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  function handleCancle() {
    setVisible(false)
  }
  function handleLogin() {
    navigate('/login')
  }
  function handleJoinBoard() {
    if (BoardIdRef.current) {
      const boardId = BoardIdRef.current.value
      console.log(boardId)
      navigate('/joinBoard', { state: { boardId } })
    }
  }
  return (
    <div className={style['modal']} style={visible ? { display: 'block' } : { display: 'none' }}>
      <div className={style['modal-avatar']}></div>
      <div className={style['modal-delete']} onClick={handleCancle}>
        ×
      </div>
      {describe == 'login' ? (
        <>
          {' '}
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
        </>
      ) : describe == 'joinBoard' ? (
        <>
          {' '}
          <div className={style['modal-title']}>白板</div>
          <div className={style['modal-des']}>
            <input type="text" placeholder="输入白板id即可加入房间~" className={style['input-item']} ref={BoardIdRef} />
          </div>
          <div className={style['login-wrap']}>
            <button className={`${style['go-login']}`} onClick={handleJoinBoard}>
              进入白板
            </button>
          </div>
          <div>
            <button className={style['modal-cancle']} onClick={handleCancle}>
              不了，谢谢
            </button>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  )
}
export default Modal
