import { useRoutes } from 'react-router-dom'
import '@arco-design/web-react/dist/css/arco.css'
import './App.css'
import route from './router/index'

function App() {
  const element = useRoutes(route)
  return <div className="App">{element}</div>
}

export default App
