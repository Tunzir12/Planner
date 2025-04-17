import React from 'react'
import Navbar from '../components/Navbar'
import Table from '../components/Table'
import StatusTag from '../components/StatusTag.jsx'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom';

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

// Helper components 
const ProjectInfo = ({ headers, data }) => (
  <div class="flow-root my-6">
    <dl class="-my-3 divide-y divide-gray-200 text-sm dark:divide-gray-700">
      {headers.map((header, index) => (
        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
          <dt class="font-medium text-gray-900 dark:text-white">{header}</dt>
          <dd class="text-gray-700 sm:col-span-2 dark:text-gray-200">{data[index]}</dd>
        </div>
      ))}
    </dl>
  </div>
)


const Divider = ({ title }) => (
  <span class="flex items-center my-3">
    <span class="shrink-0 pe-4 text-gray-900 dark:text-white">{title}</span>
    <span class="h-px flex-1 bg-gray-300 dark:bg-gray-600"></span>
  </span>

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
        <ProjectInfo headers={DescriptionHeaders} data={descriptionList} />
        <Divider title="Goals" />
        <Table headers={GoalHeaders} data={goalList} />
      </div>
    </div >
  )
}

export default Project
