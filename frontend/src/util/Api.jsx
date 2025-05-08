import DummyAPI from './DummyApi.jsx'

const getProjects = () => { }
const getProject = (id) => { }
const getGoal = (id) => {
  return goals[id]
}

const API = {
  getProjects: DummyAPI.getProjects,
  getProject: DummyAPI.getProject,
  getGoal: DummyAPI.getGoal,
  getTodo: DummyAPI.getTodo,
  getEvent: DummyAPI.getEvent
}

export default API 
