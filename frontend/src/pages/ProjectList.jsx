import React from 'react'
import Navbar from '../components/Navbar'
import Table from '../components/Table'
import { Link } from 'react-router-dom'


const HEADERS = [
  "Name", "Owner", "Milestones", "Deadline"
]

const projectToList = (pr) => (
  [
    <Link to={"/projects/" + pr.id} class="font-medium text-gray-900 whitespace-nowrap dark:text-white" >
      {pr.name}
    </Link>,

    pr.owner,

    pr.milestones.completed + " / " + pr.milestones.total,

    pr.deadline,
  ]
)

const ProjectList = () => {

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
    },
  ];


  var list = projects.map(projectToList);

  return (
    <div class="dark:bg-gray-900 min-h-screen h-full">
      <Navbar />
      <div class="px-6 ">
        <h1 class="px-6 py-4 text-gray-900 dark:text-white"> Projects</h1>
        <Table headers={HEADERS} data={list} />
      </div>
    </div >
  )
}

export default ProjectList
