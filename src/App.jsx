import './App.css'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Home from './components/Home'
import Events from './components/Events'
import Profile from './components/Profile'
import CreateEvent from './components/CreateEvent'
import { SignIn } from './components/SignIn'
import { SignUp } from './components/SignUp'

function App() {
const navigate = useNavigate()
  return (
    <div className='Main'>
      {/* <button onClick={()=> navigate("/")}>Vissza</button> */}
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/events" element={<Events/>}/>
      <Route path="/profile" element={<Profile/>}/>
      <Route path="/create_event" element={<CreateEvent/>}/>
      <Route path="/signin" element={<SignIn/>}/>
      <Route path="/signup" element={<SignUp/>}/>
    </Routes>
    </div>
  )
}

export default App
