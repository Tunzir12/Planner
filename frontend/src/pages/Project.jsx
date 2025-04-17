import React from 'react'
import { Link, useParams } from 'react-router-dom'

import DetailsList from '../components/DetailsList'
import Divider from '../components/Divider'
import Navbar from '../components/Navbar'
import StatusTag from '../components/StatusTag'
import Table from '../components/Table'

import { getProject } from '../util/Api.jsx'

// Headers
const GoalHeaders = [
  "Name", "Assigned", "Progress", "Deadline"
]

const DescriptionHeaders = [
  "Owner",
  "Milestones",
  "Project Deadline",
]

// Conversion functions
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

const projectToDescriptionList = (project) => (
  [
    project.owner,
    project.milestones.total + " / " + project.milestones.total,
    project.deadline
  ]
)

// Main component
const Project = () => {

  const { id } = useParams();

  var project = getProject(id);

  const descriptionList = projectToDescriptionList(project);
  const goalList = project.goals.map(goalToList);

  return (
    <div class="dark:bg-gray-900 min-h-screen h-full">
      <Navbar />
      <div class="px-6 ">
        <h1 class=" py-4 text-gray-900 dark:text-white text-2xl">
          {project.name}
        </h1>
        <DetailsList headers={DescriptionHeaders} data={descriptionList} />
        <Divider title="Goals" />
        <Table headers={GoalHeaders} data={goalList} />
      </div>
    </div >
  )
}

export default Project
