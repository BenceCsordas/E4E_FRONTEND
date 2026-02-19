import React, { useContext, useEffect, useState } from 'react'
import { myUserContext } from '../context/MyContextProvider'
import { useNavigate } from 'react-router'

const Profile = () => {
  const {user, logoutUser, deleteAccount} = useContext(myUserContext)
  const navigate = useNavigate()
  const logout = () => {
    console.log("Sikeres kilépés")
    logoutUser()
    navigate("/")

  }
  const handleDelete = async () => {
    if (window.confirm("Biztosan törölni akarja fiókját?")) {
      const pw = prompt("Add meg a jelszavad a fiók törléséhez: ");
      await deleteAccount(pw)
    }
  };
  console.log(user)
  return (
    <div>
      {user?.displayName}

      <button onClick={handleDelete}>Fiók törlése</button>
      <button onClick={logout}>Kijelentkezés</button>
    </div>
  )
}

export default Profile
