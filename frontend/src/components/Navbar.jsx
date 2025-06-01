import { auth, signOut } from '../firebase'
import { useNavigate } from 'react-router-dom'
import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/logo_color.svg'

//dropdown
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import {
  ArchiveBoxXMarkIcon,
  ChevronDownIcon,
  PencilIcon,
  Square2StackIcon,
  TrashIcon,
} from '@heroicons/react/16/solid'

const Navbar = () => {

  const location = useLocation();

  const goto = useNavigate();

  const goToChat = async () =>{
    try{
      goto('/chat');
    } catch(error){
      console.error('Chat error:', error.message);
    }
    }

    const goToProfile = async () =>{
    try{
      goto('/profile');
    } catch(error){
      console.error('Profile error:', error.message);
    }
    }
  

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out!');
      goto('/');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  const tabs = [
    { name: 'Home', path: '/home' },
    { name: 'Todo', path: '/todo' },
    { name: 'Projects', path: '/projects' },
  ];

  return (

    <nav className="bg-gray-800 ">
      <div className=" flex flex-wrap justify-between p-4">
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
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">

            <Menu>
              <MenuButton className="inline-flex items-center gap-2 rounded-md bg-gray-800 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-700 data-open:bg-gray-700">
                Menu
                <ChevronDownIcon className="size-4 fill-white" />
              </MenuButton>

              <MenuItems
                transition
                anchor="bottom end"
                className="w-52 origin-top-right rounded-xl border border-white/5 bg-emerald-950 p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
              >
                <MenuItem>
                  <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10"
                  onClick={goToProfile}>
                    Profile
                  </button>
                </MenuItem>
                <MenuItem>
                  <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10"
                  onClick={goToChat}>
                    Messages
                  </button>
                </MenuItem>
                <div className="my-1 h-px bg-white/5" />
                <MenuItem>
                  <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10"
                    type='submit' onClick={handleSignOut}>
                    Log Out
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
            </div>
      </div>
    </nav >
  )
}


export default Navbar
