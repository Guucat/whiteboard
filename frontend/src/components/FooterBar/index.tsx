import { addNewPage } from '@/service'
import { FooterBarProps } from '@/type'
import { color, ModalVisible, Page } from '@/utils/data'
import { FC, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'
import Modal from '../Modal'
import styles from './index.module.css'
const FooterBar: FC<FooterBarProps> = (props) => {
  const { canvas, type1Data, canvasBoardRef, currentCanvas, boardMode, baseBoardArr, canvasCurrent } = props

  const pickerColorRef = useRef<HTMLInputElement | null>(null)
  const jsonData = useRef<string | null>(null)
  const [visiable, setVisiable] = useRecoilState(ModalVisible)
  const [modalType, setModalType] = useState('')
  const [isDownload, setIsDownload] = useState(false)
  /**
   * @des 打开颜色选择器，选中并修改白板相对应的颜色
   * @param e
   * @param id
   */
  function handlePicker(e: React.ChangeEvent<HTMLInputElement>, id: number) {
    switch (id) {
      case 0:
        canvas.strokeColor = e.target.value
        canvas.canvas.renderAll()
        break
      case 1:
        canvas.fillColor = e.target.value
        canvas.canvas.renderAll()
        break
      case 2:
        canvas.canvas.backgroundColor = e.target.value
        canvas.canvas.renderAll()
        break
      default:
        break
    }
  }

  /**
   * @des 对字体大小进行调整
   * @param e
   */
  function handleSize(e: React.ChangeEvent<HTMLInputElement>) {
    canvas.fontSize = parseInt(e.target.value)
    canvas.canvas.renderAll()
  }
  // 导出类型弹窗出现
  function showDownload() {
    setIsDownload(true)
  }
  // 导出为图片类型
  function downloadPic() {
    setIsDownload(false)
    let card = canvas
    const dataURL = card.canvas.toDataURL({
      format: 'png',
      multiplier: card.canvas.getZoom(),
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    })
    const link = document.createElement('a')
    link.download = 'canvas.png'
    link.href = dataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  // 导出为json类型
  function downloadJson() {
    setIsDownload(false)
    let card = canvas
    jsonData.current = card.canvas.toJSON()

    setModalType('jsonModal')
    setVisiable(true)
  }
  function handleCancle() {
    setIsDownload(false)
  }
  const [curPage, setCurPage] = useRecoilState(Page)
  const uploadIconRef = useRef<HTMLElement | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  //上传json文件到白板
  function uploadJson() {
    fileRef.current?.click()
  }
  // input变化时
  const indexId = useRef(1)
  async function uploadFile(e: any) {
    let file = e.target.files[0]
    const formdata = new FormData()
    formdata.append('jsonFile', file)
    formdata.append('boardId', `${type1Data.ReboardId}`)
    const getUploadFileData = await addNewPage(formdata)
    const pageId = getUploadFileData.data.pageId
    indexId.current = pageId + 1
    setCurPage(indexId.current)
    canvasBoardRef.style.left = `-${window.innerWidth * (indexId.current - 1)}px`
    baseBoardArr.map((item, index) => {
      if (indexId.current == index + 1) {
        canvasCurrent.current = item
        currentCanvas()
      }
    })
    fileRef.current!.value = ''
  }
  return (
    <>
      {' '}
      {!boardMode ? (
        <div className={styles['footer-wrapper']}>
          <div className={styles['footer-container']}>
            {color.map((item, index) => {
              return (
                <div className={styles['btn-color-wrapper']} key={index}>
                  <span className={styles['color-label']}>{item}</span>
                  <input
                    type="color"
                    className={styles['color-picker']}
                    ref={pickerColorRef}
                    onChange={(e) => handlePicker(e, index)}
                  ></input>
                </div>
              )
            })}

            <div className={styles['btn-size-wrapper']}>
              <span className={styles['color-label']}>fontSize</span>
              <input
                type="range"
                className={styles['size-picekr']}
                ref={pickerColorRef}
                onChange={(e) => handleSize(e)}
                min="10"
                max="40"
              ></input>
            </div>
            <div className={styles['btn-size-wrapper']}>
              <i className={`iconfont icon-shangchuan1`} onClick={uploadJson} ref={uploadIconRef} />
              <input
                type="file"
                id="myFile"
                hidden
                ref={fileRef}
                accept="application/json"
                onChange={(e) => uploadFile(e)}
              />
            </div>
            <div className={`${styles['btn-size-wrapper']} ${styles['download']}`}>
              <i className={`iconfont icon-xiazai2`} onClick={showDownload} />
              <div className={styles['download-type']} style={isDownload ? { display: 'block' } : { display: 'none' }}>
                <div className={styles['modal-delete']} onClick={handleCancle}>
                  ×
                </div>
                <p onClick={downloadPic}>导出为图片</p>
                <p onClick={downloadJson}>导出为json</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
      <Modal visible={visiable} describe={modalType} jsonData={jsonData.current}></Modal>
    </>
  )
}

export default FooterBar
