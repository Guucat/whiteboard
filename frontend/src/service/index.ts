import instance from './service'

const login = (obj: FormData) => {
  return instance.post('/login', { data: obj })
}
const register = (obj: FormData) => {
  return instance.post('/register', { data: obj })
}

export { login, register }
