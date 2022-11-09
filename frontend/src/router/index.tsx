import AddNewPage from '@/pages/AddNewPage'
import JoinBoard from '@/pages/JoinBoard'
import { Navigate } from 'react-router-dom'
import CreateBoard from '../pages/CreateBoard'
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
    path: 'createboard',
    element: <CreateBoard></CreateBoard>,
  },
  {
    path: 'joinboard',
    element: <JoinBoard></JoinBoard>,
  },
  {
    path: 'page:id',
    element: <AddNewPage></AddNewPage>,
  },
]
