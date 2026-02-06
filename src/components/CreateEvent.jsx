import React from 'react'

const CreateEvent = () => {
  return (
    <div className='createEvent'>
      <form>
        <label>Esemény megnevezése</label>
        <input type="text"/>
        <label>Esemény leírása</label>
        <textarea></textarea>
      </form>
    </div>
  )
}

export default CreateEvent
