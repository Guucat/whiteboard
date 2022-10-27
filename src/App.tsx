import { useEffect, useRef } from 'react'
import './App.css'
import CanvasBoard from './components/CanvasBoard'

function App() {
  // let width = useRef()
  // let height = useRef()
  // useEffect(() => {
  //   width.current = window.innerWidth
  //   height.current = window.innerHeight
  // }, [])
  return (
    <div className="App">
      <CanvasBoard></CanvasBoard>
    </div>
  )
}

export default App
