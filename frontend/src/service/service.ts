import axios from 'axios'
import { BASE_URL, TIME_OUT } from './config'

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: TIME_OUT,
})
instance.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

instance.interceptors.response.use(
  (res) => {
    return res.data
  },
  (err) => {
    if (err && err.response) {
      switch (err.response.status) {
        case 400:
          return err.response.data.msg
        case 401:
          window.location.hash = '/wrong'
          Promise.reject('未授权')
          break
        default:
          // window.location.hash = "/wrong";
          Promise.reject('网络错误')
          break
      }
    }
    return Promise.resolve(err)
  }
)

export default instance
