import { MousePos } from '@/type'
import { Canvas } from 'fabric/fabric-impl'
import { fabric } from 'fabric'
interface BaseBoardProp {
  type: string
  curTools: string
  ws: React.MutableRefObject<WebSocket | null>
}
export class BaseBoard {
  canvas: any
  type: string
  bgColor: string
  stateArr: any[]
  stateIdx: any
  strokeColor: string
  lineSize: string
  selectTool: string
  mouseFrom: { x: number; y: number }
  isDrawing: boolean
  mouseTo: { x: number; y: number }
  drawingObject: any
  ws: React.MutableRefObject<WebSocket | null>
  curDrawObjectId: number
  constructor(props: BaseBoardProp) {
    this.type = props.type
    this.ws = props.ws
    this.canvas = null
    this.bgColor = '#f2f2f2'
    this.stateArr = [] // 保存画布的操作记录
    this.stateIdx = 0 // 当前操作步数
    this.strokeColor = 'pink'
    this.lineSize = '1'
    this.selectTool = props.curTools
    this.isDrawing = false
    this.drawingObject = null
    this.curDrawObjectId = 0
    this.mouseFrom = {
      x: 0,
      y: 0,
    }
    this.mouseTo = {
      x: 0,
      y: 0,
    }
    this.initCanvas()
    this.initCanvasEvent()
  }
  initCanvas() {
    if (!this.canvas) {
      this.canvas = new fabric.Canvas(this.type)
      this.canvas.setBackgroundColor(this.bgColor, undefined, {
        erasable: false,
      })
      console.log('初始化执行了', this.ws)

      // 设置背景色不受缩放与平移的影响
      this.canvas.set('backgroundVpt', false)
      // 禁止用户进行组选择
      this.canvas.selection = false
      // 设置当前鼠标停留在
      this.canvas.hoverCursor = 'default'
      // 重新渲染画布
      this.canvas.renderAll()
      // 记录画布原始状态
      this.stateArr.push(JSON.stringify(this.canvas))
      this.stateIdx = 0
      if (this.ws.current) {
        console.log('lllllllll')

        this.ws.current.onmessage = (e) => {
          console.log('传递过来的数据data', e.data)
          const data = JSON.parse(e.data)
          // if (e.data.login_name == cache_name) return;
          // 如果是画笔模式
          this.canvas.loadFromJSON(data)
        }
      }
    }
  }
  initBruch() {
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
    // 操作类型集合
    let toolTypes = ['画笔', 'rect', 'circle', 'text', 'move']
    // 监听鼠标按下事件
    this.canvas.on('mouse:down', (options: any) => {
      console.log('options', options)

      console.log('鼠标按下')

      // if (this.selectTool != 'text' && this.textObject) {
      //   // 如果当前存在文本对象，并且不是进行添加文字操作 则 退出编辑模式，并删除临时的文本对象
      //   // 将当前文本对象退出编辑模式
      //   this.textObject.exitEditing();
      //   this.textObject.set("backgroundColor", "rgba(0,0,0,0)");
      //   if (this.textObject.text == "") {
      //     this.canvas.remove(this.textObject);
      //   }
      //   this.canvas.renderAll();
      //   this.textObject = null;
      // }
      // 判断当前是否选择了集合中的操作
      console.log('gongju', this.selectTool)

      if (toolTypes.indexOf(this.selectTool) != -1) {
        console.log('zhixxxxxxxxxxxxxx')

        // 记录当前鼠标的起点坐标 (减去画布在 x y轴的偏移，因为画布左上角坐标不一定在浏览器的窗口左上角)
        this.mouseFrom.x = options.e.clientX - this.canvas._offset.left
        this.mouseFrom.y = options.e.clientY - this.canvas._offset.top

        // 判断当前选择的工具是否为文本
        // if (this.selectTool == "text") {
        //   // 文本工具初始化
        //   this.initText();
        // } else {
        // 设置当前正在进行绘图 或 移动操作
        this.isDrawing = true
      }
    })
    // 监听鼠标移动事件
    this.canvas.on('mouse:move', (options: any) => {
      console.log('鼠标移动')

      // 如果当前正在进行绘图或移动相关操作
      if (this.isDrawing) {
        // 记录当前鼠标移动终点坐标 (减去画布在 x y轴的偏移，因为画布左上角坐标不一定在浏览器的窗口左上角)
        this.mouseTo.x = options.e.clientX - this.canvas._offset.left
        this.mouseTo.y = options.e.clientY - this.canvas._offset.top
        // this.pointData.push(this.mouseTo)
        switch (this.selectTool) {
          case 'line':
            // 当前绘制直线，初始化直线绘制
            // this.initLine();
            console.log('线段')

            break
          // case "rect":
          //   // 初始化 矩形绘制
          //   this.initRect();
          //   break;
          // case "circle":
          //   // 初始化 绘制圆形
          //   this.initCircle();
          //   break;
          // case "move":
          //   // 初始化画布移动
          //   this.initMove();
        }
      }
    })
    // 监听鼠标松开事件
    this.canvas.on('mouse:up', () => {
      console.log(this.isDrawing)

      // 如果当前正在进行绘图或移动相关操作
      if (this.isDrawing) {
        // 清空鼠标移动时保存的临时绘图对象
        this.drawingObject = null
        // 鼠标抬起是发送消息
        // const dataStr = JSON.stringify(this.pointData)
        // this.ws.current?.send(dataStr)
        // console.log('发送的数据是', dataStr)
        if (this.canvas.isDrawingMode) {
          // 时间戳生成唯一id
          this.curDrawObjectId = new Date().getTime()
          let pointer = this.mouseFrom
          // let sendObj = JSON.stringify({
          //   type: 1,
          //   login_name: 'lijiyan',
          //   data: {
          //     id: this.curDrawObjectId,
          //     type: 'mouseDown',
          //     point: pointer,
          //     // bruchColor: brush.color,
          //   },
          // })
          let sendObj = JSON.stringify(this.canvas.toJSON())
          this.ws.current?.send(sendObj)
        }
        // 重置正在绘制图形标志
        this.isDrawing = false
        // 清空鼠标保存记录
        // this.resetMove();
        // // 如果当前进行的是移动操作，鼠标松开重置当前视口缩放系数
        // if (this.selectTool == "move") {
        //   this.canvas.setViewportTransform(this.canvas.viewportTransform);
        // }
      }
    })
    // // 监听画布渲染完成
    // this.canvas.on("after:render", () => {
    //   if (!this.isRedoing) {
    //     // 当前不是进行撤销或重做操作
    //     // 在绘画时会频繁触发该回调，所以间隔1s记录当前状态
    //     if (this.recordTimer) {
    //       clearTimeout(this.recordTimer)
    //       this.recordTimer = null
    //     }
    //     this.recordTimer = setTimeout(() => {
    //       this.stateArr.push(JSON.stringify(this.canvas))
    //       this.stateIdx++
    //     }, 100)
    //   }else {
    //     // 当前正在执行撤销或重做操作，不记录重新绘制的画布
    //     this.isRedoing = false
    //   }
    // })
  }
}
//   initLine() {
//     // 根据保存的鼠标起始点坐标 创建直线对象
//     let canvasObject = new fabric.Line(
//       [
//         this.getTransformedPosX(this.mouseFrom.x),
//         this.getTransformedPosY(this.mouseFrom.y),
//         this.getTransformedPosX(this.mouseTo.x),
//         this.getTransformedPosY(this.mouseTo.y),
//       ],
//       {
//         fill: this.fillColor,
//         stroke: this.strokeColor,
//         strokeWidth: this.lineSize,
//       }
//     );
//     // 绘制 图形对象
//     this.startDrawingObject(canvasObject);
//   },
// }
/**
 * @description 得到鼠标在当前画布中的位置
 * @param e
 * @param canvas
 * @returns {x,y}
 */
// export const getPosition = (e: MouseEvent, canvas: Canvas): MousePos => {
//    return { x: e.pageX - canvas.offsetLeft, y: e.pageY - canvas.offsetTop }
// }

// export const GetDatapaintLine = () => {}
