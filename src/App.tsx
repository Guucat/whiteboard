import { useRoutes } from 'react-router-dom'
import './App.css'
import CanvasBoard from './components/CanvasBoard'
import route from './router/index'

function App() {
  const element = useRoutes(route)
  return (
    <div className="App">
      {element}
      {/* <CanvasBoard></CanvasBoard> */}
    </div>
  )
}

export default App
