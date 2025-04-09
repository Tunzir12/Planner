
import './App.css'

import {Route, Routes, BrowserRouter} from 'react-router-dom'
import Login from './components/login'
import Home from './components/home'

function App() {


  return (
    <>
    <BrowserRouter>
    <Routes>
    <Route path='/' element={<Home />} />
    <Route path='/login' element={< Login />} />
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
