import { FC, useRef, useState } from 'react'
import style from './index.module.css'
import { Avatar, Message, Pagination } from '@arco-design/web-react'
import { HeaderProps } from '@/type'
import { addNewPage, deleteBoard, exitBoard, switchMode } from '@/service'
import { useNavigate } from 'react-router-dom'
import { BaseBoard } from '@/utils'
import { useRecoilState } from 'recoil'
import { Page } from '@/utils/data'

const Header: FC<HeaderProps> = (props) => {
  const { canvas, userList, ws, type1Data, curTools, canvasBoardRef, currentCanvas, baseBoardArr, boardMode } = props
  const AvatarGroup = Avatar.Group
  const navigate = useNavigate()

  /**
   * @des 退出白板
   */
  async function handleExitBoard() {
    const boardId = type1Data.ReboardId
    const curUser = type1Data.curUser
    const obj = { boardId, curUser }
    const getExitData: any = await exitBoard(obj)

    if (getExitData.msg == '退出成功') {
      // 先全局提示一下谁退出房间了，然后再刷新一下用户列表
      Message.success({ content: `用户${curUser}退出了白板`, duration: 2000 })
      setTimeout(() => {
        navigate('/home')
      }, 2500)
    }
  }

  /**
   * @des 添加新页
   */
  //let index: number = 1
  const index = useRef(1)
  const [curPage, setCurPage] = useRecoilState(Page)
  async function handleNewPage() {
    let formData = new FormData()
    formData.append('boardId', `${type1Data.ReboardId}`)
    const addnewPage = await addNewPage(formData)
    const pageId = addnewPage.data.pageId
    index.current = pageId + 1
    handleSwitchPage(index.current)
  }
  /**
   * @des 解散白板
   */

  async function handleDeleteBoard() {
    const getDeleteData: any = await deleteBoard(type1Data.ReboardId)
    if (getDeleteData.msg == '解散成功') {
      Message.success({ content: '解散成功', duration: 2000 })
      setTimeout(() => {
        navigate('/home')
      }, 2500)
    }
  }

  function handleSwitchPage(page: number) {
    setCurPage(page)

    canvasBoardRef.style.left = `-${window.innerWidth * (page - 1)}px`
    baseBoardArr.map((item, index) => {
      if (page == index + 1) {
        canvas.current = item
        currentCanvas()
      }
    })
  }
  const [isReadOnly, setIsReadOnly] = useState(false)
  async function handleMode(e: any, mode: number) {
    let formData = new FormData()
    formData.append('boardId', `${type1Data.ReboardId}`)
    formData.append('newMode', `${mode}`)
    const getSwitchData: any = await switchMode(formData)

    if (getSwitchData.msg == '切换成功') {
      mode ? setIsReadOnly(true) : setIsReadOnly(false)
    }
  }
  return (
    <div className={style['container']}>
      <div className={style['head-wrapper']}>
        <div className={style['head-left']}>
          <div className={style['add-new-page']} style={{ marginRight: '16px' }}>
            白板Id:{type1Data.ReboardId}
          </div>
          {boardMode ? (
            <></>
          ) : (
            <div className={style['add-new-page']} onClick={handleNewPage}>
              Add new Page
            </div>
          )}

          {canvasBoardRef && (
            <Pagination
              total={canvasBoardRef.childNodes.length}
              pageSize={1}
              onChange={(page) => handleSwitchPage(page)}
              hideOnSinglePage={true}
              current={curPage}
            />
          )}
        </div>

        <div className={style['head-right']}>
          {type1Data.isOwner ? (
            <div className={style['selectMode']}>
              {' '}
              <button
                className={style['readOnly']}
                style={isReadOnly ? { color: '#1398e6' } : { color: 'black' }}
                onClick={(e) => handleMode(e, 1)}
              >
                只读
              </button>
              <span className={style['division']}>|</span>
              <button
                className={style['edit']}
                style={!isReadOnly ? { color: '#1398e6' } : { color: 'black' }}
                onClick={(e) => handleMode(e, 0)}
              >
                编辑
              </button>
            </div>
          ) : (
            <></>
          )}

          <button className={style['exit-board']} onClick={handleExitBoard}>
            退出白板
          </button>
          {type1Data.isOwner ? (
            <button className={style['exit-board']} onClick={handleDeleteBoard}>
              解散白板
            </button>
          ) : (
            <></>
          )}

          <AvatarGroup size={38} maxCount={2} className={style['avatar-group']}>
            {userList &&
              userList.map((item, index) => {
                return (
                  <Avatar style={{ backgroundColor: '#168CFF' }} key={index}>
                    {item}
                  </Avatar>
                )
              })}
          </AvatarGroup>
        </div>
      </div>
    </div>
  )
}
export default Header
