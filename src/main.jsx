import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { MyUserProvider } from './context/MyContextProvider.jsx'

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <MyUserProvider>
            <App />
        </MyUserProvider>
    </BrowserRouter>

)
