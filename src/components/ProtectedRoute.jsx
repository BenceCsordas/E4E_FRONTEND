import React from 'react'
import { useContext } from 'react';
import { Navigate } from 'react-router';
import { myUserContext } from '../context/MyContextProvider';

export const ProtectedRoute = ({children}) => {
  const {user, loading} = useContext(myUserContext)

  if (loading) return <div>Betöltés...</div> 

  if (!user) {
    return <Navigate to="/signin" replace/>
  }

  return children;
};