
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


    <nav className="bg-gray-800">
      <div className="max-w-screen-xl flex flex-wrap justify-between p-4">
        <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src={logo} className="h-8" alt="Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">GoalGetter</span>
        </Link>

        <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
          <div className="flex shrink-0 items-center">
          </div>
          <div className="hidden sm:ml-6 sm:block">
            <div className="flex space-x-4">
              {tabs.map((tab, index) => (
                <Link key={index} to={tab.path} className={"rounded-md px-3 py-2 text-sm font-medium text-white " + (location.pathname == tab.path ? "bg-gray-900" : "")} aria-current="page">
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
