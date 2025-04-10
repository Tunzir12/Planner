
import './App.css'

import { Route, Routes, BrowserRouter } from 'react-router-dom'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Projects from './pages/Projects.jsx'
import Todo from './pages/Todo.jsx'

function App() {


  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/register' element={<Register />} />
          <Route path='/' element={< Login />} />
          <Route path='/home' element={< Home />} />
          <Route path='/projects' element={< Projects />} />
          <Route path='/todo' element={< Todo />} />

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
