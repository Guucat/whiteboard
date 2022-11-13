import { register } from '@/service'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import style from './index.module.css'
export default function Register() {
  const navigate = useNavigate()

  const userNameRef = useRef<HTMLInputElement>(null)
  const pwdRef = useRef<HTMLInputElement>(null)
  const getData = useRef<any>(null)
  const [showErr, setShowErr] = useState(false)
  const handleRegist = async () => {
    const username = userNameRef.current!.value
    const password = pwdRef.current!.value

    let formData = new FormData()
    formData.append('name', username)
    formData.append('pwd', password)

    getData.current = await register(formData)

    if (getData.current.msg === '注册成功') {
      navigate('/login', { state: { username, password } })
    } else if (getData.current.includes('注册失败')) {
      setShowErr(true)
      setTimeout(() => {
        setShowErr(false)
      }, 2000)
    }
  }
  useEffect(() => {
    setShowErr(false)
  }, [])
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
          <form>
            <input
              type="password"
              name="password"
              placeholder="请输入你的密码"
              className={style['input-item']}
              ref={pwdRef}
            />
          </form>
          <div className={style['btn']} onClick={handleRegist}>
            注册并跳转至登录
          </div>
        </div>

        <div className={style['msg']}>
          已有帐号？
          <Link to={'/login'}>登录</Link>
        </div>
        <div className={style['error']} style={showErr ? { display: 'block' } : { display: 'none' }}>
          {getData.current}
        </div>
      </div>
    </div>
  )
}
