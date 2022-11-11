import { instance, instance1 } from './service'

const login = (obj: FormData) => {
  return instance.post('/login', obj)
}
const register = (obj: FormData) => {
  return instance.post('/register', obj)
}

const judgeBoardId = (obj: number) => {
  console.log(obj)

  return instance1.get(`/board/validate?boardId=${obj}`)
}
const exitBoard = (obj: any) => {
  return instance1.delete(`/board/exit?boardId=${obj.boardId}&userName=${obj.curUser}`)
}

const deleteBoard = (obj: number) => {
  return instance.delete(`/board/dissolve?boardId=${obj}`)
}

const addNewPage = (obj: FormData) => {
  return instance.put(`/board/page`, obj)
}

const uploadJsonFile = (obj: FormData) => {
  return instance.put(`/board/page`, obj)
}
export { login, register, judgeBoardId, exitBoard, deleteBoard, addNewPage }
