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
      <div className="group">
  <svg viewBox="0 0 24 24" aria-hidden="true" className="search-icon">
    <g>
      <path
        d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"
      ></path>
    </g>
  </svg>

  <input
    id="query"
    className="input"
    type="search"
    placeholder="Search..."
    name="searchbar"
  />
</div>
        <div className='GridContainer'>
            {user ?<div className="div1 gdiv"  onClick={()=>navigate("/profile")}>
                <h1>Profilom</h1>  
                <FaCog size={150} className='cog'/>
            </div>:<div className="div1 gdiv"  onClick={()=>navigate("/signin")}>
                <h1>Bejelentkezés</h1>  
                <FaCog size={150} className='cog'/>
            </div>}
            
            <div className="div2 gdiv"  onClick={()=>navigate("/create_event")}> 
                <h1>Esemény létrehozása</h1>
                <RiPencilFill size={150} className='pencil'/>
            </div>
            
            <div className="div3 gdiv" >
              
              <Featured/>

            </div>
            
            <div className="div4 gdiv" onClick={()=>navigate("/events")}> 

                <h1>Események</h1>
                {/* <img src="../public/test.gif" alt="asd" style={{backgroundColor:"red"}}/> */}
            </div>
        </div>
    </div>
  )
}

export default Home
