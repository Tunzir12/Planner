import React from 'react'
import Navbar from '../components/Navbar'
import Table from '../components/Table'
import { Link } from 'react-router-dom'


const HEADERS = [
  "Name", "Owner", "Milestones", "Deadline"
]

const projectToRow = (pr) => (
  <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
    <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
      <Link to={"/projects/" + pr.id}>
        {pr.name}
      </Link>
    </th>

    <td class="px-6 py-4">
      {pr.owner}
    </td>

    <td class="px-6 py-4">
      {pr.milestones.completed} / {pr.milestones.total}
    </td>

    <td class="px-6 py-4">
      {pr.deadline}
    </td>

  </tr>
)

const Projects = () => {

  var projects = [
    {
      name: "Project 1",
      id: "2069",
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
      id: "1337",
      owner: "Me",
      milestones:
      {
        total: 30,
        completed: 1,
      },

      deadline: "Never",
    },
  ];


  return (
    <div class="dark:bg-gray-900 min-h-screen h-full">
      <Navbar />
      <div class="px-6 min-h-screen ">
        <h1 class="px-6 py-4 text-gray-900 dark:text-white"> Projects</h1>
        <Table headers={HEADERS} data={projects} dataToRow={projectToRow} />
      </div>
    </div >
  )
}

export default Projects
