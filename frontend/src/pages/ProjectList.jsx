import React from 'react'
import Navbar from '../components/Navbar'
import Table from '../components/Table'
import User from '../components/User'
import PopupForm from '../components/PopupForm.jsx'
import Loading from '../components/Loading'
import { Link } from 'react-router-dom'
import { useAuth } from '../components/routeComp/privateRoute';

import API from '../util/Api.jsx'

const HEADERS = [
  "Name", "Owner", "Goals", "Deadline"
]

const projectToList = (pr) => (
  [
    <Link to={"/projects/" + pr.id} className="font-medium text-gray-900 whitespace-nowrap dark:text-white" >
      {pr.name}
    </Link>,

    <User user={pr.owner} />,

    pr.milestonesCompleted + " / " + pr.milestonesTotal,

    pr.deadline.toDate().toDateString(),
  ]
)

const ProjectList = () => {

  const { currentUser } = useAuth();
  const { data: projects, loading, error } = API.getProjects();


  if (loading)
    return (
      <div className="dark:bg-gray-900 min-h-screen h-full">
        <Navbar />
        <Loading></Loading>
      </div >
    )

  if (error) {
    console.log(error)
    return (<div>Error</div>)
  }


  const list = projects.map(projectToList);
  const keys = projects.map(project => project.id);

  const createProject = (name) => ({
    deadline: new Date(),
    milestonesCompleted: 1,
    milestonesTotal: 3,
    name: name,
    owner: currentUser.uid,
  })

  return (
    <div className="dark:bg-gray-900 min-h-screen h-full">
      <Navbar />
      <div className="px-6 ">
        <h1 className="px-6 py-4 text-gray-900 dark:text-white"> Projects</h1>
        <Table headers={HEADERS} data={list} keys={keys} />
        <PopupForm title={"New Project"} handleFormData={(formData) => { API.addProject(createProject(formData.get("name"))) }}>
          <label>
            Title:
            <input
              type="text"
              name="name"
              required
            />

          </label>
        </PopupForm>
      </div>
    </div >
  )
}

export default ProjectList
