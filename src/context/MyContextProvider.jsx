import React from 'react'
import { useEffect } from 'react'
import { createContext } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ensureMe } from "../utils";
import { createUserWithEmailAndPassword, deleteUser, EmailAuthProvider, onAuthStateChanged,reauthenticateWithCredential,sendEmailVerification,sendPasswordResetEmail,signInWithEmailAndPassword,signOut, updateProfile } from 'firebase/auth'
import { auth } from "../firebaseApp"
import { useCallback } from 'react'
// import { uploadImage } from '../cloudinaryUtils'
// import { SingIn } from '../components/SingIn'
// import { EmailAuthProvider } from 'firebase/auth/web-extension'
// import { updateAvatar } from '../myBackend'
export const myUserContext = createContext()
export const useMyUser = () => React.useContext(myUserContext);
export const MyUserProvider = ({children}) => {
  const [msg, setMsg] = useState({})
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) 
  const [toasts, setToasts] = useState([])
  const navigate = useNavigate()


  const showToast = useCallback((type, title, message, duration = 4000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, type, title, message, duration }])
    setTimeout(() => removeToast(id), duration)
  }, [])

  const removeToast = useCallback((id) => {
    // először adding a removing class-t
    setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t))
    // majd 250ms után tényleg eltávolítjuk
    setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, 250)
}, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentuser) => {
      setUser(currentuser);

      if (currentuser && currentuser.emailVerified) {
        await ensureMe(currentuser.displayName || "");
      }

      setLoading(false) 
    });

    return () => unsubscribe();
  }, []);

    const signUpUser = async (email, password, displayName) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(auth.currentUser, {displayName})
    await sendEmailVerification(auth.currentUser)
    setMsg({info: "Kattints az emailben kapott aktiváló linkre!"})
    await logoutUser(true) // ← silent: nem írja felül a msg-t
  } catch (e) {
    setMsg({err: e.message})
  }
}
    const logoutUser = async (silent = false) => {
  await signOut(auth)
  if (!silent) setMsg({success: "Sikeres kijelentkezés"})
}
    const signInUser = async(email,password)=>{
      try {
          await signInWithEmailAndPassword(auth,email,password)
          const currentUser = auth.currentUser
          if(!currentUser.emailVerified){
            setMsg({err:"Kattints az emailben kapott aktiváló linkre!"})
            logoutUser()
            return
          }

          setMsg({signIn:true})
      } catch (error) {
        console.log(error);
        setMsg({err:"Hibás email cím vagy jelszó!"})
      }
    }
    //új jelszó
    const resetPassword = async(email)=>{
      let success = false
      try {
        await sendPasswordResetEmail(auth,email)
        setMsg({info:"A jelszó visszaállítási email elküldve!"})
      } catch (error) {
        setMsg({err:"Hiba a jelszó visszaállításakor!"})
        
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
    }*/
    const deleteAccount = async(password)=>{
      try {
            const credential = EmailAuthProvider.credential(auth.currentUser.email,password)
            await reauthenticateWithCredential(auth.currentUser,credential)
            await deleteUser(auth.currentUser)
            setMsg(null)
            setMsg({success:"Felhasználói fiók törölve!"})
            
      } catch (error) {
        console.log(error);
        setMsg({err:error})
        if(error.code=="auth/wrong-password") setMsg({err:"Hibás jelszó!"})
        else setMsg({err:"Hiba történt a profil törlésekor!"})
      }
      
    }
  return (
    <myUserContext.Provider value={{user, signUpUser, logoutUser,signInUser,msg,setMsg,resetPassword, deleteAccount, loading, toasts, showToast, removeToast}}>
      {children}
    </myUserContext.Provider>
  )
}