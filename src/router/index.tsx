import { Navigate } from 'react-router-dom'
import CanvasBoard from '../components/CanvasBoard'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/register'

export default [
  {
    path: '/',
    element: <Navigate to="/home"></Navigate>,
  },
  {
    path: 'home',
    element: <Home></Home>,
  },
  {
    path: 'register',
    element: <Register></Register>,
  },
  {
    path: 'login',
    element: <Login></Login>,
  },
  {
    path: 'board',
    element: <CanvasBoard></CanvasBoard>,
  },
]
