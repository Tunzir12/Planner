import React from 'react'
import Navbar from '../components/Navbar'
import { Link } from 'react-router-dom'


const HEADERS = [
  "Name", "Owner", "Milestones", "Deadline"
]

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
        <table class="w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400 ">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              {HEADERS.map((header) => (
                <th scope="col" class="px-6 py-3">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          {projects.map((pr) => (
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
              <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                <Link to={"/projects/" + pr.name}>
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
          ))}
        </table>
      </div>
    </div >
  )
}

export default Projects
