

// import React from 'react'
// import { assets } from '../assets/assets'
// import { Link, useNavigate } from 'react-router-dom'
// import MenuItems from './MenuItems'
// import { CirclePlus, LogOut } from 'lucide-react'
// import { UserButton, useClerk } from '@clerk/react'
// import { useSelector } from 'react-redux'

// const SideBar = ({ SideBarOpen, setSideBarOpen }) => {
//   const navigate = useNavigate()
//   const user = useSelector((state) => state.user.value)
//   const { signOut } = useClerk()

//   return (
//     <div
//       className={`w-60 xl:w-72 shrink-0 h-screen bg-white border-r border-gray-200 flex flex-col justify-between items-center
//       fixed sm:sticky sm:top-0 top-0 left-0 z-40
//       transform transition-transform duration-300 ease-in-out
//       ${SideBarOpen ? 'translate-x-0' : '-translate-x-full'}
//       sm:translate-x-0`}
//     >

//       <div className="w-full">
//         <img
//           onClick={() => {
//             navigate('/')
//             setSideBarOpen(false)
//           }}
//           src={assets.logo}
//           className="w-42 ml-7 my-2 cursor-pointer"
//           alt="Sociazo"
//         />

//         <hr className="border-gray-300 mb-8" />

//         <MenuItems setSideBarOpen={setSideBarOpen} />

//         <Link
//           to="/create-post"
//           onClick={() => setSideBarOpen(false)}
//           className="flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 transition text-white cursor-pointer"
//         >
//           <CirclePlus className="w-5 h-5" />
//           Create Post
//         </Link>
//       </div>

//       <div className="w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between">
//         <div className="flex gap-2 items-center cursor-pointer">
//           <UserButton />

//           <div>
//             <h1 className="text-sm font-medium">
//               {user.full_name}
//             </h1>

//             <p className="text-xs text-gray-500">
//               @{user.username}
//             </p>
//           </div>
//         </div>

//         <LogOut
//           onClick={signOut}
//           className="w-4.5 text-gray-400 hover:text-gray-700 transition cursor-pointer"
//         />
//       </div>

//     </div>
//   )
// }

// export default SideBar


import React from 'react'
import { assets } from '../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import MenuItems from './MenuItems'
import { CirclePlus, LogOut } from 'lucide-react'
import { UserButton, useClerk } from '@clerk/react'
import { useSelector } from 'react-redux'

const SideBar = ({ SideBarOpen, setSideBarOpen }) => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.user.value)
  const { signOut } = useClerk()

  return (
    <div
      className={`fixed sm:sticky top-0 left-0 z-40
      w-60 xl:w-72 h-dvh shrink-0
      bg-white border-r border-gray-200
      flex flex-col justify-between
      overflow-hidden
      transform transition-transform duration-300 ease-in-out
      ${SideBarOpen ? 'translate-x-0' : '-translate-x-full'}
      sm:translate-x-0`}
    >

      {/* Sidebar menu */}
      <div className="w-full flex-1 min-h-0 overflow-y-auto">

        <img
          onClick={() => {
            navigate('/')
            setSideBarOpen(false)
          }}
          src={assets.logo}
          className="w-42 ml-7 my-2 cursor-pointer"
          alt="Sociazo"
        />

        <hr className="border-gray-300 mb-8" />

        <MenuItems setSideBarOpen={setSideBarOpen} />

        <Link
          to="/create-post"
          onClick={() => setSideBarOpen(false)}
          className="flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 mb-4 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 transition text-white cursor-pointer"
        >
          <CirclePlus className="w-5 h-5" />
          Create Post
        </Link>

      </div>

      {/* Profile section - Always at bottom */}
      <div className="w-full shrink-0 border-t border-gray-200 p-4 px-5 pb-[max(16px,env(safe-area-inset-bottom))] flex items-center justify-between bg-white">

        <div className="flex gap-2 items-center min-w-0">
          <UserButton />

          <div className="min-w-0">
            <h1 className="text-sm font-medium truncate">
              {user?.full_name}
            </h1>

            <p className="text-xs text-gray-500 truncate">
              @{user?.username}
            </p>
          </div>
        </div>

        <LogOut
          onClick={signOut}
          className="w-5 h-5 shrink-0 text-gray-400 hover:text-gray-700 transition cursor-pointer"
        />

      </div>

    </div>
  )
}

export default SideBar
