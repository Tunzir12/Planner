
import './App.css'

// Components
import AuthRoute from './components/routeComp/authRoute.jsx'
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import SessionRoute from './components/routeComp/sessionRoute.jsx'

// Pages
import Goal from './pages/Goal.jsx'
import Home from './pages/Home.jsx'
import Index from './pages/Index.jsx'
import Login from './pages/Login.jsx'
import Project from './pages/Project.jsx'
import ProjectList from './pages/ProjectList.jsx'
import Register from './pages/Register.jsx'
import Test from './pages/Test.jsx'
import Todo from './pages/Todo.jsx'
import ChatPage from './pages/ChatPage.jsx'
import Profile from './pages/Profile.jsx'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthRoute />}>
            <Route path='/' element={< Index />} />
            <Route path='/register' element={<Register />} />
            <Route path='/login' element={< Login />} />
          </Route>
          <Route element={<SessionRoute />}>
            <Route path='/home' element={< Home />} />
            <Route path='/projects' element={< ProjectList />} />
            <Route path='/projects/:id' element={<Project />} />
            <Route path='/goal/:id' element={<Goal />} />
            <Route path='/todo' element={< Todo />} />
            <Route path='/test' element={< Test />} />
            <Route path='/profile' element={< Profile />} />
            <Route path='/chat' element = {<ChatPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
