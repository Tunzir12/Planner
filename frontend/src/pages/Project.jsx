import React from 'react'
import Navbar from '../components/Navbar'
import Table from '../components/Table'
import StatusTag from '../components/StatusTag.jsx'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom';

import { getProject } from '../util/Api.jsx'

const HEADERS = [
  "Name", "Assigned", "Progress", "Deadline"
]

const goalToList = (goal) => (
  [
    <Link to={"/goal/0"} class="font-medium text-gray-900 whitespace-nowrap dark:text-white" >
      {goal.title}
    </Link>,
    goal.assigned,
    <StatusTag statusId={goal.status} />,
    goal.deadline
  ]
)

const Project = () => {

  const { id } = useParams();

  var project = getProject(id);

  const list = project.goals.map(goalToList);

  return (
    <div class="dark:bg-gray-900 min-h-screen h-full">
      <Navbar />
      <div class="px-6 ">
        <h1 class="px-6 py-4 text-gray-900 dark:text-white">
          {project.name}
        </h1>
        <h1 class="px-6 py-4 text-gray-900 dark:text-white">
          Goals
        </h1>
        <Table headers={HEADERS} data={list} />
      </div>
    </div >
  )
}

export default Project
