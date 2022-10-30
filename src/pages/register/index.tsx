import { register } from '@/service'
import React, { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import style from './index.module.css'
export default function Register() {
  const navigate = useNavigate()
  const [error, setError] = useState<boolean>(false)

  const userNameRef = useRef<HTMLInputElement>(null)
  const pwdRef = useRef<HTMLInputElement>(null)
  const handleRegist = async () => {
    const username = userNameRef.current!.value
    const password = pwdRef.current!.value
    console.log('pwd', password)
    let formData = new FormData()
    formData.append('name', username)
    formData.append('pwd', password)
    const getData = await register(formData).catch((err) => setError(true))
    console.log(getData)

    //  .then((res) => {
    //     console.log(res)
    //   })
  }
  // async function handleRegist() {

  //   // 这里判断输入的用户名是否仇富，是否为空，然后在进行跳转
  //   // navigate('/login', { state: { username, password } })
  // }
  return (
    <div className={style['container']}>
      <div className={style['login-wrapper']}>
        <div className={style['header']}>Register</div>
        <div className={style['form-wrapper']}>
          <div className={style['title']}>用户名</div>
          <input
            type="text"
            name="username"
            placeholder="请输入你的用户名"
            className={style['input-item']}
            ref={userNameRef}
          />
          <div className={style['title']}>密码</div>
          <input
            type="password"
            name="password"
            placeholder="请输入你的密码"
            className={style['input-item']}
            ref={pwdRef}
          />
          {error && <div className={style['error']}>用户名或密码不能为空</div>}
          <div className={style['btn']} onClick={handleRegist}>
            注册并跳转至登录
          </div>
        </div>

        <div className={style['msg']}>
          已有帐号？
          <Link to={'/login'}>登录</Link>
        </div>
      </div>
    </div>
  )
}
