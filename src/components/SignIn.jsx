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
      <div className='signin'>
        <h1>Jelentkezz be!</h1>
        <input name="email" type='email' placeholder='email' style={{color:"black"}}/>
        <input name="password" type="password" placeholder='jelszó' style={{color:"black"}}/>
        <button className='gomb'><b>Bejelentkezés</b></button>
      </div>
      </form>
      <div><a href='' onClick={()=>navigate("/pwreset")}>Elfelejtett jelszó</a></div>
      <div><a href='' onClick={()=>navigate("/signup")}>Nincs felhasználóm!</a></div>
      {msg && msg?.err && <p style={{color:"red"}}>{msg.err}</p>}
      
    </div>
  )
}