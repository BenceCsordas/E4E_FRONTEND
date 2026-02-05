import React, { useContext, useEffect, useState } from 'react'
import { myUserContext } from '../context/MyContextProvider'
import { useNavigate } from 'react-router'

const Profile = () => {
  const {user, logoutUser} = useContext(myUserContext)
  const navigate = useNavigate()
  const logout = () => {
    console.log("Sikeres kilépés")
    logoutUser()
    navigate("/")

  }
  return (
    <div>
      {user?.displayName}


      <button onClick={logout}>Kijelentkezés</button>
    </div>
  )
}

export default Profile
