import { MousePos } from '@/type'

export class BaseBoard {
  canvas: HTMLCanvasElement
  cxt: any

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.cxt = this.canvas.getContext('2d')
  }
  paintLine(startPos: MousePos, newPos: MousePos) {
    this.cxt.strokeStyle = 'red'
    this.cxt.lineJoin = 'round'
    this.cxt.lineWidth = 5
    this.cxt.beginPath()
    this.cxt.moveTo(startPos.x, startPos.y)
    this.cxt.lineTo(newPos.x, newPos.y)
    this.cxt.closePath()
    this.cxt.stroke()
  }
}
/**
 * @description 得到鼠标在当前画布中的位置
 * @param e
 * @param canvas
 * @returns {x,y}
 */
export const getPosition = (e: MouseEvent, canvas: HTMLCanvasElement): MousePos | undefined => {
  return { x: e.pageX - canvas.offsetLeft, y: e.pageY - canvas.offsetTop }
}
