import { FC, useRef, useState } from 'react'
import style from './index.module.css'
import { useNavigate } from 'react-router-dom'
import { ModalVisible } from '@/pages/Home'
import { useRecoilState } from 'recoil'
import ReactJson from 'react-json-view'
interface ModalProps {
  visible: boolean
  describe: string
  jsonData?: any | null
}
const Modal: FC<ModalProps> = (ModalProps) => {
  //  const [visible, setVisible] = useState(false)
  const { visible, describe, jsonData } = ModalProps
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
  function handleJson() {
    let link = document.createElement('a')
    link.download = 'config.json'
    link.href = 'data:text/plain,' + JSON.stringify(jsonData)
    link.click()
  }
  return (
    <div className={style['modal']} style={visible ? { display: 'block' } : { display: 'none' }}>
      <div className={style['modal-delete']} onClick={handleCancle}>
        ×
      </div>
      {describe == 'login' ? (
        <>
          {' '}
          <div className={style['modal-avatar']}></div>
          <div className={style['login-modal-wrap']}>
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
        </>
      ) : describe == 'joinBoard' ? (
        <>
          {' '}
          <div className={style['modal-avatar']}></div>
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
      ) : describe == 'jsonModal' ? (
        <div className={style['json-wrapper']}>
          <div className={style['modal-title-json']}>导出为json</div>
          <div className={style['jsonData']}>
            <ReactJson src={jsonData}></ReactJson>
          </div>
          <div className={style['json-btn-wrapper']}>
            <button className={style['json-confirm']} onClick={handleJson}>
              导出json
            </button>
            <button className={style['json-cancle']} onClick={handleCancle}>
              {' '}
              不了，谢谢
            </button>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  )
}
export default Modal