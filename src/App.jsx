import './App.css'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Home from './components/Home'
import Events from './components/Events'
import Profile from './components/Profile'
import CreateEvent from './components/CreateEvent'

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
    </Routes>
    </div>
  )
}

export default App
