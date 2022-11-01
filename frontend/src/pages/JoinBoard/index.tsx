import SelectBar from '@/components/SelectBar'
import { FC, useState, useRef, useEffect, useCallback } from 'react'
import { CanvasProps, MousePos } from '@/type'
import { useLocation } from 'react-router-dom'
import { BaseBoard, getPosition } from '@/utils'
import CanvasBoard from '@/components/CanvasBoard'

const JoinBoard: FC<CanvasProps> = (props) => {
  const { width, height } = props
  const getCanvasRef = useRef<HTMLCanvasElement>(null)
  // const [curTools, setCurTools] = useState('箭头')
  // const [isPainting, setIsPainting] = useState(false)
  // const [mousePosition, setMousePosition] = useState<MousePos | undefined>(undefined)
  // function getCurTools(value: string) {
  //   setCurTools(value)
  // }
  // // 鼠标按下事件，在鼠标按下时判断选择的工具类型
  // const startPaint = useCallback(
  //   (e: MouseEvent) => {
  //     console.log('startPoint')

  //     const canvas: HTMLCanvasElement = getCanvasRef.current!
  //     const inBoardPos = getPosition(e, canvas)
  //     if (inBoardPos) {
  //       switch (curTools) {
  //         case '箭头':
  //           return
  //         case '画笔':
  //           setIsPainting(true)
  //           console.log('设置为空')
  //           setPonitData([])
  //           setMousePosition(inBoardPos)
  //           return
  //         default:
  //           return
  //       }
  //     }
  //   },
  //   [curTools, isPainting]
  // )
  // const [pointData, setPonitData] = useState<MousePos[]>([])
  // const paint = useCallback(
  //   (event: MouseEvent) => {
  //     console.log('paint')

  //     const canvas: HTMLCanvasElement = getCanvasRef.current!
  //     if (isPainting) {
  //       const newMousePosition = getPosition(event, canvas)
  //       setPonitData((state) => {
  //         return [...state, newMousePosition]
  //       })
  //       // console.log(newMousePosition)
  //       console.log('移动的dada', pointData)

  //       if (mousePosition && newMousePosition) {
  //         const baseBoard = new BaseBoard(canvas)
  //         baseBoard.paintLine(mousePosition, newMousePosition)
  //         setMousePosition(newMousePosition)
  //       }
  //     }
  //   },
  //   [mousePosition, isPainting]
  // )
  const { state } = useLocation()
  const ws = useRef<WebSocket | null>(null)
  // const exitPaint = useCallback(() => {
  //   if (ws.current?.readyState === 1) {
  //     console.log(pointData)
  //     const dataStr = JSON.stringify(pointData)
  //     ws.current?.send(dataStr)
  //   }
  //   setIsPainting(false)
  // }, [ws.current, pointData])

  useEffect(() => {
    console.log('useEffect，WS')
    const BoardId = state ? state.boardId : null
    console.log(BoardId)

    if (typeof WebSocket !== 'undefined') {
      ws.current = new WebSocket(`ws://114.55.132.72:8080/board/enter?boardId=${BoardId}`)
      ws.current.onopen = () => {
        console.log('websocket已建立连接')
      }
      ws.current.onmessage = (e) => {
        console.log('得到的数据啊啊啊啊啊data', e.data)
        const data = JSON.parse(e.data)
        // 组件一挂载建立webSocket连接，获取boardId的数据并绘制出来
        const canvas = getCanvasRef.current
        if (canvas) {
          // canvas.drawImage(e.data)
          const baseBoard = new BaseBoard(canvas)
          // if(typeof(e.data)==)
          baseBoard.cxt.drawImage(data, 0, 0)
          // console.log(Array.isArray(JSON.parse(e.data)))
          // const pointDataArr = JSON.parse(e.data)
          // Array.isArray(pointDataArr) &&
          //   pointDataArr.length !== 0 &&
          //   pointDataArr.map((_item: { x: number; y: number }, index: number, data: { x: number; y: number }[]) => {
          //     return index < data.length - 1 && baseBoard.paintLine(data[index], data[index + 1])
          //   })
        }
      }
    } else {
      alert('当前浏览器 Not support websocket')
    }

    return () => {
      ws.current?.close()
    }
  }, [ws])
  // useEffect(() => {
  //   console.log('useEffect,StartPaint')

  //   if (!getCanvasRef) return
  //   const canvas = getCanvasRef.current
  //   canvas?.addEventListener('mousedown', startPaint)
  //   return () => {
  //     canvas?.removeEventListener('mousedown', startPaint)
  //   }
  // }, [startPaint])

  // useEffect(() => {
  //   console.log('useEffect,paint')
  //   if (!getCanvasRef.current) return
  //   const canvas = getCanvasRef.current
  //   canvas.addEventListener('mousemove', paint)
  //   return () => {
  //     canvas.removeEventListener('mousemove', paint)
  //   }
  // }, [paint])

  // useEffect(() => {
  //   console.log('useEffect,exitPaint')
  //   if (!getCanvasRef.current) {
  //     return
  //   }
  //   const canvas: HTMLCanvasElement = getCanvasRef.current
  //   canvas.addEventListener('mouseup', exitPaint)
  //   // canvas.addEventListener('mouseleave', exitPaint)
  //   return () => {
  //     canvas.removeEventListener('mouseup', exitPaint)
  //     // canvas.removeEventListener('mouseleave', exitPaint)
  //   }
  // }, [exitPaint])
  return (
    <div>
      {/* <SelectBar getActive={getCurTools}></SelectBar>
      <canvas width={width} height={height} ref={getCanvasRef}></canvas> */}
      <CanvasBoard width={width} height={height} type={'create'} CanvasRef={getCanvasRef} ws={ws}></CanvasBoard>
    </div>
  )
}
JoinBoard.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight,
}
export default JoinBoard
