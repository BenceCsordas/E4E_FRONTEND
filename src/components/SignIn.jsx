import React from 'react'
import { useContext } from 'react'
import { useNavigate } from 'react-router'
import { useEffect } from 'react'
import { myUserContext } from '../context/MyContextProvider'
//import { MyToastify } from './MyToastify'

export const SignIn = () => {
  const {signInUser, msg} = useContext(myUserContext)
   const navigate = useNavigate()
   useEffect(()=>{
      msg && msg?.signIn && navigate('/')
    },[msg])

    console.log(msg);
    
   const handleSubmit= (event)=>{
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    console.log(data.get('email'), data.get('password'));
    signInUser(data.get('email'),data.get('password'))
   }
  return (
    <div className='signin-up-tarolo'>
      <form action="submit" onSubmit={handleSubmit}>
      <h1>Jelentkezz be!</h1>
      <div className='signin'>
        <input name="email" type='email' placeholder='email' />
        <input name="password" type="password" placeholder='jelszó' />
        {msg && msg?.err && <p className='message'>{msg.err}</p>}
        {msg && msg?.signUp && <p className='message'>{msg.signUp}</p>}
        <button className='gomb'><b>Bejelentkezés</b></button>
      </div>
      </form>
      <div><a href='' onClick={()=>navigate("/pwreset")}>Elfelejtett jelszó</a></div>
      <div><a href='' onClick={()=>navigate("/signup")}>Nincs fiókom</a></div>
      
      
    </div>
  )
}