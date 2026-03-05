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
import PageNotFound from './components/PageNotFound'
import { ProtectedRoute } from './components/ProtectedRoute'
import Event from './components/Event'
import EditEvent from './components/EditEvent'

function App() {
const navigate = useNavigate()
  return (
    <div className='Main'>
      <AiFillHome onClick={()=> navigate("/")} className='home-icon' size={40}/>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/events" element={<Events/>}/>
      <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
      <Route path="/create_event" element={<ProtectedRoute><CreateEvent/></ProtectedRoute>}/>
      <Route path="/event/:id/edit" element={<ProtectedRoute><EditEvent /></ProtectedRoute>} />
      <Route path="/event/:id" element={<Event/>}/>
      <Route path="/signin" element={<SignIn/>}/>
      <Route path="/signup" element={<SignUp/>}/>
      <Route path="/pwreset" element={<PwReset/>}/>
      <Route path='/*' element={<PageNotFound/>}/>
    </Routes>
    </div>
  )
}

export default App
