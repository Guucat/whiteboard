import { login } from '@/service'
import React, { FC, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import style from './index.module.css'

const Login: FC = () => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const userNameRef = useRef<HTMLInputElement>(null)
  const pwdRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (userNameRef.current && pwdRef.current) {
      userNameRef.current.value = state ? state.username : null
      pwdRef.current.value = state ? state.password : null
    }
  }, [])

  const handleLogin = async () => {
    // 发送登录请求，得到token
    // 如果得到了token以后，判断登录是否成功，如果成功则跳转到主面
    //将token存起来
    let formData = new FormData()
    console.log('name', userNameRef.current!.value)

    formData.append('name', userNameRef.current!.value)
    formData.append('pwd', pwdRef.current!.value)
    const getLoginData: any = await login(formData)
    console.log(getLoginData)
    if (getLoginData.msg === '登录成功') {
      localStorage.setItem('token', JSON.stringify(getLoginData.data.token))
      navigate('/home')
      // console.log('11')
    }
  }
  return (
    <div className={style['container']}>
      <div className={style['login-wrapper']}>
        <div className={style['header']}>Login</div>
        <div className={style['form-wrapper']}>
          <input type="text" name="username" placeholder="username" className={style['input-item']} ref={userNameRef} />
          <form action="">
            <input
              type="password"
              name="password"
              placeholder="password"
              className={style['input-item']}
              ref={pwdRef}
            />
          </form>

          <div className={style['btn']} onClick={handleLogin}>
            Login
          </div>
        </div>
        <div className={style['msg']}>
          Don't have account?
          <Link to={'/register'}>Sign up</Link>
        </div>
      </div>
    </div>
  )
}
export default Login
