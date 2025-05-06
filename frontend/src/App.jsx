
import './App.css'

import { Route, Routes, BrowserRouter } from 'react-router-dom'
import Index from './pages/Index.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import ProjectList from './pages/ProjectList.jsx'
import Project from './pages/Project.jsx'
import Goal from './pages/Goal.jsx'
import Todo from './pages/Todo.jsx'
import AuthRoute from './components/routeComp/authRoute.jsx'
import SessionRoute from './components/routeComp/sessionRoute.jsx'
import Test from './pages/Test.jsx'

function App() {


  return (
    <>
      <BrowserRouter>
        <Routes>

          <Route element={<AuthRoute />}/>
          <Route path='/' element={< Index />} />
          <Route path='/register' element={<Register />} />

          <Route path='/login' element={< Login />} />
          <Route path='/home' element={< Home />} />
          <Route path='/projects' element={< ProjectList />} />
          <Route path='/projects/:id' element={<Project />} />
          <Route path='/goal/:id' element={<Goal />} />
          <Route path='/todo' element={< Todo />} />
          <Route path='/test' element={< Test />} />

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
