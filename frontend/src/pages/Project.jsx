import React from 'react'
import Navbar from '../components/Navbar'
import Table from '../components/Table'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom';

const HEADERS = [
  "Name", "Assigned", "Progress", "Deadline"
]

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
        ["Do thing", "Me", "Completed", "Yesterday"],
        ["Do other thing", "Me", "Started", "Today"],
        ["Do nothing", "Friend", "Not started", "Today"],
        ["Chill", "Me, Friend", "Not started", "Tomorrow"],
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
        ["Thing", "", "C"]
      ]
    },
  ];

  var project = projects[id];

  return (
    <div class="dark:bg-gray-900 min-h-screen h-full">
      <Navbar />
      <div class="px-6 min-h-screen ">
        <h1 class="px-6 py-4 text-gray-900 dark:text-white">
          {project.name}
        </h1>
        <Table headers={HEADERS} data={project.goals} />
      </div>
    </div >
  )
}

export default Project
