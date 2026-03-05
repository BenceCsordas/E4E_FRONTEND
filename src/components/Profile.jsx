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
      navigate("/")
    }
  };
  console.log(user)
  return (
  <div className="profile-page">
    <div className="profile-card">
      <h2 className="profile-name">{user?.displayName}</h2>

      <div className="profile-buttons">
        <button className="delete-btn" onClick={handleDelete}>
          Fiók törlése
        </button>

        <button className="logout-btn" onClick={logout}>
          Kijelentkezés
        </button>
      </div>
    </div>
  </div>
)
}

export default Profile
