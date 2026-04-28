import React, { useContext } from 'react'
import { myUserContext } from '../context/MyContextProvider'


const PwReset = () => {
    const {resetPassword} = useContext(myUserContext)
    const handleSubmit = async (event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        
        await resetPassword(data.get("email"))
    }
    return (
    <div className='signin-up-tarolo'>
      
        <form onSubmit={handleSubmit} style={{margin:"10px"}}>
                <h3 style={{textAlign:"center"}}>Add meg az e-mail címedet a jelszóváltoztatás igényléséhez</h3>
                <div className="signin">
                    <input type="email" placeholder='email' name='email'/>
                    <button className='gomb'>Új jelszó igénylése</button>
                </div>
        </form>
      
      
    </div>
  )
}

export default PwReset
