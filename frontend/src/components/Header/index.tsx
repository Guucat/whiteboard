import { FC } from 'react'
import style from './index.module.css'
import { Avatar, Message } from '@arco-design/web-react'
import { HeaderProps } from '@/type'
import { exitBoard } from '@/service'
import { useRecoilState } from 'recoil'
import { ModalVisible, userLists } from '@/utils/data'
const Header: FC<HeaderProps> = (props) => {
  const { canvas, userList, curUser, boardId, ws, isOwner } = props
  console.log('props', props)
  const [curUserList, setCurUserList] = useRecoilState(userLists)
  const AvatarGroup = Avatar.Group
  /**
   * @des 退出白板
   */
  async function handleExitBoard() {
    const obj = { boardId, curUser }
    const getExitData: any = await exitBoard(obj)
    console.log(getExitData)
    if (getExitData.msg == '退出成功') {
      // 先全局提示一下谁退出房间了，然后再刷新一下用户列表
      Message.success(`用户${curUser}退出了白板`)
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data)
        console.log('接收到的数据是', data)
        console.log('llll', data.data.seqData)

        // 有两种情况，type=1,得到最开始的历史记录  type=2,有人修改后传递过来的数据
        // let canvasData
        switch (data.type) {
          case 7:
            setCurUserList(data.data.users)
          default:
            break
        }
      }
    }
    console.log('当前用户列表', curUserList)
  }

  /**
   * @des 添加新页
   */
  function handleNewPage() {}
  return (
    <div className={style['container']}>
      <div className={style['head-wrapper']}>
        <div className={style['add-new-page']} onClick={handleNewPage}>
          Add new Page
        </div>
        <div className={style['head-right']}>
          {isOwner ? (
            <div className={style['selectMode']}>
              {' '}
              <button className={style['readOnly']}>只读</button>
              <span className={style['division']}>|</span>
              <button className={style['edit']}>编辑</button>
            </div>
          ) : (
            <></>
          )}

          <button className={style['exit-board']} onClick={handleExitBoard}>
            退出白板
          </button>
          {isOwner ? (
            <button className={style['exit-board']} onClick={handleExitBoard}>
              解散白板
            </button>
          ) : (
            <></>
          )}

          <AvatarGroup size={38} maxCount={2} className={style['avatar-group']}>
            {userList.map((item, index) => {
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
