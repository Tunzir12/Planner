
import './App.css'

import {Route, Routes, BrowserRouter} from 'react-router-dom'
import Navbar from './components/navbar'

function App() {


  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path='/' element={< Navbar />} />
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
