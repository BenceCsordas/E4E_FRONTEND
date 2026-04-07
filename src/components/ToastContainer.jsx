import { useContext } from 'react'
import { myUserContext } from '../context/MyContextProvider'
import './ToastContainer.css'
import { useEffect } from 'react'
import { useNavigate } from 'react-router'

const ICONS = { success: '✓', error: '✕', warning: '!', info: 'i' }

export function ToastContainer() {
  const {msg, setMsg, toasts, removeToast, showToast } = useContext(myUserContext)
  const navigate = useNavigate()
  useEffect(()=>{
    if(msg && msg?.signIn) { 
         navigate('/') 
         showToast("success", "Siker!", "Sikeresen bejelentkeztél.")
         setMsg({})
        }if(msg && msg?.err){
          showToast("error", "Hiba!", msg.err)
          setMsg({})
        }
        else if(msg && msg?.info) { 
         showToast("info", "Infó!", msg.info) 
         setMsg(null)
        }  
        else if(msg && msg?.success) { 
         showToast("success", "Siker!", msg.success) 
         setMsg(null)
        }
        else if(msg && msg?.warning) { 
         showToast("warning", "Figyelem!", msg.warning) 
         setMsg(null)
        }
        
      
      
      
    },[msg])


  return (
    <div className="toast-container">
      {toasts.map(({ id, type, title, message, duration, removing }) => (
        <div key={id} className={`toast toast-${type}${removing ? ' removing' : ''}`}>
          <span className="toast-icon">{ICONS[type]}</span>
          <div className="toast-body">
            <p className="toast-title">{title}</p>
            <p className="toast-msg">{message}</p>
            <div className="toast-progress" style={{ animationDuration: `${duration}ms` }} />
          </div>
          <button className="toast-close" onClick={() => removeToast(id)}>x</button>
        </div>
      ))}
    </div>
  )
}