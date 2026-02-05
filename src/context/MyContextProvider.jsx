import React from 'react'
import { useEffect } from 'react'
import { createContext } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { createUserWithEmailAndPassword, deleteUser, onAuthStateChanged,reauthenticateWithCredential,sendEmailVerification,sendPasswordResetEmail,signInWithEmailAndPassword,signOut, updateProfile } from 'firebase/auth'
import { auth } from "../firebaseApp"
// import { uploadImage } from '../cloudinaryUtils'
// import { SingIn } from '../components/SingIn'
// import { EmailAuthProvider } from 'firebase/auth/web-extension'
// import { updateAvatar } from '../myBackend'
export const myUserContext = createContext()

export const MyUserProvider = ({children}) => {
  const [msg,setMsg]  = useState({})
  const [user,setUser] = useState(null)
  const navigate = useNavigate()
  useEffect(()=>{
    onAuthStateChanged(auth,(currentuser)=>{
      setUser(currentuser)
    })
    return ()=>unsubscribe()
  },[])
  
    const signUpUser = async (email, password,displayName)=>{
    console.log(displayName,email,password);
    try {
      await createUserWithEmailAndPassword(auth,email,password)
      await updateProfile(auth.currentUser,{displayName})
      await sendEmailVerification(auth.currentUser)
      console.log("Az emailedre aktiváló link érkezett!");
      
      console.log("Sikeres regisztráció!");
      setMsg({signUp:"Kattints az emailben kaptt aktiváló linkre"})
      logoutUser()
    } catch (e) {
      console.log("Bejelentkezési hiba: " + e);
      setMsg({err:e.message})
      
    }
  }
    const logoutUser = async ()=>{
      await signOut(auth)
      setMsg({signIn:false})
    }
    const signInUser = async(email,password)=>{
      try {
          await signInWithEmailAndPassword(auth,email,password)
          const currentUser = auth.currentUser
          if(!currentUser.emailVerified){
            setMsg({err:"Kattints az mailben kapott aktiváló linkre!"})
            logoutUser()
            return
          }

          setMsg({signIn:true})
      } catch (error) {
        console.log(error);
        setMsg({err:error.message})
      }
    }
    //új jelszó
    const resetPassword = async(email)=>{
      let success = false
      try {
        await sendPasswordResetEmail(auth,email)
        setMsg({resetPw:"A jelszó visszaállítási email elküldve!"})
      } catch (error) {
        setMsg({err:error.message})
        
      }finally{
        if(success){
          navigate("/")
        }
      }
    }

    //avatár csere
    /*const avatarUpdate= async(file)=>{
      try {
        const uploadResult = await uploadImage(file)
        console.log(uploadResult);
        if(uploadResult?.url) await updateProfile(auth.currentUser,{photoURL:uploadResult.url})
          //el kell tárolni a public_id-t: 
          await updateAvatar(user.uid,uploadResult.public_id)
          setUser({...auth.currentUser})
      setMsg(null)
      setMsg({updateProfile:"Sikeres profil módosítás!"})


      } catch (error) {
        setMsg({error:error.message})
      }
    }
    const deleteAccount = async(password)=>{
      try {
            const credential = EmailAuthProvider.credential(auth.currentUser.email,password)
            await reauthenticateWithCredential(auth.currentUser,credential)
            await deleteUser(auth.currentUser)
            setMsg(null)
            setMsg({serverMsg:"Felhasználói fiók törölve!"})
            
      } catch (error) {
        console.log(error);
        setMsg({err:error})
        if(error.code=="auth/wrong-password") setMsg({err:"Hibás jelszó!"})
        else setMsg({err:"Hiba történt a profil törlésekor!"})
      }
      
    }*/
  return (
    <myUserContext.Provider value={{user, signUpUser, logoutUser,signInUser,msg,setMsg,resetPassword}}>
      {children}
    </myUserContext.Provider>
  )
}