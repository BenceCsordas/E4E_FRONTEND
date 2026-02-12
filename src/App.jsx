import './App.css'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Home from './components/Home'
import Events from './components/Events'
import Profile from './components/Profile'
import CreateEvent from './components/CreateEvent'
import { SignIn } from './components/SignIn'
import { SignUp } from './components/SignUp'
import { AiFillHome } from "react-icons/ai";
import PwReset from './components/PwReset'

function App() {
const navigate = useNavigate()
  return (
    <div className='Main'>
      <AiFillHome onClick={()=> navigate("/")} className='home-icon' size={40}/>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/events" element={<Events/>}/>
      <Route path="/profile" element={<Profile/>}/>
      <Route path="/create_event" element={<CreateEvent/>}/>
      <Route path="/signin" element={<SignIn/>}/>
      <Route path="/signup" element={<SignUp/>}/>
      <Route path="/pwreset" element={<PwReset/>}/>
    </Routes>
    </div>
  )
}

export default App
