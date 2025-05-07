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
  "Assigned", "Progress", "Deadline"
]

// Conversion functions
const goalToList = (goal) => (
  [
    goal.assigned,
    <StatusTag statusId={goal.status} />,
    goal.deadline
  ]
)


// Main component
const Project = () => {

  const { id } = useParams();

  const goal = API.getGoal(id);

  const goalList = goalToList(goal);

  return (
    <div className="dark:bg-gray-900 min-h-screen h-full">
      <Navbar />
      <div className="px-6 ">
        <h1 className=" py-4 text-gray-900 dark:text-white text-2xl">
          {goal.title}
        </h1>
        <DetailsList headers={GoalHeaders} data={goalList} />
      </div>
    </div >
  )
}

export default Project
