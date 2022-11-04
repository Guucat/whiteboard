import { Gradient, Pattern } from 'fabric/fabric-impl'
import { fabric } from 'fabric'
import { toolTypes } from './data'
interface BaseBoardProp {
  type: string
  curTools: string
  ws: React.MutableRefObject<WebSocket | null>
}
export class BaseBoard {
  canvas!: fabric.Canvas
  type: string
  bgColor: string
  stateArr: string[]
  stateIdx: number
  strokeColor: string
  lineSize: number
  selectTool: string
  mouseFrom: { x: number; y: number }
  isDrawing: boolean
  mouseTo: { x: number; y: number }
  ws: React.MutableRefObject<WebSocket | null>
  curDrawObjectId: number
  fillColor: string | Pattern | Gradient | undefined
  canvasObject!: fabric.Rect | fabric.Line
  fontSize: number
  isRedoing: boolean
  drawingObject: fabric.Object | null
  textObject: any
  selectedObj: fabric.Object | undefined

  constructor(props: BaseBoardProp) {
    this.type = props.type
    this.ws = props.ws
    // this.canvas = null
    this.bgColor = '#f2f2f2'
    this.stateArr = [] // 保存画布的操作记录
    this.stateIdx = 0 // 当前操作步数
    this.strokeColor = 'black'
    this.lineSize = 1
    this.selectTool = props.curTools
    this.isDrawing = false
    this.drawingObject = null
    this.curDrawObjectId = 0
    this.fontSize = 20
    this.fillColor = 'transparent'
    this.textObject = null // 保存用户创建的文本对象
    this.isRedoing = false // 当前是否在执行撤销或重做操作

    this.mouseFrom = {
      x: 0,
      y: 0,
    }
    this.mouseTo = {
      x: 0,
      y: 0,
    }
  }
  initCanvas() {
    console.log('是否存在画布', this.canvas)

    if (!this.canvas) {
      this.canvas = new fabric.Canvas(this.type)
      // 禁止用户进行组选择
      this.canvas.selection = false
      // 设置当前鼠标停留在
      this.canvas.hoverCursor = 'default'
      // 重新渲染画布
      this.canvas.renderAll()
      // 记录画布原始状态
      this.stateArr.push(JSON.stringify(this.canvas))
      this.stateIdx = 0
    }
  }
  initBrush() {
    // 设置绘画模式画笔类型为 铅笔类型
    this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas)
    // 设置画布模式为绘画模式
    this.canvas.isDrawingMode = true
    // 设置绘画模式 画笔颜色与画笔线条大小
    this.canvas.freeDrawingBrush.color = this.strokeColor
    this.canvas.freeDrawingBrush.width = 4
    console.log('画笔设置执行了 ')
  }
  initCanvasEvent() {
    this.canvas.on('mouse:down', (options: any) => {
      if (this.selectedObj) {
        console.log('有图形被选中了')
        this.isDrawing = false
        return
      }
      if (this.selectTool != 'text' && this.textObject) {
        // 如果当前存在文本对象，并且不是进行添加文字操作 则 退出编辑模式，并删除临时的文本对象
        // 将当前文本对象退出编辑模式
        this.textObject.exitEditing()
        if (this.textObject.text == '') {
          this.canvas.remove(this.textObject)
        }
        this.canvas.renderAll()
        this.textObject = null
      }
      // 判断当前是否选择了集合中的操作
      if (toolTypes.indexOf(this.selectTool) != -1) {
        // 记录当前鼠标的起点坐标 (减去画布在 x y轴的偏移，因为画布左上角坐标不一定在浏览器的窗口左上角)
        this.mouseFrom.x = options.e.clientX
        this.mouseFrom.y = options.e.clientY
        if (this.selectTool == 'text') {
          // 文本工具初始化
          this.initText()
        } else {
          // 设置当前正在进行绘图 或 移动操作
          this.isDrawing = true
          console.log('执行了')
        }
      }
    })
    // 监听鼠标移动事件
    this.canvas.on('mouse:move', (options: any) => {
      // console.log('鼠标移动')
      // console.log('鼠标移动的this', this)
      // 如果当前正在进行绘图或移动相关操作
      if (this.isDrawing) {
        // 记录当前鼠标移动终点坐标 (减去画布在 x y轴的偏移，因为画布左上角坐标不一定在浏览器的窗口左上角)
        this.mouseTo.x = options.e.clientX
        this.mouseTo.y = options.e.clientY
        // this.pointData.push(this.mouseTo)
        switch (this.selectTool) {
          case 'line':
            // 当前绘制直线，初始化直线绘制
            this.initLine()
            console.log('线段')
            break
          case 'rect':
            this.initRect()
            break
          case 'circle':
            this.initCircle()
            break
          case 'ellipse':
            this.initEllipse()
            break
          case 'triangle':
            this.initTriangle()
            break
          case 'rhombus':
            this.initRhombus()
        }
      }
    })
    // 监听鼠标松开事件
    let recordTimer: any
    this.canvas.on('mouse:up', () => {
      // 如果当前正在进行绘图或移动相关操作
      if (this.isDrawing) {
        console.log('this.isDrawing', this.isDrawing)

        // 清空鼠标移动时保存的临时绘图对象
        this.drawingObject = null
        // 鼠标抬起是发送消息
        let sendObj = JSON.stringify(this.canvas.toJSON())
        this.ws.current?.send(sendObj)
        // 重置正在绘制图形标志
        this.isDrawing = false
      } else {
        let sendObj = JSON.stringify(this.canvas.toJSON())
        this.ws.current?.send(sendObj)
      }

      if (!this.isRedoing) {
        // 当前不是进行撤销或重做操作
        // 在绘画时会频繁触发该回调，所以间隔1s记录当前状态
        if (recordTimer) {
          clearTimeout(recordTimer)
          recordTimer = null
        }
        recordTimer = setTimeout(() => {
          this.stateArr.push(JSON.stringify(this.canvas))
          this.stateIdx++
          console.log('当前的指向', this.stateIdx)
        }, 100)
      } else {
        console.log('监测到撤销')

        // 当前正在执行撤销或重做操作，不记录重新绘制的画布
        this.isRedoing = false
      }
    })
    // 监听选中对象
    this.canvas.on('selection:created', (e) => {
      // 选中图层事件触发时，动态更新赋值
      this.selectedObj = e.selected![0]
      // console.log('当前选中对象是', e.selected[0])
      // this.isDrawing = false
      this.canvas.bringToFront(this.selectedObj)
      console.log('选中状态的this', this)

      // console.log('this.isDrawing', this.isDrawing)
    })
  }
  // 初始化文本工具
  initText() {
    if (!this.textObject) {
      // 当前不存在绘制中的文本对象
      // 创建文本对象
      this.textObject = new fabric.Textbox('', {
        left: this.mouseFrom.x,
        top: this.mouseFrom.y,
        fontSize: this.fontSize,
        fill: this.strokeColor,
        hasControls: false,
        editable: true,
        width: 30,
        backgroundColor: 'transparent',
        selectable: true,
        padding: 10,
      })
      this.canvas.add(this.textObject)
      // 文本打开编辑模式
      this.textObject.enterEditing()
      // 文本编辑框获取焦点
      this.textObject.hiddenTextarea.focus()
    } else {
      // 将当前文本对象退出编辑模式
      this.textObject.exitEditing()
      this.textObject.set('backgroundColor', 'rgba(0,0,0,0)')
      if (this.textObject.text == '') {
        this.canvas.remove(this.textObject)
      }
      this.canvas.renderAll()
      this.textObject = null
      return
    }
  }
  initLine() {
    // 根据保存的鼠标起始点坐标 创建直线对象
    this.canvasObject = new fabric.Line([this.mouseFrom.x, this.mouseFrom.y, this.mouseTo.x, this.mouseTo.y], {
      fill: this.fillColor,
      stroke: this.strokeColor,
      strokeWidth: this.lineSize,
      selectable: true,
    })
    // 绘制 图形对象
    this.drawingGraph(this.canvasObject)
  }
  initRect() {
    // 计算矩形长宽
    let left = this.mouseFrom.x
    let top = this.mouseFrom.y
    let width = this.mouseTo.x - this.mouseFrom.x
    let height = this.mouseTo.y - this.mouseFrom.y
    // 创建矩形 对象
    this.canvasObject = new fabric.Rect({
      left: left,
      top: top,
      width: width,
      height: height,
      stroke: this.strokeColor,
      fill: this.fillColor,
      strokeWidth: this.lineSize,
      selectable: true,
    })
    // 绘制矩形
    this.drawingGraph(this.canvasObject)
  }
  initCircle() {
    let left = this.mouseFrom.x
    let top = this.mouseFrom.y
    // 计算圆形半径
    let radius = Math.sqrt(Math.pow(this.mouseTo.x - left, 2) + Math.pow(this.mouseTo.y - top, 2)) / 2
    // 创建 原型对象
    let canvasObject = new fabric.Circle({
      left: left,
      top: top,
      stroke: this.strokeColor,
      fill: this.fillColor,
      radius: radius,
      strokeWidth: this.lineSize,
      selectable: true,
    })
    // 绘制圆形对象
    this.drawingGraph(canvasObject)
  }
  initEllipse() {
    let left = this.mouseFrom.x
    let top = this.mouseFrom.y
    let canvasObject = new fabric.Ellipse({
      left: left,
      top: top,
      stroke: this.strokeColor,
      fill: this.fillColor,
      rx: Math.abs(left - this.mouseTo.x) / 2,
      ry: Math.abs(top - this.mouseTo.y) / 2,
      strokeWidth: this.lineSize,
      selectable: true,
    })
    // 绘制圆形对象
    this.drawingGraph(canvasObject)
  }
  initTriangle() {
    let left = this.mouseFrom.x
    let top = this.mouseFrom.y
    let width = this.mouseTo.x - this.mouseFrom.x
    let height = this.mouseTo.y - this.mouseFrom.y
    let canvasObject = new fabric.Triangle({
      left: left,
      top: top,
      stroke: this.strokeColor,
      fill: this.fillColor,
      width: width,
      height: height,
      strokeWidth: this.lineSize,
      selectable: true,
    })
    // 绘制圆形对象
    this.drawingGraph(canvasObject)
  }
  initRhombus() {
    // 计算矩形长宽
    let left = this.mouseFrom.x
    let top = this.mouseFrom.y
    let width = this.mouseTo.x - this.mouseFrom.x
    let height = this.mouseTo.y - this.mouseFrom.y
    // 创建矩形 对象
    this.canvasObject = new fabric.Rect({
      left: left,
      top: top,
      width: height,
      height: height,
      stroke: this.strokeColor,
      fill: this.fillColor,
      strokeWidth: this.lineSize,
      angle: 45,
      selectable: true,
    })
    // 绘制矩形
    this.drawingGraph(this.canvasObject)
  }

  drawingGraph(canvasObject: any) {
    // 禁止用户选择当前正在绘制的图形
    canvasObject.selectable = true

    // 如果当前图形已绘制，清除上一次绘制的图形
    if (this.drawingObject) {
      this.canvas.remove(this.drawingObject)
    }
    // 将绘制对象添加到 canvas中
    this.canvas.add(canvasObject)
    // 保存当前绘制的图形
    // this.isDrawing = false
    this.drawingObject = canvasObject
  }
  // 删除当前选中图层对象
  deleteSelectObj() {
    console.log('删除', this.selectedObj)

    this.selectedObj && this.canvas.remove(this.selectedObj)
  }
}
