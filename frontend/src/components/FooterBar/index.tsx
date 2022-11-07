import { ModalVisible } from '@/pages/Home'
import { SelectBarProps } from '@/type'
import { color } from '@/utils/data'
import { FC, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'
import Modal from '../Modal'
import styles from './index.module.css'
const FooterBar: FC<SelectBarProps> = (props) => {
  const { canvas } = props
  const pickerColorRef = useRef<HTMLInputElement | null>(null)
  const jsonData = useRef<string | null>(null)
  const [visibles, setVisible] = useRecoilState(ModalVisible)
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
    setVisible(true)
  }
  function handleCancle() {
    setIsDownload(false)
  }
  return (
    <>
      {' '}
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
            <i className={`iconfont icon-shangchuan1`} />
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
      <Modal visible={visibles} describe={modalType} jsonData={jsonData.current}></Modal>
    </>
  )
}

export default FooterBar
