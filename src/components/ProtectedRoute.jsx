import React from 'react'
import { useContext } from 'react';
import { Navigate } from 'react-router';
import { myUserContext } from '../context/MyContextProvider';
import Spinner from './Spinner';

export const ProtectedRoute = ({children}) => {
  const {user, loading} = useContext(myUserContext)

  if (loading) return <div style={{display:"flex", alignItems:"center", justifyContent:"center", height:"100vh"}}><Spinner size={"lg"}/></div> 

  if (!user) {
    return <Navigate to="/signin" replace/>
  }

  return children;
};