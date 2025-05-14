import React from 'react'
import { Link, useParams } from 'react-router-dom'

import DetailsList from '../components/DetailsList'
import Divider from '../components/Divider'
import Navbar from '../components/Navbar'
import StatusTag from '../components/StatusTag'
import Table from '../components/Table'

import API from '../util/Api.jsx'

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
    <Link to={"/goal/0"} className="font-medium text-gray-900 whitespace-nowrap dark:text-white" >
      {goal.title}
    </Link>,
    goal.assigned,
    <StatusTag statusId={goal.status} />,
    goal.deadline.toDate().toDateString()
  ]
)

const projectToDescriptionList = (project) => (
  [
    project.owner,
    project.milestonesCompleted + " / " + project.milestonesTotal,
    project.deadline.toDate().toDateString(),
  ]
)

// Main component
const Project = () => {

  const { id } = useParams();

  var { data: project, loading: loadingProject, error } = API.getProject(id);
  var { data: goals, loading: loadingGoals } = API.getGoalsFromProjectId(id)

  if (error) {
    return (<div>error</div>)
  }

  if (loadingProject || loadingGoals)
    return (<div>loading</div>)

  const descriptionList = projectToDescriptionList(project);
  const goalList = goals.map(goalToList)

  return (
    <div className="dark:bg-gray-900 min-h-screen h-full">
      <Navbar />
      <div className="px-6 ">
        <h1 className=" py-4 text-gray-900 dark:text-white text-2xl">
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
