import React from 'react'
import { useContext } from 'react'
import { useNavigate } from 'react-router'
import { useState } from 'react'
import { myUserContext } from '../context/MyContextProvider'

export const SignUp = () => {
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
    }
    
  }
  return (
    <div className='signin-up-tarolo'>
      <form action="submit" onSubmit={handleSubmit}>
      <div className='signin'>
        <h1>Regisztrálj!</h1>
        <input name='email' type='email' placeholder='email' style={{color:"black"}}/>
        <input name="password" type="password" placeholder='jelszó' style={{color:"black"}}/>
        <input name="displayName" type="text" placeholder='Felhasználónév' style={{color:"black"}}/>
        <button className='gomb' disabled={loading}><b>{loading? "Regisztráció folyamatban" :"Regisztráció"}</b></button>
      </div>
      </form>
    </div>
  )
}