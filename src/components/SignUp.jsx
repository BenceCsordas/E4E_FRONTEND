import React from 'react'
import { useContext } from 'react'
import { useNavigate } from 'react-router'
import { useState } from 'react'
import { myUserContext } from '../context/MyContextProvider'

export const SignUp = () => {
  const navigate = useNavigate()
  const {signUpUser,msg} = useContext(myUserContext)
  const [loading,setLoading] = useState(false)
  const handleSubmit=async(event)=>{
    event.preventDefault()
    setLoading(true)
    try {
      const data = new FormData(event.currentTarget)
    await signUpUser(data.get('email'),data.get('password'),data.get('displayName'))
    event.currentTarget.reset()
    } catch (error) {
      {msg}
    }finally{
      setLoading(false)
      navigate("/signin")
    }
    
  }
  return (
    <div className='signin-up-tarolo signup-tarolo'>
      <form action="submit" onSubmit={handleSubmit}>
      <h1>Regisztrálj!</h1>
      <div className='signin'>
        <input name='email' type='email' placeholder='email' />
        <input name="password" type="password" placeholder='jelszó' />
        <input name="displayName" type="text" placeholder='felhasználónév' />
        <button className='gomb' disabled={loading}><b>{loading? "Regisztráció folyamatban" :"Regisztráció"}</b></button>
      </div>
      </form>
      <div><a href='' onClick={()=>navigate("/signin")}>Vissza</a></div>
    </div>
  )
}