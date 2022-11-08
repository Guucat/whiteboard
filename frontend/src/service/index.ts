import instance from './service'

const login = (obj: FormData) => {
  return instance.post('/login', obj)
}
const register = (obj: FormData) => {
  return instance.post('/register', obj)
}

const judgeBoardId = (obj: any) => {
  console.log(obj)

  return instance.get(`/board/validate?boardId=${obj}`)
}
export { login, register, judgeBoardId }
