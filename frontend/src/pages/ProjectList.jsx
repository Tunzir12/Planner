import React from 'react'
import Navbar from '../components/Navbar'
import Table from '../components/Table'
import { Link } from 'react-router-dom'

import API from '../util/Api.jsx'

const HEADERS = [
  "Name", "Owner", "Milestones", "Deadline"
]

const projectToList = (pr) => (
  [
    <Link to={"/projects/" + pr.id} className="font-medium text-gray-900 whitespace-nowrap dark:text-white" >
      {pr.name}
    </Link>,

    pr.owner,

    pr.milestonesCompleted + " / " + pr.milestonesTotal,

    pr.deadline.toDate().toDateString(),
  ]
)

const ProjectList = () => {

  const { data: projects, loading, error } = API.getProjects();


  if (loading)
    return (
      <div className="dark:bg-gray-900 min-h-screen h-full">
        <Navbar />
        <div className="px-6 ">
          Loading...
        </div>
      </div >
    )

  // console.log(projects)


  var list = projects.map(projectToList);

  return (
    <div className="dark:bg-gray-900 min-h-screen h-full">
      <Navbar />
      <div className="px-6 ">
        <h1 className="px-6 py-4 text-gray-900 dark:text-white"> Projects</h1>
        <Table headers={HEADERS} data={list} />
      </div>
    </div >
  )
}

export default ProjectList
