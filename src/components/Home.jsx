import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaCog } from "react-icons/fa";
import { RiPencilFill } from "react-icons/ri";
import { FaSearch } from "react-icons/fa";
import { myUserContext } from '../context/MyContextProvider';
import Featured from './Featured';


const Home = () => {
  const navigate = useNavigate();
  const {user} = useContext(myUserContext)
  return (
    <div className="HomeContainer">
   
        <div className='GridContainer'>
            {user ?<div className="div1 gdiv"  onClick={()=>navigate("/profile")}>
                <h1>Profilom</h1>  
                <FaCog  className='cog'/>
            </div>:<div className="div1 gdiv"  onClick={()=>navigate("/signin")}>
                <h1>Bejelentkezés</h1>  
                <FaCog  className='cog'/>
            </div>}
            
            <div className="div2 gdiv"  onClick={()=>navigate("/create_event")}> 
                <h1>Esemény létrehozása</h1>
                <RiPencilFill  className='pencil'/>
            </div>
            
            <div className="div3 gdiv" >
              
              <Featured/>

            </div>
            
            <div className="div4 gdiv" onClick={()=>navigate("/events")}> 

                <h1>Események</h1>
               
            </div>
        </div>
    </div>
  )
}

export default Home
