import { useState, useRef, useEffect } from 'react'
interface WebSocketProps {
  url: string
  token?: any
}
const useWebsocket = (props: WebSocketProps) => {
  const { url, token } = props
  const ws = useRef<WebSocket | null>(null)
  // socket 数据
  const [wsData, setMessage] = useState({})
  //  socket 状态
  const [readyState, setReadyState] = useState<any>({ key: 0, value: '正在连接中' })

  const creatWebSocket = () => {
    const stateArr = [
      { key: 0, value: '正在连接中' },
      { key: 1, value: 'websocket已建立连接' },
      { key: 2, value: '连接正在关闭' },
      { key: 3, value: '连接已关闭或者没有连接成功' },
    ]
    try {
      token ? (ws.current = new WebSocket(url, [token])) : (ws.current = new WebSocket(url))

      ws.current.onopen = () => {
        console.log('websocket已建立连接')
        setReadyState(stateArr[ws.current?.readyState ?? 0])
      }
      ws.current.onclose = () => {
        console.log('websocket连接已关闭', ws.current?.readyState)
        setReadyState(stateArr[ws.current?.readyState ?? 0])
      }
      ws.current.onerror = () => {
        setReadyState(stateArr[ws.current?.readyState ?? 0])
      }
      ws.current.onmessage = (e) => {
        console.log('data', e.data)
        setMessage({ ...JSON.parse(e.data) })
      }
    } catch (error) {
      console.log(error)
    }
  }

  const webSocketInit = () => {
    if (!ws.current || ws.current.readyState === 3) {
      creatWebSocket()
    }
  }

  //  关闭 WebSocket
  const closeWebSocket = () => {
    ws.current?.close()
  }

  // 发送数据
  const sendMessage = (str: string) => {
    ws.current?.send(str)
  }

  //重连
  const reconnect = () => {
    try {
      closeWebSocket()
      ws.current = null
      creatWebSocket()
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    webSocketInit()
  }, [ws])
  //  webSocketInit()
  return {
    wsData,
    readyState,
    closeWebSocket,
    reconnect,
    sendMessage,
    ws,
  }
}
export default useWebsocket
