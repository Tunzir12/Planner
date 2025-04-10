
import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/logo_color.svg'

const Navbar = () => {

  const location = useLocation();

  const tabs = [
    { name: 'Home', path: '/home' },
    { name: 'Todo', path: '/todo' },
    { name: 'Projects', path: '/projects' },
  ];

  return (


    <nav class="bg-gray-800">
      <div class="max-w-screen-xl flex flex-wrap justify-between p-4">
        <Link to="/" class="flex items-center space-x-3 rtl:space-x-reverse">
          <img src={logo} class="h-8" alt="Logo" />
          <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">GoalGetter</span>
        </Link>

        <div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
          <div class="flex shrink-0 items-center">
          </div>
          <div class="hidden sm:ml-6 sm:block">
            <div class="flex space-x-4">
              {tabs.map((tab) => (
                <Link to={tab.path} class={"rounded-md px-3 py-2 text-sm font-medium text-white " + (location.pathname == tab.path ? "bg-gray-900" : "")} aria-current="page">
                  {tab.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav >
  )
}


export default Navbar
