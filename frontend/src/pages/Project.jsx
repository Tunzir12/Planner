import React from 'react'
import Navbar from '../components/Navbar'
import Table from '../components/Table'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom';

const HEADERS = [
  "Name", "Assigned", "Progress", "Deadline"
]

const goalToList = (goal) => (
  [
    <Link to={"/goal/0"} class="font-medium text-gray-900 whitespace-nowrap dark:text-white" >
      {goal.title}
    </Link>,
    goal.assigned,
    goal.status,
    goal.deadline
  ]
)

const Project = () => {

  const { id } = useParams();

  var projects = [
    {
      name: "Project 1",
      id: "0",
      owner: "Me",
      milestones:
      {
        total: 10,
        completed: 5,
      },

      deadline: "Never",

      goals: [

        {
          title: "Do thing",
          assigned: "Me",
          status: "Completed",
          deadline: "Yesterday",
        },

        {
          title: "Do other thing",
          assigned: "Me",
          status: "Started",
          deadline: "Today",
        },

        {
          title:
            "Do nothing",
          assigned:
            "Friend",
          status:
            "Not started",
          deadline:
            "Today",
        },

        {
          title:
            "Chill",
          assigned:
            "Me ",
          status:
            "Not started",
          deadline:
            "Tomorrow",
        },
      ]
    },
    {
      name: "Hello",
      id: "1",
      owner: "Me",
      milestones:
      {
        total: 30,
        completed: 1,
      },

      deadline: "Never",
      goals: [
        {
          title:
            "Chill",
          assigned:
            "Me ",
          status:
            "Not started",
          deadline:
            "Tomorrow",
        },
      ]
    },
  ];

  var project = projects[id];


  const list = project.goals.map(goalToList);

  return (
    <div class="dark:bg-gray-900 min-h-screen h-full">
      <Navbar />
      <div class="px-6 min-h-screen ">
        <h1 class="px-6 py-4 text-gray-900 dark:text-white">
          {project.name}
        </h1>
        <Table headers={HEADERS} data={list} />
      </div>
    </div >
  )
}

export default Project
