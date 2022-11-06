import instance from './service'

const login = (obj: FormData) => {
  return instance.post('/login', obj)
}
const register = (obj: FormData) => {
  return instance.post('/register', obj)
}

export { login, register }
