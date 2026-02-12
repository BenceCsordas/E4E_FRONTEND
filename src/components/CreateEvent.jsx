import React, { useState } from 'react'

const CreateEvent = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const slider = document.getElementById('slider');
  const next = () => {
      if (currentIndex < 3) {
          setCurrentIndex(prev=>prev+=1)
        }
      console.log(currentIndex)
      slider.style.transform = `translateX(-${currentIndex * 100}%)`;
  }
  const previous = () => {
       if (currentIndex > 0) {
          setCurrentIndex(prev=>prev-=1)
        }
      slider.style.transform = `translateX(-${currentIndex * 100}%)`;
      console.log(currentIndex)
  }
  return (
    <div className='createEvent'>
      <div class="slider-container">
  <form id="multiStepForm">
    <div class="slider" id="slider">

      <div class="slide">
        <h3>Step 1</h3>
        <label>Name</label>
        <input type="text" required/>
      </div>

      <div class="slide">
        <h3>Step 2</h3>
        <label>Email</label>
        <input type="email" required/>
      </div>

      <div class="slide">
        <h3>Step 3</h3>
        <label>Password</label>
        <input type="password" required/>
      </div>

      <div class="slide">
        <h3>Finish</h3>
        <button type="submit">Submit</button>
      </div>

    </div>

    <div class="buttons">
      <button type="button" id="prevBtn" onClick={previous}>Previous</button>
      <button type="button" id="nextBtn" onClick={next}>Next</button>
    </div>

  </form>
</div>
    </div>
  )
}

export default CreateEvent
