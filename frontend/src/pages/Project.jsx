import React from 'react'
import { Link, useParams } from 'react-router-dom'

import DetailsList from '../components/DetailsList'
import Divider from '../components/Divider'
import Navbar from '../components/Navbar'
import StatusTag from '../components/StatusTag'
import Table from '../components/Table'
import Loading from '../components/Loading'
import PopupForm from '../components/PopupForm.jsx'

import API from '../util/Api.jsx'

// Headers
const GoalHeaders = [
  "Name", "Assigned", "Progress", "Deadline"
]

const DescriptionHeaders = [
  "Owner",
  "Goals",
  "Project Deadline",
]

// Conversion functions
const goalToList = (goal) => (
  [
    <Link to={"/goal/" + goal.id} className="font-medium text-gray-900 whitespace-nowrap dark:text-white" >
      {goal.title}
    </Link>,
    goal.assigned,
    <StatusTag statusId={goal.status} updateStatus={(status) => API.setGoal(goal.id, { status: status })} />,
    goal.deadline.toDate().toDateString()
  ]
)

const projectToDescriptionList = (project) => (
  [
    project.owner.DisplayName,
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
    console.log(error)
    return (<div>error</div>)
  }

  if (loadingProject || loadingGoals)
    return (
      <div>
        <Navbar />
        <Loading></Loading>
      </div>
    )

  const descriptionList = projectToDescriptionList(project);
  const goalLists = goals.map(goalToList)
  const goalKeys = goals.map(goal => goal.id)

  const createGoal = (title, deadline) => ({
    assignedUserId: "",
    deadline: new Date(deadline),
    projectId: project.id,
    title: title
  })


  const handleCreateGoal = (formData) => {
    API.addGoal(createGoal(
      formData.get("title"),
      formData.get("deadline"),
    ))
  }

  return (
    <div className="dark:bg-gray-900 min-h-screen h-full">
      <Navbar />
      <div className="px-6 ">
        <h1 className=" py-4 text-gray-900 dark:text-white text-2xl">
          {project.name}
        </h1>
        <DetailsList headers={DescriptionHeaders} data={descriptionList} />
        <Divider title="Goals" />
        <Table headers={GoalHeaders} data={goalLists} keys={goalKeys} />
        <PopupForm title={"Create New Goal"} handleFormData={handleCreateGoal}>
          <label>
            Title:
            <input
              type="text"
              name="title"
              required
            />
          </label>
          <br />
          <label>
            Deadline:
            <input
              type="date"
              name="deadline"
              required
            />
          </label>
        </PopupForm>
      </div>
    </div >
  )
}


export default Project
